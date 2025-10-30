-- Migration: Add comprehensive governance request fields to initiatives table
-- Purpose: Enable complete data flow from governance requests to initiatives
-- Date: January 30, 2025
-- Fixes: 76% data loss issue where governance form data wasn't reaching initiatives

-- Add value proposition fields
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS patient_care_value TEXT,
ADD COLUMN IF NOT EXISTS compliance_regulatory_value TEXT,
ADD COLUMN IF NOT EXISTS estimated_scope TEXT;

-- Add basic information fields
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS division_region TEXT,
ADD COLUMN IF NOT EXISTS submitter_name TEXT,
ADD COLUMN IF NOT EXISTS submitter_email TEXT;

-- Add impact category fields (strategic alignment)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS impact_commonspirit_board_goal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_commonspirit_2026_5for25 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_system_policy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_patient_safety BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_regulatory_compliance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_financial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_other TEXT;

-- Add supporting information
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS supporting_information TEXT;

-- Add groups impacted fields (stakeholder tracking)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS groups_nurses BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_physicians_apps BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_therapies BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_lab BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_pharmacy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_radiology BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_administration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_other TEXT;

-- Add regional impact fields
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS regions_impacted TEXT,
ADD COLUMN IF NOT EXISTS required_date DATE,
ADD COLUMN IF NOT EXISTS required_date_reason TEXT,
ADD COLUMN IF NOT EXISTS additional_comments TEXT;

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_initiatives_impact_board_goal
ON initiatives(impact_commonspirit_board_goal) WHERE impact_commonspirit_board_goal = true;

CREATE INDEX IF NOT EXISTS idx_initiatives_impact_2026_5for25
ON initiatives(impact_commonspirit_2026_5for25) WHERE impact_commonspirit_2026_5for25 = true;

CREATE INDEX IF NOT EXISTS idx_initiatives_impact_patient_safety
ON initiatives(impact_patient_safety) WHERE impact_patient_safety = true;

CREATE INDEX IF NOT EXISTS idx_initiatives_division_region
ON initiatives(division_region) WHERE division_region IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_initiatives_required_date
ON initiatives(required_date) WHERE required_date IS NOT NULL;

-- Add comment documenting the migration
COMMENT ON COLUMN initiatives.patient_care_value IS 'How this initiative improves patient care across the system';
COMMENT ON COLUMN initiatives.compliance_regulatory_value IS 'System-wide regulatory requirements and compliance benefits';
COMMENT ON COLUMN initiatives.estimated_scope IS 'Resources, timeline, and complexity at system scale';
COMMENT ON COLUMN initiatives.impact_commonspirit_board_goal IS 'Initiative aligns with CommonSpirit Board goals';
COMMENT ON COLUMN initiatives.impact_commonspirit_2026_5for25 IS 'Initiative supports CommonSpirit 2026 or 5 for 25 strategy';
COMMENT ON COLUMN initiatives.supporting_information IS 'Regulatory, policy, or practice guidelines supporting the initiative';
COMMENT ON COLUMN initiatives.regions_impacted IS 'Which regions are affected (South, Mountain, Northwest, California, Central)';
COMMENT ON COLUMN initiatives.required_date IS 'Required completion date for regulation/policy compliance';
COMMENT ON COLUMN initiatives.required_date_reason IS 'Reason for required date (e.g., CMS regulation effective date)';

-- Verification query (run after migration to confirm)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'initiatives'
-- AND column_name IN (
--   'patient_care_value', 'compliance_regulatory_value', 'estimated_scope',
--   'division_region', 'submitter_name', 'submitter_email',
--   'impact_commonspirit_board_goal', 'impact_commonspirit_2026_5for25',
--   'impact_system_policy', 'impact_patient_safety', 'impact_regulatory_compliance',
--   'impact_financial', 'impact_other', 'supporting_information',
--   'groups_nurses', 'groups_physicians_apps', 'groups_therapies', 'groups_lab',
--   'groups_pharmacy', 'groups_radiology', 'groups_administration', 'groups_other',
--   'regions_impacted', 'required_date', 'required_date_reason', 'additional_comments'
-- )
-- ORDER BY ordinal_position;
