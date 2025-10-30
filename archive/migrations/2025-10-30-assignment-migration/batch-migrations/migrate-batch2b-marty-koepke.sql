-- BATCH 2B: Marty Koepke Migration (8 Items)
-- Medium Priority - Special handling for protected items
--
-- PROTECTED ITEMS (DO NOT MIGRATE):
-- - GOV-2025-001 "Marty's New Initiative" (governance)
-- - GOV-2025-002 "CMS New Requirement" (governance)
-- - "Medicare Annual Wellness Visits (AWV)" (manual entry)
-- - "Depression Screening and Follow-Up" (manual entry)

-- ===========================================================================
-- STEP 0: Preview Marty's unique items BEFORE migration
-- ===========================================================================
SELECT
  'Marty Koepke Unique Items' as preview,
  a.assignment_name,
  a.work_type,
  a.status,
  a.work_effort,
  a.phase,
  CASE
    WHEN a.assignment_name LIKE '%Medicare%' THEN '⚠️ PROTECTED - Manual Entry'
    WHEN a.assignment_name LIKE '%Depression%' THEN '⚠️ PROTECTED - Manual Entry'
    ELSE '✅ Safe to migrate'
  END as migration_safety
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Marty Koepke')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
)
ORDER BY a.assignment_name;

-- ===========================================================================
-- IMPORTANT: VERIFY PROTECTED ITEMS ARE EXCLUDED
-- ===========================================================================
-- The query below should return 0 rows if protection is working
SELECT
  'Protection Check' as check_name,
  a.assignment_name,
  '❌ ERROR: Protected item would be migrated!' as warning
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Marty Koepke')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
)
AND (
  a.assignment_name ILIKE '%Medicare Annual Wellness%'
  OR a.assignment_name ILIKE '%Depression Screening%'
);
-- If this returns ANY rows, DO NOT proceed with migration!

-- ===========================================================================
-- STEP 1: Migrate Marty's unique assignments (EXCLUDING protected items)
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
  'Marty Koepke' as owner_name,
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
  'MIGRATION_BATCH2B_MARTY_KOEPKE' as last_updated_by
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Marty Koepke')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
)
-- EXCLUDE PROTECTED ITEMS
AND a.assignment_name NOT ILIKE '%Medicare Annual Wellness%'
AND a.assignment_name NOT ILIKE '%Depression Screening%';

-- ===========================================================================
-- STEP 2: Mark assignments as migrated
-- ===========================================================================
UPDATE assignments a
SET
  migrated_to_initiatives = true,
  migration_status = CASE
    WHEN a.assignment_name ILIKE '%Medicare Annual Wellness%'
      OR a.assignment_name ILIKE '%Depression Screening%'
    THEN 'PROTECTED_MANUAL_ENTRY'
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by != 'MIGRATION_BATCH2B_MARTY_KOEPKE'
    ) THEN 'DUPLICATE_ALREADY_IN_INITIATIVES'
    WHEN EXISTS (
      SELECT 1 FROM initiatives i
      WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
        AND i.team_member_id = a.team_member_id
        AND i.status != 'Deleted'
        AND i.last_updated_by = 'MIGRATION_BATCH2B_MARTY_KOEPKE'
    ) THEN 'NEWLY_MIGRATED_BATCH2B'
    ELSE 'ERROR_NO_MATCH_FOUND'
  END
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Marty Koepke');

-- ===========================================================================
-- STEP 3: Validation
-- ===========================================================================
SELECT
  'Marty Koepke Migration' as check_name,
  COUNT(*) as items_migrated,
  'Expected: 8 or fewer (if protected items excluded)' as expected
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH2B_MARTY_KOEPKE';

-- Verify protected items were NOT migrated
SELECT
  'Protected Items Check' as check_name,
  COUNT(*) as protected_items_count,
  'Should be 0' as expected
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH2B_MARTY_KOEPKE'
  AND (
    initiative_name ILIKE '%Medicare Annual Wellness%'
    OR initiative_name ILIKE '%Depression Screening%'
  );

-- List migrated items
SELECT
  initiative_name,
  type,
  status,
  work_effort
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH2B_MARTY_KOEPKE'
ORDER BY initiative_name;

-- Verify governance items still protected
SELECT
  'Governance Items Check' as check_name,
  request_id,
  initiative_name,
  'Should see GOV-2025-001 and GOV-2025-002' as expected
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Marty Koepke')
  AND governance_request_id IS NOT NULL;

SELECT 'BATCH 2B (MARTY KOEPKE) MIGRATION COMPLETE' as status;
