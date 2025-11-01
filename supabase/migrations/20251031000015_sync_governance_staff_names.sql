-- =====================================================
-- Migration: Sync Governance Request Staff Names
-- Created: 2025-10-31
-- Purpose: Update assigned_sci_name in governance_requests
--          to match current team_members names
-- =====================================================

BEGIN;

-- Update assigned_sci_name to match team_members current name
UPDATE governance_requests gr
SET assigned_sci_name = CONCAT(tm.first_name, ' ', tm.last_name)
FROM team_members tm
WHERE gr.assigned_sci_id = tm.id
  AND gr.assigned_sci_name != CONCAT(tm.first_name, ' ', tm.last_name);

COMMIT;

-- =====================================================
-- Verification Query (run separately to check results)
-- =====================================================
-- SELECT gr.request_id, gr.assigned_sci_name, CONCAT(tm.first_name, ' ', tm.last_name) as current_name
-- FROM governance_requests gr
-- JOIN team_members tm ON gr.assigned_sci_id = tm.id
-- WHERE gr.assigned_sci_name != CONCAT(tm.first_name, ' ', tm.last_name);
-- Expected: Should return 0 rows
