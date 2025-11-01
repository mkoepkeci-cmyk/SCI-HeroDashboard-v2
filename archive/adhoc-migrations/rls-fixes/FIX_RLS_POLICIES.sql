-- ============================================================================
-- Fix RLS policies on initiative_team_members to allow anon access
-- ============================================================================
-- Current policies only allow 'authenticated' users
-- Dashboard uses 'anon' key, so we need to add anon to the policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to initiative_team_members" ON initiative_team_members;
DROP POLICY IF EXISTS "Allow authenticated users to insert initiative_team_members" ON initiative_team_members;
DROP POLICY IF EXISTS "Allow authenticated users to update initiative_team_members" ON initiative_team_members;
DROP POLICY IF EXISTS "Allow authenticated users to delete initiative_team_members" ON initiative_team_members;

-- Create new policies that include anon users (matching pattern from other tables)

-- Allow SELECT for both anon and authenticated
CREATE POLICY "Allow public read access to initiative_team_members"
  ON initiative_team_members FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow INSERT for both anon and authenticated
CREATE POLICY "Allow public insert to initiative_team_members"
  ON initiative_team_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow UPDATE for both anon and authenticated
CREATE POLICY "Allow public update to initiative_team_members"
  ON initiative_team_members FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow DELETE for both anon and authenticated
CREATE POLICY "Allow public delete to initiative_team_members"
  ON initiative_team_members FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- Verification
-- ============================================================================

-- Check RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'initiative_team_members';

-- Check policies exist and include both anon and authenticated
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

-- Expected: 4 policies, each with roles = {anon, authenticated}
