-- ============================================================================
-- Check current RLS status and policies for initiative_team_members
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

-- Test query - this is what the app is trying to run
SELECT
  itm.*,
  tm.name as team_member_name
FROM initiative_team_members itm
LEFT JOIN team_members tm ON itm.team_member_id = tm.id
ORDER BY itm.is_primary DESC
LIMIT 10;

-- Count total assignments
SELECT COUNT(*) as total_assignments
FROM initiative_team_members;
