-- Simple count: How many initiatives does Lisa have with active statuses?
SELECT COUNT(*) as lisa_active_count
FROM initiatives
WHERE owner_name = 'Lisa Townsend'
  AND status IN ('Active', 'Planning', 'Scaling', 'Not Started', 'In Progress', 'On Hold');

-- Break it down by status
SELECT status, COUNT(*) as count
FROM initiatives
WHERE owner_name = 'Lisa Townsend'
  AND status IN ('Active', 'Planning', 'Scaling', 'Not Started', 'In Progress', 'On Hold')
GROUP BY status
ORDER BY status;
