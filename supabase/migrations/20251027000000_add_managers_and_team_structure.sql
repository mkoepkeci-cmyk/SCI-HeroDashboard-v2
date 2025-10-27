-- ============================================================================
-- Migration: Add Managers and Enhanced Team Member Structure
-- Date: 2025-10-27
-- Description:
--   - Create managers table for Carrie Rodriguez and Tiffany Shields-Tettamanti
--   - Extend team_members with first_name, last_name, manager_id, specialty[]
--   - Maintain backward compatibility with existing 'name' field
-- ============================================================================

-- ============================================================================
-- Create managers table
-- ============================================================================
CREATE TABLE IF NOT EXISTS managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Seed managers: Carrie Rodriguez and Tiffany Shields-Tettamanti
-- ============================================================================
INSERT INTO managers (first_name, last_name, is_active) VALUES
  ('Carrie', 'Rodriguez', true),
  ('Tiffany', 'Shields-Tettamanti', true);

-- ============================================================================
-- Extend team_members table
-- ============================================================================
-- Add first_name, last_name, manager_id, specialty[] columns
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES managers(id),
  ADD COLUMN IF NOT EXISTS specialty text[];

-- Migrate existing 'name' to 'first_name' (keep 'name' for backward compatibility)
UPDATE team_members SET first_name = name WHERE first_name IS NULL;

-- ============================================================================
-- Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_team_members_manager ON team_members(manager_id);
-- Note: Skipping GIN index on specialty array - not critical for performance with 15 team members
-- Can add later if needed: CREATE INDEX ... USING gin(specialty) when using specific operators

-- ============================================================================
-- RLS Policies for managers table
-- ============================================================================
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to managers"
  ON managers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated full access to managers"
  ON managers FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE managers IS 'Managers who oversee System Clinical Informaticists (SCIs)';
COMMENT ON COLUMN managers.first_name IS 'Manager first name';
COMMENT ON COLUMN managers.last_name IS 'Manager last name';
COMMENT ON COLUMN managers.email IS 'Manager email address (optional)';
COMMENT ON COLUMN managers.is_active IS 'Whether manager is currently active (soft delete flag)';

COMMENT ON COLUMN team_members.first_name IS 'Team member first name (migrated from name field)';
COMMENT ON COLUMN team_members.last_name IS 'Team member last name (optional, added via Admin UI)';
COMMENT ON COLUMN team_members.manager_id IS 'Reference to assigned manager (nullable)';
COMMENT ON COLUMN team_members.specialty IS 'Array of service line specialties (Ambulatory, Nursing, etc.)';
