-- Migration: Add Tab 3 Fields to Initiatives
-- Date: October 29, 2025
-- Purpose: Add fields for Tab 3 of UnifiedWorkItemForm (Proposed Solution & EHR Impact)
-- Impact: Enables tracking of proposed solutions, voting statements, EHR areas, and journal entries

-- =============================================================================
-- 1. ADD TAB 3 FIELDS TO INITIATIVES TABLE
-- =============================================================================

-- Add proposed_solution field
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS proposed_solution TEXT;

COMMENT ON COLUMN initiatives.proposed_solution IS 'Proposed solution for governance review (Tab 3)';

-- Add voting_statement field
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS voting_statement TEXT;

COMMENT ON COLUMN initiatives.voting_statement IS 'Voting statement for governance committee (Tab 3)';

-- Add ehr_areas_impacted field
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS ehr_areas_impacted TEXT[];

COMMENT ON COLUMN initiatives.ehr_areas_impacted IS 'Array of EHR areas/modules impacted by this initiative (Tab 3)';

-- Add journal_log field (JSONB array of timestamped entries)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS journal_log JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN initiatives.journal_log IS 'Timestamped journal entries for tracking decisions, meetings, and updates (Tab 3). Structure: [{timestamp, author, author_id, entry}]';

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================

-- To rollback this migration, run:
--
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS proposed_solution;
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS voting_statement;
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS ehr_areas_impacted;
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS journal_log;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify new columns exist
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'initiatives'
--   AND column_name IN ('proposed_solution', 'voting_statement', 'ehr_areas_impacted', 'journal_log');

-- Verify journal_log default value
-- SELECT initiative_name, journal_log
-- FROM initiatives
-- LIMIT 5;
