ALTER TABLE contacts_v2 ADD COLUMN department TEXT;

UPDATE contacts_v2 SET department = '采购部' WHERE id = 'ct_001' AND department IS NULL;
UPDATE contacts_v2 SET department = '工厂运营' WHERE id = 'ct_002' AND department IS NULL;
UPDATE contacts_v2 SET department = '合作伙伴部' WHERE id = 'ct_003' AND department IS NULL;
