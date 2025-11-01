-- ============================================
-- MIGRATION VERIFICATION QUERY
-- Run this to confirm all migrations completed
-- ============================================

-- 1. Check tables exist
SELECT '1. Tables Status' as check_section;
SELECT
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'field_options')
    THEN '✅ field_options table exists'
    ELSE '❌ field_options table MISSING' END as status
UNION ALL
SELECT
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'application_config')
    THEN '✅ application_config table exists'
    ELSE '❌ application_config table MISSING' END
UNION ALL
SELECT
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'capacity_thresholds')
    THEN '✅ capacity_thresholds table exists'
    ELSE '❌ capacity_thresholds table MISSING' END;

-- 2. Check record counts
SELECT '' as spacer;
SELECT '2. Record Counts' as check_section;
SELECT 'field_options' as table_name, COUNT(*)::text || ' records' as count FROM field_options
UNION ALL
SELECT 'application_config', COUNT(*)::text || ' records' FROM application_config
UNION ALL
SELECT 'capacity_thresholds', COUNT(*)::text || ' records (active)' FROM capacity_thresholds WHERE is_active = true;

-- 3. Check for duplicate capacity configs (should be 0)
SELECT '' as spacer;
SELECT '3. Duplicate Check' as check_section;
SELECT
  CASE WHEN COUNT(*) = 0
    THEN '✅ No duplicate capacity configs found'
    ELSE '❌ ' || COUNT(*)::text || ' duplicate capacity configs STILL EXIST'
  END as status
FROM application_config
WHERE key IN ('capacity_under_threshold', 'capacity_near_threshold', 'capacity_at_threshold');

-- 4. Show application_config contents (should only have banner/labels)
SELECT '' as spacer;
SELECT '4. Application Config Contents' as check_section;
SELECT
  key,
  value,
  category,
  label
FROM application_config
ORDER BY category, display_order;

-- 5. Show capacity thresholds (should have 7 levels)
SELECT '' as spacer;
SELECT '5. Capacity Thresholds' as check_section;
SELECT
  display_order,
  label,
  min_percentage || '-' || max_percentage || '%' as range,
  color,
  color_name,
  emoji,
  is_active
FROM capacity_thresholds
ORDER BY display_order;

-- 6. Show field option counts by type
SELECT '' as spacer;
SELECT '6. Field Options by Type' as check_section;
SELECT
  field_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM field_options
GROUP BY field_type
ORDER BY field_type;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- field_options: 48 records
-- application_config: 4 records (banner_title, organization_name, workload_staff_view_label, workload_manager_view_label)
-- capacity_thresholds: 7 records (all active)
-- Duplicate capacity configs: 0
-- ============================================
