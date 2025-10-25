-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION SCRIPT: Check if columns exist in Supabase
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to verify the columns are present
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check if the three new columns exist in the initiatives table
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'initiatives'
  AND column_name IN ('role', 'ehrs_impacted', 'service_line')
ORDER BY column_name;

-- Expected result: 3 rows showing:
-- ehrs_impacted | text | YES
-- role          | text | YES
-- service_line  | text | YES

-- If you see 3 rows, the columns exist and you're ready to proceed!
-- If you see 0 rows, run the ALTER TABLE commands to add them first.
