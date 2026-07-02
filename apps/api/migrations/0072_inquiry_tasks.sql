CREATE TABLE IF NOT EXISTS inquiry_tasks (
  id TEXT PRIMARY KEY,
  task_no TEXT NOT NULL UNIQUE,
  inquiry_id TEXT,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  salesperson_id TEXT,
  salesperson_name TEXT,
  service_items TEXT NOT NULL DEFAULT '[]',
  cargo_name TEXT NOT NULL DEFAULT '',
  cargo_type TEXT,
  origin TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  weight_kg REAL DEFAULT 0,
  volume_cbm REAL DEFAULT 0,
  package_count INTEGER DEFAULT 0,
  ready_date TEXT,
  target_arrival_date TEXT,
  customs_mode TEXT,
  temperature_requirement TEXT,
  special_requirement TEXT,
  cargo_files TEXT NOT NULL DEFAULT '[]',
  quote_amount REAL,
  quote_currency TEXT DEFAULT 'USD',
  quote_remark TEXT,
  quote_files TEXT NOT NULL DEFAULT '[]',
  solution_files TEXT NOT NULL DEFAULT '[]',
  sales_confirm_note TEXT,
  status TEXT NOT NULL DEFAULT '待车队报价',
  current_node TEXT NOT NULL DEFAULT '车队报价',
  created_by_id TEXT,
  created_by_name TEXT,
  submitted_at TEXT,
  quoted_at TEXT,
  confirmed_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (inquiry_id) REFERENCES transport_inquiries(id)
);

CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_status ON inquiry_tasks(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_salesperson ON inquiry_tasks(salesperson_id, salesperson_name);
CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_created_at ON inquiry_tasks(created_at);

CREATE TABLE IF NOT EXISTS inquiry_task_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  operator_id TEXT,
  operator_name TEXT,
  remark TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(task_id) REFERENCES inquiry_tasks(id)
);

CREATE INDEX IF NOT EXISTS idx_inquiry_task_logs_task_id ON inquiry_task_logs(task_id);
