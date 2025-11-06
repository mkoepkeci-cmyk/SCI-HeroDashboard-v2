/*
  # Initiative Submission System

  ## Overview
  Creates comprehensive database schema for Clinical Informatics initiative data submission.
  Supports detailed tracking of initiatives, metrics, financial impact, and collaboration.

  ## New Tables

  ### `initiatives`
  Core initiative information
  - `id` (uuid, primary key)
  - `owner_name` (text, not null) - SCI team member submitting
  - `initiative_name` (text, not null) - Clear descriptive name
  - `type` (text, not null) - System Initiative, Project, Epic Gold, etc.
  - `status` (text, not null) - Planning, Active, Scaling, Completed, On Hold
  - `start_date` (date) - Initiative start date
  - `end_date` (date) - Initiative end date
  - `timeframe_display` (text) - Human-readable timeframe
  - `clinical_sponsor_name` (text) - Clinical leader name
  - `clinical_sponsor_title` (text) - Clinical leader title
  - `key_collaborators` (text[]) - Array of collaborator names
  - `governance_bodies` (text[]) - Array of governance group names
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `initiative_metrics`
  Performance metrics for initiatives
  - `id` (uuid, primary key)
  - `initiative_id` (uuid, foreign key) - Links to initiatives
  - `metric_name` (text, not null) - Name of metric
  - `metric_type` (text, not null) - Quality, Efficiency, Adoption, Financial, etc.
  - `unit` (text, not null) - Percentage, Minutes, Count, Dollars, etc.
  - `baseline_value` (numeric) - Starting value
  - `baseline_date` (date) - When baseline was measured
  - `current_value` (numeric) - Current value
  - `measurement_date` (date) - When current was measured
  - `target_value` (numeric) - Goal value
  - `improvement` (text) - Calculated or manual improvement description
  - `measurement_method` (text) - How metric was measured
  - `display_order` (integer, default 0) - Order for display
  - `created_at` (timestamptz, default now())

  ### `initiative_financial_impact`
  Revenue and financial tracking
  - `id` (uuid, primary key)
  - `initiative_id` (uuid, foreign key) - Links to initiatives
  - `actual_revenue` (numeric) - Dollar amount realized
  - `actual_timeframe` (text) - Human-readable period
  - `measurement_start_date` (date) - Actual measurement start
  - `measurement_end_date` (date) - Actual measurement end
  - `projected_annual` (numeric) - Full 12-month projection
  - `projection_basis` (text) - How projection is calculated
  - `calculation_methodology` (text) - Detailed calculation explanation
  - `key_assumptions` (text[]) - Array of assumption statements
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `initiative_performance_data`
  Actual measured performance
  - `id` (uuid, primary key)
  - `initiative_id` (uuid, foreign key) - Links to initiatives
  - `users_deployed` (integer) - Current deployment count
  - `total_potential_users` (integer) - Maximum possible users
  - `adoption_rate` (numeric) - Calculated percentage
  - `primary_outcome` (text) - Key measured outcome
  - `measurement_method` (text) - How outcome was measured
  - `sample_size` (text) - Sample size description
  - `measurement_period` (text) - Time period measured
  - `annual_impact_calculated` (text) - Extrapolated annual value
  - `calculation_formula` (text) - Formula used
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `initiative_projections`
  Scaling projections
  - `id` (uuid, primary key)
  - `initiative_id` (uuid, foreign key) - Links to initiatives
  - `scenario_description` (text) - What is being projected
  - `projected_users` (integer) - Scale of deployment
  - `percent_of_organization` (numeric) - Portion of total
  - `projected_time_savings` (text) - Efficiency savings
  - `projected_dollar_value` (text) - Financial value
  - `revenue_impact` (text) - Revenue increase potential
  - `calculation_method` (text) - Exact formula
  - `assumptions` (text[]) - Array of assumptions
  - `sensitivity_notes` (text) - Different adoption scenarios
  - `additional_benefits` (text) - Other projected benefits
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `initiative_stories`
  Impact testimonials
  - `id` (uuid, primary key)
  - `initiative_id` (uuid, foreign key) - Links to initiatives
  - `challenge` (text) - Problem description
  - `approach` (text) - Methodology and steps
  - `outcome` (text) - Results achieved
  - `collaboration_detail` (text) - Key partners with names/titles
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ## Security
  - Enable Row Level Security on all tables
  - Allow public read access for showcase
  - Allow public insert/update for form submissions
*/

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  initiative_name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  start_date date,
  end_date date,
  timeframe_display text,
  clinical_sponsor_name text,
  clinical_sponsor_title text,
  key_collaborators text[],
  governance_bodies text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create initiative_metrics table
CREATE TABLE IF NOT EXISTS initiative_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_type text NOT NULL,
  unit text NOT NULL,
  baseline_value numeric,
  baseline_date date,
  current_value numeric,
  measurement_date date,
  target_value numeric,
  improvement text,
  measurement_method text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create initiative_financial_impact table
CREATE TABLE IF NOT EXISTS initiative_financial_impact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id) ON DELETE CASCADE,
  actual_revenue numeric,
  actual_timeframe text,
  measurement_start_date date,
  measurement_end_date date,
  projected_annual numeric,
  projection_basis text,
  calculation_methodology text,
  key_assumptions text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create initiative_performance_data table
CREATE TABLE IF NOT EXISTS initiative_performance_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id) ON DELETE CASCADE,
  users_deployed integer,
  total_potential_users integer,
  adoption_rate numeric,
  primary_outcome text,
  measurement_method text,
  sample_size text,
  measurement_period text,
  annual_impact_calculated text,
  calculation_formula text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create initiative_projections table
CREATE TABLE IF NOT EXISTS initiative_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id) ON DELETE CASCADE,
  scenario_description text,
  projected_users integer,
  percent_of_organization numeric,
  projected_time_savings text,
  projected_dollar_value text,
  revenue_impact text,
  calculation_method text,
  assumptions text[],
  sensitivity_notes text,
  additional_benefits text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create initiative_stories table
CREATE TABLE IF NOT EXISTS initiative_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id) ON DELETE CASCADE,
  challenge text,
  approach text,
  outcome text,
  collaboration_detail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_financial_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to initiatives"
  ON initiatives FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to initiative_metrics"
  ON initiative_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to initiative_financial_impact"
  ON initiative_financial_impact FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to initiative_performance_data"
  ON initiative_performance_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to initiative_projections"
  ON initiative_projections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to initiative_stories"
  ON initiative_stories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for public insert/update access
CREATE POLICY "Allow public insert to initiatives"
  ON initiatives FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to initiatives"
  ON initiatives FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert to initiative_metrics"
  ON initiative_metrics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert to initiative_financial_impact"
  ON initiative_financial_impact FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to initiative_financial_impact"
  ON initiative_financial_impact FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert to initiative_performance_data"
  ON initiative_performance_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to initiative_performance_data"
  ON initiative_performance_data FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert to initiative_projections"
  ON initiative_projections FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to initiative_projections"
  ON initiative_projections FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert to initiative_stories"
  ON initiative_stories FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to initiative_stories"
  ON initiative_stories FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_initiatives_owner ON initiatives(owner_name);
CREATE INDEX IF NOT EXISTS idx_initiatives_type ON initiatives(type);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiative_metrics_initiative_id ON initiative_metrics(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_financial_initiative_id ON initiative_financial_impact(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_performance_initiative_id ON initiative_performance_data(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_projections_initiative_id ON initiative_projections(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_stories_initiative_id ON initiative_stories(initiative_id);
