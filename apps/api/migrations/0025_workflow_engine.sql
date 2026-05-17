CREATE TABLE IF NOT EXISTS workflow_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT '大件运输',
  enabled INTEGER NOT NULL DEFAULT 1,
  remark TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_template_nodes (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  node_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  node_type TEXT NOT NULL DEFAULT '普通节点',
  default_owner TEXT,
  required INTEGER NOT NULL DEFAULT 1,
  allow_skip INTEGER NOT NULL DEFAULT 0,
  allow_return INTEGER NOT NULL DEFAULT 1,
  require_customer_confirm INTEGER NOT NULL DEFAULT 0,
  require_attachment INTEGER NOT NULL DEFAULT 0,
  timeout_hours INTEGER,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (template_id) REFERENCES workflow_templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_node_form_fields (
  id TEXT PRIMARY KEY,
  template_node_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  required INTEGER NOT NULL DEFAULT 0,
  options_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (template_node_id) REFERENCES workflow_template_nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_node_file_requirements (
  id TEXT PRIMARY KEY,
  template_node_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  allowed_types TEXT NOT NULL DEFAULT 'jpg,png,pdf,xlsx,docx',
  max_count INTEGER NOT NULL DEFAULT 20,
  customer_visible INTEGER NOT NULL DEFAULT 0,
  downloadable INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (template_node_id) REFERENCES workflow_template_nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL UNIQUE,
  project_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '进行中',
  current_node_id TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES oversize_project_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES oversize_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES workflow_templates(id)
);

CREATE TABLE IF NOT EXISTS workflow_instance_nodes (
  id TEXT PRIMARY KEY,
  instance_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  template_node_id TEXT,
  node_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  node_type TEXT NOT NULL DEFAULT '普通节点',
  owner TEXT,
  status TEXT NOT NULL DEFAULT '未开始',
  required INTEGER NOT NULL DEFAULT 1,
  allow_skip INTEGER NOT NULL DEFAULT 0,
  allow_return INTEGER NOT NULL DEFAULT 1,
  require_customer_confirm INTEGER NOT NULL DEFAULT 0,
  timeout_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_node_form_values (
  id TEXT PRIMARY KEY,
  instance_node_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  field_value TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(instance_node_id, field_key),
  FOREIGN KEY (instance_node_id) REFERENCES workflow_instance_nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_node_files (
  id TEXT PRIMARY KEY,
  instance_node_id TEXT NOT NULL,
  file_requirement_id TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  customer_visible INTEGER NOT NULL DEFAULT 0,
  visibility_level TEXT NOT NULL DEFAULT '内部资料',
  uploaded_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (instance_node_id) REFERENCES workflow_instance_nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_transitions (
  id TEXT PRIMARY KEY,
  instance_id TEXT NOT NULL,
  instance_node_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  operator TEXT,
  action TEXT NOT NULL,
  from_node_name TEXT,
  to_node_name TEXT,
  from_status TEXT,
  to_status TEXT,
  remark TEXT,
  attachments_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_todos (
  id TEXT PRIMARY KEY,
  instance_id TEXT NOT NULL,
  instance_node_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  owner TEXT,
  due_at TEXT,
  status TEXT NOT NULL DEFAULT '未处理',
  priority TEXT NOT NULL DEFAULT '普通',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE,
  FOREIGN KEY (instance_node_id) REFERENCES workflow_instance_nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workflow_template_nodes_template ON workflow_template_nodes(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instance_nodes_instance ON workflow_instance_nodes(instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_instance ON workflow_transitions(instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_todos_owner_status ON workflow_todos(owner, status);

INSERT OR IGNORE INTO workflow_templates (id, name, business_type, enabled, remark, created_by, created_at, updated_at)
VALUES ('wft_oversize_standard', '中亚大件运输标准流程', '大件运输', 1, '系统默认流程模板', 'system', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO workflow_template_nodes (
  id, template_id, node_name, sort_order, node_type, required, allow_skip, allow_return,
  require_customer_confirm, require_attachment, timeout_hours, description, created_at, updated_at
) VALUES
('wftn_domestic', 'wft_oversize_standard', '国内运输', 1, '普通节点', 1, 0, 1, 0, 0, 24, '安排国内段运输并跟进提货发运。', datetime('now'), datetime('now')),
('wftn_pickup_check', 'wft_oversize_standard', '接车验货', 2, '确认节点', 1, 0, 1, 0, 0, 24, '接车后完成验货确认。', datetime('now'), datetime('now')),
('wftn_loading_customs', 'wft_oversize_standard', '装车报关', 3, '资料节点', 1, 0, 1, 0, 1, 48, '完成装车、报关资料上传和放行跟进。', datetime('now'), datetime('now')),
('wftn_transit_customs', 'wft_oversize_standard', '转关', 4, '资料节点', 1, 1, 1, 0, 0, 48, '完成转关流程跟进。', datetime('now'), datetime('now')),
('wftn_international', 'wft_oversize_standard', '国际运输', 5, '普通节点', 1, 0, 1, 0, 0, 72, '跟进国际段在途状态。', datetime('now'), datetime('now')),
('wftn_clearance', 'wft_oversize_standard', '清关', 6, '资料节点', 1, 0, 1, 0, 0, 48, '跟进目的国清关状态。', datetime('now'), datetime('now')),
('wftn_unload', 'wft_oversize_standard', '卸货', 7, '确认节点', 1, 0, 1, 1, 1, 24, '完成卸货、签收和客户确认。', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO workflow_node_form_fields (id, template_node_id, field_name, field_key, field_type, required, options_json, sort_order)
VALUES
('wfff_domestic_time', 'wftn_domestic', '提货时间', 'pickupTime', 'datetime', 1, '[]', 1),
('wfff_domestic_address', 'wftn_domestic', '提货地址', 'pickupAddress', 'text', 1, '[]', 2),
('wfff_domestic_driver', 'wftn_domestic', '司机姓名', 'driverName', 'text', 1, '[]', 3),
('wfff_check_time', 'wftn_pickup_check', '接车时间', 'checkTime', 'datetime', 1, '[]', 1),
('wfff_check_result', 'wftn_pickup_check', '验货结果', 'checkResult', 'select', 1, '["正常","异常"]', 2),
('wfff_clearance_start', 'wftn_clearance', '清关开始时间', 'clearanceStartTime', 'datetime', 1, '[]', 1),
('wfff_clearance_status', 'wftn_clearance', '放行状态', 'releaseStatus', 'select', 1, '["未放行","已放行","查验中"]', 2);

INSERT OR IGNORE INTO workflow_node_file_requirements (id, template_node_id, file_name, required, allowed_types, max_count, customer_visible, downloadable)
VALUES
('wffr_loading_photo', 'wftn_loading_customs', '装车照片', 1, 'jpg,png,pdf', 20, 1, 1),
('wffr_customs_doc', 'wftn_loading_customs', '报关单', 1, 'pdf,xlsx,docx,jpg,png', 10, 0, 1),
('wffr_release_doc', 'wftn_loading_customs', '放行凭证', 0, 'pdf,jpg,png', 10, 1, 1),
('wffr_unload_photo', 'wftn_unload', '卸货照片', 1, 'jpg,png,pdf', 20, 1, 1),
('wffr_pod', 'wftn_unload', 'POD签收单', 1, 'pdf,jpg,png', 10, 1, 1);
