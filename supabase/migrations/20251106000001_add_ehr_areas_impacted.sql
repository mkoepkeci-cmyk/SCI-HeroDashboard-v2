-- Migration: Add EHR Areas Impacted to Initiatives
-- Date: November 6, 2025
-- Purpose: Add missing ehr_areas_impacted column for Tab 3 (Proposed Solution) in unified form
-- Issue: UnifiedWorkItemForm Tab 3 references this field but it doesn't exist in database

-- =============================================================================
-- ADD EHR_AREAS_IMPACTED COLUMN TO INITIATIVES TABLE
-- =============================================================================

-- Add ehr_areas_impacted as a text array
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS ehr_areas_impacted TEXT[];

COMMENT ON COLUMN initiatives.ehr_areas_impacted IS 'Array of EHR areas/modules impacted by this initiative (e.g., Orders, Medications, Documentation, etc.)';

-- =============================================================================
-- CREATE INDEX FOR PERFORMANCE
-- =============================================================================

-- Index for queries filtering by EHR areas
CREATE INDEX IF NOT EXISTS idx_initiatives_ehr_areas
ON initiatives USING GIN (ehr_areas_impacted)
WHERE ehr_areas_impacted IS NOT NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify column exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'initiatives'
--   AND column_name = 'ehr_areas_impacted';

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================

-- To rollback this migration, run:
--
-- DROP INDEX IF EXISTS idx_initiatives_ehr_areas;
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS ehr_areas_impacted;
