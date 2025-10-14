-- Create effort_logs table for tracking time spent on initiatives
-- This enables dynamic workload tracking and capacity management

CREATE TABLE IF NOT EXISTS effort_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Always the Monday of the week
  hours_spent DECIMAL(5,2) NOT NULL CHECK (hours_spent >= 0 AND hours_spent <= 168), -- Max hours in a week
  effort_size TEXT NOT NULL CHECK (effort_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one log per initiative per team member per week
  UNIQUE(initiative_id, team_member_id, week_start_date)
);

-- Create indexes for common queries
CREATE INDEX idx_effort_logs_initiative ON effort_logs(initiative_id);
CREATE INDEX idx_effort_logs_team_member ON effort_logs(team_member_id);
CREATE INDEX idx_effort_logs_week ON effort_logs(week_start_date);
CREATE INDEX idx_effort_logs_team_week ON effort_logs(team_member_id, week_start_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_effort_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER effort_logs_updated_at
  BEFORE UPDATE ON effort_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_effort_logs_updated_at();

-- Enable Row Level Security
ALTER TABLE effort_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Enable all operations for authenticated users" ON effort_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a view for weekly effort summaries
CREATE OR REPLACE VIEW weekly_effort_summary AS
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

-- Create a view for initiative effort trends
CREATE OR REPLACE VIEW initiative_effort_trends AS
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

-- Comment on tables and views
COMMENT ON TABLE effort_logs IS 'Tracks weekly effort (hours) spent by team members on initiatives';
COMMENT ON VIEW weekly_effort_summary IS 'Aggregates weekly effort by team member with capacity status';
COMMENT ON VIEW initiative_effort_trends IS 'Calculates effort trends for initiatives over recent weeks';
