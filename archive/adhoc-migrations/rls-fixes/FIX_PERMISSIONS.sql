-- ============================================================================
-- Fix RLS (Row Level Security) permissions for initiative_team_members table
-- ============================================================================
-- The 400 error when querying suggests RLS is enabled but no policies exist
-- This allows the dashboard to read the junction table data
-- ============================================================================

-- Disable RLS temporarily to allow full access (dashboard uses anon key)
ALTER TABLE initiative_team_members DISABLE ROW LEVEL SECURITY;

-- OR if you prefer to keep RLS enabled, add a permissive policy:
-- ALTER TABLE initiative_team_members ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Allow read access to all users" ON initiative_team_members
--   FOR SELECT
--   USING (true);
--
-- CREATE POLICY "Allow insert for authenticated users" ON initiative_team_members
--   FOR INSERT
--   WITH CHECK (true);
--
-- CREATE POLICY "Allow update for authenticated users" ON initiative_team_members
--   FOR UPDATE
--   USING (true);
--
-- CREATE POLICY "Allow delete for authenticated users" ON initiative_team_members
--   FOR DELETE
--   USING (true);

-- Verify permissions
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'initiative_team_members';

-- Test query that the app is trying to run
SELECT
  itm.*,
  tm.name
FROM initiative_team_members itm
LEFT JOIN team_members tm ON itm.team_member_id = tm.id
ORDER BY itm.is_primary DESC
LIMIT 5;
