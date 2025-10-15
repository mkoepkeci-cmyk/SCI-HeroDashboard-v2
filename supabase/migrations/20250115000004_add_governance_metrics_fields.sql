-- Add new fields to governance_requests table for enhanced impact metrics and financial projections

-- Add impact metrics as JSONB to store structured metric data
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS impact_metrics JSONB DEFAULT '[]'::jsonb;

-- Add detailed financial impact fields
ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS projected_annual_revenue NUMERIC,
ADD COLUMN IF NOT EXISTS projection_basis TEXT,
ADD COLUMN IF NOT EXISTS calculation_methodology TEXT,
ADD COLUMN IF NOT EXISTS key_assumptions JSONB DEFAULT '[]'::jsonb;

-- Add comments explaining the new fields
COMMENT ON COLUMN governance_requests.impact_metrics IS
'Array of impact metrics with baseline, current, and target values. Structure: [{metric_name, metric_type, unit, baseline_value, baseline_date, current_value, measurement_date, target_value, improvement, measurement_method}]';

COMMENT ON COLUMN governance_requests.projected_annual_revenue IS
'Projected annual revenue or savings in dollars';

COMMENT ON COLUMN governance_requests.projection_basis IS
'Explanation of how the projection was calculated (e.g., "Pilot data × 12 months")';

COMMENT ON COLUMN governance_requests.calculation_methodology IS
'Detailed methodology showing how financial impact was calculated';

COMMENT ON COLUMN governance_requests.key_assumptions IS
'Array of key assumptions underlying the financial projections';

-- Add indexes for querying
CREATE INDEX IF NOT EXISTS idx_governance_requests_impact_metrics
ON governance_requests USING GIN (impact_metrics);

-- Note: financial_impact column is retained for backward compatibility
COMMENT ON COLUMN governance_requests.financial_impact IS
'Legacy financial impact field. New submissions should use projected_annual_revenue with supporting methodology.';
