/*
  # Workload Calculator Configuration Table

  ## Overview
  Creates a flexible configuration system for workload capacity calculations.
  Allows leadership to adjust weights and thresholds without code changes.

  ## Tables Created

  ### `workload_calculator_config`
  Stores all configurable weights and thresholds for capacity calculations
  - Effort size base hours (XS, S, M, L, XL)
  - Role responsibility weights (Owner, Co-owner, Secondary, Support)
  - Work type complexity weights (System Initiative, Governance, etc.)
  - Phase intensity weights (Discovery, Design, Build, etc.)
  - Capacity utilization thresholds (under, near, at, over)

  ## Configuration Types
  - `effort_size`: Base hours for work effort sizes
  - `role_weight`: Multiplier based on responsibility level
  - `work_type_weight`: Multiplier based on work complexity
  - `phase_weight`: Multiplier based on project phase intensity
  - `capacity_threshold`: Utilization percentages for status indicators
*/

-- Create workload_calculator_config table
CREATE TABLE IF NOT EXISTS workload_calculator_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type text NOT NULL CHECK (config_type IN (
    'effort_size',
    'role_weight',
    'work_type_weight',
    'phase_weight',
    'capacity_threshold'
  )),
  key text NOT NULL,
  value decimal NOT NULL CHECK (value >= 0),
  label text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_config_key UNIQUE (config_type, key)
);

-- Add comments
COMMENT ON TABLE workload_calculator_config IS
'Configuration for workload capacity calculations. Allows dynamic adjustment of weights and thresholds.';

COMMENT ON COLUMN workload_calculator_config.config_type IS
'Type of configuration: effort_size, role_weight, work_type_weight, phase_weight, capacity_threshold';

COMMENT ON COLUMN workload_calculator_config.key IS
'Unique identifier within config_type (e.g., XS, Owner, System Initiative, Design, under)';

COMMENT ON COLUMN workload_calculator_config.value IS
'Numeric value for weight/hours/threshold. Must be >= 0.';

COMMENT ON COLUMN workload_calculator_config.label IS
'Human-readable label for display (e.g., "Less than 1 hr/wk", "Owner - Full responsibility")';

COMMENT ON COLUMN workload_calculator_config.display_order IS
'Order for displaying in UI (0 = first)';

COMMENT ON COLUMN workload_calculator_config.is_active IS
'Whether this configuration is currently active/enabled';

-- Create index for fast lookups
CREATE INDEX idx_workload_calc_config_type_key ON workload_calculator_config(config_type, key) WHERE is_active = true;

-- Enable RLS (allow public read for now, restrict write to authenticated users in future)
ALTER TABLE workload_calculator_config ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (consistent with other tables)
CREATE POLICY "Allow anonymous read access" ON workload_calculator_config
  FOR SELECT USING (true);

-- Allow anonymous insert/update for now (can restrict later)
CREATE POLICY "Allow anonymous insert" ON workload_calculator_config
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON workload_calculator_config
  FOR UPDATE USING (true);
