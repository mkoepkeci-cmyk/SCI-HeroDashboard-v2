-- Migration: Add Unified Form Support
-- Date: October 29, 2025
-- Purpose: Add fields to initiatives table to support unified request+initiative form
-- Impact: Enables single form workflow from intake through completion

-- =============================================================================
-- 1. ADD NEW COLUMNS TO INITIATIVES TABLE
-- =============================================================================

-- Add problem statement (from governance_requests)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS problem_statement TEXT;

COMMENT ON COLUMN initiatives.problem_statement IS 'System-level problem or opportunity being addressed (from intake form)';

-- Add desired outcomes (from governance_requests)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS desired_outcomes TEXT;

COMMENT ON COLUMN initiatives.desired_outcomes IS 'Specific system-wide outcomes expected (from intake form)';

-- Add governance metadata JSONB (stores governance-specific data)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS governance_metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN initiatives.governance_metadata IS 'Governance-specific metadata: division_region, submitter info, impact categories, groups impacted, regional impact, etc.';

-- =============================================================================
-- 2. ADD REQUEST_ID COLUMN TO INITIATIVES (for display in My Effort table)
-- =============================================================================

ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS request_id TEXT;

COMMENT ON COLUMN initiatives.request_id IS 'Governance request ID (GOV-YYYY-XXX) for display in effort tracking table';

-- Create index on request_id for performance
CREATE INDEX IF NOT EXISTS idx_initiatives_request_id ON initiatives(request_id);

-- =============================================================================
-- 3. UPDATE GOVERNANCE_REQUESTS STATUS CONSTRAINT
-- =============================================================================

-- Drop existing constraint
ALTER TABLE governance_requests DROP CONSTRAINT IF EXISTS valid_status;

-- Add new constraint with "Ready for Prioritization" status
ALTER TABLE governance_requests ADD CONSTRAINT valid_status CHECK (status IN (
  'Draft',
  'Ready for Review',
  'Needs Refinement',
  'Ready for Prioritization',  -- NEW STATUS
  'Ready for Governance',
  'Dismissed'
));

COMMENT ON CONSTRAINT valid_status ON governance_requests IS 'Valid governance workflow statuses including Ready for Prioritization';

-- =============================================================================
-- 4. REMOVE XXL FROM EFFORT_LOGS CONSTRAINT
-- =============================================================================

-- Drop existing constraint
ALTER TABLE effort_logs DROP CONSTRAINT IF EXISTS effort_logs_effort_size_check;

-- Add new constraint WITHOUT XXL (only XS, S, M, L, XL)
ALTER TABLE effort_logs ADD CONSTRAINT effort_logs_effort_size_check
CHECK (effort_size IN ('XS', 'S', 'M', 'L', 'XL'));

COMMENT ON CONSTRAINT effort_logs_effort_size_check ON effort_logs IS 'Valid effort sizes: XS, S, M, L, XL (XXL removed as of Oct 2025)';

-- =============================================================================
-- 5. UPDATE EXISTING INITIATIVES FROM LINKED GOVERNANCE REQUESTS
-- =============================================================================

-- Populate new fields from linked governance requests (for existing linked initiatives)
UPDATE initiatives i
SET
  problem_statement = gr.problem_statement,
  desired_outcomes = gr.desired_outcomes,
  request_id = gr.request_id,
  governance_metadata = jsonb_build_object(
    'division_region', gr.division_region,
    'submitter', jsonb_build_object(
      'name', gr.submitter_name,
      'email', gr.submitter_email
    ),
    'impact_categories', jsonb_build_object(
      'board_goal', COALESCE(gr.impact_commonspirit_board_goal, false),
      '2026_5for25', COALESCE(gr.impact_commonspirit_2026_5for25, false),
      'system_policy', COALESCE(gr.impact_system_policy, false),
      'patient_safety', COALESCE(gr.impact_patient_safety, false),
      'regulatory_compliance', COALESCE(gr.impact_regulatory_compliance, false),
      'financial', COALESCE(gr.impact_financial, false),
      'other', gr.impact_other
    ),
    'groups_impacted', jsonb_build_object(
      'nurses', COALESCE(gr.groups_nurses, false),
      'physicians_apps', COALESCE(gr.groups_physicians_apps, false),
      'therapies', COALESCE(gr.groups_therapies, false),
      'lab', COALESCE(gr.groups_lab, false),
      'pharmacy', COALESCE(gr.groups_pharmacy, false),
      'radiology', COALESCE(gr.groups_radiology, false),
      'administration', COALESCE(gr.groups_administration, false),
      'other', gr.groups_other
    ),
    'regions_impacted', gr.regions_impacted,
    'required_date', gr.required_date,
    'required_date_reason', gr.required_date_reason,
    'supporting_info', gr.supporting_information,
    'additional_comments', gr.additional_comments,
    'patient_care_value', gr.patient_care_value,
    'compliance_regulatory_value', gr.compliance_regulatory_value,
    'target_timeline', gr.target_timeline,
    'estimated_scope', gr.estimated_scope
  )
FROM governance_requests gr
WHERE i.governance_request_id = gr.id
  AND i.problem_statement IS NULL;  -- Only update if not already populated

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================

-- To rollback this migration, run:
--
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS problem_statement;
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS desired_outcomes;
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS governance_metadata;
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS request_id;
-- DROP INDEX IF EXISTS idx_initiatives_request_id;
--
-- ALTER TABLE governance_requests DROP CONSTRAINT IF EXISTS valid_status;
-- ALTER TABLE governance_requests ADD CONSTRAINT valid_status CHECK (status IN (
--   'Draft', 'Ready for Review', 'Needs Refinement', 'Ready for Governance', 'Dismissed'
-- ));
--
-- ALTER TABLE effort_logs DROP CONSTRAINT IF EXISTS effort_logs_effort_size_check;
-- ALTER TABLE effort_logs ADD CONSTRAINT effort_logs_effort_size_check
-- CHECK (effort_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL'));

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify new columns exist
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'initiatives'
--   AND column_name IN ('problem_statement', 'desired_outcomes', 'governance_metadata', 'request_id');

-- Verify populated data from governance requests
-- SELECT
--   i.initiative_name,
--   i.request_id,
--   i.problem_statement IS NOT NULL as has_problem_statement,
--   i.desired_outcomes IS NOT NULL as has_desired_outcomes,
--   i.governance_metadata != '{}'::jsonb as has_metadata
-- FROM initiatives i
-- WHERE i.governance_request_id IS NOT NULL;

-- Verify new governance status
-- SELECT DISTINCT status FROM governance_requests ORDER BY status;

-- Verify effort size constraint (should not allow XXL)
-- INSERT INTO effort_logs (initiative_id, team_member_id, week_start_date, hours_spent, effort_size)
-- VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '2025-01-01', 0, 'XXL');
-- (Should fail with constraint violation)
