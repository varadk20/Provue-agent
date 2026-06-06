CREATE TABLE transactions(
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    merchant TEXT,
    merchant_normalized TEXT,
    category TEXT,
    amount NUMERIC(12,2),
    currency TEXT,
    memo TEXT
);

CREATE TABLE funds(
    fund_id TEXT,
    fund_name TEXT,
    category TEXT,
    nav_date DATE,
    nav NUMERIC(12,4),
    PRIMARY KEY(fund_id, nav_date)
);

CREATE TABLE holdings(
    fund_id TEXT PRIMARY KEY,
    fund_name TEXT,
    units NUMERIC(12,4),
    purchase_date DATE,
    purchase_nav NUMERIC(12,4)
);

-- INDEXES

CREATE INDEX IF NOT EXISTS idx_transaction_date
ON transactions(date);

CREATE INDEX IF NOT EXISTS idx_transaction_category
ON transactions(category);

CREATE INDEX IF NOT EXISTS idx_transaction_merchant
ON transactions(merchant_normalized);

CREATE INDEX IF NOT EXISTS idx_funds_date
ON funds(nav_date);