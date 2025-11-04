/*
  # Update Workload Calculator Configuration - Simplified Formula

  ## Changes
  - Removes Governance special case (now uses formula with 0.7 weight)
  - Updates phase weights (Design 1.0 → 0.7, N/A 1.0 → 0.0)
  - Updates work type weights (Governance 0.0 → 0.7, Policy 0.5 → 0.7)
  - Updates capacity thresholds (Near 75% → 76%, At 85% → 76%)
  - Removes "In Progress" phase weight (not in spec)

  ## Formula
  Weekly Hours = Base Hours × Role Weight × Type Weight × Phase Weight × Active Status
*/

-- ============================================================================
-- UPDATE WORK TYPE WEIGHTS
-- ============================================================================

-- Governance: 0.0 → 0.7 (now uses formula instead of direct hours)
UPDATE workload_calculator_config
SET value = 0.7,
    label = 'Governance - 0.7x intensity',
    updated_at = now()
WHERE config_type = 'work_type_weight' AND key = 'Governance';

-- Policy/Guidelines: 0.5 → 0.7
UPDATE workload_calculator_config
SET value = 0.7,
    label = 'Policy/Guidelines - 0.7x intensity',
    updated_at = now()
WHERE config_type = 'work_type_weight' AND key = 'Policy/Guidelines';

-- ============================================================================
-- UPDATE PHASE WEIGHTS
-- ============================================================================

-- Design: 1.0 → 0.7
UPDATE workload_calculator_config
SET value = 0.7,
    updated_at = now()
WHERE config_type = 'phase_weight' AND key = 'Design';

-- Discovery/Define: 0.3 → 0.5
UPDATE workload_calculator_config
SET value = 0.5,
    updated_at = now()
WHERE config_type = 'phase_weight' AND key = 'Discovery/Define';

-- Did we Deliver: 0.25 → 0.3
UPDATE workload_calculator_config
SET value = 0.3,
    updated_at = now()
WHERE config_type = 'phase_weight' AND key = 'Did we Deliver';

-- General Support: 1.0 → 0.5
UPDATE workload_calculator_config
SET value = 0.5,
    label = 'General Support - 0.5x intensity',
    updated_at = now()
WHERE config_type = 'work_type_weight' AND key = 'General Support';

-- N/A: 1.0 → 0.0 (assignments with N/A phase contribute zero hours)
UPDATE workload_calculator_config
SET value = 0.0,
    label = 'N/A - Not applicable, zero hours',
    updated_at = now()
WHERE config_type = 'phase_weight' AND key = 'N/A';

-- Remove "In Progress" phase if it exists (not in spec)
DELETE FROM workload_calculator_config
WHERE config_type = 'phase_weight' AND key = 'In Progress';

-- ============================================================================
-- UPDATE CAPACITY THRESHOLDS
-- ============================================================================

-- Near: 0.75 → 0.60 (minimum for "Near Capacity" status)
UPDATE workload_calculator_config
SET value = 0.60,
    label = 'Near Capacity - 60-75% utilization',
    updated_at = now()
WHERE config_type = 'capacity_threshold' AND key = 'near';

-- At: 0.85 → 0.76 (minimum for "At Capacity" status)
UPDATE workload_calculator_config
SET value = 0.76,
    label = 'At Capacity - 76-84% utilization',
    updated_at = now()
WHERE config_type = 'capacity_threshold' AND key = 'at';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  governance_weight decimal;
  policy_weight decimal;
  design_weight decimal;
  na_weight decimal;
  near_threshold decimal;
  at_threshold decimal;
BEGIN
  SELECT value INTO governance_weight FROM workload_calculator_config WHERE config_type = 'work_type_weight' AND key = 'Governance';
  SELECT value INTO policy_weight FROM workload_calculator_config WHERE config_type = 'work_type_weight' AND key = 'Policy/Guidelines';
  SELECT value INTO design_weight FROM workload_calculator_config WHERE config_type = 'phase_weight' AND key = 'Design';
  SELECT value INTO na_weight FROM workload_calculator_config WHERE config_type = 'phase_weight' AND key = 'N/A';
  SELECT value INTO near_threshold FROM workload_calculator_config WHERE config_type = 'capacity_threshold' AND key = 'near';
  SELECT value INTO at_threshold FROM workload_calculator_config WHERE config_type = 'capacity_threshold' AND key = 'at';

  RAISE NOTICE '✅ Calculator Configuration Updated:';
  RAISE NOTICE '  Governance weight: % (expected 0.7)', governance_weight;
  RAISE NOTICE '  Policy/Guidelines weight: % (expected 0.7)', policy_weight;
  RAISE NOTICE '  Design phase weight: % (expected 0.7)', design_weight;
  RAISE NOTICE '  N/A phase weight: % (expected 0.0)', na_weight;
  RAISE NOTICE '  Near Capacity threshold: % (expected 0.60)', near_threshold;
  RAISE NOTICE '  At Capacity threshold: % (expected 0.76)', at_threshold;

  IF governance_weight != 0.7 OR policy_weight != 0.7 OR design_weight != 0.7 OR na_weight != 0.0 THEN
    RAISE WARNING '⚠️ Some weights do not match expected values. Check migration.';
  END IF;
END $$;
