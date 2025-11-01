-- =====================================================
-- Migration: Create Field Labels Configuration
-- Created: 2025-10-31
-- Purpose: Create configurable field labels for forms
--          Allows organizations to customize terminology
-- =====================================================

BEGIN;

-- Create field_labels configuration table
CREATE TABLE IF NOT EXISTS field_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key TEXT NOT NULL UNIQUE,
  label_text TEXT NOT NULL,
  description TEXT,
  field_category TEXT NOT NULL, -- 'sponsor', 'impact_category', 'general'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE field_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to field_labels" ON field_labels
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to field_labels" ON field_labels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to field_labels" ON field_labels
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete access to field_labels" ON field_labels
  FOR DELETE USING (true);

-- Insert default sponsor field labels (configurable)
INSERT INTO field_labels (field_key, label_text, description, field_category, display_order) VALUES
  ('sponsor_name_label', 'Executive Sponsor Name', 'Label for executive sponsor name field', 'sponsor', 1),
  ('sponsor_title_label', 'Executive Sponsor Title', 'Label for executive sponsor title field', 'sponsor', 2),
  ('sponsor_section_heading', 'Executive Sponsor', 'Heading for sponsor section', 'sponsor', 0)
ON CONFLICT (field_key) DO NOTHING;

-- Insert default impact category labels (configurable)
INSERT INTO field_labels (field_key, label_text, description, field_category, display_order) VALUES
  ('impact_org_board_goal', 'Board Goal', 'Organization board goal impact category', 'impact_category', 1),
  ('impact_org_strategic_plan', 'Strategic Plan', 'Organization strategic plan impact category', 'impact_category', 2),
  ('impact_enterprise_policy', 'Enterprise Policy', 'Enterprise policy impact category', 'impact_category', 3),
  ('impact_patient_safety', 'Patient Safety', 'Patient safety impact category', 'impact_category', 4),
  ('impact_regulatory_compliance', 'Regulatory Compliance', 'Regulatory compliance impact category', 'impact_category', 5),
  ('impact_financial', 'Financial', 'Financial impact category', 'impact_category', 6)
ON CONFLICT (field_key) DO NOTHING;

-- Insert default groups impacted labels (configurable)
INSERT INTO field_labels (field_key, label_text, description, field_category, display_order) VALUES
  ('group_nurses', 'Nurses', 'Nurses/Nursing group', 'groups_impacted', 1),
  ('group_physicians_apps', 'Physicians/APPs', 'Physicians and Advanced Practice Providers', 'groups_impacted', 2),
  ('group_therapies', 'Therapies', 'Therapy services group', 'groups_impacted', 3),
  ('group_lab', 'Lab', 'Laboratory services group', 'groups_impacted', 4),
  ('group_pharmacy', 'Pharmacy', 'Pharmacy services group', 'groups_impacted', 5),
  ('group_radiology', 'Radiology', 'Radiology/Imaging services group', 'groups_impacted', 6),
  ('group_administration', 'Administration', 'Administrative group', 'groups_impacted', 7)
ON CONFLICT (field_key) DO NOTHING;

-- Insert default section headings
INSERT INTO field_labels (field_key, label_text, description, field_category, display_order) VALUES
  ('section_enterprise_need', 'Enterprise Need', 'Heading for enterprise need section', 'general', 1),
  ('section_request_details', 'Request Details', 'Heading for request details section', 'general', 2),
  ('section_groups_impacted', 'Groups Impacted', 'Heading for groups impacted section', 'general', 3)
ON CONFLICT (field_key) DO NOTHING;

-- Add comments
COMMENT ON TABLE field_labels IS 'Configurable field labels for organizational customization';
COMMENT ON COLUMN field_labels.field_key IS 'Unique key identifying the field (e.g., sponsor_name_label)';
COMMENT ON COLUMN field_labels.label_text IS 'Display text for the field label';
COMMENT ON COLUMN field_labels.field_category IS 'Category: sponsor, impact_category, groups_impacted, general';

COMMIT;

-- =====================================================
-- Verification Queries (run separately)
-- =====================================================
-- SELECT * FROM field_labels ORDER BY field_category, display_order;
