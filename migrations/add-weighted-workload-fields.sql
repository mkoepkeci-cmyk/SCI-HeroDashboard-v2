-- Migration: Add Weighted Workload Fields to Initiatives Table
-- Date: 2025-10-13
-- Purpose: Enable intelligent filtering and weighted workload calculations

-- Add new fields to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS phase TEXT,
ADD COLUMN IF NOT EXISTS work_effort TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_initiatives_is_active ON initiatives(is_active);
CREATE INDEX IF NOT EXISTS idx_initiatives_phase ON initiatives(phase);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON initiatives(status);

-- Backfill is_active based on current status
UPDATE initiatives
SET is_active = CASE
  WHEN status IN ('Planning', 'Active', 'Scaling') THEN true
  ELSE false
END
WHERE is_active IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN initiatives.phase IS 'Project lifecycle phase: Discovery/Define, Design, Build, Validate/Test, Deploy, Did we Deliver, Post Go Live Support, Maintenance, Steady State, N/A';
COMMENT ON COLUMN initiatives.work_effort IS 'Size estimate: XS (< 1 hr/wk), S (1-2 hrs/wk), M (2-5 hrs/wk), L (5-10 hrs/wk), XL (> 10 hrs/wk)';
COMMENT ON COLUMN initiatives.is_active IS 'Calculated from status: true for Planning/Active/Scaling, false for Completed/On Hold/Cancelled';

-- Create function to auto-update is_active on status change
CREATE OR REPLACE FUNCTION update_is_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_active := NEW.status IN ('Planning', 'Active', 'Scaling');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update is_active when status changes
DROP TRIGGER IF EXISTS trigger_update_is_active ON initiatives;
CREATE TRIGGER trigger_update_is_active
  BEFORE INSERT OR UPDATE OF status ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_is_active();

-- Verification query
-- SELECT initiative_name, status, is_active, phase, work_effort
-- FROM initiatives
-- ORDER BY is_active DESC, status;
