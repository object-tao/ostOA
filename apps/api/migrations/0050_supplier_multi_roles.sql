ALTER TABLE suppliers ADD COLUMN types TEXT NOT NULL DEFAULT '[]';

UPDATE suppliers
SET types = '["' || replace(type, '"', '\"') || '"]'
WHERE COALESCE(types, '[]') = '[]'
  AND COALESCE(type, '') != '';

CREATE INDEX IF NOT EXISTS idx_suppliers_types ON suppliers(types);
