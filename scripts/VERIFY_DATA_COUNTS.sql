-- ============================================
-- DATA COUNT VERIFICATION
-- Date: October 31, 2025
-- Purpose: Verify actual counts vs documented counts in CLAUDE.md
-- ============================================

-- CORE DATA COUNTS
-- ============================================

SELECT
  'Team Members' as table_name,
  COUNT(*) as actual_count,
  16 as expected_count,
  CASE WHEN COUNT(*) = 16 THEN '✅ MATCH' ELSE '❌ MISMATCH' END as status
FROM team_members

UNION ALL

SELECT
  'Managers',
  COUNT(*),
  2,
  CASE WHEN COUNT(*) = 2 THEN '✅ MATCH' ELSE '❌ MISMATCH' END
FROM managers

UNION ALL

SELECT
  'Active Initiatives',
  COUNT(*),
  415,
  CASE WHEN COUNT(*) = 415 THEN '✅ MATCH' ELSE '❌ MISMATCH' END
FROM initiatives
WHERE is_active = true

UNION ALL

SELECT
  'Total Initiatives',
  COUNT(*),
  415,
  CASE WHEN COUNT(*) >= 415 THEN '✅ MATCH' ELSE '❌ MISMATCH' END
FROM initiatives

UNION ALL

SELECT
  'Initiative Stories',
  COUNT(*),
  352,
  CASE WHEN COUNT(*) = 352 THEN '✅ MATCH' ELSE '❌ MISMATCH' END
FROM initiative_stories

UNION ALL

SELECT
  'Effort Logs',
  COUNT(*),
  300,
  CASE WHEN COUNT(*) BETWEEN 250 AND 350 THEN '✅ MATCH (~300)' ELSE '❌ MISMATCH' END
FROM effort_logs

UNION ALL

SELECT
  'Governance Requests',
  COUNT(*),
  8,
  CASE WHEN COUNT(*) = 8 THEN '✅ MATCH' ELSE '❌ MISMATCH' END
FROM governance_requests

UNION ALL

SELECT
  'Initiative Metrics',
  COUNT(*),
  49,
  CASE WHEN COUNT(*) = 49 THEN '✅ MATCH (12% coverage)' ELSE '❌ MISMATCH' END
FROM initiative_metrics

UNION ALL

SELECT
  'Financial Impact',
  COUNT(*),
  103,
  CASE WHEN COUNT(*) = 103 THEN '✅ MATCH (25% coverage)' ELSE '❌ MISMATCH' END
FROM initiative_financial_impact

UNION ALL

SELECT
  'Performance Data',
  COUNT(*),
  83,
  CASE WHEN COUNT(*) = 83 THEN '✅ MATCH (20% coverage)' ELSE '❌ MISMATCH' END
FROM initiative_performance_data

UNION ALL

SELECT
  'Projections',
  COUNT(*),
  29,
  CASE WHEN COUNT(*) = 29 THEN '✅ MATCH (7% coverage)' ELSE '❌ MISMATCH' END
FROM initiative_projections

ORDER BY table_name;

-- ============================================
-- GOVERNANCE REQUEST IDs VERIFICATION
-- ============================================

SELECT
  'Governance Request IDs' as verification_type,
  request_id,
  status
FROM governance_requests
ORDER BY request_id;

-- Expected: GOV-2025-100 through GOV-2025-107 (8 total)
