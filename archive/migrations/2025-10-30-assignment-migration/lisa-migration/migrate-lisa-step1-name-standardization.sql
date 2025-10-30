-- STEP 1: Name Standardization for Lisa Townsend
-- This is SAFE and REVERSIBLE - just updates "Lisa" → "Lisa Townsend"

-- Update assignments table
UPDATE assignments
SET team_member_name = 'Lisa Townsend'
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND team_member_name != 'Lisa Townsend';

-- Update initiatives table
UPDATE initiatives
SET owner_name = 'Lisa Townsend'
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND owner_name != 'Lisa Townsend';

-- Verify the fix
SELECT 'Assignments Updated' as action, COUNT(*) as count
FROM assignments
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND team_member_name = 'Lisa Townsend';

SELECT 'Initiatives Updated' as action, COUNT(*) as count
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND owner_name = 'Lisa Townsend'
  AND status != 'Deleted';
