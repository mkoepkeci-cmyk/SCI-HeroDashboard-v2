/*
  # Link Initiatives to Team Members

  ## Overview
  Adds team member relationship to initiatives table to enable tracking which
  team member owns each initiative. This enables the team view to show all
  initiatives per member and aggregate impact data.

  ## Changes
  1. Add team_member_id foreign key column to initiatives table
  2. Create index for efficient querying by team member
  3. Add policy to allow public access to the new column

  ## Notes
  - Uses IF NOT EXISTS pattern to safely add column
  - Maintains existing RLS policies
  - Foreign key references team_members table with CASCADE delete
*/

-- Add team_member_id column to initiatives table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'initiatives' AND column_name = 'team_member_id'
  ) THEN
    ALTER TABLE initiatives ADD COLUMN team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_initiatives_team_member_id ON initiatives(team_member_id);
