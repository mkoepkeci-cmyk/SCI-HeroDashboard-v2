-- ============================================
-- Direct update: Change "Marty" to "Marty Koepke" in initiatives
-- ============================================

-- Show BEFORE state
SELECT 'BEFORE UPDATE' as info,
       owner_name,
       COUNT(*) as count
FROM initiatives
WHERE owner_name ILIKE '%marty%'
GROUP BY owner_name;

-- Update all "Marty" records to "Marty Koepke"
UPDATE initiatives
SET owner_name = 'Marty Koepke',
    updated_at = NOW()
WHERE owner_name = 'Marty'
  AND team_member_id = '1c48b25a-8d61-4087-9c19-2317cb0fc950';

-- Show AFTER state
SELECT 'AFTER UPDATE' as info,
       owner_name,
       COUNT(*) as count
FROM initiatives
WHERE owner_name ILIKE '%marty%'
GROUP BY owner_name;

-- Verify all Marty records now show full name
SELECT 'VERIFICATION - Should only show Marty Koepke' as info,
       owner_name,
       team_member_id,
       COUNT(*) as count
FROM initiatives
WHERE team_member_id = '1c48b25a-8d61-4087-9c19-2317cb0fc950'
GROUP BY owner_name, team_member_id;
