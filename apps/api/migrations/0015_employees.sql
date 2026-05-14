CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  department TEXT,
  position TEXT,
  is_salesperson INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_salesperson ON employees(is_salesperson);

INSERT OR IGNORE INTO employees (
  id, name, phone, email, department, position, is_salesperson, status, notes, created_at, updated_at
) VALUES
  ('emp_admin', '系统管理员', '', 'admin@obiecrm.com', '管理部', '管理员', 0, 'ACTIVE', '默认管理员账号', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp_sales_001', '业务一部', '', '', '业务部', '业务员', 1, 'ACTIVE', '默认业务员，可按实际人员修改', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
