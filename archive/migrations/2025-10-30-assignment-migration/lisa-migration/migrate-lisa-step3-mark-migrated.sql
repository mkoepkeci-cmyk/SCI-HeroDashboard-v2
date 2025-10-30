-- STEP 3: Mark Lisa's Assignments as Migrated
-- Adds tracking columns and marks all assignments

-- Add migration tracking columns if they don't exist
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS migrated_to_initiatives BOOLEAN DEFAULT FALSE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS migration_status TEXT;

-- Mark Lisa's assignments with migration status
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

-- Verify migration status
SELECT
  migration_status,
  COUNT(*) as count
FROM assignments
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
GROUP BY migration_status
ORDER BY migration_status;
