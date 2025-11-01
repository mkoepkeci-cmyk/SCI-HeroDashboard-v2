-- =====================================================
-- SCI Hero Dashboard - Simple Demo Data (5 Per SCI)
-- Generated: 2025-10-31T19:38:53.732Z
-- =====================================================

-- IMPORTANT: This assumes you have cleared existing data.
-- If managers table is empty, create fake managers first.

BEGIN;

-- =====================================================
-- Managers (2 Real Managers)
-- =====================================================

INSERT INTO managers (id, first_name, last_name, email, is_active) VALUES
  ('7ba6f12e-930d-479d-bbcd-79810ea44e17', 'Carrie', 'Rodriguez', 'carrie.rodriguez@commonspirit.org', true);
INSERT INTO managers (id, first_name, last_name, email, is_active) VALUES
  ('3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', 'Tiffany', 'Shields-Tettamanti', 'tiffany.shields@commonspirit.org', true);

-- =====================================================
-- Team Members (16 Real SCIs with Specialties)
-- =====================================================

INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('8d7a0f86-3922-4d47-aed2-6900dc19fa01', 'Ashley Daily', 'Ashley', 'Daily', 'System CI', ARRAY['Nursing', 'Inpatient'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('d07a5be6-8757-4abb-a43e-e04bb60481c6', 'Brooke Snow', 'Brooke', 'Snow', 'System CI', ARRAY['Nursing', 'Inpatient'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('35caa36b-8baf-4186-b055-13ded34cfc82', 'Dawn Jacobson', 'Dawn', 'Jacobson', 'System CI', ARRAY['Inpatient', 'Nursing'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('67d90b32-5f2f-4351-842b-31c0578149aa', 'Jason Mihos', 'Jason', 'Mihos', 'System CI', ARRAY['Emergency Department', 'Perioperative'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('dcf3a885-2290-49a2-b03e-299dd2424220', 'Josh Greenwood', 'Josh', 'Greenwood', 'System CI', ARRAY['Pharmacy'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('8af8be16-1241-4f95-b1aa-a8af75436716', 'Kim Willis', 'Kim', 'Willis', 'System CI', ARRAY['Revenue Cycle', 'Perioperative'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('c186f84e-c300-4a07-871b-3bcd9c7d2405', 'Lisa Townsend', 'Lisa', 'Townsend', 'System CI', ARRAY['Nursing', 'Inpatient'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('2809a50b-2832-4aa9-9df0-80f9bba729dc', 'Marisa Raddick', 'Marisa', 'Raddick', 'System CI', ARRAY['Nursing', 'Inpatient'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('4a63bcc0-e0d6-4ab2-a116-d3524fed2a2f', 'Marty Koepke', 'Marty', 'Koepke', 'System CI', ARRAY['Ambulatory', 'Radiology'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('780f1809-a68f-4c21-8d0f-e05d31d42a8f', 'Matt Stuart', 'Matt', 'Stuart', 'System CI', ARRAY['Other'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('684e8506-b876-4503-8061-a055d244c6dc', 'Melissa Plummer', 'Melissa', 'Plummer', 'System CI', ARRAY['Nursing', 'Inpatient'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('a8685c1e-50b7-4cc1-ba14-d90fd5033d69', 'Robin Delorenzo', 'Robin', 'Delorenzo', 'System CI', ARRAY['Nursing'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('5f15ae22-55e6-44bf-91db-f1ac251c49b9', 'Sherry Brennaman', 'Sherry', 'Brennaman', 'System CI', ARRAY['Nursing', 'Inpatient'], '3dcbd637-3730-4fdc-ac6d-0ce3e1c247a5', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('dee31afc-d413-4171-bbf0-db23b13a9a8d', 'Trudy Finch', 'Trudy', 'Finch', 'System CI', ARRAY['Other'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('640eb3d5-3bd7-4a0b-afd0-059903b08ee6', 'Van Nguyen', 'Van', 'Nguyen', 'System CI', ARRAY['Pharmacy'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);
INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES
  ('aca95432-76c9-4d92-903b-68e68ac3501e', 'Yvette Kirk', 'Yvette', 'Kirk', 'System CI', ARRAY['Pharmacy'], '7ba6f12e-930d-479d-bbcd-79810ea44e17', true);

-- =====================================================
-- Initiatives (5 Per SCI = 80 Total)
-- =====================================================

INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '479c12ad-2839-47b3-b8b3-08f220f8aabd', '8d7a0f86-3922-4d47-aed2-6900dc19fa01', 'Ashley Daily',
  'Radiology Results Follow-up Workflow', 'System Initiative', 'In Progress',
  'Owner', 'M', 'Build',
  'All', 'Nursing',
  '2025-09-10',
  'Cecelia Mitchell', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve cost reduction by 82% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '977eaafa-7997-4759-adfe-e37ebecee4cc', '8d7a0f86-3922-4d47-aed2-6900dc19fa01', 'Ashley Daily',
  'Laboratory Result Notification System', 'Governance', 'In Progress',
  'Owner', 'M', 'N/A',
  'Cerner', 'Laboratory',
  '2025-09-19',
  'Ellis Kautzer', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'cad156c6-c6ff-4678-934e-adc613a37282', '8d7a0f86-3922-4d47-aed2-6900dc19fa01', 'Ashley Daily',
  'Nursing Handoff Communication Tool', 'System Initiative', 'Not Started',
  'Owner', 'XS', 'Design',
  'Epic', 'Radiology',
  '2025-08-27',
  'Cora Smitham', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'ad550d3a-2e23-462f-b387-aa2c8f878c94', '8d7a0f86-3922-4d47-aed2-6900dc19fa01', 'Ashley Daily',
  'Laboratory Result Notification System', 'Governance', 'In Progress',
  'Owner', 'M', 'N/A',
  'Cerner', 'Inpatient',
  '2025-08-03',
  'Brandi Jaskolski', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 353% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'f8f3ebd4-0225-4353-8d93-a20a04b564c1', '8d7a0f86-3922-4d47-aed2-6900dc19fa01', 'Ashley Daily',
  'Nursing Quality Metrics Dashboard', 'Governance', 'Not Started',
  'Owner', 'M', 'N/A',
  'All', 'Radiology',
  '2025-08-23',
  'Meredith Schaden', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 156% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '3f0e4219-e735-4d52-baef-25bd1a6dfa0c', 'd07a5be6-8757-4abb-a43e-e04bb60481c6', 'Brooke Snow',
  'Nursing Care Plan Integration', 'System Initiative', 'In Progress',
  'Owner', 'L', 'Validate/Test',
  'Epic', 'Nursing',
  '2025-10-29',
  'Pamela Kozey', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '39fcc434-cab7-4cac-a760-d6c26dd1fac9', 'd07a5be6-8757-4abb-a43e-e04bb60481c6', 'Brooke Snow',
  'Nursing Documentation Workflow Enhancement', 'Governance', 'In Progress',
  'Owner', 'XL', 'N/A',
  'All', 'Nursing',
  '2025-10-01',
  'Miss Victoria Marks', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve time savings by 117% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'a88c69fe-0b74-4c7d-86a2-9bd5fd194793', 'd07a5be6-8757-4abb-a43e-e04bb60481c6', 'Brooke Snow',
  'Radiology Results Follow-up Workflow', 'Governance', 'Planning',
  'Owner', 'L', 'N/A',
  'Epic', 'Inpatient',
  '2025-09-16',
  'Bernard Leuschke', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '311edbde-edee-465b-a204-4716f75a7404', 'd07a5be6-8757-4abb-a43e-e04bb60481c6', 'Brooke Snow',
  'Nursing Documentation Workflow Enhancement', 'Governance', 'Planning',
  'Owner', 'M', 'N/A',
  'Cerner', 'Nursing',
  '2025-08-12',
  'Wade Ullrich IV', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 104% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '22d590a0-3513-43c3-b446-2fc50405ac23', 'd07a5be6-8757-4abb-a43e-e04bb60481c6', 'Brooke Snow',
  'Laboratory Result Notification System', 'Governance', 'Planning',
  'Owner', 'XL', 'N/A',
  'All', 'Laboratory',
  '2025-10-31',
  'Rodney Rowe DDS', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'c257eb98-7f15-4150-8e9a-e1d36f0d7a1f', '35caa36b-8baf-4186-b055-13ded34cfc82', 'Dawn Jacobson',
  'Radiology Results Follow-up Workflow', 'Governance', 'Not Started',
  'Owner', 'S', 'N/A',
  'Epic', 'Laboratory',
  '2025-10-10',
  'Shawn Miller', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 148% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '7edde073-201d-409b-a22a-cb8f7f4f7bcc', '35caa36b-8baf-4186-b055-13ded34cfc82', 'Dawn Jacobson',
  'Radiology Results Follow-up Workflow', 'Governance', 'Planning',
  'Owner', 'L', 'N/A',
  'Cerner', 'Radiology',
  '2025-08-22',
  'Kristen Fahey', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '043b55c6-323f-4b1e-b263-97c7c5935925', '35caa36b-8baf-4186-b055-13ded34cfc82', 'Dawn Jacobson',
  'Nursing Quality Metrics Dashboard', 'System Initiative', 'In Progress',
  'Owner', 'M', 'Validate/Test',
  'Cerner', 'Inpatient',
  '2025-10-01',
  'Clay Murazik', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 100% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '67d2f712-3147-472a-919c-30e7334deffd', '35caa36b-8baf-4186-b055-13ded34cfc82', 'Dawn Jacobson',
  'Radiology Order Set Standardization', 'Governance', 'Not Started',
  'Owner', 'L', 'N/A',
  'All', 'Inpatient',
  '2025-10-27',
  'Mr. Eddie Corkery', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '45a13706-c402-4c5d-9fed-7dadec0776a7', '35caa36b-8baf-4186-b055-13ded34cfc82', 'Dawn Jacobson',
  'Nursing Handoff Communication Tool', 'System Initiative', 'Not Started',
  'Owner', 'L', 'Discovery/Define',
  'Cerner', 'Radiology',
  '2025-09-18',
  'Emanuel Haag', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 111% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'e201b53c-6010-4513-96af-21e075cf3cc9', '67d90b32-5f2f-4351-842b-31c0578149aa', 'Jason Mihos',
  'Emergency Department Triage Workflow', 'Governance', 'Not Started',
  'Owner', 'M', 'N/A',
  'All', 'Emergency Department',
  '2025-08-12',
  'Elena Donnelly', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Emergency Department operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '84ee4144-4d27-4d7d-bbd1-9f80c235e060', '67d90b32-5f2f-4351-842b-31c0578149aa', 'Jason Mihos',
  'Surgical Site Infection Prevention', 'Governance', 'Not Started',
  'Owner', 'M', 'N/A',
  'All', 'Perioperative',
  '2025-09-29',
  'Sara Pollich I', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Perioperative operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 169% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'ccdff237-551d-4a24-ac51-673b73648771', '67d90b32-5f2f-4351-842b-31c0578149aa', 'Jason Mihos',
  'Anesthesia Documentation Enhancement', 'Governance', 'Not Started',
  'Owner', 'L', 'N/A',
  'Cerner', 'Perioperative',
  '2025-08-20',
  'Dr. Gabriel Kovacek', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Perioperative operations to improve patient outcomes and operational efficiency.', 'Improve time savings by 91% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '8c98c3a9-3793-46ae-8c9a-74d66030a117', '67d90b32-5f2f-4351-842b-31c0578149aa', 'Jason Mihos',
  'ED Sepsis Bundle Implementation', 'System Initiative', 'In Progress',
  'Owner', 'L', 'Build',
  'Epic', 'Emergency Department',
  '2025-10-06',
  'Jamie Dare', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Emergency Department operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'ca4b1734-f960-4a49-bd78-961486b040b5', '67d90b32-5f2f-4351-842b-31c0578149aa', 'Jason Mihos',
  'Emergency Department Triage Workflow', 'System Initiative', 'Planning',
  'Owner', 'XL', 'N/A',
  'Cerner', 'Emergency Department',
  '2025-08-15',
  'Melanie Konopelski', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Emergency Department operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 464% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'e6f9c119-d31f-4012-917a-29c55355faa2', 'dcf3a885-2290-49a2-b03e-299dd2424220', 'Josh Greenwood',
  'Pharmacy Order Set Standardization', 'Governance', 'Planning',
  'Owner', 'L', 'N/A',
  'All', 'Pharmacy',
  '2025-09-20',
  'Antonia Strosin', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 65% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'bf878646-52af-4586-b1da-cb586282a359', 'dcf3a885-2290-49a2-b03e-299dd2424220', 'Josh Greenwood',
  'Pharmacy Order Set Standardization', 'System Initiative', 'Planning',
  'Owner', 'XL', 'Design',
  'Cerner', 'Pharmacy',
  '2025-08-20',
  'Eduardo Hessel', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 54% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '63387640-143d-4d09-b622-f793ea00f105', 'dcf3a885-2290-49a2-b03e-299dd2424220', 'Josh Greenwood',
  'Medication Safety BPA Implementation', 'System Initiative', 'In Progress',
  'Owner', 'XL', 'Discovery/Define',
  'Cerner', 'Pharmacy',
  '2025-09-29',
  'Phil Crona', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '0a9d7c83-7f98-4233-b942-5a5e0e847eb1', 'dcf3a885-2290-49a2-b03e-299dd2424220', 'Josh Greenwood',
  'Pharmacy Dosing Protocols', 'System Initiative', 'In Progress',
  'Owner', 'L', 'Deploy',
  'Epic', 'Pharmacy',
  '2025-10-25',
  'Martha Wuckert', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 71% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '4d6c6e74-a1a1-4fd3-8393-88fa05623003', 'dcf3a885-2290-49a2-b03e-299dd2424220', 'Josh Greenwood',
  'Medication Reconciliation Workflow Enhancement', 'Governance', 'Planning',
  'Owner', 'XL', 'N/A',
  'Cerner', 'Pharmacy',
  '2025-10-20',
  'Chris Rutherford', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'fb81a57e-07d2-4c99-84bb-e98adb1e81ec', '8af8be16-1241-4f95-b1aa-a8af75436716', 'Kim Willis',
  'Billing Compliance Monitoring', 'System Initiative', 'Not Started',
  'Owner', 'XS', 'Validate/Test',
  'All', 'Revenue Cycle',
  '2025-09-28',
  'Preston Schaefer', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Revenue Cycle operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '42ca8600-f321-4fd1-9dc1-25b851710fe8', '8af8be16-1241-4f95-b1aa-a8af75436716', 'Kim Willis',
  'Revenue Cycle Documentation Improvement', 'System Initiative', 'Not Started',
  'Owner', 'S', 'Build',
  'Cerner', 'Revenue Cycle',
  '2025-08-09',
  'Jamie Vandervort', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Revenue Cycle operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 71% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '566ad1c7-77da-4f68-8472-27bdd5d571c9', '8af8be16-1241-4f95-b1aa-a8af75436716', 'Kim Willis',
  'Denials Management System', 'Governance', 'Not Started',
  'Owner', 'L', 'N/A',
  'Epic', 'Revenue Cycle',
  '2025-10-14',
  'Yvonne Doyle', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Revenue Cycle operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'd3775529-15de-491b-a258-037325112eb4', '8af8be16-1241-4f95-b1aa-a8af75436716', 'Kim Willis',
  'Revenue Integrity Dashboard', 'Governance', 'Planning',
  'Owner', 'M', 'N/A',
  'Cerner', 'Perioperative',
  '2025-09-04',
  'Casey Olson', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Perioperative operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 84% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '71663d7c-d051-4576-9c3b-1af3447ab56a', '8af8be16-1241-4f95-b1aa-a8af75436716', 'Kim Willis',
  'Billing Compliance Monitoring', 'Governance', 'Not Started',
  'Owner', 'S', 'N/A',
  'Cerner', 'Perioperative',
  '2025-09-22',
  'Pete Nader', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Perioperative operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'c78a3d85-89d8-4fee-8b67-f005c6cb3def', 'c186f84e-c300-4a07-871b-3bcd9c7d2405', 'Lisa Townsend',
  'Nursing Quality Metrics Dashboard', 'Governance', 'In Progress',
  'Owner', 'XL', 'N/A',
  'Epic', 'Nursing',
  '2025-08-23',
  'Mr. Ernest Gleichner', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '659fdfa8-95c3-4dc7-b640-e104ff3848ab', 'c186f84e-c300-4a07-871b-3bcd9c7d2405', 'Lisa Townsend',
  'Pressure Injury Prevention Protocol', 'Governance', 'In Progress',
  'Owner', 'XS', 'N/A',
  'Epic', 'Laboratory',
  '2025-09-25',
  'Roger Ebert', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 152% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '8f7c42ab-5f6d-409c-8804-aaf16ba6cfd7', 'c186f84e-c300-4a07-871b-3bcd9c7d2405', 'Lisa Townsend',
  'Fall Prevention Assessment Tool', 'System Initiative', 'In Progress',
  'Owner', 'L', 'N/A',
  'All', 'Inpatient',
  '2025-10-18',
  'Santiago Lockman', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve cost reduction by 104% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '244689db-813c-4ba8-98e3-e91b8a4a7196', 'c186f84e-c300-4a07-871b-3bcd9c7d2405', 'Lisa Townsend',
  'Nursing Documentation Workflow Enhancement', 'Governance', 'Planning',
  'Owner', 'XS', 'N/A',
  'All', 'Radiology',
  '2025-10-23',
  'Madeline Ward', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '3f552ba1-6c65-445b-9ff5-913fe6475c6d', 'c186f84e-c300-4a07-871b-3bcd9c7d2405', 'Lisa Townsend',
  'Radiology Results Follow-up Workflow', 'Governance', 'In Progress',
  'Owner', 'M', 'N/A',
  'Cerner', 'Inpatient',
  '2025-10-05',
  'Roderick Cormier', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'efbbf5a8-6d00-4e62-b5aa-b32b3e12d75e', '2809a50b-2832-4aa9-9df0-80f9bba729dc', 'Marisa Raddick',
  'Nursing Handoff Communication Tool', 'Governance', 'Not Started',
  'Owner', 'M', 'N/A',
  'All', 'Laboratory',
  '2025-09-15',
  'Rosa Friesen', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 156% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'e9ac468d-aa04-4f6c-ac39-ee96b99c0e17', '2809a50b-2832-4aa9-9df0-80f9bba729dc', 'Marisa Raddick',
  'Nursing Handoff Communication Tool', 'System Initiative', 'Not Started',
  'Owner', 'XS', 'Validate/Test',
  'Cerner', 'Radiology',
  '2025-10-24',
  'Mrs. Angela Wehner DDS', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve time savings by 273% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '40c5d46f-11c5-4933-83e5-f3d3475dda88', '2809a50b-2832-4aa9-9df0-80f9bba729dc', 'Marisa Raddick',
  'Radiology Results Follow-up Workflow', 'System Initiative', 'In Progress',
  'Owner', 'XS', 'Discovery/Define',
  'All', 'Laboratory',
  '2025-09-05',
  'Louis Reynolds', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '0c7cfdda-b1e1-4ce7-9524-6cd963414d1c', '2809a50b-2832-4aa9-9df0-80f9bba729dc', 'Marisa Raddick',
  'Nursing Handoff Communication Tool', 'System Initiative', 'Not Started',
  'Owner', 'S', 'Validate/Test',
  'Epic', 'Radiology',
  '2025-08-09',
  'Mr. Leonard Lynch', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'f11c4b7b-69e0-4fe9-bb2b-0cc72a8ee9d8', '2809a50b-2832-4aa9-9df0-80f9bba729dc', 'Marisa Raddick',
  'Nursing Care Plan Integration', 'System Initiative', 'In Progress',
  'Owner', 'XS', 'Discovery/Define',
  'Cerner', 'Inpatient',
  '2025-10-23',
  'Randolph Witting', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 116% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '74fe9591-c0d3-47b5-a656-b091ea68d56d', '4a63bcc0-e0d6-4ab2-a116-d3524fed2a2f', 'Marty Koepke',
  'Patient Health Assessment Integration', 'System Initiative', 'Not Started',
  'Owner', 'S', 'Deploy',
  'All', 'Ambulatory',
  '2025-10-27',
  'Johnnie Champlin', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Ambulatory operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 51% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '2d72ac77-3554-42af-962a-15744ef86835', '4a63bcc0-e0d6-4ab2-a116-d3524fed2a2f', 'Marty Koepke',
  'Patient Health Assessment Integration', 'System Initiative', 'Not Started',
  'Owner', 'XL', 'Validate/Test',
  'Epic', 'Ambulatory',
  '2025-10-04',
  'Lana Boyle III', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Ambulatory operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'c5e8dba5-6a83-4c00-afff-4a293204a494', '4a63bcc0-e0d6-4ab2-a116-d3524fed2a2f', 'Marty Koepke',
  'Depression Screening PHQ-9 Integration', 'Governance', 'Planning',
  'Owner', 'S', 'N/A',
  'All', 'Ambulatory',
  '2025-09-01',
  'Homer Hintz', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Ambulatory operations to improve patient outcomes and operational efficiency.', 'Improve cost reduction by 194% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'efd03071-d730-42ba-b6e6-8ca88fbece71', '4a63bcc0-e0d6-4ab2-a116-d3524fed2a2f', 'Marty Koepke',
  'Medicare Annual Wellness Visit Protocol', 'Governance', 'In Progress',
  'Owner', 'XL', 'N/A',
  'All', 'Ambulatory',
  '2025-08-06',
  'Brenda Prohaska-Kulas', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Ambulatory operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 414% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'c74c3708-9cdf-413c-82dd-f6db2f343512', '4a63bcc0-e0d6-4ab2-a116-d3524fed2a2f', 'Marty Koepke',
  'Ambulatory Care Coordination Workflow', 'Governance', 'Planning',
  'Owner', 'XS', 'N/A',
  'Epic', 'Ambulatory',
  '2025-08-27',
  'Terence Corkery', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Ambulatory operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'e3f81be6-642a-4c38-b485-99d00cbc7088', '780f1809-a68f-4c21-8d0f-e05d31d42a8f', 'Matt Stuart',
  'Radiology Results Follow-up Workflow', 'Governance', 'Not Started',
  'Owner', 'M', 'N/A',
  'Cerner', 'Radiology',
  '2025-09-11',
  'Abel Klein', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'bd32d760-6c20-4076-8302-cdc89a6d3ac4', '780f1809-a68f-4c21-8d0f-e05d31d42a8f', 'Matt Stuart',
  'Nursing Quality Metrics Dashboard', 'Governance', 'In Progress',
  'Owner', 'XS', 'N/A',
  'Cerner', 'Radiology',
  '2025-08-10',
  'Patti Goodwin', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'd1c7c5d2-2cd1-46d0-b96f-339be4884a6d', '780f1809-a68f-4c21-8d0f-e05d31d42a8f', 'Matt Stuart',
  'Nursing Care Plan Integration', 'Governance', 'In Progress',
  'Owner', 'S', 'N/A',
  'All', 'Inpatient',
  '2025-10-06',
  'Mr. Damon McGlynn', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 109% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '3a084820-161b-4bc1-a1ee-4b33c626861f', '780f1809-a68f-4c21-8d0f-e05d31d42a8f', 'Matt Stuart',
  'Lab Critical Value Alert System', 'Governance', 'In Progress',
  'Owner', 'XS', 'N/A',
  'Cerner', 'Nursing',
  '2025-10-06',
  'Dr. Carrie Douglas', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '2cf002b0-d5b8-481a-8d6b-de977333572b', '780f1809-a68f-4c21-8d0f-e05d31d42a8f', 'Matt Stuart',
  'Radiology Results Follow-up Workflow', 'Governance', 'In Progress',
  'Owner', 'M', 'N/A',
  'Epic', 'Laboratory',
  '2025-09-08',
  'Peggy Hyatt DDS', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve cost reduction by 200% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'a7dae35a-410b-46fb-b2af-288be5081469', '684e8506-b876-4503-8061-a055d244c6dc', 'Melissa Plummer',
  'Laboratory Result Notification System', 'System Initiative', 'Planning',
  'Owner', 'XL', 'Build',
  'Cerner', 'Inpatient',
  '2025-09-07',
  'Heidi Hermiston', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 335% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'eb69e5e7-6d3d-419a-9e0c-55fdb1dc97b1', '684e8506-b876-4503-8061-a055d244c6dc', 'Melissa Plummer',
  'Radiology Order Set Standardization', 'Governance', 'Not Started',
  'Owner', 'XL', 'N/A',
  'All', 'Nursing',
  '2025-09-29',
  'Derrick Dare', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 200% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '2b7b0edc-b8da-4b65-9bb8-7512b502e178', '684e8506-b876-4503-8061-a055d244c6dc', 'Melissa Plummer',
  'Nursing Quality Metrics Dashboard', 'Governance', 'Planning',
  'Owner', 'M', 'N/A',
  'Epic', 'Laboratory',
  '2025-09-09',
  'Darin Considine DVM', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'e798f4ef-ed14-496f-92a2-949d34f8d020', '684e8506-b876-4503-8061-a055d244c6dc', 'Melissa Plummer',
  'Nursing Quality Metrics Dashboard', 'Governance', 'Not Started',
  'Owner', 'M', 'N/A',
  'All', 'Nursing',
  '2025-08-11',
  'Wm Mohr', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve time savings by 185% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '1a3ca24f-124e-4823-9fc7-9d4ed4e2ddf8', '684e8506-b876-4503-8061-a055d244c6dc', 'Melissa Plummer',
  'Nursing Handoff Communication Tool', 'System Initiative', 'In Progress',
  'Owner', 'M', 'Validate/Test',
  'Epic', 'Radiology',
  '2025-09-03',
  'Shannon Lind', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '53c7d2dc-c128-4714-a372-fe5303fd7283', 'a8685c1e-50b7-4cc1-ba14-d90fd5033d69', 'Robin Delorenzo',
  'Lab Critical Value Alert System', 'Governance', 'Planning',
  'Owner', 'XL', 'N/A',
  'All', 'Inpatient',
  '2025-08-10',
  'Dana Gleichner', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '9e3df543-9541-4909-a1c2-477ccc4b911d', 'a8685c1e-50b7-4cc1-ba14-d90fd5033d69', 'Robin Delorenzo',
  'Radiology Order Set Standardization', 'Governance', 'Planning',
  'Owner', 'XL', 'N/A',
  'Cerner', 'Nursing',
  '2025-10-08',
  'Janet Hilll', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '80ea0dbd-3a4e-450f-ab5a-fe2932076347', 'a8685c1e-50b7-4cc1-ba14-d90fd5033d69', 'Robin Delorenzo',
  'Radiology Order Set Standardization', 'Governance', 'Not Started',
  'Owner', 'XS', 'N/A',
  'Epic', 'Radiology',
  '2025-08-31',
  'Johnnie Thiel', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 183% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '1d9ea4fc-05a9-49e1-a582-f76984a4aa50', 'a8685c1e-50b7-4cc1-ba14-d90fd5033d69', 'Robin Delorenzo',
  'Radiology Results Follow-up Workflow', 'System Initiative', 'In Progress',
  'Owner', 'XS', 'Validate/Test',
  'All', 'Nursing',
  '2025-08-09',
  'Don Prosacco', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '215f7cf6-c10d-4dba-9505-c58b36ee2826', 'a8685c1e-50b7-4cc1-ba14-d90fd5033d69', 'Robin Delorenzo',
  'Radiology Results Follow-up Workflow', 'Governance', 'Not Started',
  'Owner', 'S', 'N/A',
  'Epic', 'Radiology',
  '2025-10-28',
  'Manuel Hyatt', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '64c075b4-e715-45d5-9a37-38fa91622f99', '5f15ae22-55e6-44bf-91db-f1ac251c49b9', 'Sherry Brennaman',
  'Nursing Handoff Communication Tool', 'System Initiative', 'Planning',
  'Owner', 'L', 'Design',
  'All', 'Radiology',
  '2025-10-13',
  'June Mayer', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Radiology operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '818a067b-154f-4801-80a5-0b7ca335ff71', '5f15ae22-55e6-44bf-91db-f1ac251c49b9', 'Sherry Brennaman',
  'Nursing Care Plan Integration', 'System Initiative', 'Planning',
  'Owner', 'L', 'Deploy',
  'Cerner', 'Inpatient',
  '2025-09-02',
  'Jana Christiansen', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'a1606f91-7802-49ab-88d2-e95cde28750f', '5f15ae22-55e6-44bf-91db-f1ac251c49b9', 'Sherry Brennaman',
  'Nursing Documentation Workflow Enhancement', 'Governance', 'Not Started',
  'Owner', 'M', 'N/A',
  'Epic', 'Inpatient',
  '2025-08-07',
  'Blanche Dietrich', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '2bcb0648-2b3b-4cf9-a1d3-99421c76ffb5', '5f15ae22-55e6-44bf-91db-f1ac251c49b9', 'Sherry Brennaman',
  'Radiology Results Follow-up Workflow', 'System Initiative', 'Not Started',
  'Owner', 'S', 'Build',
  'Cerner', 'Nursing',
  '2025-08-01',
  'Misty Reilly', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '92c6cf12-3807-45e6-a683-cae592a012b2', '5f15ae22-55e6-44bf-91db-f1ac251c49b9', 'Sherry Brennaman',
  'Pressure Injury Prevention Protocol', 'System Initiative', 'Not Started',
  'Owner', 'XS', 'Validate/Test',
  'All', 'Nursing',
  '2025-09-18',
  'Dan Kunde', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'b1fc7896-1928-4f2f-a751-74b89b8b5f04', 'dee31afc-d413-4171-bbf0-db23b13a9a8d', 'Trudy Finch',
  'Nursing Documentation Workflow Enhancement', 'Governance', 'In Progress',
  'Owner', 'XS', 'N/A',
  'Cerner', 'Laboratory',
  '2025-08-29',
  'Barry Zemlak IV', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Laboratory operations to improve patient outcomes and operational efficiency.', 'Improve time savings by 153% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'd2eae996-c83c-4074-bf4d-62a7d368ad7f', 'dee31afc-d413-4171-bbf0-db23b13a9a8d', 'Trudy Finch',
  'Lab Critical Value Alert System', 'System Initiative', 'Planning',
  'Owner', 'M', 'Validate/Test',
  'All', 'Inpatient',
  '2025-09-09',
  'Winston Shields', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve time savings by 433% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '3ede0feb-3bfc-4696-81cb-048280d2c33d', 'dee31afc-d413-4171-bbf0-db23b13a9a8d', 'Trudy Finch',
  'Lab Critical Value Alert System', 'System Initiative', 'Planning',
  'Owner', 'XL', 'Validate/Test',
  'All', 'Nursing',
  '2025-10-08',
  'Amy Bednar', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Nursing operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 467% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'f39ffe5f-8a8f-44c9-82fd-ae38bf12e893', 'dee31afc-d413-4171-bbf0-db23b13a9a8d', 'Trudy Finch',
  'Nursing Care Plan Integration', 'Governance', 'Not Started',
  'Owner', 'XS', 'N/A',
  'All', 'Inpatient',
  '2025-09-06',
  'Mrs. Lillian Corwin', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '363cf52f-f5c4-4678-b685-692449765b9c', 'dee31afc-d413-4171-bbf0-db23b13a9a8d', 'Trudy Finch',
  'Lab Critical Value Alert System', 'System Initiative', 'Planning',
  'Owner', 'S', 'Discovery/Define',
  'All', 'Inpatient',
  '2025-08-22',
  'Dave Gibson', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Inpatient operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 67% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '546960ce-335b-4685-ae39-01cc782fa7ca', '640eb3d5-3bd7-4a0b-afd0-059903b08ee6', 'Van Nguyen',
  'Drug-Drug Interaction Alert Optimization', 'Governance', 'Planning',
  'Owner', 'XS', 'N/A',
  'Cerner', 'Pharmacy',
  '2025-10-20',
  'Jon Emard', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'bcd9b3de-84e8-43a7-949d-81d8955bba4a', '640eb3d5-3bd7-4a0b-afd0-059903b08ee6', 'Van Nguyen',
  'IV to PO Conversion Protocol', 'Governance', 'In Progress',
  'Owner', 'S', 'N/A',
  'All', 'Pharmacy',
  '2025-09-12',
  'Arlene Nicolas', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'e879cb6d-f45a-4a84-a799-7aadd820b5ef', '640eb3d5-3bd7-4a0b-afd0-059903b08ee6', 'Van Nguyen',
  'IV to PO Conversion Protocol', 'Governance', 'In Progress',
  'Owner', 'XS', 'N/A',
  'Cerner', 'Pharmacy',
  '2025-10-30',
  'Ron Mann', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve cost reduction by 268% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'bfa16b64-807f-4666-bec3-2e72f08887c7', '640eb3d5-3bd7-4a0b-afd0-059903b08ee6', 'Van Nguyen',
  'Controlled Substance Monitoring System', 'Governance', 'Planning',
  'Owner', 'XS', 'N/A',
  'All', 'Pharmacy',
  '2025-10-30',
  'Johanna Veum DDS', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve adoption rate by 77% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '96993706-3ebf-4851-97aa-54f993264f07', '640eb3d5-3bd7-4a0b-afd0-059903b08ee6', 'Van Nguyen',
  'Medication Safety BPA Implementation', 'Governance', 'In Progress',
  'Owner', 'XL', 'N/A',
  'Cerner', 'Pharmacy',
  '2025-10-11',
  'Kyle Von Sr.', 'MD',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 100% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '28ceb8fa-a488-4460-850c-97e15e506a5f', 'aca95432-76c9-4d92-903b-68e68ac3501e', 'Yvette Kirk',
  'Pharmacy Order Set Standardization', 'System Initiative', 'In Progress',
  'Owner', 'S', 'Design',
  'Cerner', 'Pharmacy',
  '2025-08-30',
  'Isaac Hammes', 'DO',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '8c69bb2e-d3f4-4224-9d8a-95b12d187c17', 'aca95432-76c9-4d92-903b-68e68ac3501e', 'Yvette Kirk',
  'Medication Safety BPA Implementation', 'Governance', 'Planning',
  'Owner', 'M', 'N/A',
  'All', 'Pharmacy',
  '2025-10-09',
  'Mr. Al Hamill', 'RN MSN',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve quality score by 116% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  '12a948ef-a765-420e-ac01-cf0ced43f25d', 'aca95432-76c9-4d92-903b-68e68ac3501e', 'Yvette Kirk',
  'Pharmacy Dosing Protocols', 'Governance', 'In Progress',
  'Owner', 'S', 'N/A',
  'Epic', 'Pharmacy',
  '2025-09-17',
  'Archie Lebsack', 'PharmD',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'ff020f37-d62d-4955-bcec-1727296d4acc', 'aca95432-76c9-4d92-903b-68e68ac3501e', 'Yvette Kirk',
  'Pharmacy Order Set Standardization', 'System Initiative', 'In Progress',
  'Owner', 'M', 'Validate/Test',
  'Cerner', 'Pharmacy',
  '2025-09-29',
  'Calvin Reynolds', 'VP Clinical Operations',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);
INSERT INTO initiatives (
  id, team_member_id, owner_name, initiative_name, type, status, role,
  work_effort, phase, ehrs_impacted, service_line, start_date,
  clinical_sponsor_name, clinical_sponsor_title,
  problem_statement, desired_outcomes, is_active
) VALUES (
  'c8c7ba02-bc38-4205-bc8e-7f7da1179f8c', 'aca95432-76c9-4d92-903b-68e68ac3501e', 'Yvette Kirk',
  'Medication Reconciliation Workflow Enhancement', 'Governance', 'Planning',
  'Owner', 'M', 'N/A',
  'Epic', 'Pharmacy',
  '2025-09-17',
  'Bruce Zulauf', 'Director of Nursing',
  'Addressing workflow inefficiencies and quality gaps in Pharmacy operations to improve patient outcomes and operational efficiency.', 'Improve operational efficiency by 25% within 6 months.',
  true
);

-- =====================================================
-- Initiative Metrics (50% of initiatives)
-- =====================================================

INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('479c12ad-2839-47b3-b8b3-08f220f8aabd', 'Cost Reduction', 'Financial', 56, 100, 102, 'Points', '+79%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('ad550d3a-2e23-462f-b387-aa2c8f878c94', 'Adoption Rate', 'Adoption', 19, 71, 86, 'Percentage', '+274%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('f8f3ebd4-0225-4353-8d93-a20a04b564c1', 'Adoption Rate', 'Adoption', 34, 79, 87, 'Points', '+132%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('39fcc434-cab7-4cac-a760-d6c26dd1fac9', 'Time Savings', 'Efficiency', 53, 82, 115, 'Points', '+55%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('311edbde-edee-465b-a204-4716f75a7404', 'Adoption Rate', 'Adoption', 53, 104, 108, 'Minutes', '+96%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('c257eb98-7f15-4150-8e9a-e1d36f0d7a1f', 'Adoption Rate', 'Adoption', 46, 55, 114, 'Minutes', '+20%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('043b55c6-323f-4b1e-b263-97c7c5935925', 'Adoption Rate', 'Adoption', 42, 83, 84, 'Minutes', '+98%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('45a13706-c402-4c5d-9fed-7dadec0776a7', 'Quality Score', 'Quality', 47, 84, 99, 'Minutes', '+79%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('84ee4144-4d27-4d7d-bbd1-9f80c235e060', 'Adoption Rate', 'Adoption', 36, 51, 97, 'Dollars', '+42%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('ccdff237-551d-4a24-ac51-673b73648771', 'Time Savings', 'Efficiency', 46, 66, 88, 'Dollars', '+43%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('ca4b1734-f960-4a49-bd78-961486b040b5', 'Quality Score', 'Quality', 14, 56, 79, 'Dollars', '+300%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('e6f9c119-d31f-4012-917a-29c55355faa2', 'Quality Score', 'Quality', 34, 46, 56, 'Points', '+35%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('bf878646-52af-4586-b1da-cb586282a359', 'Adoption Rate', 'Adoption', 54, 77, 83, 'Points', '+43%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('0a9d7c83-7f98-4233-b942-5a5e0e847eb1', 'Quality Score', 'Quality', 41, 41, 70, 'Percentage', '0%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('42ca8600-f321-4fd1-9dc1-25b851710fe8', 'Adoption Rate', 'Adoption', 56, 74, 96, 'Points', '+32%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('d3775529-15de-491b-a258-037325112eb4', 'Adoption Rate', 'Adoption', 49, 89, 90, 'Dollars', '+82%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('659fdfa8-95c3-4dc7-b640-e104ff3848ab', 'Quality Score', 'Quality', 31, 47, 78, 'Points', '+52%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('8f7c42ab-5f6d-409c-8804-aaf16ba6cfd7', 'Cost Reduction', 'Financial', 56, 72, 114, 'Dollars', '+29%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('efbbf5a8-6d00-4e62-b5aa-b32b3e12d75e', 'Adoption Rate', 'Adoption', 27, 43, 69, 'Points', '+59%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('e9ac468d-aa04-4f6c-ac39-ee96b99c0e17', 'Time Savings', 'Efficiency', 15, 49, 56, 'Percentage', '+227%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('f11c4b7b-69e0-4fe9-bb2b-0cc72a8ee9d8', 'Quality Score', 'Quality', 37, 37, 80, 'Minutes', '0%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('74fe9591-c0d3-47b5-a656-b091ea68d56d', 'Quality Score', 'Quality', 43, 45, 65, 'Minutes', '+5%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('c5e8dba5-6a83-4c00-afff-4a293204a494', 'Cost Reduction', 'Financial', 35, 71, 103, 'Dollars', '+103%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('efd03071-d730-42ba-b6e6-8ca88fbece71', 'Quality Score', 'Quality', 14, 40, 72, 'Points', '+186%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('d1c7c5d2-2cd1-46d0-b96f-339be4884a6d', 'Quality Score', 'Quality', 46, 46, 96, 'Minutes', '0%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('2cf002b0-d5b8-481a-8d6b-de977333572b', 'Cost Reduction', 'Financial', 30, 33, 90, 'Minutes', '+10%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('a7dae35a-410b-46fb-b2af-288be5081469', 'Adoption Rate', 'Adoption', 20, 48, 87, 'Points', '+140%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('eb69e5e7-6d3d-419a-9e0c-55fdb1dc97b1', 'Quality Score', 'Quality', 11, 31, 33, 'Minutes', '+182%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('e798f4ef-ed14-496f-92a2-949d34f8d020', 'Time Savings', 'Efficiency', 20, 20, 57, 'Percentage', '0%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('80ea0dbd-3a4e-450f-ab5a-fe2932076347', 'Adoption Rate', 'Adoption', 24, 51, 68, 'Dollars', '+113%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('b1fc7896-1928-4f2f-a751-74b89b8b5f04', 'Time Savings', 'Efficiency', 40, 45, 101, 'Points', '+13%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('d2eae996-c83c-4074-bf4d-62a7d368ad7f', 'Time Savings', 'Efficiency', 12, 52, 64, 'Points', '+333%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('3ede0feb-3bfc-4696-81cb-048280d2c33d', 'Adoption Rate', 'Adoption', 12, 13, 68, 'Minutes', '+8%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('363cf52f-f5c4-4678-b685-692449765b9c', 'Quality Score', 'Quality', 33, 39, 55, 'Dollars', '+18%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('e879cb6d-f45a-4a84-a799-7aadd820b5ef', 'Cost Reduction', 'Financial', 19, 63, 70, 'Minutes', '+232%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('bfa16b64-807f-4666-bec3-2e72f08887c7', 'Adoption Rate', 'Adoption', 48, 79, 85, 'Points', '+65%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('96993706-3ebf-4851-97aa-54f993264f07', 'Quality Score', 'Quality', 46, 47, 92, 'Percentage', '+2%');
INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES
  ('8c69bb2e-d3f4-4224-9d8a-95b12d187c17', 'Quality Score', 'Quality', 51, 70, 110, 'Minutes', '+37%');

-- =====================================================
-- Financial Impact (60% of initiatives)
-- =====================================================

INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('977eaafa-7997-4759-adfe-e37ebecee4cc', 998885, 'Revenue projection based on user adoption across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('39fcc434-cab7-4cac-a760-d6c26dd1fac9', 1285576, 'Revenue projection based on efficiency gains across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('a88c69fe-0b74-4c7d-86a2-9bd5fd194793', 697813, 'Revenue projection based on user adoption across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('22d590a0-3513-43c3-b446-2fc50405ac23', 1673077, 'Revenue projection based on efficiency gains across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('c257eb98-7f15-4150-8e9a-e1d36f0d7a1f', 543898, 'Revenue projection based on user adoption across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('043b55c6-323f-4b1e-b263-97c7c5935925', 142388, 'Revenue projection based on cost savings across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('67d2f712-3147-472a-919c-30e7334deffd', 708998, 'Revenue projection based on quality improvements across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('ca4b1734-f960-4a49-bd78-961486b040b5', 284433, 'Revenue projection based on user adoption across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('fb81a57e-07d2-4c99-84bb-e98adb1e81ec', 2076711, 'Revenue projection based on user adoption across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('42ca8600-f321-4fd1-9dc1-25b851710fe8', 1124613, 'Revenue projection based on efficiency gains across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('566ad1c7-77da-4f68-8472-27bdd5d571c9', 1389551, 'Revenue projection based on quality improvements across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('d3775529-15de-491b-a258-037325112eb4', 1929475, 'Revenue projection based on cost savings across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('71663d7c-d051-4576-9c3b-1af3447ab56a', 561784, 'Revenue projection based on efficiency gains across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('c78a3d85-89d8-4fee-8b67-f005c6cb3def', 1881791, 'Revenue projection based on user adoption across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('659fdfa8-95c3-4dc7-b640-e104ff3848ab', 1657722, 'Revenue projection based on cost savings across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('3f552ba1-6c65-445b-9ff5-913fe6475c6d', 1597040, 'Revenue projection based on user adoption across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('efbbf5a8-6d00-4e62-b5aa-b32b3e12d75e', 1309053, 'Revenue projection based on cost savings across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('e9ac468d-aa04-4f6c-ac39-ee96b99c0e17', 1838589, 'Revenue projection based on cost savings across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('40c5d46f-11c5-4933-83e5-f3d3475dda88', 645172, 'Revenue projection based on user adoption across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('f11c4b7b-69e0-4fe9-bb2b-0cc72a8ee9d8', 1742710, 'Revenue projection based on user adoption across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('74fe9591-c0d3-47b5-a656-b091ea68d56d', 1695661, 'Revenue projection based on cost savings across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('2d72ac77-3554-42af-962a-15744ef86835', 645877, 'Revenue projection based on user adoption across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('efd03071-d730-42ba-b6e6-8ca88fbece71', 2017002, 'Revenue projection based on efficiency gains across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('bd32d760-6c20-4076-8302-cdc89a6d3ac4', 1077724, 'Revenue projection based on efficiency gains across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('d1c7c5d2-2cd1-46d0-b96f-339be4884a6d', 518290, 'Revenue projection based on user adoption across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('3a084820-161b-4bc1-a1ee-4b33c626861f', 1268018, 'Revenue projection based on efficiency gains across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('2cf002b0-d5b8-481a-8d6b-de977333572b', 841656, 'Revenue projection based on quality improvements across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('eb69e5e7-6d3d-419a-9e0c-55fdb1dc97b1', 566412, 'Revenue projection based on quality improvements across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('2b7b0edc-b8da-4b65-9bb8-7512b502e178', 1317292, 'Revenue projection based on efficiency gains across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('e798f4ef-ed14-496f-92a2-949d34f8d020', 1370643, 'Revenue projection based on quality improvements across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('1a3ca24f-124e-4823-9fc7-9d4ed4e2ddf8', 140518, 'Revenue projection based on efficiency gains across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('53c7d2dc-c128-4714-a372-fe5303fd7283', 112961, 'Revenue projection based on user adoption across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('9e3df543-9541-4909-a1c2-477ccc4b911d', 688006, 'Revenue projection based on cost savings across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('1d9ea4fc-05a9-49e1-a582-f76984a4aa50', 720266, 'Revenue projection based on quality improvements across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('215f7cf6-c10d-4dba-9505-c58b36ee2826', 1944006, 'Revenue projection based on quality improvements across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('64c075b4-e715-45d5-9a37-38fa91622f99', 1521025, 'Revenue projection based on quality improvements across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('2bcb0648-2b3b-4cf9-a1d3-99421c76ffb5', 1953977, 'Revenue projection based on efficiency gains across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('92c6cf12-3807-45e6-a683-cae592a012b2', 1951802, 'Revenue projection based on user adoption across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('b1fc7896-1928-4f2f-a751-74b89b8b5f04', 130275, 'Revenue projection based on user adoption across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('3ede0feb-3bfc-4696-81cb-048280d2c33d', 1216142, 'Revenue projection based on cost savings across division deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('f39ffe5f-8a8f-44c9-82fd-ae38bf12e893', 1084534, 'Revenue projection based on cost savings across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('363cf52f-f5c4-4678-b685-692449765b9c', 1601450, 'Revenue projection based on quality improvements across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('546960ce-335b-4685-ae39-01cc782fa7ca', 1316889, 'Revenue projection based on cost savings across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('e879cb6d-f45a-4a84-a799-7aadd820b5ef', 1526625, 'Revenue projection based on cost savings across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('28ceb8fa-a488-4460-850c-97e15e506a5f', 1527384, 'Revenue projection based on quality improvements across market deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('12a948ef-a765-420e-ac01-cf0ced43f25d', 1151005, 'Revenue projection based on user adoption across system-wide deployment.');
INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES
  ('ff020f37-d62d-4955-bcec-1727296d4acc', 884903, 'Revenue projection based on cost savings across system-wide deployment.');

-- =====================================================
-- Governance Requests (8 Sample Requests)
-- =====================================================

INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
) VALUES (
  '005cef7d-76d4-426b-8bca-d58d1c1fe1be', 'GOV-2025-100', 'General Clinical Informatics Consultation Request',
  'Luke Mayer', 'Claire_Haley76@gmail.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Revenue Cycle.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'Ready for Governance', NOW() - INTERVAL '11 days'
);
INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
, assigned_sci_id, assigned_sci_name, assigned_role, work_effort
) VALUES (
  '0e83b787-46c0-44a4-9f43-b510eeefb5c9', 'GOV-2025-101', 'IV to PO Conversion Protocol',
  'Lola Kerluke', 'Addison68@hotmail.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Pharmacy.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'Ready for Governance', NOW() - INTERVAL '16 days'
  , '640eb3d5-3bd7-4a0b-afd0-059903b08ee6', 'Van Nguyen', 'Owner', 'XS'
);
INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
, assigned_sci_id, assigned_sci_name, assigned_role, work_effort
) VALUES (
  '6545aa38-e491-48ef-83a5-aa1422f5d6e4', 'GOV-2025-102', 'Lab Critical Value Alert System',
  'Andrew Jacobs', 'Randi97@gmail.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Nursing.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'Draft', NOW() - INTERVAL '26 days'
  , '2809a50b-2832-4aa9-9df0-80f9bba729dc', 'Marisa Raddick', 'Owner', 'M'
);
INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
) VALUES (
  'fc520899-fa37-4a23-b718-6d095de87658', 'GOV-2025-103', 'General Clinical Informatics Consultation Request',
  'Bert Glover', 'Robyn_Cole@gmail.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Revenue Cycle.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'In Governance', NOW() - INTERVAL '11 days'
);
INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
, assigned_sci_id, assigned_sci_name, assigned_role, work_effort
) VALUES (
  'd77d9288-3383-4bd5-973f-1397606604d3', 'GOV-2025-104', 'Denials Management System',
  'Toni Treutel', 'Alejandra72@yahoo.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Laboratory.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'Dismissed', NOW() - INTERVAL '28 days'
  , '8af8be16-1241-4f95-b1aa-a8af75436716', 'Kim Willis', 'Owner', 'XS'
);
INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
, assigned_sci_id, assigned_sci_name, assigned_role, work_effort
) VALUES (
  'ea6495ec-a1dc-4984-aceb-d3c857e4f412', 'GOV-2025-105', 'Nursing Care Plan Integration',
  'Mr. David Klein-Carter MD', 'Cassandra_Kuphal@yahoo.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Inpatient.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'In Governance', NOW() - INTERVAL '21 days'
  , '35caa36b-8baf-4186-b055-13ded34cfc82', 'Dawn Jacobson', 'Owner', 'S'
);
INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
) VALUES (
  '427262b1-51f8-460a-87c4-938722f8e4ce', 'GOV-2025-106', 'General Clinical Informatics Consultation Request',
  'June Ruecker I', 'Marie.Nitzsche50@hotmail.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Ambulatory.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'Draft', NOW() - INTERVAL '0 days'
);
INSERT INTO governance_requests (
  id, request_id, title, submitter_name, submitter_email, division_region,
  problem_statement, desired_outcomes, status, submitted_date
, assigned_sci_id, assigned_sci_name, assigned_role, work_effort
) VALUES (
  '262f9334-6073-41ff-b02e-f91d6f18a0cf', 'GOV-2025-107', 'Antimicrobial Stewardship Program Build',
  'Dr. Katherine Sanford', 'Jodie_Lang@gmail.com', 'Demo Region',
  'Request for clinical informatics support to address workflow and quality challenges in Nursing.', 'Improve operational efficiency and patient outcomes through standardized clinical workflows.',
  'Ready for Review', NOW() - INTERVAL '16 days'
  , 'dcf3a885-2290-49a2-b03e-299dd2424220', 'Josh Greenwood', 'Owner', 'M'
);

COMMIT;

-- =====================================================
-- Simple Demo Data Generation Complete!
-- =====================================================
-- Generated 16 team members (fake SCIs)
-- Generated 80 initiatives (5 per SCI)
-- Generated 38 initiative metrics (~50%)
-- Generated 47 financial records (~60%)
-- Generated 8 governance requests (5-6 with SCI assignments)
-- =====================================================

-- Work Type Distribution:
--   System Initiative: 31
--   Governance: 49
-- =====================================================

-- Next steps:
-- 1. Review this SQL file
-- 2. Backup your Supabase database (if needed)
-- 3. Run this file in Supabase SQL Editor
-- 4. Validate dashboard shows all 16 SCIs with 5 initiatives each
-- =====================================================
