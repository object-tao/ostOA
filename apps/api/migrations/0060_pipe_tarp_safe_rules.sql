INSERT OR REPLACE INTO loading_rules (
  id, rule_code, rule_name, category, value_type, rule_value, unit, enabled, description, sort_order, applicable_countries
) VALUES
(
  'lrule-pipeBatchTarpSafeMaxWeightKg',
  'pipeBatchTarpSafeMaxWeightKg',
  '大直径管材篷布稳妥单车重量',
  '管材规则',
  'number',
  '19000',
  'kg',
  1,
  '报价稳妥模式下，大直径管材使用篷布大通道时，单车按约 19 吨控制，避免仅按载重极限压缩车数；执行阶段可由现场复核后再压缩优化。',
  257,
  '[]'
),
(
  'lrule-pipeBatchLargeDiameterMm',
  'pipeBatchLargeDiameterMm',
  '大直径管材判定阈值',
  '管材规则',
  'number',
  '900',
  'mm',
  1,
  '管材外径或客户给出的宽高外包尺寸达到该值时，按大直径管材处理；可摆放/可堆叠只表示同类管材可分层并排，不等于可以按车辆载重极限压满。',
  258,
  '[]'
);
