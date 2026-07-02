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
  'lrule-russiaOversizeConsolidationCostFirst',
  'russiaOversizeConsolidationCostFirst',
  '俄罗斯超限车合装成本优先',
  '国家规则',
  'text',
  '到俄罗斯且不经过乌兹别克时，允许将多件宽高重货集中到一台超限车，超过44吨时不按乌兹别克多件合装限制拆车；必须人工复核轴荷、证件、路线、绑扎和车辆承载等级。剩余普通货优先使用13.6米6轴平板压缩车数。',
  NULL,
  1,
  '沉淀自实际配载：俄罗斯/明斯克线路应按整票总成本优化，先用超限车集中处理宽高重货，再用13.6米6轴平板消化剩余货物；该规则不适用于经过乌兹别克的线路。',
  166,
  '["俄罗斯"]'
);
