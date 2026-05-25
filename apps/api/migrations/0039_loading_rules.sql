CREATE TABLE IF NOT EXISTS loading_rules (
  id TEXT PRIMARY KEY,
  rule_code TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '通用规则',
  value_type TEXT NOT NULL DEFAULT 'number',
  rule_value TEXT NOT NULL,
  unit TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO loading_rules (
  id, rule_code, rule_name, category, value_type, rule_value, unit, enabled, description, sort_order
) VALUES
('lrule-flatbedWeightLimitKg', 'flatbedWeightLimitKg', '平板车重量上限', '重量规则', 'number', '31000', 'kg', 1, '平板车可申请超限证处理超长、超宽、超高，但重量不能超过该值。', 10),
('lrule-indivisibleSingleVehicleKg', 'indivisibleSingleVehicleKg', '不可拆分单件重量阈值', '重量规则', 'number', '44000', 'kg', 1, '除非是一件且不可拆分，否则单车总重不能超过该值。', 20),
('lrule-oversizeWidthMm', 'oversizeWidthMm', '超宽提醒阈值', '尺寸规则', 'number', '3000', 'mm', 1, '货物宽度超过该值时提醒需要核验超宽许可。', 30),
('lrule-oversizeHeightMm', 'oversizeHeightMm', '超高提醒阈值', '尺寸规则', 'number', '4500', 'mm', 1, '货物高度超过该值时提醒需要核验超高许可。', 40),
('lrule-projectBatchMinItems', 'projectBatchMinItems', '项目批量配载最小件数', '批量规则', 'number', '60', '件', 1, '大批量货物触发项目批量配载策略的最小件数。', 50),
('lrule-projectBatchSlashRatio', 'projectBatchSlashRatio', '斜杠编号批量比例', '批量规则', 'number', '0.45', '', 1, '斜杠编号货物占比达到该比例时按项目批量货物处理。', 60),
('lrule-tarpNarrowWidthMm', 'tarpNarrowWidthMm', '篷布车窄货宽度阈值', '车型偏好', 'number', '1100', 'mm', 1, '窄货、低货、长货组合优先尝试篷布车以降低总体成本。', 70),
('lrule-tarpLowHeightMm', 'tarpLowHeightMm', '篷布车低货高度阈值', '车型偏好', 'number', '900', 'mm', 1, '低货组合优先尝试篷布车。', 80),
('lrule-tarpLongLengthMm', 'tarpLongLengthMm', '篷布车长货长度阈值', '车型偏好', 'number', '9000', 'mm', 1, '长而窄低的货物可尝试篷布车组合。', 90),
('lrule-oversizeCandidateWidthMm', 'oversizeCandidateWidthMm', '超限车候选宽度阈值', '车型偏好', 'number', '2500', 'mm', 1, '货物宽度超过该值时可优先考虑超限车。', 100),
('lrule-oversizeSoftVolumeCbm', 'oversizeSoftVolumeCbm', '超限车软方数', '车型偏好', 'number', '200', 'm3', 1, '无明确车辆方数时用于超限车组合的软约束。', 110),
('lrule-flatbedSoftWidthMm', 'flatbedSoftWidthMm', '平板车软宽度', '车型偏好', 'number', '2700', 'mm', 1, '普通平板车组合时使用的软宽度判断。', 120),
('lrule-flatbedDeckWidthMm', 'flatbedDeckWidthMm', '平板车板宽', '车型偏好', 'number', '2500', 'mm', 1, '普通平板车默认板宽，用于风险提醒和组合判断。', 130),
('lrule-flatbedCostPlanLengthMm', 'flatbedCostPlanLengthMm', '平板车成本组合长度', '成本规则', 'number', '17000', 'mm', 1, '长货并车时用于总体成本方案比较的目标长度。', 140),
('lrule-mediumFlatbedSeedWeightKg', 'mediumFlatbedSeedWeightKg', '中型平板组合起始重量', '成本规则', 'number', '12000', 'kg', 1, '中等重量货物触发平板组合的参考重量。', 150),
('lrule-russiaMaxVehicleCargoHeightMm', 'russiaMaxVehicleCargoHeightMm', '俄罗斯车货总高上限', '国家规则', 'number', '5200', 'mm', 1, '俄罗斯方向车加货总高不能超过该值。', 160);
