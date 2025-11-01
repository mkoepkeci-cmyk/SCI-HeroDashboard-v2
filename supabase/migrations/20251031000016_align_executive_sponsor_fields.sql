-- =====================================================
-- Migration: Align Executive Sponsor Fields
-- Created: 2025-10-31
-- Purpose: Add sponsor_name and sponsor_title to governance_requests
--          to match initiatives table structure
--          (initiatives has clinical_sponsor_name + clinical_sponsor_title)
-- =====================================================

BEGIN;

-- Add sponsor_name field if it doesn't exist
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS sponsor_name TEXT;

-- Add sponsor_title field if it doesn't exist
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS sponsor_title TEXT;

-- Add comments for fields
COMMENT ON COLUMN governance_requests.sponsor_name IS 'Executive sponsor full name';
COMMENT ON COLUMN governance_requests.sponsor_title IS 'Executive sponsor title/role (e.g., SVP Clinical Excellence, Chief Medical Officer)';

-- If system_clinical_leader exists, copy its data to sponsor_name then drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'governance_requests'
    AND column_name = 'system_clinical_leader'
  ) THEN
    -- Copy data from system_clinical_leader to sponsor_name
    UPDATE governance_requests
    SET sponsor_name = system_clinical_leader
    WHERE system_clinical_leader IS NOT NULL AND sponsor_name IS NULL;

    -- Drop the old column
    ALTER TABLE governance_requests DROP COLUMN system_clinical_leader;
  END IF;
END $$;

COMMIT;

-- =====================================================
-- Verification Queries (run separately to check results)
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'governance_requests' AND column_name IN ('sponsor_name', 'sponsor_title');
-- Expected: Both sponsor_name and sponsor_title exist
