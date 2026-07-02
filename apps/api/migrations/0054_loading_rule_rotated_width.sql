INSERT OR IGNORE INTO loading_rules (
  id, rule_code, rule_name, category, value_type, rule_value, unit, enabled, description, sort_order, applicable_countries
) VALUES (
  'lrule-rotatedLoadMaxWidthMm',
  'rotatedLoadMaxWidthMm',
  '旋转横置最大占宽',
  '装载规则',
  'number',
  '3500',
  'mm',
  1,
  '货物旋转横置装车时，横置后的占车宽度不能超过 3500mm；超过则不按横置缩短长度处理。',
  175,
  '[]'
);

UPDATE loading_rules
SET rule_name = '旋转横置最大占宽',
    category = '装载规则',
    value_type = 'number',
    rule_value = '3500',
    unit = 'mm',
    enabled = 1,
    description = '货物旋转横置装车时，横置后的占车宽度不能超过 3500mm；超过则不按横置缩短长度处理。',
    sort_order = 175,
    updated_at = CURRENT_TIMESTAMP
WHERE rule_code = 'rotatedLoadMaxWidthMm';
