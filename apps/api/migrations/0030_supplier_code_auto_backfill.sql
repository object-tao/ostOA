UPDATE suppliers
SET supplier_code = 'SUP-' || strftime('%Y%m%d', 'now') || '-' || upper(hex(randomblob(3)))
WHERE COALESCE(supplier_code, '') = '';
