-- STEP 2: Migrate Lisa's 2 Unique Assignments to Initiatives Table
-- Only migrates items NOT already in initiatives (ALM to SPM, DH Nursing)

INSERT INTO initiatives (
  owner_name,
  initiative_name,
  type,
  status,
  phase,
  work_effort,
  role,
  team_member_id,
  is_draft,
  is_active,
  completion_percentage,
  created_at,
  updated_at,
  last_updated_by
)
SELECT
  'Lisa Townsend' as owner_name,
  a.assignment_name as initiative_name,
  a.work_type as type,
  a.status,
  a.phase,
  a.work_effort,
  COALESCE(a.role_type, 'Owner') as role,
  a.team_member_id,
  false as is_draft,
  true as is_active,
  CASE
    WHEN a.status = 'Complete' THEN 100
    WHEN a.status = 'Completed' THEN 100
    ELSE 14
  END as completion_percentage,
  a.created_at,
  NOW() as updated_at,
  'MIGRATION_LISA_UNIQUE_ASSIGNMENTS' as last_updated_by
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend')
  AND NOT EXISTS (
    SELECT 1 FROM initiatives i
    WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
      AND i.team_member_id = a.team_member_id
      AND i.status != 'Deleted'
  );

-- Verify insertion
SELECT
  initiative_name,
  type,
  status,
  work_effort,
  completion_percentage,
  last_updated_by
FROM initiatives
WHERE last_updated_by = 'MIGRATION_LISA_UNIQUE_ASSIGNMENTS'
ORDER BY initiative_name;
