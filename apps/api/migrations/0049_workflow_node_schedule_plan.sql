ALTER TABLE workflow_instance_nodes ADD COLUMN planned_start_at TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN planned_end_at TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN planned_duration_hours REAL;
ALTER TABLE workflow_instance_nodes ADD COLUMN warning_before_hours REAL;
ALTER TABLE workflow_instance_nodes ADD COLUMN schedule_remark TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN schedule_updated_at TEXT;

UPDATE workflow_instance_nodes
SET planned_end_at = COALESCE(planned_end_at, timeout_at),
    planned_duration_hours = COALESCE(planned_duration_hours, (
      SELECT timeout_hours
      FROM workflow_template_nodes
      WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id
    )),
    warning_before_hours = COALESCE(warning_before_hours, 0),
    schedule_updated_at = COALESCE(schedule_updated_at, datetime('now'))
WHERE timeout_at IS NOT NULL
   OR template_node_id IS NOT NULL;
