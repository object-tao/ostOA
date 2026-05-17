CREATE TABLE IF NOT EXISTS loading_plans (
  id TEXT PRIMARY KEY,
  plan_no TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  cargo_items TEXT NOT NULL DEFAULT '[]',
  vehicle_ids TEXT NOT NULL DEFAULT '[]',
  plan_result TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'SAVED',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loading_plans_created_at ON loading_plans(created_at);
