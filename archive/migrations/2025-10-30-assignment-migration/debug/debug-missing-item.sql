-- DEBUG: Find the missing item (57 migrated instead of 58)

-- Check 1: Batch breakdown (which batch is short?)
SELECT
  'Batch Counts' as check_name,
  last_updated_by,
  COUNT(*) as actual,
  CASE last_updated_by
    WHEN 'MIGRATION_BATCH1_LOW_PRIORITY' THEN 15
    WHEN 'MIGRATION_BATCH2A_MATT_STUART' THEN 9
    WHEN 'MIGRATION_BATCH2B_MARTY_KOEPKE' THEN 8
    WHEN 'MIGRATION_BATCH3_JOSH_GREENWOOD' THEN 26
  END as expected,
  COUNT(*) - CASE last_updated_by
    WHEN 'MIGRATION_BATCH1_LOW_PRIORITY' THEN 15
    WHEN 'MIGRATION_BATCH2A_MATT_STUART' THEN 9
    WHEN 'MIGRATION_BATCH2B_MARTY_KOEPKE' THEN 8
    WHEN 'MIGRATION_BATCH3_JOSH_GREENWOOD' THEN 26
  END as difference
FROM initiatives
WHERE last_updated_by IN (
  'MIGRATION_BATCH1_LOW_PRIORITY',
  'MIGRATION_BATCH2A_MATT_STUART',
  'MIGRATION_BATCH2B_MARTY_KOEPKE',
  'MIGRATION_BATCH3_JOSH_GREENWOOD'
)
GROUP BY last_updated_by
ORDER BY last_updated_by;

-- Check 2: SCI breakdown (which SCI is short?)
SELECT
  'SCI Counts' as check_name,
  owner_name,
  COUNT(*) as actual,
  CASE owner_name
    WHEN 'Sherry Brennaman' THEN 5
    WHEN 'Ashley Daily' THEN 2
    WHEN 'Jason Mihos' THEN 2
    WHEN 'Melissa Plummer' THEN 2
    WHEN 'Yvette Kirk' THEN 2
    WHEN 'Dawn Jacobson' THEN 1
    WHEN 'Matt Stuart' THEN 9
    WHEN 'Marty Koepke' THEN 8
    WHEN 'Josh Greenwood' THEN 26
  END as expected,
  COUNT(*) - CASE owner_name
    WHEN 'Sherry Brennaman' THEN 5
    WHEN 'Ashley Daily' THEN 2
    WHEN 'Jason Mihos' THEN 2
    WHEN 'Melissa Plummer' THEN 2
    WHEN 'Yvette Kirk' THEN 2
    WHEN 'Dawn Jacobson' THEN 1
    WHEN 'Matt Stuart' THEN 9
    WHEN 'Marty Koepke' THEN 8
    WHEN 'Josh Greenwood' THEN 26
  END as difference
FROM initiatives
WHERE last_updated_by IN (
  'MIGRATION_BATCH1_LOW_PRIORITY',
  'MIGRATION_BATCH2A_MATT_STUART',
  'MIGRATION_BATCH2B_MARTY_KOEPKE',
  'MIGRATION_BATCH3_JOSH_GREENWOOD'
)
GROUP BY owner_name
ORDER BY owner_name;

-- Check 3: Find assignments that still have unique items for these 10 SCIs
SELECT
  'Remaining Unique Items' as check_name,
  tm.name as sci_name,
  a.assignment_name,
  a.work_type,
  a.status,
  a.migration_status,
  '❌ This item was not migrated' as issue
FROM assignments a
INNER JOIN team_members tm ON a.team_member_id = tm.id
WHERE tm.name IN (
  'Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson',
  'Matt Stuart', 'Marty Koepke', 'Josh Greenwood'
)
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
)
ORDER BY tm.name, a.assignment_name;

-- Check 4: Check for case sensitivity or whitespace issues
SELECT
  'Potential Name Mismatch' as check_name,
  tm.name as sci_name,
  a.assignment_name as assignment_name,
  LOWER(TRIM(a.assignment_name)) as normalized_assignment,
  i.initiative_name as matching_initiative,
  LOWER(TRIM(i.initiative_name)) as normalized_initiative,
  CASE
    WHEN LOWER(TRIM(a.assignment_name)) = LOWER(TRIM(i.initiative_name)) THEN '✅ Match'
    ELSE '❌ No exact match'
  END as match_status
FROM assignments a
INNER JOIN team_members tm ON a.team_member_id = tm.id
LEFT JOIN initiatives i ON i.team_member_id = a.team_member_id
  AND LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
  AND i.status != 'Deleted'
WHERE tm.name IN (
  'Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson',
  'Matt Stuart', 'Marty Koepke', 'Josh Greenwood'
)
AND i.initiative_name IS NULL
ORDER BY tm.name, a.assignment_name;

-- Check 5: Verify Marty's protected items exist in assignments but NOT in migrated initiatives
SELECT
  'Marty Protected Items' as check_name,
  a.assignment_name,
  a.work_type,
  CASE
    WHEN a.assignment_name ILIKE '%Medicare%' THEN '✅ Protected (Medicare)'
    WHEN a.assignment_name ILIKE '%Depression%' THEN '✅ Protected (Depression)'
    ELSE '⚠️ Should have been migrated'
  END as protection_status
FROM assignments a
WHERE a.team_member_id = (SELECT id FROM team_members WHERE name = 'Marty Koepke')
AND NOT EXISTS (
  SELECT 1 FROM initiatives i
  WHERE LOWER(TRIM(i.initiative_name)) = LOWER(TRIM(a.assignment_name))
    AND i.team_member_id = a.team_member_id
    AND i.status != 'Deleted'
);
