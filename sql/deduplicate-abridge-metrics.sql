-- Deduplicate metrics for Abridge AI Pilot initiative
-- This will keep only the most recent version of each unique metric

-- First, let's see what we have
SELECT
  metric_name,
  COUNT(*) as count
FROM initiative_metrics
WHERE initiative_id = '5a8c9e83-3cf9-4120-9f59-a7ac84f1c6e4'
GROUP BY metric_name
ORDER BY count DESC;

-- Delete duplicates, keeping only the most recent of each metric_name
WITH ranked_metrics AS (
  SELECT
    id,
    metric_name,
    ROW_NUMBER() OVER (
      PARTITION BY metric_name
      ORDER BY created_at DESC
    ) as rn
  FROM initiative_metrics
  WHERE initiative_id = '5a8c9e83-3cf9-4120-9f59-a7ac84f1c6e4'
)
DELETE FROM initiative_metrics
WHERE id IN (
  SELECT id
  FROM ranked_metrics
  WHERE rn > 1
);

-- Update display_order for the remaining metrics
WITH ordered_metrics AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY metric_name) - 1 as new_order
  FROM initiative_metrics
  WHERE initiative_id = '5a8c9e83-3cf9-4120-9f59-a7ac84f1c6e4'
)
UPDATE initiative_metrics
SET display_order = ordered_metrics.new_order
FROM ordered_metrics
WHERE initiative_metrics.id = ordered_metrics.id;

-- Verify the results
SELECT
  metric_name,
  metric_type,
  display_order,
  created_at
FROM initiative_metrics
WHERE initiative_id = '5a8c9e83-3cf9-4120-9f59-a7ac84f1c6e4'
ORDER BY display_order;
