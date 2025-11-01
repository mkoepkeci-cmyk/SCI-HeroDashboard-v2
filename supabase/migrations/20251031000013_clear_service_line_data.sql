-- =====================================================
-- Migration: Clear Service Line Data
-- Created: 2025-10-31
-- Purpose: Clear existing service line data from team_members
--          and initiatives tables to prepare for dynamic
--          configuration via field_options
-- =====================================================

BEGIN;

-- Clear service line data from team_members table (specialty field)
UPDATE team_members
SET specialty = NULL
WHERE specialty IS NOT NULL;

-- Clear service line data from initiatives table
UPDATE initiatives
SET service_line = NULL
WHERE service_line IS NOT NULL;

COMMIT;

-- =====================================================
-- Verification Queries (run separately to check results)
-- =====================================================
-- SELECT COUNT(*) as team_members_with_specialty FROM team_members WHERE specialty IS NOT NULL;
-- SELECT COUNT(*) as initiatives_with_service_line FROM initiatives WHERE service_line IS NOT NULL;
-- Expected: Both should return 0
