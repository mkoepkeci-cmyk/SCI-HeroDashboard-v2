-- VALIDATION: Batch 1 Low Priority Migration
-- Run this after migrate-batch1-low-priority.sql

-- Check 1: Total items migrated (should be 15)
SELECT
  'Total Items Migrated' as validation_check,
  COUNT(*) as actual,
  15 as expected,
  CASE WHEN COUNT(*) = 15 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY';

-- Check 2: Breakdown by SCI (verify each count)
SELECT
  'Items Per SCI' as validation_check,
  owner_name,
  COUNT(*) as actual,
  CASE owner_name
    WHEN 'Sherry Brennaman' THEN 5
    WHEN 'Ashley Daily' THEN 2
    WHEN 'Jason Mihos' THEN 2
    WHEN 'Melissa Plummer' THEN 2
    WHEN 'Yvette Kirk' THEN 2
    WHEN 'Dawn Jacobson' THEN 1
    ELSE 0
  END as expected,
  CASE WHEN COUNT(*) = CASE owner_name
    WHEN 'Sherry Brennaman' THEN 5
    WHEN 'Ashley Daily' THEN 2
    WHEN 'Jason Mihos' THEN 2
    WHEN 'Melissa Plummer' THEN 2
    WHEN 'Yvette Kirk' THEN 2
    WHEN 'Dawn Jacobson' THEN 1
    ELSE 0
  END THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY'
GROUP BY owner_name
ORDER BY owner_name;

-- Check 3: No duplicates created
SELECT
  'Duplicate Check' as validation_check,
  initiative_name,
  owner_name,
  COUNT(*) as duplicate_count,
  '❌ FAIL - Duplicate found!' as status
FROM initiatives
WHERE team_member_id IN (
  SELECT id FROM team_members WHERE name IN (
    'Sherry Brennaman',
    'Ashley Daily',
    'Jason Mihos',
    'Melissa Plummer',
    'Yvette Kirk',
    'Dawn Jacobson'
  )
)
AND status != 'Deleted'
GROUP BY initiative_name, owner_name
HAVING COUNT(*) > 1;
-- If this returns 0 rows, no duplicates were created (PASS)

-- Check 4: Verify total initiatives per SCI
SELECT
  'Total Initiatives Per SCI' as validation_check,
  tm.name,
  COUNT(i.id) as total_initiatives,
  '✅ Should match assignments_count + unique_to_migrate' as note
FROM team_members tm
LEFT JOIN initiatives i ON i.team_member_id = tm.id AND i.status != 'Deleted'
WHERE tm.name IN (
  'Sherry Brennaman',
  'Ashley Daily',
  'Jason Mihos',
  'Melissa Plummer',
  'Yvette Kirk',
  'Dawn Jacobson'
)
GROUP BY tm.name
ORDER BY tm.name;

-- Check 5: Assignment migration status
SELECT
  'Assignment Migration Status' as validation_check,
  tm.name,
  a.migration_status,
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
GROUP BY tm.name, a.migration_status
ORDER BY tm.name, a.migration_status;

-- Check 6: List all newly migrated items for manual review
SELECT
  'Newly Migrated Items' as validation_check,
  owner_name,
  initiative_name,
  type,
  status,
  work_effort,
  phase
FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY'
ORDER BY owner_name, initiative_name;

-- Summary: Overall status
SELECT
  'VALIDATION SUMMARY' as final_check,
  (SELECT COUNT(*) FROM initiatives WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY') as total_migrated,
  (SELECT COUNT(*) FROM initiatives i1
   WHERE team_member_id IN (SELECT id FROM team_members WHERE name IN ('Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson'))
   AND status != 'Deleted'
   AND EXISTS (
     SELECT 1 FROM initiatives i2
     WHERE i2.initiative_name = i1.initiative_name
       AND i2.team_member_id = i1.team_member_id
       AND i2.status != 'Deleted'
       AND i2.id != i1.id
   )
  ) as duplicates_found,
  CASE
    WHEN (SELECT COUNT(*) FROM initiatives WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY') = 15
     AND (SELECT COUNT(*) FROM initiatives i1
          WHERE team_member_id IN (SELECT id FROM team_members WHERE name IN ('Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson'))
          AND status != 'Deleted'
          AND EXISTS (
            SELECT 1 FROM initiatives i2
            WHERE i2.initiative_name = i1.initiative_name
              AND i2.team_member_id = i1.team_member_id
              AND i2.status != 'Deleted'
              AND i2.id != i1.id
          )
         ) = 0
    THEN '✅ ALL CHECKS PASSED'
    ELSE '❌ VALIDATION FAILED - CHECK DETAILS ABOVE'
  END as overall_status;
