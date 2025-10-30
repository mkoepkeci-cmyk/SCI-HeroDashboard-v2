-- ROLLBACK: Batch 1 Low Priority Migration
-- Use this if batch1 migration causes any issues

-- STEP 1: Delete newly migrated initiatives
DELETE FROM initiatives
WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY';

-- STEP 2: Reset assignment migration flags for these SCIs
UPDATE assignments a
SET
  migrated_to_initiatives = false,
  migration_status = NULL
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

-- VERIFICATION: Check rollback success
SELECT
  'Rollback Verification' as check_name,
  (SELECT COUNT(*) FROM initiatives WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY') as migrated_items_remaining,
  (SELECT COUNT(*) FROM assignments a
   INNER JOIN team_members tm ON a.team_member_id = tm.id
   WHERE tm.name IN ('Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson')
     AND a.migration_status = 'NEWLY_MIGRATED_BATCH1'
  ) as assignments_still_marked,
  CASE
    WHEN (SELECT COUNT(*) FROM initiatives WHERE last_updated_by = 'MIGRATION_BATCH1_LOW_PRIORITY') = 0
     AND (SELECT COUNT(*) FROM assignments a
          INNER JOIN team_members tm ON a.team_member_id = tm.id
          WHERE tm.name IN ('Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson')
            AND a.migration_status = 'NEWLY_MIGRATED_BATCH1'
         ) = 0
    THEN '✅ ROLLBACK COMPLETE'
    ELSE '❌ ROLLBACK INCOMPLETE - CHECK DETAILS'
  END as status;

SELECT 'ROLLBACK COMPLETE FOR BATCH 1' as result;
