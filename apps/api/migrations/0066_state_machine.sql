CREATE TABLE IF NOT EXISTS state_machine_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'workflow_node',
  event_type TEXT NOT NULL DEFAULT 'workflow.node.completed',
  condition_json TEXT NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL DEFAULT 'log_only',
  action_config_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  remark TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS state_machine_events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'system',
  scope TEXT NOT NULL DEFAULT 'workflow_node',
  event_type TEXT NOT NULL,
  ref_id TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT
);

CREATE TABLE IF NOT EXISTS state_machine_logs (
  id TEXT PRIMARY KEY,
  rule_id TEXT,
  event_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_state_machine_rules_event ON state_machine_rules(event_type, enabled);
CREATE INDEX IF NOT EXISTS idx_state_machine_events_type ON state_machine_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_state_machine_logs_event ON state_machine_logs(event_id, created_at);

INSERT OR IGNORE INTO rbac_permissions (id, code, name, module, action, sort_order)
VALUES
  ('perm_state_machine_view', 'stateMachine.view', '查看状态机', '状态机', 'view', 760),
  ('perm_state_machine_manage', 'stateMachine.manage', '管理状态机', '状态机', 'manage', 761);

INSERT OR IGNORE INTO rbac_role_permissions (role_id, permission_id)
SELECT rbac_roles.id, rbac_permissions.id
FROM rbac_roles
JOIN rbac_permissions ON rbac_permissions.code IN ('stateMachine.view', 'stateMachine.manage')
WHERE rbac_roles.code = 'admin';

INSERT OR IGNORE INTO state_machine_rules (
  id, rule_name, scope, event_type, condition_json, action_type, action_config_json, enabled, remark
) VALUES (
  'smr_workflow_waiting_log',
  '流程节点进入待处理时记录事件',
  'workflow_node',
  'workflow.node.waiting',
  '{}',
  'log_only',
  '{}',
  1,
  '第一版默认只记录节点待处理事件，避免和现有飞书待办通知重复。需要时可改为 feishu_card。'
);
