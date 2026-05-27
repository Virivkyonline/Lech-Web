CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company_name TEXT,
  plan TEXT NOT NULL,
  template TEXT NOT NULL,
  license_status TEXT NOT NULL DEFAULT 'trial',
  trial_until TEXT,
  paid_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_license_status ON accounts(license_status);
