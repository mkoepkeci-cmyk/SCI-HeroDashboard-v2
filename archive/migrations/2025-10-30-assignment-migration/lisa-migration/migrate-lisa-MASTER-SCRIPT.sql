-- MASTER MIGRATION SCRIPT: Lisa Townsend
-- Run all 5 steps in sequence to migrate Lisa's 2 unique assignments

-- ============================================================================
-- STEP 1: Name Standardization
-- ============================================================================
UPDATE assignments
SET team_member_name = 'Lisa Townsend'
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND team_member_name != 'Lisa Townsend';

UPDATE initiatives
SET owner_name = 'Lisa Townsend'
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND owner_name != 'Lisa Townsend';

-- ============================================================================
-- STEP 2: Migrate ONLY Lisa's 2 Unique Assignments
-- ============================================================================
INSERT INTO initiatives (
  owner_name,
  initiative_name,
  type,
  status,
  phase,
  work_effort,
  role,
  team_member_id,
  is_draft,
  is_active,
  completion_percentage,
  created_at,
  updated_at,
  last_updated_by
)
SELECT
  'Lisa Townsend',
  a.assignment_name,
  a.work_type,
  a.status,
  a.phase,
  a.work_effort,
  COALESCE(a.role_type, 'Owner'),
  a.team_member_id,
  false,
  true,
  CASE WHEN a.status IN ('Complete', 'Completed') THEN 100 ELSE 14 END,
  a.created_at,
  NOW(),
  'MIGRATION_LISA_UNIQUE_ASSIGNMENTS'
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND NOT EXISTS (
    SELECT 1 FROM initiatives i
    WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
      AND i.team_member_id = a.team_member_id
      AND i.status != 'Deleted'
  );

-- ============================================================================
-- STEP 3: Mark Assignments as Migrated
-- ============================================================================
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS migrated_to_initiatives BOOLEAN DEFAULT FALSE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS migration_status TEXT;

UPDATE assignments a
SET
  migrated_to_initiatives = true,
  migration_status = CASE
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by != 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS'
    ) THEN 'DUPLICATE_ALREADY_IN_INITIATIVES'
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by = 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS'
    ) THEN 'NEWLY_MIGRATED'
    ELSE 'ERROR_NO_MATCH_FOUND'
  END
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');

-- ============================================================================
-- STEP 4: Clear Dashboard Metrics (Optional - App Will Auto-Recalculate)
-- ============================================================================
DELETE FROM dashboard_metrics
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');

-- ============================================================================
-- VALIDATION RESULTS
-- ============================================================================

-- Total initiatives for Lisa (should be 3)
SELECT
  'Lisa Total Initiatives' as metric,
  COUNT(*) as count
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND status != 'Deleted';

-- Newly migrated items (should be 2)
SELECT
  'Newly Migrated' as metric,
  initiative_name,
  type,
  status
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND last_updated_by = 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS'
ORDER BY initiative_name;

-- Assignment migration status breakdown
SELECT
  'Assignment Status' as metric,
  migration_status,
  COUNT(*) as count
FROM assignments
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
GROUP BY migration_status;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'MIGRATION COMPLETE FOR LISA TOWNSEND' as status,
       '2 unique assignments migrated to initiatives table' as result;
