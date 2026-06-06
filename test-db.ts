// test-db.ts

import { pool } from "./src/mastra/db/connection";

const result = await pool.query(
  "SELECT NOW()"
);

console.log(result.rows);