CREATE TABLE IF NOT EXISTS workflow_node_tracking_records (
  id TEXT PRIMARY KEY,
  instance_id TEXT NOT NULL,
  instance_node_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  node_name TEXT NOT NULL,
  tracked_at TEXT NOT NULL,
  location TEXT,
  tracking_status TEXT,
  content TEXT NOT NULL,
  operator TEXT,
  customer_visible INTEGER NOT NULL DEFAULT 0,
  visibility_level TEXT NOT NULL DEFAULT '内部资料',
  files_json TEXT NOT NULL DEFAULT '[]',
  remark TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE,
  FOREIGN KEY (instance_node_id) REFERENCES workflow_instance_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES oversize_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES oversize_project_tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workflow_tracking_instance ON workflow_node_tracking_records(instance_id, tracked_at);
CREATE INDEX IF NOT EXISTS idx_workflow_tracking_node ON workflow_node_tracking_records(instance_node_id, tracked_at);
