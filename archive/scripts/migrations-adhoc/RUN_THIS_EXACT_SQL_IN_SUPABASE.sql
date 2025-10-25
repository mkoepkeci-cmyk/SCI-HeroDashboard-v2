-- ═══════════════════════════════════════════════════════════════════════════════
-- COPY ALL OF THIS AND RUN IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════════════════════════
-- URL: https://fiyaolxiarzkihlbhtmz.supabase.co
-- Go to: SQL Editor → New query → Paste this entire file → Click RUN
-- ═══════════════════════════════════════════════════════════════════════════════

-- STEP 1: Add the three new columns
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS ehrs_impacted TEXT;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS service_line TEXT;

-- STEP 2: Update existing 5 initiatives with new field data from CSV
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Abridge AI Pilot (Completed)
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Abridge AI Pilot - Clinical Documentation Efficiency Analysis';

-- 2. HRS Integration - Remote Patient Monitoring (Active - Epic)
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'Epic',
    service_line = 'Ambulatory'
WHERE initiative_name = 'HRS Integration - Remote Patient Monitoring';

-- 3. Notable Health - RPM to API Migration
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'Cerner',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Notable Health - RPM to API Migration';

-- 4. SDOH Standardization
UPDATE initiatives
SET role = 'Support',
    ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name LIKE 'Social Determinants of Health%';

-- 5. Clinical Informatics Website
UPDATE initiatives
SET role = 'Support',
    ehrs_impacted = 'All',
    service_line = 'Other'
WHERE initiative_name = 'Clinical Informatics Enterprise Website';

-- VERIFICATION: Check that everything worked
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT
    initiative_name,
    owner_name,
    status,
    role,
    ehrs_impacted,
    service_line
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Marty')
ORDER BY status DESC, initiative_name;

-- Expected result: 5 rows, all with role, ehrs_impacted, and service_line populated
-- ═══════════════════════════════════════════════════════════════════════════════
