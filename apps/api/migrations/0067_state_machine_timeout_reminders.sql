UPDATE rbac_permissions
SET name = '查看状态机', module = '状态机'
WHERE code = 'stateMachine.view';

UPDATE rbac_permissions
SET name = '管理状态机', module = '状态机'
WHERE code = 'stateMachine.manage';

UPDATE state_machine_rules
SET
  rule_name = '流程节点进入待处理时记录事件',
  remark = '第一版默认只记录节点待处理事件，避免和现有飞书待办通知重复。需要时可改为 feishu_card。'
WHERE id = 'smr_workflow_waiting_log';

CREATE INDEX IF NOT EXISTS idx_workflow_instance_nodes_timeout_scan
ON workflow_instance_nodes(status, timeout_at);

CREATE INDEX IF NOT EXISTS idx_state_machine_events_ref_type_status
ON state_machine_events(ref_id, event_type, status, created_at);

CREATE INDEX IF NOT EXISTS idx_state_machine_logs_action_status
ON state_machine_logs(action_type, status, created_at);

INSERT OR IGNORE INTO state_machine_rules (
  id, rule_name, scope, event_type, condition_json, action_type, action_config_json, enabled, remark
) VALUES (
  'smr_workflow_timeout_feishu',
  '流程节点超时飞书提醒',
  'workflow_node',
  'workflow.node.timeout',
  '{}',
  'feishu_card',
  '{"maxReminders":10}',
  1,
  '定时状态机每30分钟扫描超时节点，最多向当前责任人发送10次飞书卡片。'
);
