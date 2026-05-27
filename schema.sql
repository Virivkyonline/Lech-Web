-- Cloudflare D1 schema for Lech-Web account/licence system
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  license_status TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TEXT NOT NULL,
  license_ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  template TEXT NOT NULL,
  phone TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sites_user ON sites(user_id);
