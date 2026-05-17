ALTER TABLE customers ADD COLUMN invoice_info TEXT;

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  contact_info TEXT,
  payee TEXT,
  bank_phone TEXT,
  bank_card_no TEXT,
  bank_name TEXT,
  notes TEXT,
  attachments TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_vehicles (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  plate_no TEXT,
  vehicle_type TEXT,
  required_vehicle_type TEXT,
  vehicle_length TEXT,
  axle TEXT,
  driving_license_files TEXT NOT NULL DEFAULT '[]',
  brand_model TEXT,
  road_transport_cert_no TEXT,
  experience_license_no TEXT,
  inspection_valid_until TEXT,
  operation_cert_review_date TEXT,
  mandatory_scrap_date TEXT,
  vehicle_photo_files TEXT NOT NULL DEFAULT '[]',
  other_files TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS supplier_drivers (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  id_card_no TEXT,
  notes TEXT,
  payee TEXT,
  bank_phone TEXT,
  bank_card_no TEXT,
  bank_name TEXT,
  id_front_files TEXT NOT NULL DEFAULT '[]',
  id_back_files TEXT NOT NULL DEFAULT '[]',
  driver_license_files TEXT NOT NULL DEFAULT '[]',
  insurance_files TEXT NOT NULL DEFAULT '[]',
  international_road_permit_files TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_supplier_vehicles_supplier ON supplier_vehicles(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_drivers_supplier ON supplier_drivers(supplier_id);
