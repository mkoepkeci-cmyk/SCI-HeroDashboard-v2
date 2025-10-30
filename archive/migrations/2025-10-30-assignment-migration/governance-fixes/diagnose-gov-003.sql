-- Diagnostic queries for GOV-2025-003 (Lisa Townsend)

-- Query 1: Check if the governance request exists
SELECT
  id,
  request_id,
  title,
  status,
  assigned_sci_id,
  assigned_sci_name,
  linked_initiative_id,
  submitted_date,
  created_at
FROM governance_requests
WHERE request_id = 'GOV-2025-003';

-- Query 2: Check if there's an initiative with governance_request_id matching GOV-2025-003's UUID
-- (We'll need the UUID from Query 1 to run this)
SELECT
  i.id as initiative_id,
  i.initiative_name,
  i.request_id,
  i.governance_request_id,
  i.owner_name,
  i.team_member_id,
  i.status,
  i.type,
  i.is_active,
  i.is_draft,
  i.created_at
FROM initiatives i
WHERE i.initiative_name LIKE '%CMS%requirement%'
   OR i.owner_name = 'Lisa Townsend'
ORDER BY i.created_at DESC;

-- Query 3: Check Lisa Townsend's team_member record
SELECT id, name, email
FROM team_members
WHERE name LIKE '%Lisa%Townsend%';

-- Query 4: Look for any orphaned initiatives that might belong to GOV-2025-003
SELECT
  i.id as initiative_id,
  i.initiative_name,
  i.request_id,
  i.governance_request_id,
  i.owner_name,
  i.team_member_id,
  i.status,
  i.type,
  i.created_at,
  gr.request_id as linked_gov_request_id
FROM initiatives i
LEFT JOIN governance_requests gr ON i.governance_request_id = gr.id
WHERE i.initiative_name LIKE '%Tiffany%'
   OR i.initiative_name LIKE '%CMS%'
ORDER BY i.created_at DESC
LIMIT 10;
