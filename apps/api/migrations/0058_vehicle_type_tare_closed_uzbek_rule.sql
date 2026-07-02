ALTER TABLE vehicle_types ADD COLUMN tare_weight REAL;
ALTER TABLE vehicle_types ADD COLUMN is_closed INTEGER NOT NULL DEFAULT 0;

INSERT OR REPLACE INTO loading_rules (
  id,
  rule_code,
  rule_name,
  category,
  value_type,
  rule_value,
  unit,
  enabled,
  description,
  sort_order,
  applicable_countries
) VALUES (
  'lrule-uzbekistanMultiCargoHardSplitWeightKg',
  'uzbekistanMultiCargoHardSplitWeightKg',
  '乌兹别克多件合装重量上限',
  '国家规则',
  'number',
  '44000',
  'kg',
  1,
  '经过或到达乌兹别克时，多件合装单车总重不允许超过44吨；除非是一件不可拆分货物，否则必须拆车。',
  167,
  '["乌兹别克","乌兹别克斯坦"]'
);
