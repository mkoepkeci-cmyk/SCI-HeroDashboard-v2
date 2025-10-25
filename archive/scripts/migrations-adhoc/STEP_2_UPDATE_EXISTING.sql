-- ═══════════════════════════════════════════════════════════
-- STEP 2: Update Existing 4 Initiatives with New Field Data
-- ═══════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor AFTER Step 1
-- This populates role, ehrs_impacted, service_line for existing initiatives
-- ═══════════════════════════════════════════════════════════

-- 1. Update Abridge AI Pilot (Completed)
-- CSV data: Primary, All EHRs, Ambulatory, Completed
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Abridge AI Pilot - Clinical Documentation Efficiency Analysis'
AND owner_name = 'Marty';

-- 2. Update HRS Integration - Remote Patient Monitoring (Active - Epic version)
-- CSV data: Primary, Epic, Ambulatory, Active, Go-Live 7/29/25
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'Epic',
    service_line = 'Ambulatory'
WHERE initiative_name = 'HRS Integration - Remote Patient Monitoring'
AND owner_name = 'Marty'
AND status = 'Active';

-- 3. Update Notable Health - RPM to API Migration
-- CSV data: Primary, Cerner, Ambulatory, Active
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'Cerner',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Notable Health - RPM to API Migration'
AND owner_name = 'Marty';

-- 4. Update SDOH Standardization
-- CSV data: Support role, All EHRs, Ambulatory, Active
UPDATE initiatives
SET role = 'Support',
    ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name LIKE 'Social Determinants of Health%'
AND owner_name = 'Marty';

-- Verify all updates worked
SELECT
    initiative_name,
    status,
    role,
    ehrs_impacted,
    service_line
FROM initiatives
WHERE owner_name = 'Marty'
ORDER BY status DESC, initiative_name;

-- Expected result: 4 rows, all with role, ehrs_impacted, and service_line populated
