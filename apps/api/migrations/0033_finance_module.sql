CREATE TABLE IF NOT EXISTS finance_items (
  id TEXT PRIMARY KEY,
  item_no TEXT NOT NULL UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('receivable', 'payable')),
  project_id TEXT,
  task_id TEXT,
  customer_id TEXT,
  customer_name TEXT,
  supplier_id TEXT,
  supplier_name TEXT,
  fee_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  amount REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL DEFAULT 1,
  amount_cny REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  source_type TEXT NOT NULL DEFAULT 'manual',
  occurrence_stage TEXT,
  bill_id TEXT,
  payment_request_id TEXT,
  confirmed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES oversize_projects(id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES oversize_project_tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS finance_bills (
  id TEXT PRIMARY KEY,
  bill_no TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  customer_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  total_amount REAL NOT NULL DEFAULT 0,
  total_amount_cny REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  confirmed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS finance_bill_items (
  bill_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (bill_id, item_id),
  FOREIGN KEY (bill_id) REFERENCES finance_bills(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES finance_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_payment_requests (
  id TEXT PRIMARY KEY,
  request_no TEXT NOT NULL UNIQUE,
  supplier_id TEXT,
  supplier_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  total_amount_cny REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_at TEXT,
  approved_at TEXT,
  paid_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS finance_payment_request_items (
  request_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (request_id, item_id),
  FOREIGN KEY (request_id) REFERENCES finance_payment_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES finance_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_finance_items_direction_status ON finance_items(direction, status);
CREATE INDEX IF NOT EXISTS idx_finance_items_task ON finance_items(task_id);
CREATE INDEX IF NOT EXISTS idx_finance_items_project ON finance_items(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_items_customer ON finance_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_items_supplier ON finance_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_finance_bills_customer ON finance_bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_payment_requests_supplier ON finance_payment_requests(supplier_id);
