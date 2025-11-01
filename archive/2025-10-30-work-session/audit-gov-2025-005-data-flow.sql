-- AUDIT: GOV-2025-005 Complete Data Flow Validation
-- Date: October 30, 2025
-- Purpose: Verify governance request → initiative → capacity flow for GOV-2025-005

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
WHERE request_id = 'GOV-2025-005';

-- Expected:
-- - request_id: 'GOV-2025-005'
-- - title: 'Melissa - New For you'
-- - submitter_name: 'Deb Rockman'
-- - status: 'Ready for Governance' (✅ per user report)
-- - assigned_sci_name: 'Melissa Plummer'
-- - work_effort: Should be set
-- - linked_initiative_id: NOT NULL (UUID) - Phase 1 complete

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
  SELECT id FROM governance_requests WHERE request_id = 'GOV-2025-005'
);

-- Expected:
-- - initiative_name: 'Melissa - New For you'
-- - owner_name: 'Melissa Plummer'
-- - type: 'System Initiative' (Phase 1 default)
-- - status: 'In Progress' (Phase 2 updates from Not Started)
-- - work_effort: Transferred from governance request
-- - governance_request_id: Matches governance_requests.id
-- - request_id: 'GOV-2025-005'
-- - problem_statement, desired_outcomes: Populated by Phase 2
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
WHERE gr.request_id = 'GOV-2025-005';

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
  SELECT linked_initiative_id FROM governance_requests WHERE request_id = 'GOV-2025-005'
);

-- Expected:
-- - Record may or may not exist depending on if financial data was entered
-- - If exists, projected_annual should have a value

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
  SELECT linked_initiative_id FROM governance_requests WHERE request_id = 'GOV-2025-005'
);

-- Expected:
-- - challenge: Populated with problem_statement
-- - outcome: Populated with desired_outcomes
-- - Record created by Phase 2

-- ===========================================================================
-- CHECK 6: Phase 1 vs Phase 2 Verification
-- ===========================================================================
SELECT
  'Phase Completion Status' as audit_check,
  gr.request_id,
  gr.status as current_status,
  CASE WHEN gr.linked_initiative_id IS NOT NULL THEN '✅ Phase 1 Complete' ELSE '❌ Phase 1 Failed' END as phase1_status,
  CASE WHEN i.status = 'In Progress' THEN '✅ Phase 2 Complete' ELSE '⚠️ Phase 2 Incomplete (status: ' || COALESCE(i.status, 'NULL') || ')' END as phase2_status,
  CASE WHEN i.problem_statement IS NOT NULL THEN '✅ Details Populated' ELSE '❌ Missing Details' END as details_status,
  CASE WHEN fi.id IS NOT NULL THEN '✅ Financial Created' ELSE '⚠️ No Financial Data' END as financial_status,
  CASE WHEN s.id IS NOT NULL THEN '✅ Story Created' ELSE '⚠️ No Story' END as story_status
FROM governance_requests gr
LEFT JOIN initiatives i ON i.id = gr.linked_initiative_id
LEFT JOIN initiative_financial_impact fi ON fi.initiative_id = gr.linked_initiative_id
LEFT JOIN initiative_stories s ON s.initiative_id = gr.linked_initiative_id
WHERE gr.request_id = 'GOV-2025-005';

-- Expected:
-- - current_status: 'Ready for Governance'
-- - phase1_status: '✅ Phase 1 Complete'
-- - phase2_status: '✅ Phase 2 Complete'
-- - details_status: '✅ Details Populated'
-- - financial_status: May be '⚠️ No Financial Data' if not entered
-- - story_status: '✅ Story Created'

-- ===========================================================================
-- CHECK 7: Melissa's Updated Initiative Count
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
    WHEN gov_count >= 2 THEN '✅ PASS - Has GOV-2025-004 and GOV-2025-005'
    ELSE '⚠️ WARNING - Expected 2+ governance items, got ' || gov_count::text
  END as gov_count_status,
  CASE
    WHEN total_count >= 15 THEN '✅ PASS - Has at least 15 active initiatives'
    ELSE '⚠️ WARNING - Expected 15+, got ' || total_count::text
  END as total_count_status
FROM melissa_initiatives;

-- Expected:
-- - gov_count: Should be 2 (GOV-2025-004 + GOV-2025-005)
-- - total_count: Should be 16 (15 existing + 1 new GOV-2025-005)

-- ===========================================================================
-- CHECK 8: Verify GOV-2025-005 in System Initiatives Table
-- ===========================================================================
SELECT
  'System Initiatives Table' as audit_check,
  i.id,
  i.initiative_name,
  i.owner_name,
  i.type,
  i.status,
  i.request_id,
  i.work_effort,
  CASE
    WHEN i.initiative_name = 'Melissa - New For you'
     AND i.owner_name = 'Melissa Plummer'
     AND i.request_id = 'GOV-2025-005'
    THEN '✅ PASS - Found in System Initiatives'
    ELSE '⚠️ WARNING - Data mismatch'
  END as verification_status
FROM initiatives i
WHERE i.request_id = 'GOV-2025-005'
  AND i.status != 'Deleted';

-- Expected:
-- - Should return 1 row
-- - initiative_name: 'Melissa - New For you'
-- - owner_name: 'Melissa Plummer'
-- - type: 'System Initiative'
-- - status: 'In Progress'
-- - request_id: 'GOV-2025-005'
-- - verification_status: '✅ PASS - Found in System Initiatives'

-- ===========================================================================
-- SUMMARY: Overall Data Flow Health for GOV-2025-005
-- ===========================================================================
SELECT
  'OVERALL DATA FLOW AUDIT' as summary,
  'GOV-2025-005' as request_id,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM governance_requests gr
      JOIN initiatives i ON i.id = gr.linked_initiative_id
      WHERE gr.request_id = 'GOV-2025-005'
        AND gr.status = 'Ready for Governance'
        AND gr.assigned_sci_name = 'Melissa Plummer'
        AND i.status = 'In Progress'
        AND i.governance_request_id = gr.id
        AND i.request_id = 'GOV-2025-005'
    ) THEN '✅ PASS - Complete data flow intact'
    ELSE '❌ FAIL - Data flow broken, check individual checks above'
  END as overall_status;

-- ===========================================================================
-- BONUS: Compare GOV-2025-004 and GOV-2025-005
-- ===========================================================================
SELECT
  'Comparison' as audit_check,
  gr.request_id,
  gr.title,
  gr.submitter_name,
  gr.assigned_sci_name,
  gr.status,
  gr.work_effort,
  i.initiative_name,
  i.status as initiative_status,
  CASE WHEN fi.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_financial,
  CASE WHEN s.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_story
FROM governance_requests gr
LEFT JOIN initiatives i ON i.id = gr.linked_initiative_id
LEFT JOIN initiative_financial_impact fi ON fi.initiative_id = gr.linked_initiative_id
LEFT JOIN initiative_stories s ON s.initiative_id = gr.linked_initiative_id
WHERE gr.request_id IN ('GOV-2025-004', 'GOV-2025-005')
ORDER BY gr.request_id;

-- Shows both governance requests side-by-side for comparison
