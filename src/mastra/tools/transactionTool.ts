import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { pool } from "../db/connection";

export const transactionTool = createTool({

  id: "query_transactions",

  description:
    "Query transaction spending data",

  inputSchema: z.object({

    category: z.string().optional(),

    merchant: z.string().optional(),

    startDate: z.string().optional(),

    endDate: z.string().optional(),

    aggregate: z.enum([
      "sum",
      "avg",
      "top_merchants",
      "monthly"
    ])

  }),

  execute: async ({
    category,
    merchant,
    startDate,
    endDate,
    aggregate
  }) => {

    let whereClauses = [
      `category != 'transfer'`
    ];

    const values: any[] = [];

    if (category) {

      values.push(category);

      whereClauses.push(
        `category = $${values.length}`
      );

    }

    if (merchant) {

      values.push(
        merchant.toLowerCase()
      );

      whereClauses.push(
        `
        split_part(
          merchant_normalized,
          ' ',
          1
        ) = $${values.length}
        `
      );

    }

    if (startDate) {

      values.push(startDate);

      whereClauses.push(
        `date >= $${values.length}`
      );

    }

    if (endDate) {

      values.push(endDate);

      whereClauses.push(
        `date <= $${values.length}`
      );

    }

    const where =
      whereClauses.join(
        " AND "
      );

    let sql = "";

    if (
      aggregate === "sum"
    ) {

      sql = `
      SELECT

      ROUND(
        SUM(amount)::numeric,
        2
      ) AS total

      FROM transactions

      WHERE ${where}
      `;

    }

    else if (
      aggregate === "avg"
    ) {

      sql = `
      SELECT

      ROUND(
        AVG(amount)::numeric,
        2
      ) AS average

      FROM transactions

      WHERE ${where}
      `;

    }

    else if (
      aggregate === "top_merchants"
    ) {

      sql = `
      SELECT

      split_part(
        merchant_normalized,
        ' ',
        1
      ) AS merchant,

      ROUND(
        SUM(amount)::numeric,
        2
      ) AS spend

      FROM transactions

      WHERE ${where}

      GROUP BY

      split_part(
        merchant_normalized,
        ' ',
        1
      )

      ORDER BY spend DESC

      LIMIT 5
      `;

    }

    else if (
      aggregate === "monthly"
    ) {

      sql = `
      SELECT

      DATE_TRUNC(
        'month',
        date
      ) AS month,

      ROUND(
        SUM(amount)::numeric,
        2
      ) AS spend

      FROM transactions

      WHERE ${where}

      GROUP BY

      DATE_TRUNC(
        'month',
        date
      )

      ORDER BY month
      `;

    }


    const result =
      await pool.query(
        sql,
        values
      );

    return result.rows;

  }

});