CREATE TABLE IF NOT EXISTS working_time_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  location TEXT,
  node_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  enabled INTEGER NOT NULL DEFAULT 1,
  remark TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS working_time_periods (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  weekday INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (rule_id) REFERENCES working_time_rules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS working_calendar_days (
  id TEXT PRIMARY KEY,
  country TEXT,
  location TEXT,
  date TEXT NOT NULL,
  day_type TEXT NOT NULL,
  name TEXT,
  all_day INTEGER NOT NULL DEFAULT 1,
  periods_json TEXT NOT NULL DEFAULT '[]',
  enabled INTEGER NOT NULL DEFAULT 1,
  remark TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_working_time_periods_rule_id ON working_time_periods(rule_id);
CREATE INDEX IF NOT EXISTS idx_working_calendar_days_date ON working_calendar_days(date);
CREATE INDEX IF NOT EXISTS idx_working_calendar_days_scope ON working_calendar_days(country, location, date);

ALTER TABLE workflow_template_nodes ADD COLUMN working_time_rule_id TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN working_time_rule_id TEXT;
