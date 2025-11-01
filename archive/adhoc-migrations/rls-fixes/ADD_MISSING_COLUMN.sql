-- ============================================================================
-- Add missing is_primary column to initiative_team_members table
-- ============================================================================
-- The table exists but is missing the is_primary column
-- This adds the column and sets existing records appropriately
-- ============================================================================

-- Add the missing column
ALTER TABLE initiative_team_members
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- Set is_primary = true for the first team member on each initiative
-- (assuming the first one added is the primary owner)
UPDATE initiative_team_members itm
SET is_primary = true
WHERE id IN (
  SELECT DISTINCT ON (initiative_id) id
  FROM initiative_team_members
  ORDER BY initiative_id, created_at ASC
);

-- Verify the column was added
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'initiative_team_members'
ORDER BY ordinal_position;

-- Show sample data
SELECT
  initiative_id,
  team_member_id,
  role,
  is_primary,
  created_at
FROM initiative_team_members
ORDER BY initiative_id, is_primary DESC
LIMIT 10;
