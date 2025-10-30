-- Check all unique owner names in initiatives table
SELECT DISTINCT owner_name, COUNT(*) as initiative_count
FROM initiatives
WHERE owner_name IS NOT NULL
GROUP BY owner_name
ORDER BY owner_name;

-- Check all team member names
SELECT id, name, email
FROM team_members
ORDER BY name;

-- Check governance request assignments
SELECT DISTINCT assigned_sci_name, COUNT(*) as request_count
FROM governance_requests
WHERE assigned_sci_name IS NOT NULL
GROUP BY assigned_sci_name
ORDER BY assigned_sci_name;
