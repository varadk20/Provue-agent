import { transactionTool } from "./transactionTool";
import { fundTool } from "./fundTool";
import { holdingTool } from "./holdingTool";
import { recurringTool } from "./recurringTool";

async function run() {

  console.log("\nTRANSACTION\n");

  console.log(
    await transactionTool.execute?.(
      {
        category: "food",
        aggregate: "sum"
      },
      {} as any
    )
  );

  console.log("\nFUND\n");

  console.log(
    await fundTool.execute?.(
      {
        fundName: "Saffron Bluechip Equity Fund",
        startDate: "2024-01-01",
        endDate: "2025-01-01"
      },
      {} as any
    )
  );

  console.log("\nHOLDING\n");

  console.log(
    await holdingTool.execute?.(
      {
        fundName: "Saffron Bluechip Equity Fund"
      },
      {} as any
    )
  );

  console.log("\nRECURRING\n");

  console.log(
    await recurringTool.execute?.(
      {},
      {} as any
    )
  );
}

run();