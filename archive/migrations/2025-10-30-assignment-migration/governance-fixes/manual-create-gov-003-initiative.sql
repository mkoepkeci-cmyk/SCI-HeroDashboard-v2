-- Manual creation of initiative for GOV-2025-003 (Lisa Townsend)
-- Run this to repair GOV-2025-003 after Phase 1/Phase 2 fixes are deployed
-- This creates the initiative that should have been created when SCI was assigned

-- Step 1: Insert the initiative manually (mimics Phase 1 + Phase 2 combined)
-- This will create initiative with status "In Progress" so it shows in System Initiatives table
INSERT INTO initiatives (
  owner_name,
  initiative_name,
  type,
  status,
  phase,
  role,
  team_member_id,
  governance_request_id,
  request_id,
  problem_statement,
  desired_outcomes,
  is_draft,
  is_active,
  created_at,
  updated_at
)
SELECT
  gr.assigned_sci_name as owner_name,
  gr.title as initiative_name,
  'System Initiative' as type,
  'In Progress' as status,  -- Phase 2 status so it shows in System Initiatives table
  'Discovery/Define' as phase,
  'Owner' as role,
  gr.assigned_sci_id as team_member_id,
  gr.id as governance_request_id,
  gr.request_id as request_id,
  gr.problem_statement,
  gr.desired_outcomes,
  false as is_draft,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM governance_requests gr
WHERE gr.request_id = 'GOV-2025-003'
  AND NOT EXISTS (
    -- Only insert if initiative doesn't already exist
    SELECT 1 FROM initiatives i WHERE i.governance_request_id = gr.id
  )
RETURNING id, initiative_name, request_id, owner_name, status;

-- Step 3: Update the governance request with the linked_initiative_id
-- (Run this after Step 2 completes and you get the initiative ID)
UPDATE governance_requests gr
SET linked_initiative_id = (
  SELECT i.id
  FROM initiatives i
  WHERE i.request_id = 'GOV-2025-003'
  LIMIT 1
)
WHERE gr.request_id = 'GOV-2025-003'
RETURNING id, request_id, linked_initiative_id;

-- Step 4: Verify the linkage is complete
SELECT
  gr.request_id,
  gr.title,
  gr.status as gov_status,
  gr.assigned_sci_name,
  gr.linked_initiative_id,
  i.id as initiative_id,
  i.initiative_name,
  i.status as initiative_status,
  i.owner_name,
  i.request_id as initiative_request_id
FROM governance_requests gr
LEFT JOIN initiatives i ON gr.linked_initiative_id = i.id
WHERE gr.request_id = 'GOV-2025-003';
