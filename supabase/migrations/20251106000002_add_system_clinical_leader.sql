-- Migration: Add system_clinical_leader column to governance_requests
-- Date: November 6, 2025
-- Purpose: Replace sponsor_name with system_clinical_leader to match field naming convention

-- Add system_clinical_leader column
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS system_clinical_leader TEXT;

COMMENT ON COLUMN governance_requests.system_clinical_leader IS 'Name and title of the system clinical leader sponsoring this request (e.g., Dr. Sarah Johnson, SVP Clinical Excellence)';

-- Copy existing sponsor_name data to system_clinical_leader (if sponsor_name exists)
-- This ensures no data loss during the field name transition
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'governance_requests'
        AND column_name = 'sponsor_name'
    ) THEN
        UPDATE governance_requests
        SET system_clinical_leader = sponsor_name
        WHERE sponsor_name IS NOT NULL AND system_clinical_leader IS NULL;
    END IF;
END $$;

-- Verification query (uncomment to test)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'governance_requests'
--   AND column_name = 'system_clinical_leader';
