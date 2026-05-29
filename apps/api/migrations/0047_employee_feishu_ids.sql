ALTER TABLE employees ADD COLUMN feishu_open_id TEXT;
ALTER TABLE employees ADD COLUMN feishu_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_employees_feishu_open_id ON employees(feishu_open_id);
CREATE INDEX IF NOT EXISTS idx_employees_feishu_user_id ON employees(feishu_user_id);
