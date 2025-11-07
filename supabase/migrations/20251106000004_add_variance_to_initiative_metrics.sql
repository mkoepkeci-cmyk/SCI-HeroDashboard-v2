-- Migration: Add variance_from_target column to initiative_metrics table
-- Date: November 6, 2025
-- Purpose: Track variance from target for each metric to support Tab4 unified Pre/Post interface

-- Add variance_from_target column to initiative_metrics table
ALTER TABLE initiative_metrics
ADD COLUMN IF NOT EXISTS variance_from_target NUMERIC;

-- Add comment
COMMENT ON COLUMN initiative_metrics.variance_from_target IS
'Calculated variance from target value (current_value - target_value)';

-- Backfill existing data
UPDATE initiative_metrics
SET variance_from_target = COALESCE(current_value, 0) - COALESCE(target_value, 0)
WHERE variance_from_target IS NULL
  AND current_value IS NOT NULL
  AND target_value IS NOT NULL;
