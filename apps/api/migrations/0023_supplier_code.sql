ALTER TABLE suppliers ADD COLUMN supplier_code TEXT;

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(supplier_code);
