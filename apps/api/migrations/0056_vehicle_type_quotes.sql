CREATE TABLE IF NOT EXISTS vehicle_type_quotes (
  id TEXT PRIMARY KEY,
  quote_batch TEXT NOT NULL,
  quote_date TEXT NOT NULL,
  origin_country TEXT NOT NULL DEFAULT '中国',
  origin_city TEXT NOT NULL DEFAULT '霍尔果斯',
  destination_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  vehicle_type_id TEXT,
  vehicle_type_name TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  remark TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_type_quotes_quote_date ON vehicle_type_quotes(quote_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_type_quotes_route ON vehicle_type_quotes(destination_country, destination_city);
CREATE INDEX IF NOT EXISTS idx_vehicle_type_quotes_vehicle ON vehicle_type_quotes(vehicle_type_name);
