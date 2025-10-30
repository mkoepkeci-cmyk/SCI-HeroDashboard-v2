-- ============================================
-- Step 1: Fix the completion trigger to handle NULL TG_ARGV
-- ============================================

CREATE OR REPLACE FUNCTION update_initiative_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_result jsonb;
  section_name text;
BEGIN
  -- Calculate completion for the initiative
  completion_result := calculate_initiative_completion(NEW.id);

  -- Determine section name (use TG_ARGV[0] if provided, otherwise use 'basic')
  section_name := COALESCE(TG_ARGV[0], 'basic');

  -- Update the initiative record
  UPDATE initiatives
  SET
    completion_status = completion_result->'completion_status',
    completion_percentage = (completion_result->>'completion_percentage')::numeric,
    section_last_updated = jsonb_build_object(section_name, NOW())
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- ============================================
-- Step 2: Synchronize ALL owner names from team_members table
-- ============================================

-- Show current mismatches BEFORE update
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

-- Update ALL initiatives to use team_members.name
UPDATE initiatives i
SET owner_name = tm.name,
    updated_at = NOW()
FROM team_members tm
WHERE i.team_member_id = tm.id
  AND i.owner_name != tm.name;

-- Update governance_requests to use team_members.name
UPDATE governance_requests gr
SET assigned_sci_name = tm.name,
    updated_at = NOW()
FROM team_members tm
WHERE gr.assigned_sci_id = tm.id
  AND gr.assigned_sci_name != tm.name;

-- Show results AFTER update
SELECT
  'AFTER UPDATE - Initiatives' as info,
  i.owner_name,
  COUNT(*) as count
FROM initiatives i
GROUP BY i.owner_name
ORDER BY i.owner_name;

-- Verify no mismatches remain
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
