-- PHASE 2: Safe Duplicate Detection
-- Excludes governance-created initiatives and recent manual additions

-- Step 1: Find exact duplicates between assignments and initiatives
-- EXCLUDES initiatives with governance_request_id (GOV-2025-XXX items)
SELECT
  tm.name as team_member,
  a.assignment_name,
  a.work_type as assign_work_type,
  i.initiative_name,
  i.type as init_work_type,
  i.governance_request_id,
  i.created_at,
  a.id as assignment_id,
  i.id as initiative_id,
  'EXACT DUPLICATE - SKIP MIGRATION' as match_type
FROM assignments a
INNER JOIN initiatives i
  ON LOWER(TRIM(a.assignment_name)) = LOWER(TRIM(i.initiative_name))
  AND a.team_member_id = i.team_member_id
INNER JOIN team_members tm ON a.team_member_id = tm.id
WHERE i.status != 'Deleted'
  AND i.governance_request_id IS NULL  -- Exclude governance items
ORDER BY tm.name, a.assignment_name;

-- Step 2: Find Lisa Townsend's UNIQUE assignments (safe to migrate)
SELECT
  a.assignment_name,
  a.work_type,
  a.status,
  a.work_effort,
  a.id as assignment_id,
  'UNIQUE - SAFE TO MIGRATE' as migration_status
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND NOT EXISTS (
    SELECT 1 FROM initiatives i
    WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
      AND i.team_member_id = a.team_member_id
      AND i.status != 'Deleted'
  )
ORDER BY a.assignment_name;

-- Step 3: Count summary for Lisa
SELECT
  'Lisa Townsend' as team_member,
  (SELECT COUNT(*) FROM assignments WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')) as total_assignments,
  (SELECT COUNT(*) FROM initiatives WHERE owner_name = 'Lisa Townsend' AND status != 'Deleted') as total_initiatives,
  (SELECT COUNT(*) FROM initiatives WHERE owner_name = 'Lisa Townsend' AND status != 'Deleted' AND governance_request_id IS NOT NULL) as governance_initiatives,
  (SELECT COUNT(*)
   FROM assignments a
   WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
     AND EXISTS (
       SELECT 1 FROM initiatives i
       WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
         AND i.team_member_id = a.team_member_id
         AND i.status != 'Deleted'
     )
  ) as duplicate_assignments,
  (SELECT COUNT(*)
   FROM assignments a
   WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
     AND NOT EXISTS (
       SELECT 1 FROM initiatives i
       WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
         AND i.team_member_id = a.team_member_id
         AND i.status != 'Deleted'
     )
  ) as unique_assignments_to_migrate;

-- Step 4: Verify Marty's governance items are protected
SELECT
  request_id,
  initiative_name,
  owner_name,
  status,
  created_at
FROM initiatives
WHERE governance_request_id IS NOT NULL
  AND owner_name = 'Marty Koepke'
ORDER BY created_at DESC;

-- Step 5: Check for recent manual additions (last 7 days) - DO NOT MIGRATE THESE
SELECT
  initiative_name,
  owner_name,
  type,
  created_at,
  last_updated_by,
  'RECENT MANUAL - DO NOT MIGRATE' as protection_status
FROM initiatives
WHERE status != 'Deleted'
  AND governance_request_id IS NULL
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
