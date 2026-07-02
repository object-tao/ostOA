UPDATE workflow_instance_nodes
SET working_time_rule_id = (
  SELECT workflow_template_nodes.working_time_rule_id
  FROM workflow_template_nodes
  WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id
)
WHERE (working_time_rule_id IS NULL OR working_time_rule_id = '')
  AND EXISTS (
    SELECT 1
    FROM workflow_template_nodes
    WHERE workflow_template_nodes.id = workflow_instance_nodes.template_node_id
      AND workflow_template_nodes.working_time_rule_id IS NOT NULL
      AND workflow_template_nodes.working_time_rule_id <> ''
  );
