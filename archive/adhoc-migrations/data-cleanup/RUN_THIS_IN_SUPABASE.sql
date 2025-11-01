-- ============================================================================
-- CRITICAL: Run this SQL in Supabase SQL Editor to enable multi-team member assignments
-- ============================================================================
-- This creates the junction table that allows initiatives to be assigned to
-- multiple team members (Owner, Co-Owner, Secondary, Support)
-- ============================================================================

-- Create junction table for multi-team-member assignments on initiatives
CREATE TABLE IF NOT EXISTS initiative_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('Owner', 'Co-Owner', 'Secondary', 'Support')),
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Prevent duplicate assignments (same person can't have multiple roles on same initiative)
  UNIQUE(initiative_id, team_member_id)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_itm_initiative ON initiative_team_members(initiative_id);
CREATE INDEX IF NOT EXISTS idx_itm_team_member ON initiative_team_members(team_member_id);
CREATE INDEX IF NOT EXISTS idx_itm_role ON initiative_team_members(role);

-- Migrate existing data from initiatives table
-- This copies the primary owner (team_member_id + role) to the junction table
INSERT INTO initiative_team_members (initiative_id, team_member_id, role, is_primary)
SELECT
  id,
  team_member_id,
  COALESCE(role, 'Owner') as role,  -- Default to 'Owner' if role is null
  true  -- Mark as primary owner
FROM initiatives
WHERE team_member_id IS NOT NULL
  AND NOT EXISTS (
    -- Only insert if this record doesn't already exist
    SELECT 1 FROM initiative_team_members
    WHERE initiative_team_members.initiative_id = initiatives.id
      AND initiative_team_members.team_member_id = initiatives.team_member_id
  );

-- Add table comment
COMMENT ON TABLE initiative_team_members IS
'Junction table for multi-team-member assignments on initiatives.
Supports Owner, Co-Owner, Secondary, Support roles.
Allows initiatives to appear on multiple SCI boards based on role assignments.';

-- Add column comments
COMMENT ON COLUMN initiative_team_members.is_primary IS
'Marks the primary owner/assignee. Used for backward compatibility with initiatives.team_member_id.';

COMMENT ON COLUMN initiative_team_members.role IS
'Team member role: Owner (100%), Co-Owner (100%), Secondary (50%), Support (25%).
Weights defined in workload_calculator_config table.';

-- Verify the migration
SELECT
  'initiative_team_members table created successfully!' as message,
  COUNT(*) as total_assignments
FROM initiative_team_members;
