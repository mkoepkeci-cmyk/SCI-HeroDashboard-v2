-- Add is_active field to team_members table
-- This allows tracking when team members leave the organization
-- Default to TRUE for all existing members

ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Set all existing team members to active
UPDATE team_members
SET is_active = TRUE
WHERE is_active IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN team_members.is_active IS 'Whether the team member is currently active. Set to FALSE when they leave the organization.';
