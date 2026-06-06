import { createTool }
from "@mastra/core/tools";

import { z } from "zod";

import { pool }
from "../db/connection";

export const fundTool =
createTool({
    id: "fund_returns",

    inputSchema: z.object({
        fundName: z.string(),

        startDate: z.string(),

        endDate: z.string()
    }),

    execute: async ({ fundName,
  startDate,
  endDate }) => {

        const start = await pool.query(
            `
     SELECT nav
     FROM funds
     WHERE fund_name=$1
     AND nav_date=$2
     `,
            [
                fundName,
                startDate
            ]
        );

        const end = await pool.query(
            `
     SELECT nav
     FROM funds
     WHERE fund_name=$1
     AND nav_date=$2
     `,
            [
                fundName,
                endDate
            ]
        );

        const startNAV = Number(start.rows[0].nav);

        const endNAV = Number(end.rows[0].nav);

        const returnPct = (
            (endNAV - startNAV)
            / startNAV
        ) * 100;

        return {
            startNAV,

            endNAV,

            returnPercent: Number(
                returnPct.toFixed(2)
            )
        };

    },
    description: ""
});