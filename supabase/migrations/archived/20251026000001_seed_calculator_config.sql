/*
  # Seed Workload Calculator Configuration

  ## Overview
  Populates workload_calculator_config with initial values from Google Sheets calculations.
  These values match the formulas documented in "Sample capacity calculations.md"

  ## Data Sources
  Values extracted from SCI Workload Tracker spreadsheet formulas:
  - Base Hours: XS=0.5, S=1.5, M=3.5, L=7.5, XL=15
  - Role Weights: Owner=1, Co-owner=1, Secondary=0.5, Support=0.25
  - Work Type Weights: Various (System Initiative=1, Policy=0.5, etc.)
  - Phase Weights: Discovery=0.3, Design=1, Maintenance=0.25, etc.
  - Capacity Thresholds: Under<60%, Near 60-74%, At 75-84%, Over≥85%
*/

-- Clear existing config (in case of re-run)
TRUNCATE TABLE workload_calculator_config;

-- ============================================================================
-- EFFORT SIZES (Base Hours per Week)
-- ============================================================================
INSERT INTO workload_calculator_config (config_type, key, value, label, display_order) VALUES
  ('effort_size', 'XS', 0.5, 'Extra Small - Less than 1 hr/wk', 1),
  ('effort_size', 'S', 1.5, 'Small - 1-2 hrs/wk', 2),
  ('effort_size', 'M', 3.5, 'Medium - 2-5 hrs/wk', 3),
  ('effort_size', 'L', 7.5, 'Large - 5-10 hrs/wk', 4),
  ('effort_size', 'XL', 15.0, 'Extra Large - More than 10 hrs/wk', 5),
  ('effort_size', 'Unspecified', 0.0, 'Unspecified - No estimate', 6);

-- ============================================================================
-- ROLE WEIGHTS (Responsibility Level Multiplier)
-- ============================================================================
INSERT INTO workload_calculator_config (config_type, key, value, label, display_order) VALUES
  ('role_weight', 'Owner', 1.0, 'Owner - Full responsibility and decision-making', 1),
  ('role_weight', 'Co-owner', 1.0, 'Co-owner - Shared full responsibility', 2),
  ('role_weight', 'Secondary', 0.5, 'Secondary - Supporting role, half weight', 3),
  ('role_weight', 'Support', 0.25, 'Support - Minimal involvement, quarter weight', 4);

-- ============================================================================
-- WORK TYPE WEIGHTS (Complexity/Intensity Multiplier)
-- ============================================================================
INSERT INTO workload_calculator_config (config_type, key, value, label, display_order) VALUES
  ('work_type_weight', 'Epic Gold', 1.0, 'Epic Gold - Full intensity', 1),
  ('work_type_weight', 'System Initiative', 1.0, 'System Initiative - Full intensity', 2),
  ('work_type_weight', 'System Project', 1.0, 'System Project - Full intensity', 3),
  ('work_type_weight', 'Epic Upgrades', 1.0, 'Epic Upgrades - Full intensity', 4),
  ('work_type_weight', 'General Support', 1.0, 'General Support - Full intensity', 5),
  ('work_type_weight', 'Ticket', 1.0, 'Ticket - Full intensity', 6),
  ('work_type_weight', 'Governance', 0.0, 'Governance - Uses direct hours (no formula)', 7),
  ('work_type_weight', 'Policy/Guidelines', 0.5, 'Policy/Guidelines - Reduced intensity', 8),
  ('work_type_weight', 'Market Project', 0.5, 'Market Project - Reduced intensity', 9);

-- ============================================================================
-- PHASE WEIGHTS (Project Lifecycle Intensity Multiplier)
-- ============================================================================
INSERT INTO workload_calculator_config (config_type, key, value, label, display_order) VALUES
  ('phase_weight', 'Discovery/Define', 0.3, 'Discovery/Define - Low intensity planning', 1),
  ('phase_weight', 'Design', 1.0, 'Design - Full intensity design work', 2),
  ('phase_weight', 'Build', 1.0, 'Build - Full intensity development', 3),
  ('phase_weight', 'Validate/Test', 1.0, 'Validate/Test - Full intensity testing', 4),
  ('phase_weight', 'Deploy', 1.0, 'Deploy - Full intensity deployment', 5),
  ('phase_weight', 'Did we Deliver', 0.25, 'Did we Deliver - Low intensity evaluation', 6),
  ('phase_weight', 'Post Go Live Support', 0.5, 'Post Go Live Support - Moderate intensity support', 7),
  ('phase_weight', 'Maintenance', 0.25, 'Maintenance - Low intensity maintenance', 8),
  ('phase_weight', 'Steady State', 0.15, 'Steady State - Minimal ongoing work', 9),
  ('phase_weight', 'N/A', 1.0, 'N/A - Not applicable, use full weight', 10);

-- ============================================================================
-- CAPACITY THRESHOLDS (Utilization Percentage Breakpoints)
-- ============================================================================
-- Note: These define the MINIMUM utilization for each status
-- under: < 60%, near: 60-74%, at: 75-84%, over: >= 85%
INSERT INTO workload_calculator_config (config_type, key, value, label, display_order) VALUES
  ('capacity_threshold', 'under', 0.60, 'Under Capacity - Less than 60% utilization', 1),
  ('capacity_threshold', 'near', 0.75, 'Near Capacity - 60-74% utilization', 2),
  ('capacity_threshold', 'at', 0.85, 'At Capacity - 75-84% utilization', 3),
  ('capacity_threshold', 'over', 0.85, 'Over Capacity - 85%+ utilization', 4);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Count records by type
-- Expected: 6 effort_size + 4 role_weight + 9 work_type_weight + 10 phase_weight + 4 capacity_threshold = 33 total

DO $$
DECLARE
  total_count int;
  effort_count int;
  role_count int;
  work_type_count int;
  phase_count int;
  threshold_count int;
BEGIN
  SELECT COUNT(*) INTO total_count FROM workload_calculator_config;
  SELECT COUNT(*) INTO effort_count FROM workload_calculator_config WHERE config_type = 'effort_size';
  SELECT COUNT(*) INTO role_count FROM workload_calculator_config WHERE config_type = 'role_weight';
  SELECT COUNT(*) INTO work_type_count FROM workload_calculator_config WHERE config_type = 'work_type_weight';
  SELECT COUNT(*) INTO phase_count FROM workload_calculator_config WHERE config_type = 'phase_weight';
  SELECT COUNT(*) INTO threshold_count FROM workload_calculator_config WHERE config_type = 'capacity_threshold';

  RAISE NOTICE 'Workload Calculator Config Seeded:';
  RAISE NOTICE '  Effort Sizes: %', effort_count;
  RAISE NOTICE '  Role Weights: %', role_count;
  RAISE NOTICE '  Work Type Weights: %', work_type_count;
  RAISE NOTICE '  Phase Weights: %', phase_count;
  RAISE NOTICE '  Capacity Thresholds: %', threshold_count;
  RAISE NOTICE '  Total Records: %', total_count;

  IF total_count != 33 THEN
    RAISE WARNING 'Expected 33 records, got %. Check seed data.', total_count;
  END IF;
END $$;
