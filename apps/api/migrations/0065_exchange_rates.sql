CREATE TABLE IF NOT EXISTS exchange_rates (
  id TEXT PRIMARY KEY,
  currency_code TEXT NOT NULL UNIQUE,
  currency_name TEXT,
  rate_to_cny REAL NOT NULL DEFAULT 1,
  source TEXT,
  synced_at TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  remark TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_enabled ON exchange_rates(enabled);

INSERT OR IGNORE INTO exchange_rates (
  id,
  currency_code,
  currency_name,
  rate_to_cny,
  source,
  synced_at,
  enabled,
  remark,
  created_at,
  updated_at
) VALUES
  ('exr_cny', 'CNY', 'CNY', 1, 'system', CURRENT_TIMESTAMP, 1, 'default currency', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('exr_usd', 'USD', 'USD', 7.2, 'system', CURRENT_TIMESTAMP, 1, 'default currency', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('exr_kzt', 'KZT', 'KZT', 0.015, 'system', CURRENT_TIMESTAMP, 1, 'default currency', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('exr_rub', 'RUB', 'RUB', 0.08, 'system', CURRENT_TIMESTAMP, 1, 'default currency', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
