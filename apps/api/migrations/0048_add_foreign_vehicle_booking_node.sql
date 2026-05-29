UPDATE workflow_template_nodes
SET sort_order = sort_order + 1,
    updated_at = datetime('now')
WHERE template_id = 'wft_oversize_standard'
  AND sort_order >= 3
  AND NOT EXISTS (
    SELECT 1
    FROM workflow_template_nodes existing
    WHERE existing.template_id = 'wft_oversize_standard'
      AND existing.id = 'wftn_foreign_vehicle_booking'
  );

INSERT OR IGNORE INTO workflow_template_nodes (
  id, template_id, node_name, sort_order, node_type, required, allow_skip, allow_return,
  require_customer_confirm, require_attachment, require_supplier, supplier_types,
  require_vehicle, require_driver, timeout_hours, description, created_at, updated_at
) VALUES (
  'wftn_foreign_vehicle_booking',
  'wft_oversize_standard',
  '境外车预定',
  3,
  '资料节点',
  1,
  0,
  1,
  0,
  0,
  1,
  '["国外车队","国外经纪人","自营业务"]',
  1,
  0,
  24,
  '预定境外车辆，反馈车队、车辆、价格、币种和预计到车信息。',
  datetime('now'),
  datetime('now')
);

INSERT OR IGNORE INTO workflow_node_form_fields (
  id, template_node_id, field_name, field_key, field_type, required, options_json, sort_order
) VALUES
('wfff_foreign_booking_vehicle_info', 'wftn_foreign_vehicle_booking', '预定车辆信息', 'vehicleBookingInfo', 'textarea', 1, '[]', 1),
('wfff_foreign_booking_price', 'wftn_foreign_vehicle_booking', '报价金额', 'quoteAmount', 'number', 1, '[]', 2),
('wfff_foreign_booking_currency', 'wftn_foreign_vehicle_booking', '币种', 'currency', 'select', 1, '["USD","CNY","KZT","RUB"]', 3),
('wfff_foreign_booking_eta', 'wftn_foreign_vehicle_booking', '预计到车时间', 'vehicleEta', 'datetime', 0, '[]', 4),
('wfff_foreign_booking_price_note', 'wftn_foreign_vehicle_booking', '价格说明', 'priceNote', 'textarea', 0, '[]', 5);

INSERT OR IGNORE INTO workflow_node_file_requirements (
  id, template_node_id, file_name, required, allowed_types, max_count, customer_visible, downloadable
) VALUES
('wffr_foreign_booking_quote', 'wftn_foreign_vehicle_booking', '境外车报价/确认单', 0, 'jpg,png,pdf,xlsx,docx', 10, 0, 1);

UPDATE oversize_projects
SET workflow_node_ids = CASE
  WHEN workflow_node_ids IS NULL OR trim(workflow_node_ids) = '' OR trim(workflow_node_ids) = '[]' THEN workflow_node_ids
  WHEN instr(workflow_node_ids, '"wftn_foreign_vehicle_booking"') > 0 THEN workflow_node_ids
  WHEN instr(workflow_node_ids, '"wftn_pickup_check"') > 0 THEN replace(workflow_node_ids, '"wftn_pickup_check"', '"wftn_pickup_check","wftn_foreign_vehicle_booking"')
  ELSE substr(workflow_node_ids, 1, length(workflow_node_ids) - 1) || ',"wftn_foreign_vehicle_booking"]'
END
WHERE workflow_template_id = 'wft_oversize_standard';

UPDATE workflow_instance_nodes
SET sort_order = sort_order + 1,
    updated_at = datetime('now')
WHERE instance_id IN (
    SELECT id FROM workflow_instances WHERE template_id = 'wft_oversize_standard'
  )
  AND sort_order >= 3
  AND NOT EXISTS (
    SELECT 1
    FROM workflow_instance_nodes existing
    WHERE existing.instance_id = workflow_instance_nodes.instance_id
      AND existing.node_name = '境外车预定'
  );

INSERT OR IGNORE INTO workflow_instance_nodes (
  id, instance_id, task_id, project_id, template_node_id, node_name, sort_order, node_type,
  owner, status, required, allow_skip, allow_return, require_customer_confirm,
  require_supplier, supplier_types, require_vehicle, require_driver,
  created_at, updated_at
)
SELECT
  'wfin_foreign_booking_' || workflow_instances.id,
  workflow_instances.id,
  workflow_instances.task_id,
  workflow_instances.project_id,
  'wftn_foreign_vehicle_booking',
  '境外车预定',
  3,
  '资料节点',
  NULL,
  '未开始',
  1,
  0,
  1,
  0,
  1,
  '["国外车队","国外经纪人","自营业务"]',
  1,
  0,
  datetime('now'),
  datetime('now')
FROM workflow_instances
WHERE workflow_instances.template_id = 'wft_oversize_standard'
  AND NOT EXISTS (
    SELECT 1
    FROM workflow_instance_nodes existing
    WHERE existing.instance_id = workflow_instances.id
      AND existing.node_name = '境外车预定'
  );
