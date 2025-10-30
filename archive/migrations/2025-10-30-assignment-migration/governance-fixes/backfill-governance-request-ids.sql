-- Backfill request_id for existing initiatives that have governance_request_id but missing request_id
-- This repairs initiatives created before the Phase 1/Phase 2 fix was applied
--
-- Target: GOV-2025-003 and any other governance-linked initiatives missing request_id
--
-- Run this ONCE after deploying the Phase 1/Phase 2 code fixes

UPDATE initiatives i
SET request_id = gr.request_id
FROM governance_requests gr
WHERE i.governance_request_id = gr.id
  AND i.request_id IS NULL;

-- Verify the update
SELECT
  i.id as initiative_id,
  i.initiative_name,
  i.request_id as initiative_request_id,
  gr.request_id as governance_request_id,
  i.owner_name,
  i.status,
  i.type
FROM initiatives i
JOIN governance_requests gr ON i.governance_request_id = gr.id
WHERE gr.request_id LIKE 'GOV-%'
ORDER BY gr.request_id;
