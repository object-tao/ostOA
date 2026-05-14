ALTER TABLE customers ADD COLUMN short_name TEXT;

UPDATE customers SET short_name = 'Obsidian' WHERE id = 'cus_001' AND short_name IS NULL;
UPDATE customers SET short_name = 'Harbor' WHERE id = 'cus_002' AND short_name IS NULL;
UPDATE customers SET short_name = 'North Vale' WHERE id = 'cus_003' AND short_name IS NULL;

INSERT OR IGNORE INTO tag_groups (id, name, description, sort_order)
VALUES ('grp_business', '业务标签', '默认业务分类标签', 0);

INSERT OR IGNORE INTO tags (id, group_id, name, color)
VALUES
  ('tag_consolidation_customer', 'grp_business', '集运客户', 'blue'),
  ('tag_oversized_transport', 'grp_business', '大件运输', 'orange'),
  ('tag_ip', 'grp_business', 'IP', 'purple'),
  ('tag_cross_border_ecommerce', 'grp_business', '跨境电商', 'green'),
  ('tag_kazakhstan', 'grp_business', '哈萨克斯坦', 'cyan');
