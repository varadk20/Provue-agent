import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import { pool } from "../src/mastra/db/connection";
import { normalizeMerchant } from "../src/mastra/utils/merchantNormalizer";

dotenv.config();

const dataDir = process.env.DATA_DIR;


async function ingest() {
  try {

    if (!dataDir) {
      throw new Error("DATA_DIR not provided");
    }

    console.log("Starting ingestion...");

    // Clear old data

    await pool.query("TRUNCATE transactions CASCADE");
    await pool.query("TRUNCATE funds CASCADE");
    await pool.query("TRUNCATE holdings CASCADE");

    // =====================
    // TRANSACTIONS
    // =====================

    const transactions = JSON.parse(
      fs.readFileSync(
        path.join(dataDir, "transactions.json"),
        "utf8"
      )
    );

    for (const tx of transactions) {

      await pool.query(
        `
        INSERT INTO transactions
        (
          id,
          date,
          merchant,
          merchant_normalized,
          category,
          amount,
          currency,
          memo
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [
          tx.id,
          tx.date,
          tx.merchant,
          normalizeMerchant(tx.merchant,  tx.memo),
          tx.category,
          tx.amount,
          tx.currency,
          tx.memo
        ]
      );

    }

    console.log("Transactions Imported");

    // =====================
    // FUNDS
    // =====================

    const funds = JSON.parse(
      fs.readFileSync(
        path.join(dataDir, "funds.json"),
        "utf8"
      )
    );

    for (const fund of funds) {

      for (const navPoint of fund.nav) {

        await pool.query(
          `
          INSERT INTO funds
          (
            fund_id,
            fund_name,
            category,
            nav_date,
            nav
          )
          VALUES
          ($1,$2,$3,$4,$5)
          `,
          [
            fund.id,
            fund.name,
            fund.category,
            navPoint.date,
            navPoint.value
          ]
        );

      }

    }

    console.log("Funds Imported");

    // =====================
    // HOLDINGS
    // =====================

    const holdings = JSON.parse(
      fs.readFileSync(
        path.join(dataDir, "holdings.json"),
        "utf8"
      )
    );

    for (const holding of holdings) {

      await pool.query(
        `
        INSERT INTO holdings
        (
          fund_id,
          fund_name,
          units,
          purchase_date,
          purchase_nav
        )
        VALUES
        ($1,$2,$3,$4,$5)
        `,
        [
          holding.fund_id,
          holding.fund_name,
          holding.units,
          holding.purchase_date,
          holding.purchase_nav
        ]
      );

    }

    console.log("Holdings Imported");

    console.log("Ingestion Complete");

  } catch (error) {

    console.error(error);

  } finally {

    await pool.end();

  }
}

ingest();