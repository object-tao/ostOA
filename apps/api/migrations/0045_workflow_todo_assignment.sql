ALTER TABLE workflow_instance_nodes ADD COLUMN owner_role_id TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN owner_role_name TEXT;

ALTER TABLE workflow_todos ADD COLUMN owner_role_id TEXT;
ALTER TABLE workflow_todos ADD COLUMN owner_role_name TEXT;
ALTER TABLE workflow_todos ADD COLUMN assignment_source TEXT;

CREATE INDEX IF NOT EXISTS idx_workflow_todos_role_status ON workflow_todos(owner_role_id, status);
