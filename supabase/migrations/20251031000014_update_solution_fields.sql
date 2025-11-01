-- =====================================================
-- Migration: Update Solution Fields
-- Created: 2025-10-31
-- Purpose: Add decision field for governance decisions
--          and remove ehr_areas_impacted field
-- =====================================================

BEGIN;

-- Add decision field to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS decision TEXT;

-- Add comment for decision field
COMMENT ON COLUMN initiatives.decision IS 'Governance decision: Approved, Denied, Sent Back, Dismissed';

-- Drop ehr_areas_impacted column (no longer needed)
ALTER TABLE initiatives
DROP COLUMN IF EXISTS ehr_areas_impacted;

COMMIT;

-- =====================================================
-- Verification Queries (run separately to check results)
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'initiatives' AND column_name IN ('decision', 'ehr_areas_impacted');
-- Expected: decision exists, ehr_areas_impacted does not exist
