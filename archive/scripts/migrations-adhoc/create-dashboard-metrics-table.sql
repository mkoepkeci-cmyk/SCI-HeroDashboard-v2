-- Create dashboard_metrics table
-- This table stores pre-calculated metrics from the Excel Dashboard tab (columns A-Y)
-- NO calculations should be done in the app - this is the source of truth

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,

  -- Summary Metrics (Dashboard Columns A-G)
  total_assignments INTEGER NOT NULL DEFAULT 0,
  active_assignments INTEGER NOT NULL DEFAULT 0,
  active_hours_per_week DECIMAL(10,2) NOT NULL DEFAULT 0,
  available_hours DECIMAL(10,2) NOT NULL DEFAULT 40,
  capacity_utilization DECIMAL(5,4) NOT NULL DEFAULT 0,
  capacity_status TEXT, -- e.g., "⚠️ 2 Need Baseline Info, 4 Other Incomplete - 🟢 Under"

  -- Work Type Breakdown: Epic Gold (Columns H-I)
  epic_gold_count INTEGER NOT NULL DEFAULT 0,
  epic_gold_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: Governance (Columns J-K)
  governance_count INTEGER NOT NULL DEFAULT 0,
  governance_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: System Initiatives (Columns L-M)
  system_initiative_count INTEGER NOT NULL DEFAULT 0,
  system_initiative_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: System Projects (Columns N-O)
  system_projects_count INTEGER NOT NULL DEFAULT 0,
  system_projects_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: Epic Upgrades (Columns P-Q)
  epic_upgrades_count INTEGER NOT NULL DEFAULT 0,
  epic_upgrades_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: General Support (Columns R-S)
  general_support_count INTEGER NOT NULL DEFAULT 0,
  general_support_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: Policy (Columns T-U)
  policy_count INTEGER NOT NULL DEFAULT 0,
  policy_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: Market (Columns V-W)
  market_count INTEGER NOT NULL DEFAULT 0,
  market_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Work Type Breakdown: Ticket (Columns X-Y)
  ticket_count INTEGER NOT NULL DEFAULT 0,
  ticket_hours DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Metadata
  last_updated TIMESTAMP DEFAULT NOW(),

  PRIMARY KEY (team_member_id)
);

-- Add comments for documentation
COMMENT ON TABLE dashboard_metrics IS 'Pre-calculated workload metrics from Excel Dashboard tab - DO NOT calculate in app';
COMMENT ON COLUMN dashboard_metrics.capacity_status IS 'Full capacity status text from Excel Dashboard column G';
COMMENT ON COLUMN dashboard_metrics.active_hours_per_week IS 'Active hours from Excel Dashboard column D - already calculated with formulas';
COMMENT ON COLUMN dashboard_metrics.capacity_utilization IS 'Decimal capacity (e.g., 0.2964 = 29.64%) from Excel Dashboard column F';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_team_member ON dashboard_metrics(team_member_id);

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_dashboard_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_dashboard_metrics_timestamp ON dashboard_metrics;
CREATE TRIGGER trigger_update_dashboard_metrics_timestamp
BEFORE UPDATE ON dashboard_metrics
FOR EACH ROW
EXECUTE FUNCTION update_dashboard_metrics_timestamp();

-- Display sample structure
SELECT
  'dashboard_metrics table created successfully' as status,
  'Use import-dashboard-data.ts to populate from Excel' as next_step;
