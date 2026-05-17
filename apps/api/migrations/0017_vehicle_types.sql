CREATE TABLE IF NOT EXISTS vehicle_types (
  id TEXT PRIMARY KEY,
  sequence_no INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  line_count INTEGER,
  axle_count INTEGER,
  effective_length REAL,
  effective_volume REAL,
  payload_weight REAL,
  scenario TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_types_category ON vehicle_types(category);
CREATE INDEX IF NOT EXISTS idx_vehicle_types_sequence ON vehicle_types(sequence_no);
