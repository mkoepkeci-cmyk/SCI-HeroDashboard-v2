SELECT 
  id,
  initiative_name,
  type,
  ehrs_impacted,
  role,
  status,
  service_line,
  created_at,
  updated_at
FROM initiatives
WHERE initiative_name ILIKE '%HRS Integration%Remote Patient%'
ORDER BY created_at DESC;
