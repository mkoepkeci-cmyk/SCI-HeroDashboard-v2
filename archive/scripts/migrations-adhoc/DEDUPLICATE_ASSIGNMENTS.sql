-- SQL Script to Deduplicate Assignments
-- Run this directly in Supabase SQL Editor

-- Create a temporary table with the IDs to keep (oldest record for each duplicate)
CREATE TEMP TABLE assignments_to_keep AS
SELECT DISTINCT ON (team_member_id, assignment_name) id
FROM assignments
ORDER BY team_member_id, assignment_name, created_at ASC;

-- Show what will be deleted
SELECT
    tm.name as team_member,
    COUNT(*) as duplicates_to_delete
FROM assignments a
JOIN team_members tm ON a.team_member_id = tm.id
WHERE a.id NOT IN (SELECT id FROM assignments_to_keep)
GROUP BY tm.name
ORDER BY tm.name;

-- Delete duplicate assignments (keep only the first/oldest one)
DELETE FROM assignments
WHERE id NOT IN (SELECT id FROM assignments_to_keep);

-- Show final counts
SELECT
    tm.name as team_member,
    COUNT(DISTINCT a.assignment_name) as unique_assignments,
    COUNT(*) as total_assignments,
    COUNT(*) - COUNT(DISTINCT a.assignment_name) as remaining_duplicates
FROM team_members tm
LEFT JOIN assignments a ON tm.id = a.team_member_id
GROUP BY tm.name
ORDER BY tm.name;

-- Drop temp table
DROP TABLE assignments_to_keep;
