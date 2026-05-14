ALTER TABLE customers ADD COLUMN customer_code TEXT;

CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);
