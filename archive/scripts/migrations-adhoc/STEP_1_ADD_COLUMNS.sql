-- ═══════════════════════════════════════════════════════════
-- STEP 1: Add Database Columns
-- ═══════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor FIRST
-- URL: https://fiyaolxiarzkihlbhtmz.supabase.co
-- Navigate to: SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- Add role column (Primary/Co-Owner/Secondary/Support)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS role TEXT;

-- Add ehrs_impacted column (All/Epic/Cerner/Altera)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS ehrs_impacted TEXT;

-- Add service_line column (Ambulatory/Pharmacy/Nursing/etc)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS service_line TEXT;

-- Verify columns were added successfully
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'initiatives'
AND column_name IN ('role', 'ehrs_impacted', 'service_line')
ORDER BY column_name;

-- Expected result: 3 rows showing:
-- ehrs_impacted | text
-- role          | text
-- service_line  | text
