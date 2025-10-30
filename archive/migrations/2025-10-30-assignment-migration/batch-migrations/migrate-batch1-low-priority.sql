-- BATCH 1: Low Priority Migration (7 SCIs, 15 Total Items)
-- Safest batch - small counts, no protected items
--
-- SCIs included:
-- - Sherry Brennaman: 5 items
-- - Ashley Daily: 2 items
-- - Jason Mihos: 2 items
-- - Melissa Plummer: 2 items
-- - Yvette Kirk: 2 items
-- - Dawn Jacobson: 1 item
--
-- Total: 15 unique assignments to migrate

-- ===========================================================================
-- STEP 1: Preview items that will be migrated
-- ===========================================================================
SELECT
  tm.name as sci_name,
  a.assignment_name,
  a.work_type,
  a.status,
  a.work_effort,
  a.phase
FROM assignments a
INNER JOIN team_members tm ON a.team_member_id = tm.id
WHERE tm.name IN (
  'Sherry Brennaman',
  'Ashley Daily',
  'Jason Mihos',
  'Melissa Plummer',
  'Yvette Kirk',
  'Dawn Jacobson'
)
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
)
ORDER BY tm.name, a.assignment_name;

-- ===========================================================================
-- STEP 2: Migrate unique assignments to initiatives
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
  tm.name as owner_name,
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
  'MIGRATION_BATCH1_LOW_PRIORITY' as last_updated_by
FROM assignments a
INNER JOIN team_members tm ON a.team_member_id = tm.id
WHERE tm.name IN (
  'Sherry Brennaman',
  'Ashley Daily',
  'Jason Mihos',
  'Melissa Plummer',
  'Yvette Kirk',
  'Dawn Jacobson'
)
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
);

-- ===========================================================================
-- STEP 3: Mark assignments as migrated
-- ===========================================================================
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
        AND i.last_updated_by != 'MIGRATION_BATCH1_LOW_PRIORITY'
    ) THEN 'DUPLICATE_ALREADY_IN_INITIATIVES'
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY'
    ) THEN 'NEWLY_MIGRATED_BATCH1'
    ELSE 'ERROR_NO_MATCH_FOUND'
  END
FROM team_members tm
WHERE a.team_member_id = tm.id
  AND tm.name IN (
    'Sherry Brennaman',
    'Ashley Daily',
    'Jason Mihos',
    'Melissa Plummer',
    'Yvette Kirk',
    'Dawn Jacobson'
  );

-- ===========================================================================
-- STEP 4: Validation Results
-- ===========================================================================

-- Count of newly migrated items (should be 15)
SELECT
  'Total Newly Migrated' as check_name,
  COUNT(*) as count,
  'Expected: 15' as expected
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY';

-- Breakdown by SCI
SELECT
  owner_name as sci_name,
  COUNT(*) as items_migrated
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY'
GROUP BY owner_name
ORDER BY owner_name;

-- Migration status breakdown for these SCIs
SELECT
  tm.name,
  migration_status,
  COUNT(*) as count
FROM assignments a
INNER JOIN team_members tm ON a.team_member_id = tm.id
WHERE tm.name IN (
  'Sherry Brennaman',
  'Ashley Daily',
  'Jason Mihos',
  'Melissa Plummer',
  'Yvette Kirk',
  'Dawn Jacobson'
)
GROUP BY tm.name, migration_status
ORDER BY tm.name, migration_status;

-- Final success message
SELECT 'BATCH 1 MIGRATION COMPLETE' as status,
       '15 items migrated across 7 SCIs' as result;
