ALTER TABLE customers ADD COLUMN contact_name TEXT;
ALTER TABLE customers ADD COLUMN contract_status TEXT NOT NULL DEFAULT '未签署';
ALTER TABLE customers ADD COLUMN contract_files TEXT NOT NULL DEFAULT '[]';
