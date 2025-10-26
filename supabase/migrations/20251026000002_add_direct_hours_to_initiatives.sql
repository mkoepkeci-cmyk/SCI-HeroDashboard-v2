/*
  # Add Direct Hours Field for Governance Initiatives

  ## Overview
  Adds `direct_hours_per_week` column to initiatives table to support
  governance activities that use direct hour tracking instead of formula-based calculation.

  ## Changes
  - Add `direct_hours_per_week` column (nullable decimal)
  - Only used for Governance work type
  - Represents actual hours spent (e.g., 5 hours of committee meetings per week)

  ## Usage
  - Governance initiatives: Set direct_hours_per_week, leave work_effort NULL
  - Other work types: Use work_effort (XS/S/M/L/XL), leave direct_hours_per_week NULL
*/

-- Add direct_hours_per_week column to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS direct_hours_per_week decimal CHECK (direct_hours_per_week >= 0 AND direct_hours_per_week <= 168);

-- Add comment explaining usage
COMMENT ON COLUMN initiatives.direct_hours_per_week IS
'For Governance work type only: Direct hours per week spent on governance activities (e.g., committee meetings). This value bypasses the formula-based calculation and is used directly for capacity calculation. For all other work types, use work_effort field instead.';

-- Create index for queries filtering by work type and direct hours
CREATE INDEX IF NOT EXISTS idx_initiatives_governance_hours
ON initiatives(type, direct_hours_per_week)
WHERE type = 'Governance' AND direct_hours_per_week IS NOT NULL;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Added direct_hours_per_week column to initiatives table';
  RAISE NOTICE 'Use this field for Governance work type to specify actual hours per week';
  RAISE NOTICE 'For other work types, continue using work_effort field';
END $$;
