ALTER TABLE oversize_projects ADD COLUMN workflow_template_id TEXT;
ALTER TABLE oversize_projects ADD COLUMN workflow_node_ids TEXT NOT NULL DEFAULT '[]';

UPDATE oversize_projects
SET workflow_template_id = COALESCE(workflow_template_id, 'wft_oversize_standard')
WHERE workflow_template_id IS NULL;
