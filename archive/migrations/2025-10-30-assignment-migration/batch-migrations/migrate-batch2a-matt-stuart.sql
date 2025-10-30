-- BATCH 2A: Matt Stuart Migration (9 Items)
-- Medium Priority - Matt left the organization
-- Need to verify these items are still relevant

-- ===========================================================================
-- STEP 0: Preview Matt's unique items BEFORE migration
-- ===========================================================================
SELECT
  'Matt Stuart Unique Items' as preview,
  a.assignment_name,
  a.work_type,
  a.status,
  a.work_effort,
  a.phase,
  'Review: Should this stay with Matt or transfer to someone else?' as action_needed
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Matt Stuart')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
)
ORDER BY a.assignment_name;

-- ===========================================================================
-- IMPORTANT: REVIEW THE ABOVE LIST BEFORE PROCEEDING
-- ===========================================================================
-- If any items should be transferred to another SCI (e.g., Marty Koepke),
-- do NOT run the migration below. Instead, manually reassign those items first.
-- ===========================================================================

-- ===========================================================================
-- STEP 1: Migrate Matt's unique assignments to initiatives
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
  'Matt Stuart' as owner_name,
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
  'MIGRATION_BATCH2A_MATT_STUART' as last_updated_by
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Matt Stuart')
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
        AND i.last_updated_by != 'MIGRATION_BATCH2A_MATT_STUART'
    ) THEN 'DUPLICATE_ALREADY_IN_INITIATIVES'
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by = 'MIGRATION_BATCH2A_MATT_STUART'
    ) THEN 'NEWLY_MIGRATED_BATCH2A'
    ELSE 'ERROR_NO_MATCH_FOUND'
  END
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Matt Stuart');

-- ===========================================================================
-- STEP 3: Validation
-- ===========================================================================
SELECT
  'Matt Stuart Migration' as check_name,
  COUNT(*) as items_migrated,
  'Expected: 9' as expected
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH2A_MATT_STUART';

-- List migrated items
SELECT
  initiative_name,
  type,
  status,
  work_effort
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH2A_MATT_STUART'
ORDER BY initiative_name;

SELECT 'BATCH 2A (MATT STUART) MIGRATION COMPLETE' as status;
