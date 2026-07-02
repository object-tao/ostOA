-- 蓬布车有顶，车辆有效高度统一按 2.9 米控制。
UPDATE vehicle_types
SET effective_height = 2.9
WHERE category LIKE '%蓬布%'
   OR category LIKE '%篷布%'
   OR name LIKE '%蓬布%'
   OR name LIKE '%篷布%';
