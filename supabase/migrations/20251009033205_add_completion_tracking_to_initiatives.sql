/*
  # Add Completion Tracking to Initiatives

  ## Overview
  Adds comprehensive completion tracking to initiatives table to support phased
  data entry workflow where initiatives are created with basic info and progressively
  completed as metrics and financial data are realized over time.

  ## Changes

  1. New Columns Added to `initiatives` table:
    - `is_draft` (boolean, default false) - Distinguishes draft vs published initiatives
    - `completion_status` (jsonb) - Tracks completion state of each section
      Structure: {
        basic: boolean,
        governance: boolean,
        metrics: boolean,
        financial: boolean,
        performance: boolean,
        projections: boolean,
        story: boolean
      }
    - `completion_percentage` (numeric) - Overall completion score (0-100)
    - `last_updated_by` (text) - Owner name who last modified the initiative
    - `section_last_updated` (jsonb) - Timestamp tracking for each section
      Structure: {
        basic: timestamp,
        governance: timestamp,
        metrics: timestamp,
        financial: timestamp,
        performance: timestamp,
        projections: timestamp,
        story: timestamp
      }

  2. Database Function:
    - `calculate_initiative_completion()` - Automatically calculates completion
      status and percentage based on which sections have data

  3. Trigger:
    - Updates completion fields automatically on any initiative changes

  4. Indexes:
    - Added indexes for efficient searching by owner, completion percentage

  ## Notes
  - Completion tracking works for both draft and published initiatives
  - Even published initiatives can have incomplete sections awaiting realized metrics
  - Supports real-world workflow where initiatives are tracked over 6+ month periods
  - Uses existing owner field for filtering without requiring authentication
*/

-- Add completion tracking columns to initiatives table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'initiatives' AND column_name = 'is_draft'
  ) THEN
    ALTER TABLE initiatives ADD COLUMN is_draft boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'initiatives' AND column_name = 'completion_status'
  ) THEN
    ALTER TABLE initiatives ADD COLUMN completion_status jsonb DEFAULT '{
      "basic": false,
      "governance": false,
      "metrics": false,
      "financial": false,
      "performance": false,
      "projections": false,
      "story": false
    }'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'initiatives' AND column_name = 'completion_percentage'
  ) THEN
    ALTER TABLE initiatives ADD COLUMN completion_percentage numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'initiatives' AND column_name = 'last_updated_by'
  ) THEN
    ALTER TABLE initiatives ADD COLUMN last_updated_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'initiatives' AND column_name = 'section_last_updated'
  ) THEN
    ALTER TABLE initiatives ADD COLUMN section_last_updated jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create function to calculate initiative completion status
CREATE OR REPLACE FUNCTION calculate_initiative_completion(initiative_id uuid)
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
  SELECT * INTO initiative_record FROM initiatives WHERE id = initiative_id;
  
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
  SELECT COUNT(*) INTO metrics_count FROM initiative_metrics WHERE initiative_metrics.initiative_id = initiative_id;
  IF metrics_count > 0 THEN
    completion_obj := jsonb_set(completion_obj, '{metrics}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check financial section
  IF EXISTS (SELECT 1 FROM initiative_financial_impact WHERE initiative_financial_impact.initiative_id = initiative_id) THEN
    completion_obj := jsonb_set(completion_obj, '{financial}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check performance section
  IF EXISTS (SELECT 1 FROM initiative_performance_data WHERE initiative_performance_data.initiative_id = initiative_id) THEN
    completion_obj := jsonb_set(completion_obj, '{performance}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check projections section
  IF EXISTS (SELECT 1 FROM initiative_projections WHERE initiative_projections.initiative_id = initiative_id) THEN
    completion_obj := jsonb_set(completion_obj, '{projections}', 'true'::jsonb);
    completed_sections := completed_sections + 1;
  END IF;

  -- Check story section
  IF EXISTS (SELECT 1 FROM initiative_stories WHERE initiative_stories.initiative_id = initiative_id) THEN
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

-- Create trigger function to update completion on changes
CREATE OR REPLACE FUNCTION update_initiative_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_data jsonb;
BEGIN
  -- Calculate completion
  completion_data := calculate_initiative_completion(NEW.id);
  
  -- Update the initiative record
  NEW.completion_status := completion_data->'completion_status';
  NEW.completion_percentage := (completion_data->>'completion_percentage')::numeric;
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on initiatives table
DROP TRIGGER IF EXISTS trigger_update_initiative_completion ON initiatives;
CREATE TRIGGER trigger_update_initiative_completion
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_initiative_completion();

-- Create trigger function for related tables to update parent initiative
CREATE OR REPLACE FUNCTION update_parent_initiative_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_data jsonb;
  parent_id uuid;
BEGIN
  -- Get the initiative_id from the changed record
  IF TG_OP = 'DELETE' THEN
    parent_id := OLD.initiative_id;
  ELSE
    parent_id := NEW.initiative_id;
  END IF;

  -- Calculate and update completion
  completion_data := calculate_initiative_completion(parent_id);
  
  UPDATE initiatives
  SET 
    completion_status = completion_data->'completion_status',
    completion_percentage = (completion_data->>'completion_percentage')::numeric,
    updated_at = now()
  WHERE id = parent_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on related tables
DROP TRIGGER IF EXISTS trigger_metrics_update_initiative ON initiative_metrics;
CREATE TRIGGER trigger_metrics_update_initiative
  AFTER INSERT OR UPDATE OR DELETE ON initiative_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_initiative_completion();

DROP TRIGGER IF EXISTS trigger_financial_update_initiative ON initiative_financial_impact;
CREATE TRIGGER trigger_financial_update_initiative
  AFTER INSERT OR UPDATE OR DELETE ON initiative_financial_impact
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_initiative_completion();

DROP TRIGGER IF EXISTS trigger_performance_update_initiative ON initiative_performance_data;
CREATE TRIGGER trigger_performance_update_initiative
  AFTER INSERT OR UPDATE OR DELETE ON initiative_performance_data
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_initiative_completion();

DROP TRIGGER IF EXISTS trigger_projections_update_initiative ON initiative_projections;
CREATE TRIGGER trigger_projections_update_initiative
  AFTER INSERT OR UPDATE OR DELETE ON initiative_projections
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_initiative_completion();

DROP TRIGGER IF EXISTS trigger_stories_update_initiative ON initiative_stories;
CREATE TRIGGER trigger_stories_update_initiative
  AFTER INSERT OR UPDATE OR DELETE ON initiative_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_initiative_completion();

-- Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_initiatives_owner_name ON initiatives(owner_name);
CREATE INDEX IF NOT EXISTS idx_initiatives_completion_percentage ON initiatives(completion_percentage);
CREATE INDEX IF NOT EXISTS idx_initiatives_is_draft ON initiatives(is_draft);
CREATE INDEX IF NOT EXISTS idx_initiatives_last_updated_by ON initiatives(last_updated_by);

-- Update existing initiatives to calculate their completion status
DO $$
DECLARE
  init_record record;
  completion_data jsonb;
BEGIN
  FOR init_record IN SELECT id FROM initiatives LOOP
    completion_data := calculate_initiative_completion(init_record.id);
    
    UPDATE initiatives
    SET 
      completion_status = completion_data->'completion_status',
      completion_percentage = (completion_data->>'completion_percentage')::numeric,
      last_updated_by = owner_name
    WHERE id = init_record.id;
  END LOOP;
END $$;