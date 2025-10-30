-- Re-Analysis After Name Standardization (FIXED)
-- This will show TRUE unique counts now that names are standardized

-- Full summary for ALL SCIs
WITH sci_summary AS (
  SELECT
    tm.id as team_member_id,
    tm.name as canonical_name,
    COALESCE(
      (SELECT COUNT(*) FROM assignments WHERE team_member_id = tm.id),
      0
    ) as assignments_count,
    COALESCE(
      (SELECT COUNT(*) FROM initiatives WHERE team_member_id = tm.id AND status != 'Deleted'),
      0
    ) as initiatives_count,
    COALESCE(
      (SELECT COUNT(*) FROM initiatives WHERE team_member_id = tm.id AND status != 'Deleted' AND governance_request_id IS NOT NULL),
      0
    ) as governance_count,
    COALESCE(
      (SELECT COUNT(*)
       FROM assignments a
       WHERE a.team_member_id = tm.id
         AND NOT EXISTS (
           SELECT 1 FROM initiatives i
           WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
             AND i.team_member_id = a.team_member_id
             AND i.status != 'Deleted'
         )
      ),
      0
    ) as unique_assignments_to_migrate,
    COALESCE(
      (SELECT COUNT(*)
       FROM assignments a
       WHERE a.team_member_id = tm.id
         AND EXISTS (
           SELECT 1 FROM initiatives i
           WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
             AND i.team_member_id = a.team_member_id
             AND i.status != 'Deleted'
         )
      ),
      0
    ) as duplicate_assignments
  FROM team_members tm
)
SELECT
  canonical_name,
  assignments_count,
  initiatives_count,
  governance_count,
  duplicate_assignments,
  unique_assignments_to_migrate,
  CASE
    WHEN unique_assignments_to_migrate = 0 THEN '✅ Complete'
    WHEN unique_assignments_to_migrate > 0 AND unique_assignments_to_migrate <= 5 THEN '⚠️ Low Priority'
    WHEN unique_assignments_to_migrate > 5 AND unique_assignments_to_migrate <= 15 THEN '🟡 Medium Priority'
    WHEN unique_assignments_to_migrate > 15 THEN '🔴 High Priority'
    ELSE 'Unknown'
  END as migration_priority
FROM sci_summary
WHERE assignments_count > 0 OR initiatives_count > 0
ORDER BY unique_assignments_to_migrate DESC, canonical_name;
