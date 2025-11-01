-- AUDIT: GOV-2025-004 Complete Data Flow Validation
-- Date: October 30, 2025
-- Purpose: Verify governance request → initiative → capacity flow is working correctly

-- ===========================================================================
-- CHECK 1: Governance Request Details
-- ===========================================================================
SELECT
  'Governance Request' as audit_check,
  id,
  request_id,
  title,
  submitter_name,
  status,
  assigned_sci_id,
  assigned_sci_name,
  work_effort,
  linked_initiative_id,
  projected_annual_revenue,
  financial_impact,
  submitted_date,
  updated_at
FROM governance_requests
WHERE request_id = 'GOV-2025-004';

-- Expected:
-- - request_id: 'GOV-2025-004'
-- - status: 'Ready for Governance'
-- - assigned_sci_name: 'Melissa Plummer'
-- - work_effort: 'L'
-- - linked_initiative_id: NOT NULL (UUID)
-- - projected_annual_revenue or financial_impact: Should have $2.0M

-- ===========================================================================
-- CHECK 2: Linked Initiative Details
-- ===========================================================================
SELECT
  'Linked Initiative' as audit_check,
  i.id,
  i.initiative_name,
  i.owner_name,
  i.team_member_id,
  i.type,
  i.status,
  i.work_effort,
  i.role,
  i.phase,
  i.governance_request_id,
  i.request_id,
  i.problem_statement,
  i.desired_outcomes,
  i.is_draft,
  i.is_active,
  i.created_at,
  i.updated_at
FROM initiatives i
WHERE i.governance_request_id = (
  SELECT id FROM governance_requests WHERE request_id = 'GOV-2025-004'
);

-- Expected:
-- - initiative_name: 'Diedre-Here is a new request'
-- - owner_name: 'Melissa Plummer'
-- - type: 'System Initiative' (Phase 1 creates as System Initiative)
-- - status: 'In Progress' (Phase 2 changes from Not Started to In Progress)
-- - work_effort: 'L' (transferred from governance request)
-- - governance_request_id: Matches governance_requests.id
-- - request_id: 'GOV-2025-004' (display ID)
-- - problem_statement, desired_outcomes: Should be populated by Phase 2
-- - is_draft: false
-- - is_active: true

-- ===========================================================================
-- CHECK 3: Bidirectional Linking
-- ===========================================================================
SELECT
  'Bidirectional Link Check' as audit_check,
  gr.request_id as gov_request_id,
  gr.linked_initiative_id as gov_links_to_initiative,
  i.id as initiative_id,
  i.governance_request_id as initiative_links_to_gov,
  CASE
    WHEN gr.linked_initiative_id = i.id
     AND i.governance_request_id = gr.id
    THEN '✅ PASS - Bidirectional link intact'
    ELSE '❌ FAIL - Link mismatch'
  END as link_status
FROM governance_requests gr
LEFT JOIN initiatives i ON i.id = gr.linked_initiative_id
WHERE gr.request_id = 'GOV-2025-004';

-- Expected: link_status = '✅ PASS - Bidirectional link intact'

-- ===========================================================================
-- CHECK 4: Financial Impact Data
-- ===========================================================================
SELECT
  'Financial Impact' as audit_check,
  fi.id,
  fi.initiative_id,
  fi.projected_annual,
  fi.actual_revenue,
  fi.calculation_methodology,
  fi.projection_basis,
  fi.key_assumptions,
  fi.created_at,
  fi.updated_at
FROM initiative_financial_impact fi
WHERE fi.initiative_id = (
  SELECT linked_initiative_id FROM governance_requests WHERE request_id = 'GOV-2025-004'
);

-- Expected:
-- - projected_annual: Should be around $2,000,000 (user reported $2.0M)
-- - Record should exist (Phase 2 creates this)

-- ===========================================================================
-- CHECK 5: Initiative Story
-- ===========================================================================
SELECT
  'Initiative Story' as audit_check,
  s.id,
  s.initiative_id,
  s.challenge,
  s.approach,
  s.outcome,
  s.created_at,
  s.updated_at
FROM initiative_stories s
WHERE s.initiative_id = (
  SELECT linked_initiative_id FROM governance_requests WHERE request_id = 'GOV-2025-004'
);

-- Expected:
-- - challenge: Populated with problem_statement from governance request
-- - outcome: Populated with desired_outcomes from governance request
-- - Record should exist (Phase 2 creates this)

-- ===========================================================================
-- CHECK 6: Initiative Metrics
-- ===========================================================================
SELECT
  'Initiative Metrics' as audit_check,
  COUNT(*) as metrics_count,
  STRING_AGG(metric_name, ', ') as metric_names
FROM initiative_metrics m
WHERE m.initiative_id = (
  SELECT linked_initiative_id FROM governance_requests WHERE request_id = 'GOV-2025-004'
);

-- Expected:
-- - metrics_count: May be 0 (metrics are optional)
-- - If impact_metrics array existed in governance request, Phase 2 should transfer them

-- ===========================================================================
-- CHECK 7: Melissa Plummer's Capacity Before/After
-- ===========================================================================
WITH melissa_initiatives AS (
  SELECT
    COUNT(*) FILTER (WHERE i.governance_request_id IS NULL) as non_gov_count,
    COUNT(*) FILTER (WHERE i.governance_request_id IS NOT NULL) as gov_count,
    COUNT(*) as total_count
  FROM initiatives i
  WHERE i.team_member_id = (SELECT id FROM team_members WHERE name = 'Melissa Plummer')
    AND i.status IN ('Active', 'In Progress', 'Not Started', 'Planning', 'Scaling')
    AND i.status != 'Deleted'
)
SELECT
  'Melissa Initiative Count' as audit_check,
  non_gov_count,
  gov_count,
  total_count,
  CASE
    WHEN total_count = 15 THEN '✅ PASS - Matches user report (15 active)'
    ELSE '⚠️ WARNING - Expected 15, got ' || total_count::text
  END as count_status
FROM melissa_initiatives;

-- Expected:
-- - total_count: 15 (user reported 15 active initiatives)
-- - gov_count: Should be 1 (GOV-2025-004)

-- ===========================================================================
-- CHECK 8: Melissa's Capacity Calculation
-- ===========================================================================
WITH melissa_capacity AS (
  SELECT
    tm.id as team_member_id,
    tm.name,
    COUNT(i.id) as active_initiatives,
    -- Count initiatives with complete capacity data
    COUNT(i.id) FILTER (
      WHERE i.role IS NOT NULL
        AND i.work_effort IS NOT NULL
        AND i.type IS NOT NULL
        AND (i.phase IS NOT NULL OR i.type = 'Governance')
    ) as complete_data_count,
    -- Sum planned hours using formula (rough estimate for audit)
    SUM(
      CASE
        WHEN i.work_effort = 'XS' THEN 0.5
        WHEN i.work_effort = 'S' THEN 1.5
        WHEN i.work_effort = 'M' THEN 3.5
        WHEN i.work_effort = 'L' THEN 7.5
        WHEN i.work_effort = 'XL' THEN 15
        ELSE 0
      END
    ) as estimated_base_hours,
    -- Get actual hours from effort_logs (latest entries)
    COALESCE((
      SELECT SUM(el.hours_spent)
      FROM effort_logs el
      WHERE el.team_member_id = tm.id
        AND el.initiative_id IN (
          SELECT id FROM initiatives
          WHERE team_member_id = tm.id
            AND status IN ('Active', 'In Progress', 'Not Started', 'Planning', 'Scaling')
            AND status != 'Deleted'
        )
    ), 0) as actual_hours_logged
  FROM team_members tm
  LEFT JOIN initiatives i ON i.team_member_id = tm.id
    AND i.status IN ('Active', 'In Progress', 'Not Started', 'Planning', 'Scaling')
    AND i.status != 'Deleted'
  WHERE tm.name = 'Melissa Plummer'
  GROUP BY tm.id, tm.name
)
SELECT
  'Melissa Capacity Check' as audit_check,
  name,
  active_initiatives,
  complete_data_count,
  estimated_base_hours,
  ROUND((estimated_base_hours / 40.0) * 100, 1) || '%' as estimated_capacity_pct,
  actual_hours_logged,
  ROUND((actual_hours_logged / 40.0) * 100, 1) || '%' as actual_capacity_pct,
  CASE
    WHEN active_initiatives = 15 THEN '✅ PASS - 15 active initiatives'
    ELSE '⚠️ WARNING - Expected 15, got ' || active_initiatives::text
  END as initiative_count_status,
  CASE
    WHEN estimated_base_hours BETWEEN 9 AND 12 THEN '✅ PASS - Planned hours ~10.4 (within range)'
    ELSE '⚠️ INFO - Estimated base ' || estimated_base_hours::text || ' hrs (user reported 10.4, but this is BEFORE weights)'
  END as planned_hours_status,
  CASE
    WHEN actual_hours_logged BETWEEN 20 AND 30 THEN '✅ PASS - Actual hours ~24.5 (within range)'
    ELSE '⚠️ INFO - Actual ' || actual_hours_logged::text || ' hrs (user reported 24.5)'
  END as actual_hours_status
FROM melissa_capacity;

-- Expected:
-- - active_initiatives: 15
-- - estimated_base_hours: ~10-12 (user reported 10.4 hrs planned, this is base before weights)
-- - actual_hours_logged: ~24-25 (user reported 24.5 hrs actual)

-- ===========================================================================
-- CHECK 9: Dashboard Metrics Updated
-- ===========================================================================
-- NOTE: "total_assignments" is a FIELD NAME in dashboard_metrics table,
--       NOT a reference to the deleted "assignments" table.
--       This field tracks the COUNT of initiatives per team member.
SELECT
  'Dashboard Metrics' as audit_check,
  dm.team_member_id,
  tm.name,
  dm.total_assignments as total_initiatives_count,
  dm.active_assignments as active_initiatives_count,
  -- Calculate real-time revenue from initiative_financial_impact
  COALESCE((
    SELECT SUM(fi.projected_annual)
    FROM initiative_financial_impact fi
    JOIN initiatives i ON i.id = fi.initiative_id
    WHERE i.team_member_id = tm.id
      AND i.status != 'Deleted'
  ), 0) as total_revenue_impact,
  dm.last_updated
FROM dashboard_metrics dm
JOIN team_members tm ON tm.id = dm.team_member_id
WHERE tm.name = 'Melissa Plummer';

-- Expected:
-- - total_initiatives_count: Should reflect 15 active initiatives
-- - total_revenue_impact: Should include $2.0M from GOV-2025-004 if Phase 2 created financial record
--
-- ⚠️ NAMING CLARIFICATION:
-- The dashboard_metrics table has fields named "total_assignments" and "active_assignments"
-- but these are just field NAMES - they store INITIATIVE counts, not data from the deleted
-- assignments table. This is legacy naming that predates the assignments table removal.
--
-- ⚠️ REVENUE CALCULATION:
-- Revenue is calculated in real-time from initiative_financial_impact table, NOT from
-- a pre-calculated dashboard_metrics field. This ensures the most accurate total.

-- ===========================================================================
-- CHECK 10: Phase 1 vs Phase 2 Verification
-- ===========================================================================
SELECT
  'Phase Completion Status' as audit_check,
  CASE WHEN gr.linked_initiative_id IS NOT NULL THEN '✅ Phase 1 Complete' ELSE '❌ Phase 1 Failed' END as phase1_status,
  CASE WHEN i.status = 'In Progress' THEN '✅ Phase 2 Complete' ELSE '⚠️ Phase 2 Incomplete (status: ' || i.status || ')' END as phase2_status,
  CASE WHEN i.problem_statement IS NOT NULL THEN '✅ Details Populated' ELSE '❌ Missing Details' END as details_status,
  CASE WHEN fi.id IS NOT NULL THEN '✅ Financial Created' ELSE '⚠️ No Financial Data' END as financial_status,
  CASE WHEN s.id IS NOT NULL THEN '✅ Story Created' ELSE '⚠️ No Story' END as story_status
FROM governance_requests gr
LEFT JOIN initiatives i ON i.id = gr.linked_initiative_id
LEFT JOIN initiative_financial_impact fi ON fi.initiative_id = gr.linked_initiative_id
LEFT JOIN initiative_stories s ON s.initiative_id = gr.linked_initiative_id
WHERE gr.request_id = 'GOV-2025-004';

-- Expected:
-- - phase1_status: '✅ Phase 1 Complete'
-- - phase2_status: '✅ Phase 2 Complete'
-- - details_status: '✅ Details Populated'
-- - financial_status: '✅ Financial Created'
-- - story_status: '✅ Story Created'

-- ===========================================================================
-- SUMMARY: Overall Data Flow Health
-- ===========================================================================
SELECT
  'OVERALL DATA FLOW AUDIT' as summary,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM governance_requests gr
      JOIN initiatives i ON i.id = gr.linked_initiative_id
      WHERE gr.request_id = 'GOV-2025-004'
        AND gr.status = 'Ready for Governance'
        AND gr.work_effort = 'L'
        AND i.status = 'In Progress'
        AND i.work_effort = 'L'
        AND i.governance_request_id = gr.id
    ) THEN '✅ PASS - Complete data flow intact'
    ELSE '❌ FAIL - Data flow broken, check individual checks above'
  END as overall_status;
