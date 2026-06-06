import fs from "fs";
import path from "path";
import crypto from "crypto";

const logDir = path.join(
  process.cwd(),
  "logs"
);

const logFile = path.join(
  logDir,
  "requests.log"
);

export function detectIntent(
  question: string
): string {

  const q =
    question.toLowerCase();

  if (
    q.includes("fund")
  ) {
    return "fund_query";
  }

  if (
    q.includes("holding")
  ) {
    return "holding_query";
  }

  if (
    q.includes("subscription")
  ) {
    return "subscription_query";
  }

  if (
    q.includes("merchant")
  ) {
    return "merchant_query";
  }

  if (
    q.includes("refund")
  ) {
    return "refund_query";
  }

  if (
    q.includes("transfer")
  ) {
    return "transfer_query";
  }

  if (
    q.includes("spend") ||
    q.includes("spent")
  ) {
    return "spending_query";
  }

  return "finance_query";
}

type LogData = {
  question: string;
  latencyMs: number;
  status: "success" | "failed";
  errorMessage?: string | null;
  intent?: string;
};

export function logRequest(
  data: LogData
) {

  try {

    if (!fs.existsSync(logDir)) {

      fs.mkdirSync(
        logDir,
        {
          recursive: true
        }
      );

    }

    const logEntry = {

      request_id:
        crypto.randomUUID(),

      timestamp:
        new Date()
          .toISOString(),

      original_question:
        data.question,

      normalized_intent:
        data.intent ||
        "finance_query",

      tools_called: [],

      sanitized_tool_inputs: {},

      database_tables_read: [],

      latency_ms:
        data.latencyMs,

      status:
        data.status,

      error_message:
        data.errorMessage ||
        null,

      fallback_reason:
        data.status === "failed"
          ? "agent_execution_failed"
          : null

    };

    fs.appendFileSync(
      logFile,
      JSON.stringify(
        logEntry,
        null,
        2
      ) + "\n"
    );

  } catch (error) {

    console.error(
      "Failed to write log:",
      error
    );

  }

}