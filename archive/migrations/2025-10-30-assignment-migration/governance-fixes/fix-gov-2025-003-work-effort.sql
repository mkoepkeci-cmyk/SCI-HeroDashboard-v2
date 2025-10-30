-- Fix GOV-2025-003: Add missing work_effort field
-- This initiative was created before the work_effort transfer fix was applied

-- First, verify the governance request has work_effort = 'XL'
SELECT
  request_id,
  title,
  work_effort as governance_work_effort,
  assigned_sci_name,
  linked_initiative_id
FROM governance_requests
WHERE request_id = 'GOV-2025-003';

-- Then update the linked initiative with the work_effort value
UPDATE initiatives
SET work_effort = (
  SELECT work_effort
  FROM governance_requests
  WHERE request_id = 'GOV-2025-003'
),
updated_at = NOW()
WHERE request_id = 'GOV-2025-003';

-- Verify the fix
SELECT
  request_id,
  initiative_name,
  owner_name,
  work_effort,
  status,
  type
FROM initiatives
WHERE request_id = 'GOV-2025-003';
