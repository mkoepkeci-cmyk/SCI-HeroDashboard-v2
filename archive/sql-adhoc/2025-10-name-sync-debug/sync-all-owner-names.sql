-- ============================================
-- Synchronize ALL owner names from team_members table
-- This ensures initiatives.owner_name matches team_members.name
-- ============================================

-- Step 1: Show current mismatches BEFORE update
SELECT
  'MISMATCHES BEFORE UPDATE' as info,
  i.owner_name as initiative_owner_name,
  tm.name as team_member_name,
  COUNT(*) as mismatch_count
FROM initiatives i
JOIN team_members tm ON i.team_member_id = tm.id
WHERE i.owner_name != tm.name
GROUP BY i.owner_name, tm.name
ORDER BY mismatch_count DESC;

-- Step 2: Update ALL initiatives to use team_members.name
UPDATE initiatives i
SET owner_name = tm.name,
    updated_at = NOW()
FROM team_members tm
WHERE i.team_member_id = tm.id
  AND i.owner_name != tm.name;

-- Step 3: Update governance_requests to use team_members.name
UPDATE governance_requests gr
SET assigned_sci_name = tm.name,
    updated_at = NOW()
FROM team_members tm
WHERE gr.assigned_sci_id = tm.id
  AND gr.assigned_sci_name != tm.name;

-- Step 4: Show results AFTER update
SELECT
  'AFTER UPDATE - Initiatives' as info,
  i.owner_name,
  COUNT(*) as count
FROM initiatives i
GROUP BY i.owner_name
ORDER BY i.owner_name;

-- Step 5: Verify no mismatches remain
SELECT
  'VERIFICATION - Should be ZERO mismatches' as info,
  COUNT(*) as remaining_mismatches
FROM initiatives i
JOIN team_members tm ON i.team_member_id = tm.id
WHERE i.owner_name != tm.name;

SELECT
  'VERIFICATION - Governance Requests' as info,
  COUNT(*) as remaining_mismatches
FROM governance_requests gr
JOIN team_members tm ON gr.assigned_sci_id = tm.id
WHERE gr.assigned_sci_name != tm.name;
