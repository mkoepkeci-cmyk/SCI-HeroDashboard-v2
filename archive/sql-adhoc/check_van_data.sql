-- Get Van's team member ID
SELECT id, name FROM team_members WHERE name LIKE '%Van%';

-- Get Van's assignments and check for missing fields
SELECT 
    a.id,
    a.assignment_name,
    a.status,
    a.work_type,
    a.work_effort,
    a.phase,
    a.role_type,
    CASE 
        WHEN a.work_effort IS NULL THEN 'Missing Work Effort'
        WHEN a.phase IS NULL THEN 'Missing Phase'
        WHEN a.role_type IS NULL THEN 'Missing Role Type'
        ELSE 'Complete'
    END as data_status
FROM assignments a
JOIN team_members tm ON a.team_member_id = tm.id
WHERE tm.name LIKE '%Van%'
ORDER BY a.status, a.assignment_name;
