ALTER TABLE transport_inquiries ADD COLUMN quote_amount REAL;
ALTER TABLE transport_inquiries ADD COLUMN quote_currency TEXT;
ALTER TABLE transport_inquiries ADD COLUMN quote_remark TEXT;
ALTER TABLE transport_inquiries ADD COLUMN quote_files TEXT NOT NULL DEFAULT '[]';
ALTER TABLE transport_inquiries ADD COLUMN solution_files TEXT NOT NULL DEFAULT '[]';
ALTER TABLE transport_inquiries ADD COLUMN quoted_at TEXT;
