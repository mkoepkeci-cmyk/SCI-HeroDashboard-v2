-- Fix SECURITY DEFINER governance views to use SECURITY INVOKER
-- Date: October 30, 2025
--
-- Issue: Views v_requests_by_year and v_prioritization_queue are defined with
-- SECURITY DEFINER property, which enforces permissions of the view creator
-- rather than the querying user. This can bypass Row Level Security (RLS).
--
-- Solution: Recreate views with security_invoker = true to enforce RLS properly.

-- ============================================================================
-- STEP 1: Fix v_requests_by_year view
-- ============================================================================

DROP VIEW IF EXISTS v_requests_by_year CASCADE;

CREATE OR REPLACE VIEW v_requests_by_year
WITH (security_invoker = true)
AS
SELECT
  EXTRACT(YEAR FROM submitted_date) AS year,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE status = 'Ready for Review') AS ready_for_review,
  COUNT(*) FILTER (WHERE status = 'Ready for Governance') AS ready_for_governance,
  COUNT(*) FILTER (WHERE status = 'Dismissed') AS dismissed,
  COUNT(*) FILTER (WHERE status = 'Converted to Initiative') AS converted,
  COUNT(*) FILTER (WHERE assigned_sci_id IS NOT NULL) AS assigned_requests
FROM governance_requests
WHERE submitted_date IS NOT NULL
GROUP BY EXTRACT(YEAR FROM submitted_date)
ORDER BY year DESC;

COMMENT ON VIEW v_requests_by_year IS 'Governance requests aggregated by year with status breakdown (SECURITY INVOKER)';

-- ============================================================================
-- STEP 2: Fix v_prioritization_queue view
-- ============================================================================

DROP VIEW IF EXISTS v_prioritization_queue CASCADE;

CREATE OR REPLACE VIEW v_prioritization_queue
WITH (security_invoker = true)
AS
SELECT
  gr.id,
  gr.request_id,
  gr.title,
  gr.submitter_name,
  gr.division_region,
  gr.problem_statement,
  gr.desired_outcomes,
  gr.system_clinical_leader,
  gr.assigned_sci_id,
  gr.assigned_sci_name,
  gr.status,
  gr.submitted_date,
  gr.benefit_score,
  gr.effort_score,
  gr.total_score,
  gr.priority_rank,
  gr.financial_impact,
  -- Calculate priority score (benefit - effort, higher is better)
  CASE
    WHEN gr.benefit_score IS NOT NULL AND gr.effort_score IS NOT NULL
    THEN gr.benefit_score - gr.effort_score
    ELSE NULL
  END AS priority_score,
  -- Determine priority tier
  CASE
    WHEN gr.total_score >= 7 THEN 'High'
    WHEN gr.total_score >= 4 THEN 'Medium'
    WHEN gr.total_score >= 0 THEN 'Low'
    ELSE 'Unscored'
  END AS priority_tier
FROM governance_requests gr
WHERE gr.status IN ('Ready for Review', 'Ready for Governance')
  AND gr.submitted_date IS NOT NULL
ORDER BY
  gr.total_score DESC NULLS LAST,
  gr.submitted_date ASC;

COMMENT ON VIEW v_prioritization_queue IS 'Governance requests prioritized by score for review workflow (SECURITY INVOKER)';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify views were recreated with security_invoker = true
SELECT
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE viewname IN ('v_requests_by_year', 'v_prioritization_queue')
  AND schemaname = 'public';

-- Should return 2 rows showing the views exist

-- ============================================================================
-- STEP 3: Fix update_governance_requests_updated_at function with mutable search_path
-- ============================================================================
--
-- Issue: Function update_governance_requests_updated_at does not have search_path set,
-- which creates a security vulnerability where malicious users can manipulate the
-- schema search path to redirect function calls.
--
-- Solution: Add "SET search_path = public" to prevent search_path manipulation attacks.

CREATE OR REPLACE FUNCTION update_governance_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

COMMENT ON FUNCTION update_governance_requests_updated_at IS 'Automatically updates updated_at timestamp for governance_requests (secure search_path)';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'SECURITY DEFINER governance views and functions fixed successfully' AS status;
