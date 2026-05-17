DELETE FROM workflow_node_form_fields
WHERE template_node_id = 'wftn_domestic'
  AND (
    field_key IN ('driverName', 'driverphone', 'driverPhone', 'plateNumber', 'platenumber', 'trailerPlate', 'trailerplate')
    OR field_name IN ('司机姓名', '司机电话', '车牌号码', '挂车车牌')
  );
