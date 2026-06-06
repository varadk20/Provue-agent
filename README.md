# Provue Finance Research Agent

A finance research agent built using **Mastra**, **Typescrit**, **PostgreSQL**, and **Gemini 2.5 Flash**.

The system answers questions about:

- Spending and transactions
- Merchant analysis
- Recurring subscriptions
- Mutual fund returns
- Investment holdings

All answers are grounded in PostgreSQL data through specialized tools rather than generated from model knowledge.

---

# Architecture

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

---

# Setup

## Install Dependencies

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgres_connection_string

GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

DATA_DIR=./data/sample_a
```

---

# Database Setup

Create the PostgreSQL schema using the provided SQL schema file.

After creating the tables, ingest the sample dataset:

```bash
DATA_DIR=./data/sample_a npx tsx scripts/ingest.ts
```

Expected output:

```text
Starting ingestion...
Transactions Imported
Funds Imported
Holdings Imported
Ingestion Complete
```

---

# Running Locally

Start the API server:

```bash
npx tsx src/mastra/server.ts
```

Expected output:

```text
Server running on 3000
```

The API will be available at:

```text
http://localhost:3000
```

---

# Using Postman

### Method

```text
POST
```

### URL

```text
http://localhost:3000/ask
```

### Headers

```text
Content-Type: application/json
```

### Body

Select:

```text
Body → raw → JSON
```

Then send:

```json
{
  "question": "What are my top 5 merchants?"
}
```

Example:

```json
{
  "question": "How much did I spend on food?"
}
```

Response:

```json
{
  "answer": "..."
}
```

---

# API

## Endpoint

```http
POST /ask
```

## Request

```json
{
  "question": "How much did I spend on food?"
}
```

## Response

```json
{
  "answer": "..."
}
```

---

# Deployment

Platform:

```text
Railway
```

Public URL:

```text
https://provue-agent-production.up.railway.app
```

Example Request:

```http
POST https://provue-agent-production.up.railway.app/ask
```

Body:

```json
{
  "question": "How much did I spend on Amazon?"
}
```

---

# Evaluation

Run the evaluation suite:

```bash
npx tsx eval/eval.ts
```

The evaluation script sends requests to the local `/ask` endpoint and reports:

- Total tests
- Passed tests
- Failed tests

Covered scenarios include:

- Merchant lookup
- Date filtering
- Category spending
- Refund handling
- Transfer exclusion
- Monthly spending trends
- Recurring subscriptions
- Fund returns
- Holding returns
- No-data cases

---

# Logging

All requests are logged to:

```text
logs/requests.log
```

Captured fields include:

- request_id
- timestamp
- original_question
- normalized_intent
- latency_ms
- status
- error_message
- fallback_reason

Example:

```json
{
  "request_id": "123",
  "original_question": "How much did I spend on Amazon?",
  "normalized_intent": "merchant_spend",
  "latency_ms": 215,
  "status": "success"
}
```

---

# Design Document

Detailed implementation decisions, formulas, observability, evaluation strategy, deployment decisions, and tradeoffs are documented in:

```text
DESIGN.md
```
