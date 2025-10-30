-- STEP 4: Validation Queries for Lisa's Migration

-- Check 1: Total initiatives count for Lisa (should be 3)
SELECT
  'Total Initiatives for Lisa' as check_name,
  COUNT(*) as count,
  'Expected: 3 (1 governance + 2 migrated)' as expected
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND status != 'Deleted';

-- Check 2: Verify the 2 newly migrated initiatives
SELECT
  'Newly Migrated Initiatives' as check_name,
  initiative_name,
  type,
  status,
  work_effort,
  completion_percentage,
  last_updated_by
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND last_updated_by = 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS'
ORDER BY initiative_name;

-- Check 3: Verify governance initiative is untouched
SELECT
  'Governance Initiative (Protected)' as check_name,
  request_id,
  initiative_name,
  type,
  status,
  governance_request_id
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND governance_request_id IS NOT NULL;

-- Check 4: Assignment migration status breakdown
SELECT
  'Assignment Migration Status' as check_name,
  migration_status,
  COUNT(*) as count
FROM assignments
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
GROUP BY migration_status
ORDER BY migration_status;

-- Check 5: Compare before/after counts
SELECT
  'Before/After Comparison' as check_name,
  (SELECT COUNT(*) FROM assignments WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')) as assignments_total,
  (SELECT COUNT(*) FROM initiatives WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend') AND status != 'Deleted') as initiatives_total,
  (SELECT COUNT(*) FROM assignments WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend') AND migration_status = 'NEWLY_MIGRATED') as newly_migrated_count;

-- Check 6: List all of Lisa's initiatives with source indication
SELECT
  initiative_name,
  type,
  status,
  CASE
    WHEN governance_request_id IS NOT NULL THEN 'GOVERNANCE PORTAL'
    WHEN last_updated_by = 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS' THEN 'MIGRATED FROM ASSIGNMENTS'
    ELSE 'EXISTING/MANUAL'
  END as source
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND status != 'Deleted'
ORDER BY source, initiative_name;
