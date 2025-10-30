-- Migration: Drop assignments table (replaced by initiatives)
-- Date: October 30, 2025
-- Reason: The assignments table has been fully replaced by the initiatives table
--         after successful migration of 57 items across 11 SCIs (Lisa + 10 batches)
--
-- Migration History:
-- - migrate-lisa-MASTER-SCRIPT.sql: 2 items migrated
-- - migrate-batch1-low-priority.sql: 15 items migrated (7 SCIs)
-- - migrate-batch2a-matt-stuart.sql: 9 items migrated
-- - migrate-batch2b-marty-koepke.sql: 7-8 items migrated (with protections)
-- - migrate-batch3-josh-greenwood.sql: 26 items migrated
--
-- Impact Assessment:
-- ✅ Safe to remove - only 1 READ query in App.tsx (now removed)
-- ✅ No write operations found across entire codebase
-- ✅ Not used by capacity calculations (uses initiatives)
-- ✅ Not used by dashboard_metrics (calculates from initiatives)
-- ✅ Not used by work_type_summary or ehr_platform_summary
--
-- Code Changes Applied:
-- ✅ Removed Assignment type from src/lib/supabase.ts
-- ✅ Removed assignments property from TeamMemberWithDetails in App.tsx
-- ✅ Removed assignments fetch query from App.tsx (line 169-173)
-- ✅ Removed memberAssignments filter from App.tsx (line 222-224)
-- ✅ Removed assignments from member object mapping (line 293)
-- ✅ Build passed with no TypeScript errors
--
-- =============================================================================
-- DROP ASSIGNMENTS TABLE
-- =============================================================================

-- Remove assignments table entirely (all data migrated to initiatives)
DROP TABLE IF EXISTS assignments CASCADE;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify table no longer exists (should return 0 rows)
SELECT COUNT(*) as assignments_table_exists
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'assignments';

-- Should return: 0

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. All assignment data has been migrated to initiatives table
-- 2. Migration status tracked via migration_status field in assignments (before drop)
-- 3. Initiatives table is now the single source of truth for workload tracking
-- 4. Dashboard will continue to function normally (already using initiatives exclusively)
