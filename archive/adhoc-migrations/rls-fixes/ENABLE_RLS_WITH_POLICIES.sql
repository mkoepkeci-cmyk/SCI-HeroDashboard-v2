-- ============================================================================
-- CORRECT FIX: Enable RLS with Public Policies on initiative_team_members
-- ============================================================================
-- This matches the standard pattern used by ALL other tables in the database
-- (initiatives, team_members, effort_logs, governance_requests, etc.)
--
-- Pattern: RLS enabled + public policies for development
-- Production: Tighten policies later without schema changes
-- ============================================================================

-- Enable Row Level Security (matching all other tables)
ALTER TABLE initiative_team_members ENABLE ROW LEVEL SECURITY;

-- Grant SELECT access to anonymous and authenticated users
CREATE POLICY "Allow public read access to initiative_team_members"
  ON initiative_team_members FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant INSERT access to authenticated users
CREATE POLICY "Allow authenticated users to insert initiative_team_members"
  ON initiative_team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant UPDATE access to authenticated users
CREATE POLICY "Allow authenticated users to update initiative_team_members"
  ON initiative_team_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant DELETE access to authenticated users
CREATE POLICY "Allow authenticated users to delete initiative_team_members"
  ON initiative_team_members FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'initiative_team_members';

-- Check policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'initiative_team_members'
ORDER BY policyname;

-- Test the query that was failing (should work now)
SELECT COUNT(*) as total_assignments
FROM initiative_team_members;

-- ============================================================================
-- Expected Results:
-- 1. rls_enabled = true
-- 2. 4 policies listed (SELECT, INSERT, UPDATE, DELETE)
-- 3. Count query returns number without error
-- ============================================================================
