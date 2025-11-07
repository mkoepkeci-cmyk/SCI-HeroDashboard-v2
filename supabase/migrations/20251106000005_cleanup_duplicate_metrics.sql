-- Migration: Clean up duplicate metrics
-- Date: November 6, 2025
-- Purpose: Remove duplicate metric entries created by the old DELETE+INSERT save pattern

-- Keep only the most recent entry for each unique metric_name per initiative
-- Using ROW_NUMBER() window function to identify duplicates and keep only the first one

DELETE FROM initiative_metrics
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY initiative_id, metric_name
             ORDER BY created_at DESC NULLS LAST
           ) as rn
    FROM initiative_metrics
  ) ranked
  WHERE rn > 1
);

-- Verify cleanup
-- This query will show how many unique metrics remain per initiative
-- Expected: Each initiative should have distinct metric names only
SELECT
  initiative_id,
  COUNT(*) as total_metrics,
  COUNT(DISTINCT metric_name) as unique_metrics
FROM initiative_metrics
GROUP BY initiative_id
HAVING COUNT(*) <> COUNT(DISTINCT metric_name);
-- If this returns no rows, cleanup was successful!
