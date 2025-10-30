-- Comprehensive diagnostic for GOV-2025-003 financial/metrics data flow
-- This checks EVERY step in the data pipeline

-- ============================================================
-- STEP 1: Check if financial data was saved to governance_requests table
-- ============================================================
SELECT
  request_id,
  title,
  status,
  projected_annual_revenue,
  projection_basis,
  calculation_methodology,
  key_assumptions::text AS key_assumptions,  -- Cast to text for display
  impact_metrics::text AS impact_metrics,    -- Cast to text for display
  submitted_date,
  updated_at,
  linked_initiative_id
FROM governance_requests
WHERE request_id = 'GOV-2025-003';

-- EXPECTED: projected_annual_revenue should have a number value
-- EXPECTED: calculation_methodology should have text
-- EXPECTED: impact_metrics should be a JSON array with metric objects

-- ============================================================
-- STEP 2: Check if initiative_financial_impact record exists
-- ============================================================
SELECT
  ifi.id,
  ifi.initiative_id,
  ifi.projected_annual,
  ifi.projection_basis,
  ifi.calculation_methodology,
  ifi.key_assumptions,
  ifi.created_at,
  ifi.updated_at,
  i.initiative_name,
  i.request_id
FROM initiative_financial_impact ifi
JOIN initiatives i ON ifi.initiative_id = i.id
WHERE i.request_id = 'GOV-2025-003';

-- EXPECTED: One record with projected_annual populated
-- IF EMPTY: Phase 2 either didn't run OR source data was NULL

-- ============================================================
-- STEP 3: Check if initiative_metrics records exist
-- ============================================================
SELECT
  im.id,
  im.initiative_id,
  im.metric_name,
  im.metric_type,
  im.unit,
  im.baseline_value,
  im.current_value,
  im.target_value,
  im.improvement,
  im.measurement_method,
  im.display_order,
  i.initiative_name,
  i.request_id
FROM initiative_metrics im
JOIN initiatives i ON im.initiative_id = i.id
WHERE i.request_id = 'GOV-2025-003'
ORDER BY im.display_order;

-- EXPECTED: Multiple metric records (one per metric in the form)
-- IF EMPTY: Phase 2 either didn't run OR impact_metrics array was empty

-- ============================================================
-- STEP 4: Cross-check all three tables for GOV-2025-003
-- ============================================================
SELECT
  gr.request_id,
  gr.title,
  gr.status as gov_status,
  gr.projected_annual_revenue as gov_projected_revenue,
  gr.calculation_methodology as gov_methodology,
  CASE
    WHEN gr.impact_metrics IS NOT NULL
    THEN jsonb_array_length(gr.impact_metrics::jsonb)
    ELSE 0
  END as gov_metrics_count,
  i.id as initiative_id,
  i.initiative_name,
  i.status as initiative_status,
  ifi.projected_annual as initiative_projected_revenue,
  ifi.calculation_methodology as initiative_methodology,
  (SELECT COUNT(*) FROM initiative_metrics WHERE initiative_id = i.id) as initiative_metrics_count
FROM governance_requests gr
LEFT JOIN initiatives i ON gr.linked_initiative_id = i.id
LEFT JOIN initiative_financial_impact ifi ON ifi.initiative_id = i.id
WHERE gr.request_id = 'GOV-2025-003';

-- DIAGNOSIS KEY:
-- If gov_projected_revenue IS NULL → Problem at STEP 1: Form didn't save financial data
-- If gov_projected_revenue HAS VALUE but initiative_projected_revenue IS NULL → Problem at STEP 2: Phase 2 didn't transfer financial data
-- If gov_metrics_count > 0 but initiative_metrics_count = 0 → Problem at STEP 2: Phase 2 didn't transfer metrics
-- If ALL values populated → Data flow is working, check dashboard fetch/display

-- ============================================================
-- STEP 5: Check dashboard_metrics table (aggregate data)
-- ============================================================
SELECT
  dm.*
FROM dashboard_metrics dm
JOIN team_members tm ON dm.team_member_id = tm.id
WHERE tm.name = 'Lisa Townsend';

-- This shows what the dashboard THINKS Lisa's metrics are
-- Compare with calculated values from her initiatives

-- ============================================================
-- DIAGNOSTIC SUMMARY
-- ============================================================
-- Run all queries above and compare results:
--
-- SCENARIO A: governance_requests has financial data, but initiative tables don't
--   → Phase 2 transfer failed or didn't run
--   → FIX: Manually run Phase 2 or trigger by changing status
--
-- SCENARIO B: governance_requests has NO financial data
--   → Form save failed or user never filled out financial section
--   → FIX: Go back to governance form, fill in financial data, save
--
-- SCENARIO C: Both governance_requests AND initiative tables have data
--   → Data flow is working correctly
--   → FIX: Check dashboard fetch query or display logic
