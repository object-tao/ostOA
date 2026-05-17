UPDATE vehicle_types
SET price_sort = CASE
  WHEN category = '蓬布车' THEN 10
  WHEN category = '普通平板车' THEN 20
  WHEN category = '冷藏车' THEN 30
  WHEN category = '超限车' THEN 40
  ELSE 99
END
WHERE price_sort IS NULL;
