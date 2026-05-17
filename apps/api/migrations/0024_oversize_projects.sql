CREATE TABLE IF NOT EXISTS oversize_projects (
  id TEXT PRIMARY KEY,
  project_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  manager TEXT,
  status TEXT NOT NULL DEFAULT '待启动',
  service_scope TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS oversize_project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_no TEXT NOT NULL UNIQUE,
  vehicle_no TEXT,
  vehicle_type TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  cargo_summary TEXT,
  planned_departure_date TEXT,
  status TEXT NOT NULL DEFAULT '待发运',
  progress INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES oversize_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oversize_task_nodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  node_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '未开始',
  owner TEXT,
  planned_date TEXT,
  completed_at TEXT,
  notes TEXT,
  files TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES oversize_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES oversize_project_tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oversize_project_todos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT,
  node_id TEXT,
  title TEXT NOT NULL,
  owner TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT '待处理',
  priority TEXT NOT NULL DEFAULT '普通',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES oversize_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES oversize_project_tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (node_id) REFERENCES oversize_task_nodes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS oversize_project_exceptions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT,
  node_id TEXT,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT '一般',
  status TEXT NOT NULL DEFAULT '处理中',
  owner TEXT,
  description TEXT,
  resolution TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES oversize_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES oversize_project_tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (node_id) REFERENCES oversize_task_nodes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_oversize_projects_status ON oversize_projects(status);
CREATE INDEX IF NOT EXISTS idx_oversize_project_tasks_project ON oversize_project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_oversize_task_nodes_task ON oversize_task_nodes(task_id);
CREATE INDEX IF NOT EXISTS idx_oversize_project_todos_project ON oversize_project_todos(project_id);
CREATE INDEX IF NOT EXISTS idx_oversize_project_exceptions_project ON oversize_project_exceptions(project_id);
