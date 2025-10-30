-- ============================================
-- Part 1: Update all "Marty" to "Marty Koepke"
-- ============================================

-- Show BEFORE state
SELECT 'BEFORE UPDATE' as info,
       owner_name,
       COUNT(*) as count
FROM initiatives
WHERE owner_name ILIKE '%marty%'
GROUP BY owner_name;

-- Update all "Marty" records to "Marty Koepke"
UPDATE initiatives
SET owner_name = 'Marty Koepke',
    updated_at = NOW()
WHERE owner_name = 'Marty'
  AND team_member_id = '1c48b25a-8d61-4087-9c19-2317cb0fc950';

-- Show AFTER state
SELECT 'AFTER UPDATE' as info,
       owner_name,
       COUNT(*) as count
FROM initiatives
WHERE owner_name ILIKE '%marty%'
GROUP BY owner_name;

-- ============================================
-- Part 2: Fix the trigger to prevent recursion
-- ============================================

-- The problem: Trigger does UPDATE inside a BEFORE UPDATE trigger, causing infinite loop
-- The solution: Return NEW with modified values instead of doing another UPDATE

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

  -- Instead of UPDATE (which triggers recursion), modify NEW and return it
  NEW.completion_status := completion_result->'completion_status';
  NEW.completion_percentage := (completion_result->>'completion_percentage')::numeric;
  NEW.section_last_updated := jsonb_build_object(section_name, NOW());
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- ============================================
-- Part 3: Re-enable the trigger
-- ============================================

ALTER TABLE initiatives ENABLE TRIGGER trigger_update_initiative_completion;

-- Verify trigger is enabled
SELECT tgname, tgenabled,
       CASE tgenabled
         WHEN 'O' THEN 'ENABLED'
         WHEN 'D' THEN 'DISABLED'
       END as status
FROM pg_trigger
WHERE tgname = 'trigger_update_initiative_completion';

SELECT 'All done! Names updated and trigger fixed.' as final_status;
