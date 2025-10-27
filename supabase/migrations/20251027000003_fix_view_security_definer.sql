-- Fix SECURITY DEFINER views to use SECURITY INVOKER
-- This ensures views use the permissions of the querying user, not the view creator
-- Addresses security warnings from Supabase linter
--
-- Background: PostgreSQL views can be created with SECURITY DEFINER, which means
-- they execute with the permissions of the view creator rather than the querying user.
-- This can bypass Row Level Security (RLS) policies and create security vulnerabilities.
--
-- Solution: Recreate views with security_invoker = true to enforce RLS properly.

-- ============================================================================
-- STEP 1: Fix weekly_effort_summary view
-- ============================================================================

DROP VIEW IF EXISTS weekly_effort_summary CASCADE;
CREATE OR REPLACE VIEW weekly_effort_summary
WITH (security_invoker = true)
AS
SELECT
  team_member_id,
  week_start_date,
  COUNT(DISTINCT initiative_id) as initiative_count,
  SUM(hours_spent) as total_hours,
  CASE
    WHEN SUM(hours_spent) >= 50 THEN 'critical'
    WHEN SUM(hours_spent) >= 45 THEN 'over'
    WHEN SUM(hours_spent) >= 40 THEN 'near'
    WHEN SUM(hours_spent) >= 30 THEN 'normal'
    ELSE 'under'
  END as capacity_status
FROM effort_logs
GROUP BY team_member_id, week_start_date;

COMMENT ON VIEW weekly_effort_summary IS 'Aggregates weekly effort by team member with capacity status (SECURITY INVOKER)';

-- ============================================================================
-- STEP 2: Fix initiative_effort_trends view
-- ============================================================================

DROP VIEW IF EXISTS initiative_effort_trends CASCADE;
CREATE OR REPLACE VIEW initiative_effort_trends
WITH (security_invoker = true)
AS
WITH recent_weeks AS (
  SELECT
    el.initiative_id,
    el.team_member_id,
    el.week_start_date,
    el.hours_spent,
    ROW_NUMBER() OVER (PARTITION BY el.initiative_id, el.team_member_id ORDER BY el.week_start_date DESC) as week_rank
  FROM effort_logs el
),
trend_calc AS (
  SELECT
    initiative_id,
    team_member_id,
    MAX(CASE WHEN week_rank = 1 THEN hours_spent END) as current_hours,
    MAX(CASE WHEN week_rank = 2 THEN hours_spent END) as prev_hours,
    AVG(hours_spent) as avg_hours,
    COUNT(*) as weeks_logged,
    SUM(hours_spent) as total_hours
  FROM recent_weeks
  WHERE week_rank <= 4 -- Look at last 4 weeks for trend
  GROUP BY initiative_id, team_member_id
)
SELECT
  i.id as initiative_id,
  i.initiative_name,
  i.type as work_type,
  tc.team_member_id,
  COALESCE(tc.current_hours, 0) as recent_hours,
  CASE
    WHEN tc.prev_hours IS NULL THEN 'stable'
    WHEN tc.current_hours > tc.prev_hours * 1.2 THEN 'increasing'
    WHEN tc.current_hours < tc.prev_hours * 0.8 THEN 'decreasing'
    ELSE 'stable'
  END as trend,
  CASE
    WHEN tc.prev_hours IS NOT NULL AND tc.prev_hours > 0
    THEN ROUND(((tc.current_hours - tc.prev_hours) / tc.prev_hours * 100)::numeric, 1)
  END as trend_percentage,
  tc.weeks_logged,
  tc.total_hours
FROM initiatives i
LEFT JOIN trend_calc tc ON i.id = tc.initiative_id
WHERE tc.current_hours IS NOT NULL;

COMMENT ON VIEW initiative_effort_trends IS 'Calculates effort trends for initiatives over recent weeks (SECURITY INVOKER)';

-- ============================================================================
-- STEP 3: Enable Row Level Security (RLS) on tables
-- ============================================================================
--
-- Supabase is warning that these tables don't have RLS enabled.
-- Enable RLS and create appropriate policies for each table.

-- Enable RLS on work_type_hours table
DO $$
BEGIN
  ALTER TABLE work_type_hours ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- RLS already enabled
END $$;

-- Drop and recreate policies for work_type_hours (ensures clean state)
DROP POLICY IF EXISTS "Allow public read access to work_type_hours" ON work_type_hours;
DROP POLICY IF EXISTS "Allow authenticated users to insert work_type_hours" ON work_type_hours;
DROP POLICY IF EXISTS "Allow authenticated users to update work_type_hours" ON work_type_hours;
DROP POLICY IF EXISTS "Allow authenticated users to delete work_type_hours" ON work_type_hours;

CREATE POLICY "Allow public read access to work_type_hours"
  ON work_type_hours FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert work_type_hours"
  ON work_type_hours FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update work_type_hours"
  ON work_type_hours FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete work_type_hours"
  ON work_type_hours FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on capacity_history table
DO $$
BEGIN
  ALTER TABLE capacity_history ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- RLS already enabled
END $$;

-- Drop and recreate policies for capacity_history (ensures clean state)
DROP POLICY IF EXISTS "Allow public read access to capacity_history" ON capacity_history;
DROP POLICY IF EXISTS "Allow authenticated users to insert capacity_history" ON capacity_history;
DROP POLICY IF EXISTS "Allow authenticated users to update capacity_history" ON capacity_history;
DROP POLICY IF EXISTS "Allow authenticated users to delete capacity_history" ON capacity_history;

CREATE POLICY "Allow public read access to capacity_history"
  ON capacity_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert capacity_history"
  ON capacity_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update capacity_history"
  ON capacity_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete capacity_history"
  ON capacity_history FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on dashboard_metrics table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_metrics' AND table_schema = 'public') THEN
    -- Enable RLS
    BEGIN
      ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
    EXCEPTION
      WHEN duplicate_object THEN
        NULL; -- RLS already enabled
    END;

    -- Drop existing policies (if any)
    DROP POLICY IF EXISTS "Allow public read access to dashboard_metrics" ON dashboard_metrics;
    DROP POLICY IF EXISTS "Allow authenticated users to insert dashboard_metrics" ON dashboard_metrics;
    DROP POLICY IF EXISTS "Allow authenticated users to update dashboard_metrics" ON dashboard_metrics;
    DROP POLICY IF EXISTS "Allow authenticated users to delete dashboard_metrics" ON dashboard_metrics;

    -- Create policies for dashboard_metrics
    EXECUTE 'CREATE POLICY "Allow public read access to dashboard_metrics"
      ON dashboard_metrics FOR SELECT
      TO anon, authenticated
      USING (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated users to insert dashboard_metrics"
      ON dashboard_metrics FOR INSERT
      TO authenticated
      WITH CHECK (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated users to update dashboard_metrics"
      ON dashboard_metrics FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated users to delete dashboard_metrics"
      ON dashboard_metrics FOR DELETE
      TO authenticated
      USING (true)';
  END IF;
END $$;

-- Enable RLS on initiative_team_members table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'initiative_team_members' AND table_schema = 'public') THEN
    -- Enable RLS
    BEGIN
      ALTER TABLE initiative_team_members ENABLE ROW LEVEL SECURITY;
    EXCEPTION
      WHEN duplicate_object THEN
        NULL; -- RLS already enabled
    END;

    -- Drop existing policies (if any)
    DROP POLICY IF EXISTS "Allow public read access to initiative_team_members" ON initiative_team_members;
    DROP POLICY IF EXISTS "Allow authenticated users to insert initiative_team_members" ON initiative_team_members;
    DROP POLICY IF EXISTS "Allow authenticated users to update initiative_team_members" ON initiative_team_members;
    DROP POLICY IF EXISTS "Allow authenticated users to delete initiative_team_members" ON initiative_team_members;

    -- Create policies for initiative_team_members
    EXECUTE 'CREATE POLICY "Allow public read access to initiative_team_members"
      ON initiative_team_members FOR SELECT
      TO anon, authenticated
      USING (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated users to insert initiative_team_members"
      ON initiative_team_members FOR INSERT
      TO authenticated
      WITH CHECK (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated users to update initiative_team_members"
      ON initiative_team_members FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated users to delete initiative_team_members"
      ON initiative_team_members FOR DELETE
      TO authenticated
      USING (true)';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Fix functions with mutable search_path
-- ============================================================================
--
-- Background: Functions without a SET search_path clause can be exploited
-- by malicious users who manipulate the schema search path to redirect
-- function calls to malicious objects.
--
-- Solution: Add "SET search_path = public" to all functions to prevent
-- search_path manipulation attacks.

-- Fix update_is_active function
CREATE OR REPLACE FUNCTION update_is_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_active := NEW.status IN ('Planning', 'Active', 'Scaling');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix calculate_capacity_utilization function
CREATE OR REPLACE FUNCTION calculate_capacity_utilization()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate utilization as active_hours / available_hours
  IF NEW.available_hours > 0 THEN
    NEW.capacity_utilization := NEW.active_hours_per_week / NEW.available_hours;
  ELSE
    NEW.capacity_utilization := 0;
  END IF;

  -- Determine capacity status
  IF NEW.capacity_utilization >= 1.0 THEN
    NEW.capacity_status := 'over_capacity';
  ELSIF NEW.capacity_utilization >= 0.8 THEN
    NEW.capacity_status := 'near_capacity';
  ELSE
    NEW.capacity_status := 'available';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix update_work_type_hours_timestamp function
CREATE OR REPLACE FUNCTION update_work_type_hours_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix update_dashboard_metrics_timestamp function (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_dashboard_metrics_timestamp') THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION update_dashboard_metrics_timestamp()
      RETURNS TRIGGER AS $func$
      BEGIN
        NEW.updated_at := NOW();
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql
      SET search_path = public;
    ';
  END IF;
END $$;

-- Fix update_effort_logs_updated_at function
CREATE OR REPLACE FUNCTION update_effort_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix update_initiative_completion function
CREATE OR REPLACE FUNCTION update_initiative_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_result jsonb;
BEGIN
  -- Calculate completion for the initiative
  completion_result := calculate_initiative_completion(NEW.id);

  -- Update the initiative record
  UPDATE initiatives
  SET
    completion_status = completion_result->'completion_status',
    completion_percentage = (completion_result->>'completion_percentage')::numeric,
    section_last_updated = jsonb_build_object(TG_ARGV[0], NOW())
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix update_parent_initiative_completion function
CREATE OR REPLACE FUNCTION update_parent_initiative_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_result jsonb;
BEGIN
  -- Calculate completion for the parent initiative
  completion_result := calculate_initiative_completion(NEW.initiative_id);

  -- Update the parent initiative record
  UPDATE initiatives
  SET
    completion_status = completion_result->'completion_status',
    completion_percentage = (completion_result->>'completion_percentage')::numeric,
    section_last_updated = jsonb_build_object(
      CASE TG_TABLE_NAME
        WHEN 'initiative_metrics' THEN 'metrics'
        WHEN 'initiative_financial_impact' THEN 'financial'
        WHEN 'initiative_performance_data' THEN 'performance'
        WHEN 'initiative_projections' THEN 'projections'
        WHEN 'initiative_stories' THEN 'story'
      END,
      NOW()
    )
  WHERE id = NEW.initiative_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix calculate_initiative_completion function
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
$$ LANGUAGE plpgsql
SET search_path = public;
