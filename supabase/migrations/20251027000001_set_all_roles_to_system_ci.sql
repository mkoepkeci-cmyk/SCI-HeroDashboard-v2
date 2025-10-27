-- ============================================================================
-- Migration: Set All Team Members to System CI Role
-- Date: 2025-10-27
-- Description:
--   All 15 team members are System Clinical Informaticists (System CI)
--   Update any existing role values to standardize on 'System CI'
-- ============================================================================

-- Set all team members to 'System CI' role
UPDATE team_members
SET role = 'System CI'
WHERE role IS NULL OR role != 'System CI';

-- Add constraint to ensure role is always 'System CI' (or allow future roles if needed)
-- For now, just standardizing the data
COMMENT ON COLUMN team_members.role IS 'Team member role - currently all are System CI';
