-- ============================================================================
-- Check what RLS policies currently exist on initiative_team_members
-- ============================================================================

-- Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'initiative_team_members';

-- Check what policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'initiative_team_members'
ORDER BY policyname;

-- Compare with initiatives table policies (which work with anon)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'initiatives'
ORDER BY policyname;
