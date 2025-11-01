-- Quick check to see what's already been migrated

-- Check if field_options table exists
SELECT
  'field_options table' as item,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'field_options'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check if capacity_thresholds table exists
SELECT
  'capacity_thresholds table' as item,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'capacity_thresholds'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check if application_config table exists
SELECT
  'application_config table' as item,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'application_config'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Count records in each table
SELECT 'field_options records' as item, COUNT(*)::text as status FROM field_options;
SELECT 'capacity_thresholds records' as item, COUNT(*)::text as status FROM capacity_thresholds;
SELECT 'application_config records' as item, COUNT(*)::text as status FROM application_config;

-- Check for duplicate capacity configs in application_config
SELECT
  'Duplicate capacity configs' as item,
  COUNT(*)::text || ' FOUND (should be 0)' as status
FROM application_config
WHERE key IN ('capacity_under_threshold', 'capacity_near_threshold', 'capacity_at_threshold');

-- Show all application_config records
SELECT
  'Application configs by category' as report,
  category,
  COUNT(*) as count
FROM application_config
GROUP BY category
ORDER BY category;
