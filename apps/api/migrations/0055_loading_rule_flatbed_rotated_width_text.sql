UPDATE loading_rules
SET rule_name = '平板车横置最大占宽',
    category = '平板车规则',
    description = '适用于普通平板车、特种平板车：货物旋转横置装车时，横置后的占车宽度不能超过 3500mm；超过则不按横置缩短长度处理。',
    updated_at = CURRENT_TIMESTAMP
WHERE rule_code = 'rotatedLoadMaxWidthMm';
