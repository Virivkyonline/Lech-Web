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

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL,
  title TEXT NOT NULL,
  headline TEXT NOT NULL,
  subheadline TEXT,
  phone TEXT,
  email TEXT,
  primary_cta TEXT,
  services_json TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_websites_account_id ON websites(account_id);
CREATE INDEX IF NOT EXISTS idx_websites_slug ON websites(slug);
