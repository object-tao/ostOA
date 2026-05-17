ALTER TABLE workflow_instance_nodes ADD COLUMN service_currency TEXT NOT NULL DEFAULT 'CNY';
ALTER TABLE workflow_instance_nodes ADD COLUMN service_exchange_rate REAL NOT NULL DEFAULT 1;
ALTER TABLE finance_items ADD COLUMN workflow_instance_node_id TEXT;
CREATE INDEX IF NOT EXISTS idx_finance_items_workflow_node ON finance_items(workflow_instance_node_id);
