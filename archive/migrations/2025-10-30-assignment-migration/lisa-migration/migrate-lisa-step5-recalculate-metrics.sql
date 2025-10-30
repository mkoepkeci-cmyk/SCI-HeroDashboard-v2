-- STEP 5: Recalculate Dashboard Metrics for Lisa Townsend
-- This updates capacity calculations, work type counts, and active assignments

-- Note: The recalculateDashboardMetrics() function is in TypeScript
-- It needs to be called from the app after this SQL migration completes
-- For now, we'll manually update dashboard_metrics as a workaround

-- Delete old dashboard metrics for Lisa
DELETE FROM dashboard_metrics
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');

-- Recalculate and insert fresh metrics
INSERT INTO dashboard_metrics (
  team_member_id,
  active_assignments,
  total_hours_per_week,
  capacity_utilization,
  work_type_breakdown,
  updated_at
)
SELECT
  (SELECT id FROM team_members WHERE name = 'Lisa Townsend') as team_member_id,
  COUNT(*) as active_assignments,
  0 as total_hours_per_week,  -- Will be calculated by workloadCalculator.ts
  0 as capacity_utilization,   -- Will be calculated by workloadCalculator.ts
  jsonb_build_object(
    'work_types', jsonb_object_agg(
      type,
      count
    )
  ) as work_type_breakdown,
  NOW() as updated_at
FROM (
  SELECT
    type,
    COUNT(*) as count
  FROM initiatives
  WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
    AND status IN ('Active', 'In Progress', 'Not Started', 'Planning', 'Scaling')
    AND status != 'Deleted'
  GROUP BY type
) work_types;

-- Verify the metrics update
SELECT
  tm.name,
  dm.active_assignments,
  dm.work_type_breakdown,
  dm.updated_at
FROM dashboard_metrics dm
INNER JOIN team_members tm ON dm.team_member_id = tm.id
WHERE tm.name = 'Lisa Townsend';
