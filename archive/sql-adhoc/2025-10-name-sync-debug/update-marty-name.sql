-- ============================================
-- Update "Marty" to "Marty Koepke" across all tables
-- ============================================

-- Step 1: Show current state BEFORE updates
SELECT 'BEFORE UPDATE - Initiatives' as info, owner_name, COUNT(*) as count
FROM initiatives
WHERE owner_name LIKE '%Marty%'
GROUP BY owner_name
UNION ALL
SELECT 'BEFORE UPDATE - Team Members' as info, name, COUNT(*) as count
FROM team_members
WHERE name LIKE '%Marty%'
GROUP BY name
UNION ALL
SELECT 'BEFORE UPDATE - Governance Requests' as info, assigned_sci_name, COUNT(*) as count
FROM governance_requests
WHERE assigned_sci_name LIKE '%Marty%'
GROUP BY assigned_sci_name;

-- Step 2: Update initiatives table
UPDATE initiatives
SET owner_name = 'Marty Koepke',
    updated_at = NOW()
WHERE owner_name = 'Marty';

-- Step 3: Update team_members table
UPDATE team_members
SET name = 'Marty Koepke'
WHERE name = 'Marty';

-- Step 4: Update governance_requests table
UPDATE governance_requests
SET assigned_sci_name = 'Marty Koepke',
    updated_at = NOW()
WHERE assigned_sci_name = 'Marty';

-- Step 5: Show results AFTER updates
SELECT 'AFTER UPDATE - Summary' as info,
       'Initiatives' as table_name,
       COUNT(*) as records_with_full_name
FROM initiatives
WHERE owner_name = 'Marty Koepke'
UNION ALL
SELECT 'AFTER UPDATE - Summary' as info,
       'Team Members' as table_name,
       COUNT(*) as records_with_full_name
FROM team_members
WHERE name = 'Marty Koepke'
UNION ALL
SELECT 'AFTER UPDATE - Summary' as info,
       'Governance Requests' as table_name,
       COUNT(*) as records_with_full_name
FROM governance_requests
WHERE assigned_sci_name = 'Marty Koepke';

-- Step 6: Verify no "Marty" (without last name) remains
SELECT 'VERIFICATION - Should be ZERO' as info,
       COUNT(*) as remaining_short_names
FROM (
  SELECT owner_name as name FROM initiatives WHERE owner_name = 'Marty'
  UNION ALL
  SELECT name FROM team_members WHERE name = 'Marty'
  UNION ALL
  SELECT assigned_sci_name as name FROM governance_requests WHERE assigned_sci_name = 'Marty'
) as all_names;
