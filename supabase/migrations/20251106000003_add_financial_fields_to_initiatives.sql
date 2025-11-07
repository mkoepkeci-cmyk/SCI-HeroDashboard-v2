-- Migration: Add financial fields to initiatives table
-- Date: November 6, 2025
-- Purpose: Add projected_annual_revenue, projection_basis, calculation_methodology, key_assumptions
--          to initiatives table so Phase 1 governance conversion can save financial data

-- Add financial fields to initiatives table (matching governance_requests structure)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS projected_annual_revenue NUMERIC,
ADD COLUMN IF NOT EXISTS projection_basis TEXT,
ADD COLUMN IF NOT EXISTS calculation_methodology TEXT,
ADD COLUMN IF NOT EXISTS key_assumptions JSONB DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN initiatives.projected_annual_revenue IS
'Projected annual revenue or savings in dollars (from governance request or manual entry)';

COMMENT ON COLUMN initiatives.projection_basis IS
'Explanation of how the projection was calculated (e.g., "Pilot data × 12 months")';

COMMENT ON COLUMN initiatives.calculation_methodology IS
'Detailed methodology showing how financial impact was calculated';

COMMENT ON COLUMN initiatives.key_assumptions IS
'Array of key assumptions underlying the financial projections';

-- Migrate existing data from initiative_financial_impact table to initiatives table
-- This ensures no data loss during the schema change
UPDATE initiatives i
SET
  projected_annual_revenue = COALESCE(i.projected_annual_revenue, fi.projected_annual),
  projection_basis = COALESCE(i.projection_basis, fi.projection_basis),
  calculation_methodology = COALESCE(i.calculation_methodology, fi.calculation_methodology),
  key_assumptions = COALESCE(
    i.key_assumptions,
    CASE
      WHEN fi.key_assumptions IS NOT NULL THEN
        jsonb_build_array(fi.key_assumptions)
      ELSE
        '[]'::jsonb
    END
  )
FROM initiative_financial_impact fi
WHERE i.id = fi.initiative_id
  AND (
    i.projected_annual_revenue IS NULL
    OR i.projection_basis IS NULL
    OR i.calculation_methodology IS NULL
    OR i.key_assumptions = '[]'::jsonb
  );

-- Verification query (uncomment to test)
-- SELECT
--   i.id,
--   i.initiative_name,
--   i.projected_annual_revenue,
--   i.projection_basis,
--   i.calculation_methodology,
--   i.key_assumptions,
--   fi.projected_annual as fi_projected_annual,
--   fi.projection_basis as fi_projection_basis
-- FROM initiatives i
-- LEFT JOIN initiative_financial_impact fi ON i.id = fi.initiative_id
-- WHERE i.projected_annual_revenue IS NOT NULL OR fi.projected_annual IS NOT NULL
-- ORDER BY i.updated_at DESC
-- LIMIT 10;
