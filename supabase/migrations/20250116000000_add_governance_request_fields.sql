/*
  # Add Additional Fields to Governance Requests

  ## Overview
  Adds comprehensive intake fields to governance_requests table to capture
  impact categories, groups affected, regional scope, required dates, and comments.

  ## New Fields

  ### Category of Impact (JSONB array for checkbox support)
  - commonspirit_board_goal (boolean)
  - commonspirit_2026_5for25 (boolean)
  - system_policy (boolean)
  - patient_safety (boolean)
  - regulatory_compliance (boolean)
  - financial (boolean)
  - other_impact (text) - Free text for "Other:" option

  ### Supporting Information
  - supporting_information (text) - Regulatory, policy, practice guidelines

  ### Groups Impacted (JSONB array for checkbox support)
  - groups_nurses (boolean)
  - groups_physicians_apps (boolean)
  - groups_therapies (boolean)
  - groups_lab (boolean)
  - groups_pharmacy (boolean)
  - groups_radiology (boolean)
  - groups_administration (boolean)
  - other_groups (text) - Free text for "Other:" option

  ### Regional Impact
  - regions_impacted (text) - All regions or specific list

  ### Timeline
  - required_date (date) - Required date for problem resolution
  - required_date_reason (text) - Reason (regulation effective, policy effective, etc.)

  ### Additional Comments
  - additional_comments (text) - Any additional information

  ## Updates to Impact Metrics Storage
  Already stored as JSONB in `impact_metrics` field - no changes needed
*/

-- ==============================================
-- Add New Columns to governance_requests
-- ==============================================

-- Impact Categories (checkboxes)
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS impact_commonspirit_board_goal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_commonspirit_2026_5for25 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_system_policy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_patient_safety BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_regulatory_compliance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_financial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impact_other TEXT;

-- Supporting Information
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS supporting_information TEXT;

-- Groups Impacted (checkboxes)
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS groups_nurses BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_physicians_apps BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_therapies BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_lab BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_pharmacy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_radiology BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_administration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_other TEXT;

-- Regional Impact
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS regions_impacted TEXT;

-- Required Date
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS required_date DATE,
ADD COLUMN IF NOT EXISTS required_date_reason TEXT;

-- Additional Comments
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS additional_comments TEXT;

-- ==============================================
-- Comments
-- ==============================================
COMMENT ON COLUMN governance_requests.impact_commonspirit_board_goal IS
  'Impact category: CommonSpirit Board Goal';

COMMENT ON COLUMN governance_requests.impact_commonspirit_2026_5for25 IS
  'Impact category: CommonSpirit 2026 or 5 for 25';

COMMENT ON COLUMN governance_requests.impact_system_policy IS
  'Impact category: System Policy';

COMMENT ON COLUMN governance_requests.impact_patient_safety IS
  'Impact category: Patient Safety';

COMMENT ON COLUMN governance_requests.impact_regulatory_compliance IS
  'Impact category: Regulatory Compliance';

COMMENT ON COLUMN governance_requests.impact_financial IS
  'Impact category: Financial';

COMMENT ON COLUMN governance_requests.impact_other IS
  'Impact category: Other (free text)';

COMMENT ON COLUMN governance_requests.supporting_information IS
  'Regulatory, policy, practice guidelines, etc. that support the request and selected categories';

COMMENT ON COLUMN governance_requests.groups_nurses IS
  'Impacted group: Nurses';

COMMENT ON COLUMN governance_requests.groups_physicians_apps IS
  'Impacted group: Physicians/APPs';

COMMENT ON COLUMN governance_requests.groups_therapies IS
  'Impacted group: Therapies';

COMMENT ON COLUMN governance_requests.groups_lab IS
  'Impacted group: Lab';

COMMENT ON COLUMN governance_requests.groups_pharmacy IS
  'Impacted group: Pharmacy';

COMMENT ON COLUMN governance_requests.groups_radiology IS
  'Impacted group: Radiology';

COMMENT ON COLUMN governance_requests.groups_administration IS
  'Impacted group: Administration';

COMMENT ON COLUMN governance_requests.groups_other IS
  'Impacted group: Other (free text)';

COMMENT ON COLUMN governance_requests.regions_impacted IS
  'What regions are impacted by this change (All regions or specific list)';

COMMENT ON COLUMN governance_requests.required_date IS
  'Required date for problem resolution (regulation effective date, policy effective date, etc.)';

COMMENT ON COLUMN governance_requests.required_date_reason IS
  'Reason for required date (e.g., regulation effective date, policy effective date, survey action plan)';

COMMENT ON COLUMN governance_requests.additional_comments IS
  'Additional comments and information about the governance request';
