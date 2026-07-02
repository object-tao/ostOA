ALTER TABLE workflow_template_nodes ADD COLUMN require_gps INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_template_nodes ADD COLUMN gps_provider_id TEXT;
ALTER TABLE workflow_template_nodes ADD COLUMN gps_device_no TEXT;

ALTER TABLE workflow_instance_nodes ADD COLUMN require_gps INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_instance_nodes ADD COLUMN gps_provider_id TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN gps_device_no TEXT;

UPDATE workflow_instance_nodes
SET require_gps = COALESCE(
      (SELECT require_gps FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id),
      0
    ),
    gps_provider_id = COALESCE(
      gps_provider_id,
      (SELECT gps_provider_id FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id)
    ),
    gps_device_no = COALESCE(
      gps_device_no,
      (SELECT gps_device_no FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id)
    );
