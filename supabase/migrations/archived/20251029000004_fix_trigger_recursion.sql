-- ============================================
-- Fix trigger infinite recursion bug
-- ============================================
-- The previous version did UPDATE inside BEFORE UPDATE trigger,
-- causing infinite recursion. This version modifies NEW directly.

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

  -- Modify NEW record directly (no recursive UPDATE)
  NEW.completion_status := completion_result->'completion_status';
  NEW.completion_percentage := (completion_result->>'completion_percentage')::numeric;
  NEW.section_last_updated := jsonb_build_object(section_name, NOW());
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
