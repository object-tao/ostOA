ALTER TABLE loading_rules ADD COLUMN applicable_countries TEXT NOT NULL DEFAULT '[]';

UPDATE loading_rules
SET applicable_countries = '["俄罗斯"]'
WHERE rule_code = 'russiaMaxVehicleCargoHeightMm';
