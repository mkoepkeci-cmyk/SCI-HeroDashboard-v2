/*
  # Fix Initiative Completion Function Parameter Conflict

  ## Changes
  - Drops and recreates calculate_initiative_completion function with proper parameter naming
  - Fixes ambiguous column reference error by renaming parameter from initiative_id to p_initiative_id
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS calculate_initiative_completion(uuid);

-- Recreate the function with fixed parameter naming
CREATE OR REPLACE FUNCTION calculate_initiative_completion(p_initiative_id uuid)
RETURNS jsonb AS $$
DECLARE
  initiative_record record;
  metrics_count integer;
  completion_obj jsonb;
  completed_sections integer := 0;
  total_sections integer := 7;
  percentage numeric;
BEGIN
  -- Get initiative data
  SELECT * INTO initiative_record FROM initiatives WHERE id = p_initiative_id;
  
  IF NOT FOUND THEN
    RETURN '{"completion_status": {}, "completion_percentage": 0}'::jsonb;
  END IF;

  -- Initialize completion object
  completion_obj := '{
    "basic": false,
    "governance": false,
    "metrics": false,
    "financial": false,
    "performance": false,
    "projections": false,
    "story": false
  }'::jsonb;

  -- Check basic info (required fields are always filled, so always true)
  completion_obj := jsonb_set(completion_obj, '{basic}', 'true'::jsonb);
  completed_sections := completed_sections + 1;

  -- Check governance section
  IF initiative_record.clinical_sponsor_name IS NOT NULL 
     OR (initiative_record.governance_bodies IS NOT NULL AND array_length(initiative_record.governance_bodies, 1) > 0)
     OR (initiative_record.key_collaborators IS NOT NULL AND array_length(initiative_record.key_collaborators, 1) > 0) THEN
    completion_obj := jsonb_set(completion_obj, '{governance}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check metrics section
  SELECT COUNT(*) INTO metrics_count FROM initiative_metrics WHERE initiative_id = p_initiative_id;
  IF metrics_count > 0 THEN
    completion_obj := jsonb_set(completion_obj, '{metrics}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check financial section
  IF EXISTS (SELECT 1 FROM initiative_financial_impact WHERE initiative_id = p_initiative_id) THEN
    completion_obj := jsonb_set(completion_obj, '{financial}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check performance section
  IF EXISTS (SELECT 1 FROM initiative_performance_data WHERE initiative_id = p_initiative_id) THEN
    completion_obj := jsonb_set(completion_obj, '{performance}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check projections section
  IF EXISTS (SELECT 1 FROM initiative_projections WHERE initiative_id = p_initiative_id) THEN
    completion_obj := jsonb_set(completion_obj, '{projections}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check story section
  IF EXISTS (SELECT 1 FROM initiative_stories WHERE initiative_id = p_initiative_id) THEN
    completion_obj := jsonb_set(completion_obj, '{story}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Calculate percentage
  percentage := (completed_sections::numeric / total_sections::numeric) * 100;

  -- Return both completion status and percentage
  RETURN jsonb_build_object(
    'completion_status', completion_obj,
    'completion_percentage', percentage
  );
END;
$$ LANGUAGE plpgsql;
