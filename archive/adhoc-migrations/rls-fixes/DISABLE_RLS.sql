-- ============================================================================
-- ⚠️ DO NOT USE THIS FILE - INCORRECT APPROACH ⚠️
-- ============================================================================
-- This file disables RLS, which does NOT match your database architecture.
--
-- CORRECT APPROACH: Use ENABLE_RLS_WITH_POLICIES.sql instead
--
-- All other tables in your database (initiatives, team_members, effort_logs,
-- governance_requests, etc.) have RLS ENABLED with public policies.
--
-- The initiative_team_members table should match this pattern.
-- ============================================================================

-- DO NOT RUN THIS:
-- ALTER TABLE initiative_team_members DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'initiative_team_members';

-- Test the query that was failing
SELECT COUNT(*) as total_assignments
FROM initiative_team_members;
