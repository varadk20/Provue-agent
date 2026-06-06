import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// export const pool = new pg.Pool({
//   connectionString:
//     "postgres://postgres:postgres@localhost:5432/provue_tara",
// });