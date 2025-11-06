-- Migration: Add Work Assignment Fields to Governance Requests
-- Date: November 6, 2025
-- Purpose: Add missing work_effort, work_phase, work_type, and assigned_role columns to governance_requests table
-- Issue: GovernanceRequestDetail component was referencing these fields but they didn't exist in the database

-- =============================================================================
-- ADD MISSING COLUMNS TO governance_requests
-- =============================================================================

-- Add work_effort (estimated weekly effort for governance prep)
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS work_effort TEXT;

COMMENT ON COLUMN governance_requests.work_effort IS 'Estimated weekly effort size for SCI governance prep work (XS, S, M, L, XL)';

-- Add work_phase (current phase of governance prep work)
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS work_phase TEXT;

COMMENT ON COLUMN governance_requests.work_phase IS 'Current phase of governance prep work (Discovery/Define, Design, Build, etc.)';

-- Add work_type (type of work for the assigned SCI)
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS work_type TEXT;

COMMENT ON COLUMN governance_requests.work_type IS 'Type of work for assigned SCI (typically "Governance" for governance prep)';

-- Add assigned_role (role of the assigned SCI)
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS assigned_role TEXT;

COMMENT ON COLUMN governance_requests.assigned_role IS 'Role of assigned SCI (Owner, Co-Owner, Secondary, Support)';

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for queries filtering by work_effort
CREATE INDEX IF NOT EXISTS idx_governance_requests_work_effort
ON governance_requests(work_effort)
WHERE work_effort IS NOT NULL;

-- Index for queries filtering by assigned_sci_id and work_effort (for capacity queries)
CREATE INDEX IF NOT EXISTS idx_governance_requests_sci_effort
ON governance_requests(assigned_sci_id, work_effort)
WHERE assigned_sci_id IS NOT NULL AND work_effort IS NOT NULL;

-- =============================================================================
-- CONSTRAINTS (Optional - add if needed)
-- =============================================================================

-- Note: No strict constraints added initially to allow flexibility.
-- If you want to enforce valid values, uncomment and run:
--
-- ALTER TABLE governance_requests ADD CONSTRAINT valid_work_effort
-- CHECK (work_effort IS NULL OR work_effort IN ('XS', 'S', 'M', 'L', 'XL'));
--
-- ALTER TABLE governance_requests ADD CONSTRAINT valid_assigned_role
-- CHECK (assigned_role IS NULL OR assigned_role IN ('Owner', 'Co-Owner', 'Secondary', 'Support'));

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify new columns exist
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'governance_requests'
--   AND column_name IN ('work_effort', 'work_phase', 'work_type', 'assigned_role')
-- ORDER BY column_name;

-- Verify indexes created
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'governance_requests'
--   AND indexname LIKE '%work%'
-- ORDER BY indexname;

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================

-- To rollback this migration, run:
--
-- DROP INDEX IF EXISTS idx_governance_requests_work_effort;
-- DROP INDEX IF EXISTS idx_governance_requests_sci_effort;
-- ALTER TABLE governance_requests DROP COLUMN IF EXISTS work_effort;
-- ALTER TABLE governance_requests DROP COLUMN IF EXISTS work_phase;
-- ALTER TABLE governance_requests DROP COLUMN IF EXISTS work_type;
-- ALTER TABLE governance_requests DROP COLUMN IF EXISTS assigned_role;
