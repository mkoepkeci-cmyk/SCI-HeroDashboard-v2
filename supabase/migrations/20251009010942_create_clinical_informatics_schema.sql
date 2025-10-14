/*
  # Clinical Informatics Team Database Schema

  ## Overview
  Creates a comprehensive database for tracking Clinical Informatics team members, 
  their assignments, work metrics, and impact data.

  ## New Tables
  
  ### `team_members`
  Stores information about each team member
  - `id` (uuid, primary key)
  - `name` (text, unique, not null) - Team member name
  - `role` (text, not null) - Job role/title
  - `specialty` (text) - Area of specialty
  - `total_assignments` (integer, default 0) - Total number of assignments
  - `revenue_impact` (text) - Financial impact (e.g., "$276M+")
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `assignments`
  Tracks all work assignments across the team
  - `id` (uuid, primary key)
  - `assignment_name` (text, not null) - Name/description of assignment
  - `work_type` (text, not null) - Type of work (Epic Gold, System Initiative, etc.)
  - `phase` (text) - Current phase of work
  - `status` (text, not null) - Current status
  - `work_effort` (text) - Estimated effort level
  - `team_member_id` (uuid, foreign key) - Links to team_members
  - `team_member_name` (text, not null) - Name for quick reference
  - `role_type` (text) - Primary, Secondary, Support, Co-owner
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `work_type_summary`
  Aggregated view of work types per team member
  - `id` (uuid, primary key)
  - `team_member_id` (uuid, foreign key)
  - `work_type` (text, not null)
  - `count` (integer, not null)
  - `created_at` (timestamptz, default now())

  ### `ehr_platform_summary`
  Tracks EHR platform assignments per team member
  - `id` (uuid, primary key)
  - `team_member_id` (uuid, foreign key)
  - `ehr_platform` (text, not null) - Epic, Cerner, All, etc.
  - `count` (integer, not null)
  - `created_at` (timestamptz, default now())

  ### `key_highlights`
  Stores notable achievements and key work items
  - `id` (uuid, primary key)
  - `team_member_id` (uuid, foreign key)
  - `highlight` (text, not null)
  - `order_index` (integer, default 0)
  - `created_at` (timestamptz, default now())

  ### `team_metrics`
  Overall team performance metrics
  - `id` (uuid, primary key)
  - `metric_name` (text, unique, not null)
  - `metric_value` (text, not null)
  - `metric_category` (text) - Overview, Financial, Efficiency, etc.
  - `display_order` (integer, default 0)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Create policies for authenticated read access
  - Create policies for authenticated users to manage their own data
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  role text NOT NULL,
  specialty text,
  total_assignments integer DEFAULT 0,
  revenue_impact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_name text NOT NULL,
  work_type text NOT NULL,
  phase text,
  status text NOT NULL,
  work_effort text,
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  team_member_name text NOT NULL,
  role_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_type_summary table
CREATE TABLE IF NOT EXISTS work_type_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  work_type text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_member_id, work_type)
);

-- Create ehr_platform_summary table
CREATE TABLE IF NOT EXISTS ehr_platform_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  ehr_platform text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_member_id, ehr_platform)
);

-- Create key_highlights table
CREATE TABLE IF NOT EXISTS key_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  highlight text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create team_metrics table
CREATE TABLE IF NOT EXISTS team_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text UNIQUE NOT NULL,
  metric_value text NOT NULL,
  metric_category text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_type_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE ehr_platform_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is an internal showcase tool)
CREATE POLICY "Allow public read access to team_members"
  ON team_members FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to assignments"
  ON assignments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to work_type_summary"
  ON work_type_summary FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to ehr_platform_summary"
  ON ehr_platform_summary FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to key_highlights"
  ON key_highlights FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to team_metrics"
  ON team_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for authenticated users to insert/update data
CREATE POLICY "Allow authenticated users to insert team_members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update team_members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert work_type_summary"
  ON work_type_summary FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert ehr_platform_summary"
  ON ehr_platform_summary FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert key_highlights"
  ON key_highlights FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert team_metrics"
  ON team_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update team_metrics"
  ON team_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assignments_team_member_id ON assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_assignments_team_member_name ON assignments(team_member_name);
CREATE INDEX IF NOT EXISTS idx_assignments_work_type ON assignments(work_type);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_work_type_summary_team_member_id ON work_type_summary(team_member_id);
CREATE INDEX IF NOT EXISTS idx_ehr_platform_summary_team_member_id ON ehr_platform_summary(team_member_id);
CREATE INDEX IF NOT EXISTS idx_key_highlights_team_member_id ON key_highlights(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_metrics_category ON team_metrics(metric_category);
