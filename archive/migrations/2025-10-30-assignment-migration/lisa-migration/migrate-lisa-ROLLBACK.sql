-- ROLLBACK SCRIPT: Lisa Townsend Migration
-- Use this if the migration causes any issues
-- Run these commands to undo all changes

-- Step 1: Delete newly migrated initiatives
DELETE FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND last_updated_by = 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS';

-- Step 2: Reset assignment migration flags
UPDATE assignments
SET
  migrated_to_initiatives = false,
  migration_status = NULL
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');

-- Step 3: (Optional) Revert name standardization to "Lisa" if needed
-- Only run this if you need to revert names back to original format
-- UPDATE assignments
-- SET team_member_name = 'Lisa'
-- WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');

-- UPDATE initiatives
-- SET owner_name = 'Lisa'
-- WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
--   AND last_updated_by != 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS';

-- Verification: Check that rollback worked
SELECT
  'Post-Rollback Check' as status,
  (SELECT COUNT(*) FROM initiatives WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend') AND status != 'Deleted') as initiatives_count,
  (SELECT COUNT(*) FROM initiatives WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend') AND last_updated_by = 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS') as migrated_items_remaining;

SELECT 'ROLLBACK COMPLETE' as status;
