UPDATE workflow_template_nodes
SET require_gps = 0
WHERE node_name = '国际运输'
  AND COALESCE(gps_provider_id, '') = ''
  AND COALESCE(gps_device_no, '') = '';

UPDATE workflow_instance_nodes
SET require_gps = COALESCE(
      (SELECT require_gps FROM workflow_template_nodes WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id),
      0
    )
WHERE node_name = '国际运输'
  AND COALESCE(gps_provider_id, '') = ''
  AND COALESCE(gps_device_no, '') = '';
