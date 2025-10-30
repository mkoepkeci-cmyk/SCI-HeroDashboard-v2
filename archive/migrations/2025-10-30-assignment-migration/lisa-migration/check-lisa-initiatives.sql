-- Check Lisa Townsend's initiatives by status
SELECT
  status,
  COUNT(*) as count,
  STRING_AGG(initiative_name, ', ') as initiatives
FROM initiatives
WHERE owner_name = 'Lisa Townsend'
  AND (status IS NULL OR status != 'Deleted')
GROUP BY status
ORDER BY status;

-- Check specifically for "On Hold" status
SELECT
  initiative_name,
  status,
  type,
  work_effort
FROM initiatives
WHERE owner_name = 'Lisa Townsend'
  AND status = 'On Hold';

-- Total count of active initiatives (matching our filter)
SELECT COUNT(*) as total_active_initiatives
FROM initiatives
WHERE owner_name = 'Lisa Townsend'
  AND status IN ('Active', 'Planning', 'Scaling', 'Not Started', 'In Progress', 'On Hold')
  AND (status IS NULL OR status != 'Deleted');
