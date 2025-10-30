-- ============================================
-- Verify name synchronization results
-- ============================================

-- Show all unique owner names in initiatives
SELECT 'All Initiative Owners' as info, owner_name, COUNT(*) as count
FROM initiatives
WHERE owner_name IS NOT NULL
GROUP BY owner_name
ORDER BY owner_name;

-- Show all team member names
SELECT 'All Team Members' as info, name, email
FROM team_members
ORDER BY name;

-- Check for any remaining mismatches
SELECT 'Any Remaining Mismatches?' as info,
       i.owner_name as initiative_name,
       tm.name as team_member_name,
       COUNT(*) as count
FROM initiatives i
JOIN team_members tm ON i.team_member_id = tm.id
WHERE i.owner_name != tm.name
GROUP BY i.owner_name, tm.name;
