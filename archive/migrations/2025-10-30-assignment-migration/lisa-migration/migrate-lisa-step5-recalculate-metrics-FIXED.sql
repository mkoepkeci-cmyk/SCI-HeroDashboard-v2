-- STEP 5: Dashboard Metrics Recalculation
-- Note: The dashboard will automatically recalculate metrics on next page load
-- This step is optional - just for immediate verification

-- Option 1: Let the app auto-recalculate (RECOMMENDED)
-- Just refresh the dashboard after migration completes

-- Option 2: Manual cleanup (optional)
-- Delete old metrics so app is forced to recalculate fresh
DELETE FROM dashboard_metrics
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');

-- Verification: Check that metrics were deleted
SELECT
  'Dashboard Metrics Cleared' as status,
  COUNT(*) as remaining_records
FROM dashboard_metrics
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');

-- Note: The app's recalculateDashboardMetrics() function will run on next page load
-- and populate fresh metrics based on the 3 initiatives in the initiatives table
