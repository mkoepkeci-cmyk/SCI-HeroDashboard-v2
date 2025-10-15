-- Test Governance Request Data
-- Run this in Supabase SQL editor to create test governance requests

-- Test Request 1: Ready for SCI Assignment
INSERT INTO governance_requests (
  request_id,
  title,
  division_region,
  submitter_name,
  submitter_email,
  problem_statement,
  desired_outcomes,
  patient_care_value,
  compliance_regulatory_value,
  financial_impact,
  system_clinical_leader,
  target_timeline,
  estimated_scope,
  status,
  submitted_date,
  reviewed_date,
  created_at,
  updated_at
) VALUES (
  'GOV-2025-001',
  'SDOH Screening Expansion to Emergency Departments',
  'System (system-wide, all divisions)',
  'Dr. Sarah Johnson',
  'sjohnson@commonspirit.org',
  'Currently, Social Determinants of Health (SDOH) screening is only implemented in ambulatory care settings across CommonSpirit Health. Emergency departments and hospital observation departments do not systematically screen patients for SDOH factors, leading to missed opportunities for addressing social needs that contribute to health outcomes and ED utilization. This represents a system-wide gap affecting all divisions and markets.',
  '100% screening coverage across all emergency departments and hospital observation departments system-wide. Implementation of standardized SDOH screening workflow integrated into Epic ED documentation. Establishment of referral pathways to community resources in all markets. Quarterly reporting on screening rates, identified needs, and connection to resources.',
  'Systematic identification of social needs (food insecurity, housing instability, transportation barriers) in ED patients will enable targeted interventions to address root causes of health issues. Expected reduction in ED recidivism and improvement in patient outcomes through connection to community resources. Enhanced ability to provide whole-person care in alignment with CommonSpirit mission.',
  'Aligns with CMS quality measures for health-related social needs screening. Supports state-level requirements for SDOH data collection (California, Colorado). Positions organization for anticipated federal SDOH reporting requirements. Demonstrates commitment to health equity and value-based care principles.',
  500000,
  'Dr. Sarah Johnson, SVP Clinical Excellence',
  'Q1 2026 - Phased rollout by market',
  'System-wide implementation across 140+ EDs and HODs. Requires Epic build standardization, workflow training for 5000+ ED staff, and community resource database development for all markets.',
  'Ready for Governance',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '7 days',
  NOW()
);

-- Test Request 2: In Review
INSERT INTO governance_requests (
  request_id,
  title,
  division_region,
  submitter_name,
  submitter_email,
  problem_statement,
  desired_outcomes,
  patient_care_value,
  compliance_regulatory_value,
  financial_impact,
  system_clinical_leader,
  target_timeline,
  estimated_scope,
  status,
  submitted_date,
  created_at,
  updated_at
) VALUES (
  'GOV-2025-002',
  'Sepsis Protocol Standardization Across All Markets',
  'All California',
  'Dr. Michael Chen',
  'mchen@commonspirit.org',
  'California division currently has variations in sepsis screening, escalation, and treatment protocols across 29 hospitals. Lack of standardization creates inconsistency in care delivery, difficulty in measuring outcomes, and challenges with regulatory compliance. Need system-wide standardized Epic-based sepsis protocol.',
  'Single standardized sepsis screening tool implemented in Epic across all California hospitals. Automated alert system for early sepsis identification. Consistent treatment bundle activated through Epic order sets. Real-time dashboard for sepsis metric tracking.',
  'Early identification and consistent treatment of sepsis will reduce mortality rates and improve patient outcomes. Standardized approach enables better surveillance and rapid response. Expected 15% reduction in sepsis mortality through early intervention.',
  'Meets CMS SEP-1 core measure requirements for sepsis management. Aligns with California state sepsis mandates. Supports Joint Commission requirements for early sepsis recognition and treatment.',
  750000,
  'Dr. Michael Chen, CMO California Division',
  'Q2 2026',
  'Implementation across 29 California hospitals. Epic build for screening tools, order sets, and dashboards. Training for 12,000 clinical staff. Pilot at 3 hospitals before system-wide rollout.',
  'Under Review',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '4 days',
  NOW()
);

-- Test Request 3: Submitted (awaiting review)
INSERT INTO governance_requests (
  request_id,
  title,
  division_region,
  submitter_name,
  submitter_email,
  problem_statement,
  desired_outcomes,
  patient_care_value,
  system_clinical_leader,
  target_timeline,
  status,
  submitted_date,
  created_at,
  updated_at
) VALUES (
  'GOV-2025-003',
  'Pharmacy Oncology Medication Management Enhancement',
  'System (system-wide, all divisions)',
  'Lisa Martinez, PharmD',
  'lmartinez@commonspirit.org',
  'Current chemotherapy and immunotherapy ordering and administration processes lack standardization across the system. Multiple order sets, varying safety checks, and inconsistent monitoring protocols create patient safety risks and inefficiencies. Need to standardize pharmacy oncology workflows in Epic.',
  'Standardized oncology medication order sets across all CommonSpirit oncology centers. Integrated safety checks for chemotherapy dosing, renal adjustments, and drug interactions. Standardized patient monitoring protocols and documentation.',
  'Enhanced patient safety through standardized safety checks and dosing protocols. Reduced medication errors in high-risk oncology population. Improved clinical outcomes through consistent monitoring and intervention protocols.',
  'Dr. Robert Kim, SVP Pharmacy Services',
  'Q3 2026',
  'Submitted',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW()
);

-- Test Request 4: Draft (not yet submitted)
INSERT INTO governance_requests (
  request_id,
  title,
  division_region,
  submitter_name,
  submitter_email,
  problem_statement,
  desired_outcomes,
  status,
  created_at,
  updated_at
) VALUES (
  'GOV-2025-004',
  'Maternal Health Dashboard Implementation',
  'Northwest',
  'Dr. Jennifer Park',
  'jpark@commonspirit.org',
  'Northwest division lacks real-time visibility into maternal health outcomes, hemorrhage rates, and other key OB metrics.',
  'Real-time Epic dashboard showing maternal health metrics, early warning scores for hemorrhage risk, and outcome tracking.',
  'Draft',
  NOW(),
  NOW()
);

-- Show all created requests
SELECT
  request_id,
  title,
  status,
  division_region,
  submitter_name,
  created_at
FROM governance_requests
ORDER BY created_at DESC;
