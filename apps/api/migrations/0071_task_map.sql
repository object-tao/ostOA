CREATE TABLE IF NOT EXISTS map_configs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'amap',
  amap_web_key TEXT,
  amap_rest_key TEXT,
  amap_security_js_code TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  remark TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO map_configs (id, provider, enabled, created_at, updated_at)
VALUES ('default', 'amap', 1, datetime('now'), datetime('now'));

CREATE TABLE IF NOT EXISTS task_gps_locations (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  project_id TEXT,
  instance_node_id TEXT,
  provider_id TEXT,
  gps_device_no TEXT,
  latitude REAL,
  longitude REAL,
  address TEXT,
  located_at TEXT,
  raw_data TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_gps_locations_task_id ON task_gps_locations(task_id);
CREATE INDEX IF NOT EXISTS idx_task_gps_locations_project_id ON task_gps_locations(project_id);
CREATE INDEX IF NOT EXISTS idx_task_gps_locations_device ON task_gps_locations(provider_id, gps_device_no);
