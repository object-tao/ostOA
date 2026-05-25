CREATE TABLE IF NOT EXISTS market_info (
  id TEXT PRIMARY KEY,
  collected_at TEXT NOT NULL,
  whatsapp_number TEXT,
  source_group TEXT,
  foreign_text TEXT NOT NULL,
  chinese_translation TEXT,
  status TEXT NOT NULL DEFAULT 'VALID',
  raw_payload TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_info_collected_at ON market_info(collected_at);
CREATE INDEX IF NOT EXISTS idx_market_info_status ON market_info(status);
