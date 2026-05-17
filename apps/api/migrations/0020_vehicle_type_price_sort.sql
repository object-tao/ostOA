ALTER TABLE vehicle_types ADD COLUMN price_sort INTEGER;

CREATE INDEX IF NOT EXISTS idx_vehicle_types_price_sort ON vehicle_types(price_sort);
