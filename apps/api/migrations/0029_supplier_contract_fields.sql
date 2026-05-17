ALTER TABLE suppliers ADD COLUMN contract_status TEXT NOT NULL DEFAULT '未签署';
ALTER TABLE suppliers ADD COLUMN contract_files TEXT NOT NULL DEFAULT '[]';
