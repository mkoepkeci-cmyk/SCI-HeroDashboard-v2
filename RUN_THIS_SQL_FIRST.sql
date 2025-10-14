-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR FIRST ⚠️
-- Go to: https://fiyaolxiarzkihlbhtmz.supabase.co
-- Navigate to: SQL Editor → New query
-- Copy and paste this entire file, then click RUN

-- Add all three new columns to initiatives table
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS ehrs_impacted TEXT;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS service_line TEXT;

-- Verify the columns were added successfully
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'initiatives'
AND column_name IN ('role', 'ehrs_impacted', 'service_line')
ORDER BY column_name;

-- You should see 3 rows returned:
-- ehrs_impacted | text
-- role          | text
-- service_line  | text
