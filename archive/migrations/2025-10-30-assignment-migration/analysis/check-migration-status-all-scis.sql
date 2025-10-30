-- Check migration status for ALL 16 SCIs
-- Compare assignments table vs initiatives table counts

-- Count by team member from assignments table
WITH assignments_counts AS (
  SELECT
    team_member_name,
    COUNT(*) as assignments_count
  FROM assignments
  GROUP BY team_member_name
),

-- Count by team member from initiatives table
initiatives_counts AS (
  SELECT
    owner_name,
    COUNT(*) as initiatives_count
  FROM initiatives
  WHERE status != 'Deleted'
  GROUP BY owner_name
)

-- Compare side by side
SELECT
  COALESCE(a.team_member_name, i.owner_name) as team_member,
  COALESCE(a.assignments_count, 0) as assignments_count,
  COALESCE(i.initiatives_count, 0) as initiatives_count,
  COALESCE(i.initiatives_count, 0) - COALESCE(a.assignments_count, 0) as difference,
  CASE
    WHEN COALESCE(a.assignments_count, 0) = 0 AND COALESCE(i.initiatives_count, 0) > 0
      THEN '✅ Migrated (no assignments, has initiatives)'
    WHEN COALESCE(a.assignments_count, 0) > 0 AND COALESCE(i.initiatives_count, 0) = 0
      THEN '❌ NOT Migrated (has assignments, no initiatives)'
    WHEN COALESCE(a.assignments_count, 0) > 0 AND COALESCE(i.initiatives_count, 0) > 0
      THEN '⚠️ PARTIAL (has both - needs migration)'
    ELSE 'No data'
  END as migration_status
FROM assignments_counts a
FULL OUTER JOIN initiatives_counts i ON a.team_member_name = i.owner_name
ORDER BY team_member;

-- Summary: How many SCIs are fully migrated?
SELECT
  COUNT(DISTINCT team_member_name) as total_scis_with_assignments,
  COUNT(DISTINCT CASE WHEN team_member_name IN (SELECT owner_name FROM initiatives WHERE status != 'Deleted') THEN team_member_name END) as scis_with_initiatives
FROM assignments;
