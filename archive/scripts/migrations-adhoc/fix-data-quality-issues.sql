-- Migration: Fix Data Quality Issues
-- Date: 2025-10-13
-- Purpose: Fix is_active flags, link initiatives to team members, sync totals

-- ============================================================================
-- FIX #1: Update is_active for Completed/On Hold initiatives
-- ============================================================================

-- Update all initiatives with Completed/On Hold/Cancelled status
UPDATE initiatives
SET is_active = false
WHERE status IN ('Completed', 'On Hold', 'Cancelled');

-- Update all initiatives with Active/Planning/Scaling status
UPDATE initiatives
SET is_active = true
WHERE status IN ('Planning', 'Active', 'Scaling');

-- Verification query
SELECT
  status,
  is_active,
  COUNT(*) as count
FROM initiatives
GROUP BY status, is_active
ORDER BY status, is_active;

-- ============================================================================
-- FIX #2: Link initiatives to team members (by owner name)
-- ============================================================================

-- Update initiatives to link them to team members based on owner_name
-- This matches the owner_name in initiatives to the name in team_members

UPDATE initiatives i
SET team_member_id = tm.id
FROM team_members tm
WHERE i.owner_name ILIKE '%' || tm.name || '%'
  AND i.team_member_id IS NULL;

-- Alternative: More precise matching (use if above doesn't work well)
-- UPDATE initiatives i
-- SET team_member_id = (
--   SELECT id FROM team_members tm
--   WHERE i.owner_name ILIKE '%' || tm.name || '%'
--   LIMIT 1
-- )
-- WHERE i.team_member_id IS NULL;

-- Verification query
SELECT
  COALESCE(tm.name, 'Unassigned') as team_member,
  COUNT(*) as initiative_count
FROM initiatives i
LEFT JOIN team_members tm ON i.team_member_id = tm.id
GROUP BY tm.name
ORDER BY initiative_count DESC;

-- ============================================================================
-- FIX #3: Sync total_assignments in team_members with work_type_summary
-- ============================================================================

-- Update total_assignments to match the sum from work_type_summary
UPDATE team_members tm
SET total_assignments = (
  SELECT COALESCE(SUM(wts.count), 0)
  FROM work_type_summary wts
  WHERE wts.team_member_id = tm.id
);

-- Verification query
SELECT
  tm.name,
  tm.total_assignments as total_in_team_members,
  COALESCE(SUM(wts.count), 0) as total_in_work_type_summary
FROM team_members tm
LEFT JOIN work_type_summary wts ON wts.team_member_id = tm.id
GROUP BY tm.id, tm.name, tm.total_assignments
ORDER BY tm.name;

-- ============================================================================
-- VERIFICATION: Check all fixes
-- ============================================================================

-- 1. Check is_active by status
SELECT
  'is_active check' as check_type,
  status,
  is_active,
  COUNT(*) as count
FROM initiatives
GROUP BY status, is_active
ORDER BY status;

-- 2. Check team member assignments
SELECT
  'team member link check' as check_type,
  CASE
    WHEN team_member_id IS NULL THEN 'Unassigned'
    ELSE 'Assigned'
  END as assignment_status,
  COUNT(*) as count
FROM initiatives
GROUP BY CASE WHEN team_member_id IS NULL THEN 'Unassigned' ELSE 'Assigned' END;

-- 3. Check total_assignments sync
SELECT
  'total_assignments sync check' as check_type,
  tm.name,
  tm.total_assignments,
  COALESCE(SUM(wts.count), 0) as work_type_sum,
  CASE
    WHEN tm.total_assignments = COALESCE(SUM(wts.count), 0) THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM team_members tm
LEFT JOIN work_type_summary wts ON wts.team_member_id = tm.id
GROUP BY tm.id, tm.name, tm.total_assignments
ORDER BY tm.name;

-- ============================================================================
-- Summary report
-- ============================================================================

SELECT
  'Summary' as report_section,
  (SELECT COUNT(*) FROM team_members) as total_team_members,
  (SELECT COUNT(*) FROM initiatives) as total_initiatives,
  (SELECT COUNT(*) FROM initiatives WHERE is_active = true) as active_initiatives,
  (SELECT COUNT(*) FROM initiatives WHERE is_active = false) as inactive_initiatives,
  (SELECT COUNT(*) FROM initiatives WHERE team_member_id IS NULL) as unassigned_initiatives,
  (SELECT COUNT(*) FROM initiatives WHERE team_member_id IS NOT NULL) as assigned_initiatives;
