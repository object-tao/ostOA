ALTER TABLE workflow_template_nodes ADD COLUMN require_supplier INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_template_nodes ADD COLUMN supplier_types TEXT NOT NULL DEFAULT '[]';
ALTER TABLE workflow_template_nodes ADD COLUMN require_vehicle INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_template_nodes ADD COLUMN require_driver INTEGER NOT NULL DEFAULT 0;

ALTER TABLE workflow_instance_nodes ADD COLUMN require_supplier INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_instance_nodes ADD COLUMN supplier_types TEXT NOT NULL DEFAULT '[]';
ALTER TABLE workflow_instance_nodes ADD COLUMN require_vehicle INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_instance_nodes ADD COLUMN require_driver INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_instance_nodes ADD COLUMN supplier_id TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN supplier_name TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN supplier_type TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN supplier_vehicle_id TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN vehicle_plate_no TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN supplier_driver_id TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN driver_name TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN driver_phone TEXT;
ALTER TABLE workflow_instance_nodes ADD COLUMN service_cost REAL;
ALTER TABLE workflow_instance_nodes ADD COLUMN service_remark TEXT;

UPDATE workflow_template_nodes
SET require_supplier = 1,
    supplier_types = '["国内车队","国内经纪人","自营业务"]',
    require_vehicle = 1,
    require_driver = 1
WHERE node_name = '国内运输';

UPDATE workflow_template_nodes
SET require_supplier = 1,
    supplier_types = '["国外车队","国外经纪人","自营业务"]',
    require_vehicle = 1,
    require_driver = 1
WHERE node_name = '国际运输';

UPDATE workflow_template_nodes
SET require_supplier = 1,
    supplier_types = '["报关行","转关行","自营业务"]',
    require_vehicle = 0,
    require_driver = 0
WHERE node_name IN ('装车报关', '转关');

UPDATE workflow_template_nodes
SET require_supplier = 1,
    supplier_types = '["清关行","国外经纪人","自营业务"]',
    require_vehicle = 0,
    require_driver = 0
WHERE node_name = '清关';

UPDATE workflow_instance_nodes
SET require_supplier = COALESCE((SELECT require_supplier FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id), 0),
    supplier_types = COALESCE((SELECT supplier_types FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id), '[]'),
    require_vehicle = COALESCE((SELECT require_vehicle FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id), 0),
    require_driver = COALESCE((SELECT require_driver FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id), 0);
