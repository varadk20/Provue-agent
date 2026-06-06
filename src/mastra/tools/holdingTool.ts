import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { pool } from "../db/connection";

export const holdingTool =
createTool({

  id: "holding_returns",

  description:
    "Calculate holding returns and total portfolio value",

  inputSchema: z.object({
    fundName: z.string().optional()
  }),

  execute: async ({ fundName }) => {

    // PORTFOLIO-WIDE QUERY
    if (!fundName) {

      const holdings =
        await pool.query(`
          SELECT *
          FROM holdings
        `);

      let portfolioValue = 0;
      let totalCost = 0;

      for (const holding of holdings.rows) {

        const latest =
          await pool.query(
            `
            SELECT nav
            FROM funds
            WHERE fund_id=$1
            ORDER BY nav_date DESC
            LIMIT 1
            `,
            [holding.fund_id]
          );

        const latestNav =
          Number(
            latest.rows[0].nav
          );

        const currentValue =
          latestNav *
          Number(
            holding.units
          );

        const cost =
          Number(
            holding.purchase_nav
          ) *
          Number(
            holding.units
          );

        portfolioValue +=
          currentValue;

        totalCost +=
          cost;
      }

      const profit =
        portfolioValue -
        totalCost;

      return {
        portfolioValue:
          Number(
            portfolioValue.toFixed(2)
          ),

        totalCost:
          Number(
            totalCost.toFixed(2)
          ),

        profit:
          Number(
            profit.toFixed(2)
          ),

        returnPercent:
          Number(
            (
              (profit / totalCost)
              * 100
            ).toFixed(2)
          )
      };
    }

    // SINGLE FUND QUERY

    const holding =
      await pool.query(
        `
        SELECT *
        FROM holdings
        WHERE fund_name=$1
        `,
        [fundName]
      );

    if (
      holding.rows.length === 0
    ) {

      return {
        error:
          "Holding not found"
      };
    }

    const latest =
      await pool.query(
        `
        SELECT nav
        FROM funds
        WHERE fund_name=$1
        ORDER BY nav_date DESC
        LIMIT 1
        `,
        [fundName]
      );

    const h =
      holding.rows[0];

    const latestNav =
      Number(
        latest.rows[0].nav
      );

    const currentValue =
      latestNav *
      Number(h.units);

    const cost =
      Number(h.purchase_nav)
      *
      Number(h.units);

    const profit =
      currentValue - cost;

    return {

      currentValue:
        Number(
          currentValue.toFixed(2)
        ),

      cost:
        Number(
          cost.toFixed(2)
        ),

      profit:
        Number(
          profit.toFixed(2)
        ),

      returnPercent:
        Number(
          (
            (profit / cost)
            * 100
          ).toFixed(2)
        )
    };
  }
});