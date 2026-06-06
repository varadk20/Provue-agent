# Provue Finance Research Agent - Design Document

## 1. System Overview

This project implements a finance research agent capable of answering questions about:

* Transactions and spending
* Merchant analysis
* Recurring subscriptions
* Mutual fund returns
* Investment holdings

The system is built using:

* Node.js
* Express
* Mastra
* PostgreSQL
* Gemini 2.5 Flash

The solution consists of two major phases:

1. Data ingestion into PostgreSQL
2. Question answering using database-backed tools

This separation ensures that all answers are grounded in stored financial data rather than model memory.

---

# 2. Architecture

## System Flow

```text
Sample Dataset
(sample_a / sample_b / sample_c)
            │
            ▼
       Ingest Script
            │
            ▼
 Merchant Normalization
            │
            ▼
        PostgreSQL
            │
            ▼
        Express API
          POST /ask
            │
            ▼
       Tara Agent
            │
            ▼
      Tool Selection
            │
            ├── Transaction Tool
            ├── Fund Tool
            ├── Holding Tool
            └── Recurring Tool
            │
            ▼
      PostgreSQL Query
            │
            ▼
      Retrieved Results
            │
            ▼
    Natural Language Answer
```

## Components

### Ingestion Layer

The ingestion script loads the provided JSON datasets into PostgreSQL.

Responsibilities:

* Read transactions.json
* Read funds.json
* Read holdings.json
* Normalize merchant names
* Populate PostgreSQL tables

The same ingestion pipeline works across all provided datasets without requiring hardcoded merchant aliases.

### Database Layer

PostgreSQL acts as the source of truth.

Tables:

* transactions
* funds
* holdings

All financial calculations are derived directly from these tables.

### API Layer

Express exposes the `/ask` endpoint.

Responsibilities:

* Request validation
* Error handling
* Agent execution
* Response formatting
* Logging

### Agent Layer

The Tara agent interprets user questions and selects the appropriate tool.

The agent does not directly answer finance questions from model knowledge.

Instead, it uses tool outputs generated from PostgreSQL queries.

### Tool Layer

The system contains four specialized tools.

#### Transaction Tool

Used for:

* Spend calculations
* Merchant analysis
* Monthly spending trends
* Category spending

#### Fund Tool

Used for:

* Fund performance
* NAV analysis
* Period returns

#### Holding Tool

Used for:

* Investment performance
* Realized returns

#### Recurring Tool

Used for:

* Subscription detection
* Recurring payment analysis

### Observability Layer

All requests generate structured logs.

Captured information includes:

* Request ID
* Original question
* Intent
* Latency
* Status
* Error details

Logs are stored in:

```text
logs/requests.log
```

---

# 3. Tool Design

The system intentionally uses multiple specialized tools instead of a single large tool.

This keeps responsibilities isolated and simplifies maintenance.

## Transaction Tool

Purpose:

* Total spending
* Average spending
* Merchant analysis
* Monthly spending
* Category analysis

Reason for separation:

Transaction queries require filtering, aggregation, merchant matching, refunds, and date-based calculations.

Keeping transaction logic separate prevents unnecessary coupling with investment calculations.

---

## Fund Tool

Purpose:

* Fund performance
* NAV lookups
* Period return calculations

Reason for separation:

Fund analytics use historical NAV data and different financial formulas than transaction analysis.

---

## Holding Tool

Purpose:

* Holding performance
* Investment return calculations

Reason for separation:

Holdings combine purchase information with NAV history and therefore require different business logic.

---

## Recurring Tool

Purpose:

* Detect subscriptions
* Identify recurring merchants

Reason for separation:

Recurring detection uses frequency-based analysis rather than aggregation queries.

---

# 4. Grounding and Hallucination Prevention

The system is designed so that answers are grounded in database results.

The language model never directly computes financial values.

Workflow:

1. User asks a question
2. Agent selects a tool
3. Tool executes SQL
4. PostgreSQL returns data
5. Agent formats the result

All financial values originate from PostgreSQL.

If data is unavailable, the system returns an appropriate response rather than inventing information.

This significantly reduces hallucination risk.

---

# 5. Merchant Matching Strategy

The assignment explicitly discourages hardcoded merchant aliases.

Examples of avoided approaches:

```javascript
const SWIGGY_ALIASES = [...];
const AMAZON_ALIASES = [...];
```

Instead, merchant names are normalized during ingestion.

Examples:

```text
SWIGGY*ORDER
→ swiggy order

SWIGGY BANGALORE
→ swiggy bangalore

AMAZON.IN
→ amazon in

APOLLO PHARMACY MUMBAI
→ apollo pharmacy mumbai
```

Normalization performs:

* Lowercasing
* Special character removal
* Whitespace cleanup
* Merchant extraction from UPI memos when available

This allows the solution to generalize across unseen merchant names and datasets.

---

# 6. Financial Formulas

## Total Spend

```text
Spend = SUM(amount)
```

Applied after filters such as:

* Merchant
* Category
* Date range

Transfers are excluded.

---

## Net Spend

```text
Net Spend = Purchases − Refunds
```

Refund transactions remain in the dataset and naturally reduce total spend.

---

## Merchant Ranking

```text
Top Merchants =
SUM(amount)
GROUP BY merchant
ORDER BY spend DESC
```

---

## Monthly Spending

```text
Monthly Spend =
SUM(amount)
GROUP BY month
```

---

## Fund Period Return

```text
Return (%) =
((End NAV − Start NAV)
/ Start NAV)
× 100
```

Where:

* Start NAV is nearest to the requested start date
* End NAV is nearest to the requested end date

---

## Holding Return

```text
Current Value =
Units × Latest NAV
```

```text
Investment Value =
Units × Purchase NAV
```

```text
Return (%) =
((Current Value − Investment Value)
/ Investment Value)
× 100
```

---

## Recurring Subscription Detection

A merchant is considered recurring when:

* Multiple transactions exist
* Transactions occur at approximately regular intervals

Examples:

* Netflix
* Spotify
* Notion

The implementation relies on transaction history rather than predefined merchant lists.

---

# 7. Evaluation Framework

A lightweight evaluation suite was implemented.

The evaluation script sends requests to the local `/ask` endpoint and verifies that valid responses are returned.

Covered scenarios include:

1. Merchant lookup
2. Date filtering
3. Category spending
4. Top merchants
5. Refund handling
6. Transfer exclusion
7. Monthly spending trends
8. Recurring subscriptions
9. No-data cases
10. Fund returns
11. Holding returns
12. General transaction analytics

The script reports:

* Total tests
* Passed tests
* Failed tests

This provides a quick regression check before deployment.

---

# 8. Observability

Each request generates a structured log entry.

Captured fields:

* request_id
* timestamp
* original_question
* normalized_intent
* latency_ms
* status
* error_message
* fallback_reason

Example:

```json
{
  "request_id": "123",
  "original_question": "How much did I spend on Amazon?",
  "normalized_intent": "merchant_spend",
  "latency_ms": 220,
  "status": "success"
}
```

Logs are written to:

```text
logs/requests.log
```

---

# 9. Failed Run Investigation

Failed requests can be investigated using:

1. Request logs
2. Railway deployment logs
3. Error messages
4. Re-running the same query

This provides visibility into:

* Tool failures
* Database failures
* Deployment issues
* API key configuration issues

During development, logging helped identify:

* Missing Gemini API key
* Missing database schema
* Missing environment variables
* PostgreSQL connection issues

---

# 10. Deployment

## Platform

Railway

## Components

* Express API Service
* PostgreSQL Database

## Environment Variables

```env
DATABASE_URL=
GOOGLE_GENERATIVE_AI_API_KEY=
DATA_DIR=
```

## Deployment URL

Replace with the deployed Railway URL:

```text
https://provue-agent-production.up.railway.app/ask
```

---

# 11. Tradeoffs

## Advantages

* Simple architecture
* Easy deployment
* Strong grounding through SQL
* Works across multiple datasets
* Easy debugging and observability
* Clear separation of responsibilities

## Limitations

* Merchant grouping can still over-group some merchants
* Recurring detection is heuristic-based
* Tool selection depends on LLM interpretation
* Large datasets may require query optimization

---

# 12. Future Improvements

With additional time I would:

1. Improve merchant clustering using embeddings
2. Add semantic query routing
3. Add answer confidence scoring
4. Improve recurring payment detection
5. Add richer evaluation coverage
6. Add caching for expensive analytics
7. Add automated expected-answer validation
8. Add asynchronous job execution support

---

# 13. Async Tool Milestone

The current implementation executes all tools synchronously.

The provided datasets are relatively small and do not require long-running jobs.

If asynchronous processing were required:

1. Create a job record
2. Return a job ID immediately
3. Execute processing in the background
4. Persist job status
5. Allow polling for completion
6. Return final results when complete

This would support significantly larger datasets and computationally expensive analytics.

---

# 14. Conclusion

The system provides a grounded finance research agent built around PostgreSQL-backed tools.

The architecture prioritizes:

* Correctness
* Traceability
* Observability
* Dataset generalization

while remaining simple to deploy, test, and maintain.
