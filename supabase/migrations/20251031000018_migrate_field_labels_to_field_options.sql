-- =====================================================
-- Migration: Add Groups Impacted and Impact Categories
-- Created: 2025-10-31
-- Purpose: Add groups_impacted and impact_categories
--          field types to field_options table
-- =====================================================

BEGIN;

-- First, drop the existing check constraint
ALTER TABLE field_options DROP CONSTRAINT IF EXISTS field_options_field_type_check;

-- Recreate the check constraint with the new field types
ALTER TABLE field_options ADD CONSTRAINT field_options_field_type_check
  CHECK (field_type IN (
    'work_type',
    'role',
    'phase',
    'work_effort',
    'service_line',
    'ehr_platform',
    'status',
    'team_role',
    'groups_impacted',
    'impact_categories'
  ));

-- Insert groups_impacted options
INSERT INTO field_options (field_type, key, label, description, display_order, is_active, affects_capacity_calc) VALUES
  ('groups_impacted', 'group_nurses', 'Nurses', 'Nurses/Nursing group', 1, true, false),
  ('groups_impacted', 'group_physicians_apps', 'Physicians/APPs', 'Physicians and Advanced Practice Providers', 2, true, false),
  ('groups_impacted', 'group_therapies', 'Therapies', 'Therapy services group', 3, true, false),
  ('groups_impacted', 'group_lab', 'Lab', 'Laboratory services group', 4, true, false),
  ('groups_impacted', 'group_pharmacy', 'Pharmacy', 'Pharmacy services group', 5, true, false),
  ('groups_impacted', 'group_radiology', 'Radiology', 'Radiology/Imaging services group', 6, true, false),
  ('groups_impacted', 'group_administration', 'Administration', 'Administrative group', 7, true, false)
ON CONFLICT (field_type, key) DO NOTHING;

-- Insert impact_categories options
INSERT INTO field_options (field_type, key, label, description, display_order, is_active, affects_capacity_calc) VALUES
  ('impact_categories', 'impact_org_board_goal', 'Board Goal', 'Organization board goal impact category', 1, true, false),
  ('impact_categories', 'impact_org_strategic_plan', 'Strategic Plan', 'Organization strategic plan impact category', 2, true, false),
  ('impact_categories', 'impact_enterprise_policy', 'Enterprise Policy', 'Enterprise policy impact category', 3, true, false),
  ('impact_categories', 'impact_patient_safety', 'Patient Safety', 'Patient safety impact category', 4, true, false),
  ('impact_categories', 'impact_regulatory_compliance', 'Regulatory Compliance', 'Regulatory compliance impact category', 5, true, false),
  ('impact_categories', 'impact_financial', 'Financial', 'Financial impact category', 6, true, false)
ON CONFLICT (field_type, key) DO NOTHING;

-- Drop the field_labels table if it exists (cleanup from previous migration)
DROP TABLE IF EXISTS field_labels CASCADE;

-- Add comment
COMMENT ON COLUMN field_options.field_type IS 'Field type: work_type, role, phase, work_effort, service_line, ehr_platform, status, team_role, groups_impacted, impact_categories';

COMMIT;

-- =====================================================
-- Verification Queries (run separately)
-- =====================================================
-- SELECT field_type, key, label FROM field_options WHERE field_type IN ('groups_impacted', 'impact_categories') ORDER BY field_type, display_order;
