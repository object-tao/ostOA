UPDATE workflow_template_nodes
SET gps_provider_id = NULL,
    gps_device_no = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE gps_provider_id IS NOT NULL
   OR gps_device_no IS NOT NULL;

UPDATE workflow_instance_nodes
SET gps_provider_id = NULL,
    gps_device_no = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE gps_provider_id IS NOT NULL
   OR gps_device_no IS NOT NULL;
