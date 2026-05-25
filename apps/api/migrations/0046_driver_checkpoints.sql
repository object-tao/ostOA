CREATE TABLE IF NOT EXISTS driver_checkpoints (
  id TEXT PRIMARY KEY,
  tg_id TEXT NOT NULL,
  tg_name TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  checkin_at TEXT NOT NULL,
  address_ru TEXT,
  address_zh TEXT,
  country_ru TEXT,
  country_zh TEXT,
  city_ru TEXT,
  city_zh TEXT,
  plate_no TEXT,
  original_image_key TEXT,
  original_image_url TEXT,
  watermarked_image_key TEXT,
  watermarked_image_url TEXT,
  map_image_key TEXT,
  map_image_url TEXT,
  raw_google_ru TEXT,
  raw_google_zh TEXT,
  status TEXT NOT NULL DEFAULT 'VALID',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_driver_checkpoints_tg_id ON driver_checkpoints(tg_id);
CREATE INDEX IF NOT EXISTS idx_driver_checkpoints_checkin_at ON driver_checkpoints(checkin_at);
