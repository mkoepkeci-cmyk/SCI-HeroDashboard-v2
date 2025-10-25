-- Migration: Add Capacity and Workload Fields
-- Date: 2025-10-13
-- Purpose: Add fields to support enhanced Workload Dashboard with capacity metrics

-- ============================================================================
-- STEP 1: Add capacity fields to team_members table
-- ============================================================================

ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS active_hours_per_week DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_hours DECIMAL(5,2) DEFAULT 40.0,
ADD COLUMN IF NOT EXISTS capacity_utilization DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capacity_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS capacity_warnings TEXT;

-- Add comment descriptions
COMMENT ON COLUMN team_members.active_hours_per_week IS 'HONEST hours per week - only from assignments WITH work effort defined';
COMMENT ON COLUMN team_members.available_hours IS 'Total available hours per week (typically 40)';
COMMENT ON COLUMN team_members.capacity_utilization IS 'Percentage of capacity utilized (0.0 to 1.0+) - HONEST metrics only';
COMMENT ON COLUMN team_members.capacity_status IS 'Capacity status: available, near_capacity, over_capacity';
COMMENT ON COLUMN team_members.capacity_warnings IS 'Warning text from Excel Dashboard (e.g., "⚠️ 22 Need Baseline Info, 40 Other Incomplete")';

-- ============================================================================
-- STEP 2: Create work_type_hours table for detailed work type tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS work_type_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  work_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  hours_per_week DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique combination of team member and work type
  CONSTRAINT unique_member_work_type UNIQUE (team_member_id, work_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_type_hours_team_member
  ON work_type_hours(team_member_id);

CREATE INDEX IF NOT EXISTS idx_work_type_hours_work_type
  ON work_type_hours(work_type);

-- Add comments
COMMENT ON TABLE work_type_hours IS 'Tracks hours per week and count for each work type per team member';
COMMENT ON COLUMN work_type_hours.count IS 'Number of assignments of this work type';
COMMENT ON COLUMN work_type_hours.hours_per_week IS 'Estimated hours per week for this work type';

-- ============================================================================
-- STEP 3: Create capacity_history table for trending
-- ============================================================================

CREATE TABLE IF NOT EXISTS capacity_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_hours DECIMAL(5,2) DEFAULT 0,
  capacity_utilization DECIMAL(5,4) DEFAULT 0,
  total_assignments INTEGER DEFAULT 0,
  capacity_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique combination of team member and date
  CONSTRAINT unique_member_snapshot_date UNIQUE (team_member_id, snapshot_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_capacity_history_team_member
  ON capacity_history(team_member_id);

CREATE INDEX IF NOT EXISTS idx_capacity_history_date
  ON capacity_history(snapshot_date DESC);

-- Add comments
COMMENT ON TABLE capacity_history IS 'Historical snapshots of team member capacity for trending analysis';
COMMENT ON COLUMN capacity_history.snapshot_date IS 'Date of the capacity snapshot';
COMMENT ON COLUMN capacity_history.active_hours IS 'Active hours per week at time of snapshot';

-- ============================================================================
-- STEP 4: Create function to automatically update capacity_utilization
-- ============================================================================

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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate on insert/update
DROP TRIGGER IF EXISTS trigger_calculate_capacity ON team_members;

CREATE TRIGGER trigger_calculate_capacity
  BEFORE INSERT OR UPDATE OF active_hours_per_week, available_hours
  ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION calculate_capacity_utilization();

-- ============================================================================
-- STEP 5: Create function to update work_type_hours timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_work_type_hours_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_work_type_hours_timestamp ON work_type_hours;

CREATE TRIGGER trigger_update_work_type_hours_timestamp
  BEFORE UPDATE ON work_type_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_work_type_hours_timestamp();

-- ============================================================================
-- STEP 6: Verification Queries
-- ============================================================================

-- Check that columns were added
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'team_members'
  AND column_name IN ('active_hours_per_week', 'available_hours', 'capacity_utilization', 'capacity_status')
ORDER BY column_name;

-- Check that new tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('work_type_hours', 'capacity_history')
  AND table_schema = 'public'
ORDER BY table_name;

-- Show sample data structure
SELECT
  tm.name,
  tm.total_assignments,
  tm.active_hours_per_week,
  tm.available_hours,
  tm.capacity_utilization,
  tm.capacity_status
FROM team_members tm
ORDER BY tm.capacity_utilization DESC NULLS LAST
LIMIT 5;

-- ============================================================================
-- STEP 7: Grant permissions (if needed)
-- ============================================================================

-- Grant permissions to authenticated users (adjust as needed for your setup)
-- GRANT ALL ON work_type_hours TO authenticated;
-- GRANT ALL ON capacity_history TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- NOTES
-- ============================================================================

-- This migration adds:
-- 1. Capacity tracking fields to team_members
-- 2. work_type_hours table for detailed work type hour tracking
-- 3. capacity_history table for trending over time
-- 4. Automatic calculation of capacity_utilization and capacity_status
-- 5. Triggers to keep data fresh

-- Next steps:
-- 1. Run import script to populate data from Excel Dashboard
-- 2. Create views or materialized views if needed for performance
-- 3. Set up periodic snapshots to capacity_history for trending

-- To rollback this migration:
-- ALTER TABLE team_members DROP COLUMN IF EXISTS active_hours_per_week;
-- ALTER TABLE team_members DROP COLUMN IF EXISTS available_hours;
-- ALTER TABLE team_members DROP COLUMN IF EXISTS capacity_utilization;
-- ALTER TABLE team_members DROP COLUMN IF EXISTS capacity_status;
-- DROP TABLE IF EXISTS capacity_history;
-- DROP TABLE IF EXISTS work_type_hours;
-- DROP FUNCTION IF EXISTS calculate_capacity_utilization();
-- DROP FUNCTION IF EXISTS update_work_type_hours_timestamp();
