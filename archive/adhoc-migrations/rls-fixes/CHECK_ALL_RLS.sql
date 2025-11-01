-- ============================================================================
-- Check RLS status on all main tables
-- ============================================================================

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'initiatives',
    'team_members',
    'effort_logs',
    'governance_requests',
    'initiative_team_members',
    'workload_calculator_config'
  )
ORDER BY tablename;
