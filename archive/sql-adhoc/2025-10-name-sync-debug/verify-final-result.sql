-- ============================================
-- Verify the final result
-- ============================================

-- Check all Marty records
SELECT 'All Marty Records' as info,
       owner_name,
       team_member_id,
       COUNT(*) as count
FROM initiatives
WHERE team_member_id = '1c48b25a-8d61-4087-9c19-2317cb0fc950'
GROUP BY owner_name, team_member_id;

-- Check for any remaining short "Marty" names
SELECT 'Any remaining "Marty" without last name?' as info,
       COUNT(*) as count
FROM initiatives
WHERE owner_name = 'Marty';

-- Verify trigger is working (enabled and correct)
SELECT tgname,
       CASE tgenabled
         WHEN 'O' THEN 'ENABLED ✓'
         WHEN 'D' THEN 'DISABLED ✗'
       END as status
FROM pg_trigger
WHERE tgname = 'trigger_update_initiative_completion';
