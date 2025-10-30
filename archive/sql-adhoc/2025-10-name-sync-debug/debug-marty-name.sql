-- ============================================
-- Debug: Find Marty's records across all tables
-- ============================================

-- Check team_members table - what is the authoritative name?
SELECT 'Team Members Table' as source, id, name, role
FROM team_members
WHERE name ILIKE '%marty%';

-- Check initiatives table - what names exist?
SELECT 'Initiatives Table' as source,
       owner_name,
       team_member_id,
       COUNT(*) as count
FROM initiatives
WHERE owner_name ILIKE '%marty%'
GROUP BY owner_name, team_member_id;

-- Check for Marty's team_member_id
SELECT 'Finding Marty Team Member ID' as info,
       tm.id as team_member_id,
       tm.name as team_member_name,
       COUNT(i.id) as initiative_count
FROM team_members tm
LEFT JOIN initiatives i ON i.team_member_id = tm.id
WHERE tm.name ILIKE '%marty%'
GROUP BY tm.id, tm.name;

-- Check if there's a mismatch
SELECT 'Mismatch Check' as info,
       i.owner_name as initiative_owner_name,
       tm.name as team_member_name,
       i.team_member_id,
       COUNT(*) as count
FROM initiatives i
LEFT JOIN team_members tm ON i.team_member_id = tm.id
WHERE i.owner_name ILIKE '%marty%'
GROUP BY i.owner_name, tm.name, i.team_member_id;
