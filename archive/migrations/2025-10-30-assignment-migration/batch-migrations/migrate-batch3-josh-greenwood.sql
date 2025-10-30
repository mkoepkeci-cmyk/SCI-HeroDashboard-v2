-- BATCH 3: Josh Greenwood Migration (26 Items)
-- High Priority - Largest single migration
-- Requires thorough validation

-- ===========================================================================
-- STEP 0: Preview Josh's unique items BEFORE migration
-- ===========================================================================
SELECT
  'Josh Greenwood Unique Items - Page 1' as preview,
  a.assignment_name,
  a.work_type,
  a.status,
  a.work_effort,
  a.phase
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Josh Greenwood')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
)
ORDER BY a.assignment_name
LIMIT 26;

-- Count verification
SELECT
  'Total Unique Items for Josh' as count_check,
  COUNT(*) as total,
  'Expected: 26' as expected
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Josh Greenwood')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
);

-- ===========================================================================
-- STEP 1: Migrate Josh's unique assignments to initiatives
-- ===========================================================================
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
  'Josh Greenwood' as owner_name,
  a.assignment_name as initiative_name,
  a.work_type as type,
  a.status,
  a.phase,
  a.work_effort,
  COALESCE(a.role_type, 'Owner') as role,
  a.team_member_id,
  false as is_draft,
  true as is_active,
  CASE
    WHEN a.status IN ('Complete', 'Completed') THEN 100
    ELSE 14
  END as completion_percentage,
  a.created_at,
  NOW() as updated_at,
  'MIGRATION_BATCH3_JOSH_GREENWOOD' as last_updated_by
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Josh Greenwood')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
);

-- ===========================================================================
-- STEP 2: Mark assignments as migrated
-- ===========================================================================
UPDATE assignments a
SET
  migrated_to_initiatives = true,
  migration_status = CASE
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by != 'MIGRATION_BATCH3_JOSH_GREENWOOD'
    ) THEN 'DUPLICATE_ALREADY_IN_INITIATIVES'
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by = 'MIGRATION_BATCH3_JOSH_GREENWOOD'
    ) THEN 'NEWLY_MIGRATED_BATCH3'
    ELSE 'ERROR_NO_MATCH_FOUND'
  END
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Josh Greenwood');

-- ===========================================================================
-- STEP 3: Validation
-- ===========================================================================

-- Total migrated (should be 26)
SELECT
  'Josh Greenwood Migration' as check_name,
  COUNT(*) as items_migrated,
  'Expected: 26' as expected,
  CASE WHEN COUNT(*) = 26 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH3_JOSH_GREENWOOD';

-- Check for duplicates (should be 0)
SELECT
  'Duplicate Check' as check_name,
  initiative_name,
  COUNT(*) as duplicate_count,
  '❌ FAIL - Duplicate found!' as status
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Josh Greenwood')
  AND status != 'Deleted'
GROUP BY initiative_name
HAVING COUNT(*) > 1;

-- Josh's new total initiatives (should be 75 + 26 = 101)
SELECT
  'Josh Total Initiatives' as check_name,
  COUNT(*) as total,
  'Expected: 101 (75 existing + 26 migrated)' as expected
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Josh Greenwood')
  AND status != 'Deleted';

-- List all migrated items (paginated)
SELECT
  'Migrated Items Page 1 (1-20)' as page,
  initiative_name,
  type,
  status,
  work_effort
FROM (
  SELECT
    initiative_name,
    type,
    status,
    work_effort,
    ROW_NUMBER() OVER (ORDER BY initiative_name) as row_num
  FROM initiatives
  WHERE last_updated_by = 'MIGRATION_BATCH3_JOSH_GREENWOOD'
) numbered
WHERE row_num <= 20
ORDER BY initiative_name;

-- Migrated items page 2
SELECT
  'Migrated Items Page 2 (21-26)' as page,
  initiative_name,
  type,
  status,
  work_effort
FROM (
  SELECT
    initiative_name,
    type,
    status,
    work_effort,
    ROW_NUMBER() OVER (ORDER BY initiative_name) as row_num
  FROM initiatives
  WHERE last_updated_by = 'MIGRATION_BATCH3_JOSH_GREENWOOD'
) numbered
WHERE row_num > 20
ORDER BY initiative_name;

-- Assignment migration status breakdown
SELECT
  'Assignment Status' as check_name,
  migration_status,
  COUNT(*) as count
FROM assignments
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Josh Greenwood')
GROUP BY migration_status
ORDER BY migration_status;

SELECT 'BATCH 3 (JOSH GREENWOOD) MIGRATION COMPLETE' as status,
       '26 items migrated - Josh now has 101 total initiatives' as result;
