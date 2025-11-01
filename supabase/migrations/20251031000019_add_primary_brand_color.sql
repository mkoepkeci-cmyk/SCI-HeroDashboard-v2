-- =====================================================
-- Migration: Add Primary Brand Color Configuration
-- Created: 2025-10-31
-- Purpose: Add configurable primary brand color to
--          application_config for theming
-- =====================================================

BEGIN;

-- Insert primary brand color configuration
INSERT INTO application_config (
  key,
  value,
  category,
  label,
  description,
  value_type,
  default_value,
  is_editable,
  display_order
)
VALUES (
  'primary_brand_color',
  '#9B2F6A',
  'branding',
  'Primary Brand Color',
  'Main color used for buttons, headers, navigation tabs, and hero cards throughout the application',
  'color',
  '#9B2F6A',
  true,
  5
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  description = EXCLUDED.description;

COMMIT;

-- =====================================================
-- Verification Query (run separately)
-- =====================================================
-- SELECT * FROM application_config WHERE key = 'primary_brand_color';
