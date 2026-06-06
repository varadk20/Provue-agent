import { createTool }
from "@mastra/core/tools";

import { z } from "zod";

import { pool }
from "../db/connection";

export const recurringTool =
createTool({
    id: "subscriptions",

    inputSchema: z.object({}),

    execute: async () => {

        const result = await pool.query(
            `
   SELECT
   merchant_normalized,
   COUNT(*) AS count
   FROM transactions
   GROUP BY merchant_normalized
   HAVING COUNT(*) >= 3
   ORDER BY count DESC
   `
        );

        return result.rows;

    },
    description: ""
});