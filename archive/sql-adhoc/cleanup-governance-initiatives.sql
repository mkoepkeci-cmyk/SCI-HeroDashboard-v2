-- ============================================
-- CLEANUP: Delete Broken Governance Initiatives
-- Purpose: Remove Mandated Reporting and Translation Services initiatives
--          created without request_id field
-- ============================================

-- Step 1: Find the initiatives to delete
-- Run this first to verify you're deleting the right ones
SELECT
  id,
  initiative_name,
  owner_name,
  type,
  status,
  request_id,
  governance_request_id
FROM initiatives
WHERE initiative_name IN ('Mandated Reporting', 'Translation Services')
  AND owner_name = 'Marty Koepke'
  AND type = 'System Initiative';

-- Expected result: 2 rows with NULL request_id

-- ============================================

-- Step 2: Delete the initiatives
-- IMPORTANT: Uncomment the lines below and run AFTER verifying Step 1 results

-- DELETE FROM initiatives
-- WHERE initiative_name IN ('Mandated Reporting', 'Translation Services')
--   AND owner_name = 'Marty Koepke'
--   AND type = 'System Initiative'
--   AND request_id IS NULL;

-- ============================================

-- Step 3: Clear the linked_initiative_id from governance_requests
-- This allows Phase 1 to run again and create NEW initiatives with request_id

-- UPDATE governance_requests
-- SET
--   linked_initiative_id = NULL,
--   updated_at = NOW()
-- WHERE request_id IN ('GOV-2025-00002', 'GOV-2025-00003');

-- ============================================

-- Step 4: Verify cleanup
SELECT 'Initiatives' as table_name, COUNT(*) as count
FROM initiatives
WHERE initiative_name IN ('Mandated Reporting', 'Translation Services')
  AND owner_name = 'Marty Koepke'
UNION ALL
SELECT 'Governance Requests with linked_initiative_id', COUNT(*)
FROM governance_requests
WHERE request_id IN ('GOV-2025-00002', 'GOV-2025-00003')
  AND linked_initiative_id IS NOT NULL;

-- Expected result: Both counts should be 0

-- ============================================
-- INSTRUCTIONS:
-- 1. Copy this file's contents
-- 2. Open Supabase Dashboard → SQL Editor
-- 3. Run Step 1 (SELECT query) - verify 2 initiatives found
-- 4. Uncomment and run Step 2 (DELETE) - removes broken initiatives
-- 5. Uncomment and run Step 3 (UPDATE) - clears governance links
-- 6. Run Step 4 (Verification) - confirm both counts are 0
-- 7. Refresh your browser at http://localhost:5173
-- 8. Proceed with testing workflow from Step 2 of cleanup instructions
-- ============================================
