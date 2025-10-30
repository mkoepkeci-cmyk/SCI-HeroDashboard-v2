-- FINAL VALIDATION: All Batch Migrations (1, 2A, 2B, 3)
-- Verifies all 58 items migrated successfully across 10 SCIs

-- ===========================================================================
-- CHECK 1: Total items migrated across all batches (should be 58)
-- ===========================================================================
SELECT
  'All Batches Total' as validation_check,
  COUNT(*) as total_migrated,
  58 as expected,
  CASE WHEN COUNT(*) = 58 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM initiatives
WHERE last_updated_by IN (
  'MIGRATION_BATCH1_LOW_PRIORITY',
  'MIGRATION_BATCH2A_MATT_STUART',
  'MIGRATION_BATCH2B_MARTY_KOEPKE',
  'MIGRATION_BATCH3_JOSH_GREENWOOD'
);

-- ===========================================================================
-- CHECK 2: Breakdown by batch
-- ===========================================================================
SELECT
  'Batch Breakdown' as validation_check,
  last_updated_by,
  COUNT(*) as items_migrated,
  CASE last_updated_by
    WHEN 'MIGRATION_BATCH1_LOW_PRIORITY' THEN 15
    WHEN 'MIGRATION_BATCH2A_MATT_STUART' THEN 9
    WHEN 'MIGRATION_BATCH2B_MARTY_KOEPKE' THEN 8
    WHEN 'MIGRATION_BATCH3_JOSH_GREENWOOD' THEN 26
    ELSE 0
  END as expected,
  CASE WHEN COUNT(*) = CASE last_updated_by
    WHEN 'MIGRATION_BATCH1_LOW_PRIORITY' THEN 15
    WHEN 'MIGRATION_BATCH2A_MATT_STUART' THEN 9
    WHEN 'MIGRATION_BATCH2B_MARTY_KOEPKE' THEN 8
    WHEN 'MIGRATION_BATCH3_JOSH_GREENWOOD' THEN 26
    ELSE 0
  END THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM initiatives
WHERE last_updated_by IN (
  'MIGRATION_BATCH1_LOW_PRIORITY',
  'MIGRATION_BATCH2A_MATT_STUART',
  'MIGRATION_BATCH2B_MARTY_KOEPKE',
  'MIGRATION_BATCH3_JOSH_GREENWOOD'
)
GROUP BY last_updated_by
ORDER BY last_updated_by;

-- ===========================================================================
-- CHECK 3: Breakdown by SCI (all 10 SCIs)
-- ===========================================================================
SELECT
  'Items Per SCI' as validation_check,
  owner_name,
  COUNT(*) as items_migrated,
  CASE owner_name
    -- Batch 1 (15 items)
    WHEN 'Sherry Brennaman' THEN 5
    WHEN 'Ashley Daily' THEN 2
    WHEN 'Jason Mihos' THEN 2
    WHEN 'Melissa Plummer' THEN 2
    WHEN 'Yvette Kirk' THEN 2
    WHEN 'Dawn Jacobson' THEN 1
    -- Batch 2A (9 items)
    WHEN 'Matt Stuart' THEN 9
    -- Batch 2B (8 items)
    WHEN 'Marty Koepke' THEN 8
    -- Batch 3 (26 items)
    WHEN 'Josh Greenwood' THEN 26
    ELSE 0
  END as expected,
  CASE WHEN COUNT(*) = CASE owner_name
    WHEN 'Sherry Brennaman' THEN 5
    WHEN 'Ashley Daily' THEN 2
    WHEN 'Jason Mihos' THEN 2
    WHEN 'Melissa Plummer' THEN 2
    WHEN 'Yvette Kirk' THEN 2
    WHEN 'Dawn Jacobson' THEN 1
    WHEN 'Matt Stuart' THEN 9
    WHEN 'Marty Koepke' THEN 8
    WHEN 'Josh Greenwood' THEN 26
    ELSE 0
  END THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM initiatives
WHERE last_updated_by IN (
  'MIGRATION_BATCH1_LOW_PRIORITY',
  'MIGRATION_BATCH2A_MATT_STUART',
  'MIGRATION_BATCH2B_MARTY_KOEPKE',
  'MIGRATION_BATCH3_JOSH_GREENWOOD'
)
GROUP BY owner_name
ORDER BY owner_name;

-- ===========================================================================
-- CHECK 4: No duplicates created
-- ===========================================================================
SELECT
  'Duplicate Check' as validation_check,
  initiative_name,
  owner_name,
  COUNT(*) as duplicate_count,
  '❌ FAIL - Duplicate found!' as status
FROM initiatives
WHERE team_member_id IN (
  SELECT id FROM team_members WHERE name IN (
    'Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson',
    'Matt Stuart', 'Marty Koepke', 'Josh Greenwood'
  )
)
AND status != 'Deleted'
GROUP BY initiative_name, owner_name
HAVING COUNT(*) > 1;
-- If this returns 0 rows, no duplicates were created (PASS)

-- ===========================================================================
-- CHECK 5: Verify protected items were NOT migrated (Marty Koepke)
-- ===========================================================================
SELECT
  'Protected Items Check' as validation_check,
  COUNT(*) as protected_items_migrated,
  'Should be 0' as expected,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM initiatives
WHERE last_updated_by IN (
  'MIGRATION_BATCH2B_MARTY_KOEPKE',
  'MIGRATION_BATCH1_LOW_PRIORITY',
  'MIGRATION_BATCH2A_MATT_STUART',
  'MIGRATION_BATCH3_JOSH_GREENWOOD'
)
AND (
  initiative_name ILIKE '%Medicare Annual Wellness%'
  OR initiative_name ILIKE '%Depression Screening%'
);

-- ===========================================================================
-- CHECK 6: Verify governance items still exist (GOV-2025-001, GOV-2025-002)
-- ===========================================================================
SELECT
  'Governance Items Check' as validation_check,
  request_id,
  initiative_name,
  owner_name,
  '✅ Should see GOV-2025-001 and GOV-2025-002' as expected
FROM initiatives
WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Marty Koepke')
  AND governance_request_id IS NOT NULL
ORDER BY request_id;

-- ===========================================================================
-- CHECK 7: Assignment migration status for all 10 SCIs
-- ===========================================================================
SELECT
  'Assignment Migration Status' as validation_check,
  tm.name as sci_name,
  a.migration_status,
  COUNT(*) as count
FROM assignments a
INNER JOIN team_members tm ON a.team_member_id = tm.id
WHERE tm.name IN (
  'Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson',
  'Matt Stuart', 'Marty Koepke', 'Josh Greenwood'
)
GROUP BY tm.name, a.migration_status
ORDER BY tm.name, a.migration_status;

-- ===========================================================================
-- CHECK 8: Final reconciliation - unique count should now be 0 for all 10 SCIs
-- ===========================================================================
SELECT
  'Final Reconciliation' as validation_check,
  tm.name as sci_name,
  COUNT(DISTINCT a.assignment_name) as assignments_count,
  COUNT(DISTINCT i.initiative_name) as initiatives_count,
  COUNT(DISTINCT a.assignment_name) - COUNT(DISTINCT i.initiative_name) as unique_to_migrate,
  CASE WHEN COUNT(DISTINCT a.assignment_name) - COUNT(DISTINCT i.initiative_name) <= 0
    THEN '✅ COMPLETE'
    ELSE '❌ ITEMS REMAINING'
  END as status
FROM team_members tm
LEFT JOIN assignments a ON a.team_member_id = tm.id
LEFT JOIN initiatives i ON i.team_member_id = tm.id AND i.status != 'Deleted'
WHERE tm.name IN (
  'Sherry Brennaman', 'Ashley Daily', 'Jason Mihos', 'Melissa Plummer', 'Yvette Kirk', 'Dawn Jacobson',
  'Matt Stuart', 'Marty Koepke', 'Josh Greenwood', 'Lisa Townsend'
)
GROUP BY tm.name
ORDER BY unique_to_migrate DESC, tm.name;

-- ===========================================================================
-- CHECK 9: Overall summary for all 16 SCIs
-- ===========================================================================
SELECT
  'All 16 SCIs Summary' as validation_check,
  tm.name as sci_name,
  COUNT(DISTINCT i.id) as total_initiatives,
  SUM(CASE WHEN i.last_updated_by LIKE 'MIGRATION_%' THEN 1 ELSE 0 END) as migrated_items
FROM team_members tm
LEFT JOIN initiatives i ON i.team_member_id = tm.id AND i.status != 'Deleted'
GROUP BY tm.name
ORDER BY total_initiatives DESC;

-- ===========================================================================
-- FINAL STATUS
-- ===========================================================================
SELECT
  'FINAL MIGRATION STATUS' as result,
  (SELECT COUNT(*) FROM initiatives WHERE last_updated_by IN (
    'MIGRATION_BATCH1_LOW_PRIORITY',
    'MIGRATION_BATCH2A_MATT_STUART',
    'MIGRATION_BATCH2B_MARTY_KOEPKE',
    'MIGRATION_BATCH3_JOSH_GREENWOOD'
  )) as total_migrated,
  '58 items expected across 10 SCIs' as expected,
  CASE
    WHEN (SELECT COUNT(*) FROM initiatives WHERE last_updated_by IN (
      'MIGRATION_BATCH1_LOW_PRIORITY',
      'MIGRATION_BATCH2A_MATT_STUART',
      'MIGRATION_BATCH2B_MARTY_KOEPKE',
      'MIGRATION_BATCH3_JOSH_GREENWOOD'
    )) = 58 THEN '✅ ALL MIGRATIONS SUCCESSFUL'
    ELSE '❌ MIGRATION INCOMPLETE - CHECK DETAILS ABOVE'
  END as final_status;
