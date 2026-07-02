INSERT OR IGNORE INTO loading_rules (
  id, rule_code, rule_name, category, value_type, rule_value, unit, enabled, description, sort_order, applicable_countries
) VALUES
('lrule-russiaCargoHeightLimitMm', 'russiaCargoHeightLimitMm', '俄罗斯货物有效高度上限', '国家规则', 'number', '4200', 'mm', 1, '俄罗斯车货总高按 5200mm 控制，扣除车辆高度后，系统按货物有效高度 4200mm 校验。', 165, '["俄罗斯"]'),
('lrule-deckPressureLimitKgPerMm', 'deckPressureLimitKgPerMm', '普通平板受力上限', '受力规则', 'number', '4', 'kg/mm', 1, '货物重量除以承载长度大于该值时，普通平板木底板受力不足，必须使用特种板。', 170, '[]');

UPDATE loading_rules
SET rule_name = '俄罗斯车货总高上限',
    rule_value = '5200',
    unit = 'mm',
    description = '俄罗斯方向车辆加货物总高不得超过 5200mm；系统另按货物有效高度 4200mm 自动校验。',
    applicable_countries = '["俄罗斯"]',
    updated_at = CURRENT_TIMESTAMP
WHERE rule_code = 'russiaMaxVehicleCargoHeightMm';

UPDATE loading_rules
SET rule_value = '4200',
    unit = 'mm',
    description = '俄罗斯车货总高按 5200mm 控制，扣除车辆高度后，系统按货物有效高度 4200mm 校验。',
    applicable_countries = '["俄罗斯"]',
    updated_at = CURRENT_TIMESTAMP
WHERE rule_code = 'russiaCargoHeightLimitMm';

UPDATE loading_rules
SET rule_value = '4',
    unit = 'kg/mm',
    description = '货物重量除以承载长度大于该值时，普通平板木底板受力不足，必须使用特种板。',
    updated_at = CURRENT_TIMESTAMP
WHERE rule_code = 'deckPressureLimitKgPerMm';
