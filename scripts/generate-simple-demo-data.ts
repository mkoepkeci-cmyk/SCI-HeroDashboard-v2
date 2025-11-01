/**
 * Simple Demo Data Generation - 5 Initiatives Per SCI
 *
 * Generates realistic fake data for SCI team with focus on:
 * - Governance and System Initiatives
 * - Proper assignment fields (role, work_effort, size)
 * - Basic metrics and projected revenue
 *
 * Usage:
 *   npx tsx scripts/generate-simple-demo-data.ts > scripts/simple-demo-data.sql
 */

import { faker } from '@faker-js/faker';

// Configuration
const CONFIG = {
  INITIATIVES_PER_SCI: 5,
  CURRENT_YEAR: 2025,
};

// Valid options
const WORK_TYPES = ['System Initiative', 'Governance'];
const STATUSES = ['Not Started', 'In Progress', 'Planning'];
const PHASES = ['Discovery/Define', 'Design', 'Build', 'Validate/Test', 'Deploy', 'N/A'];
const ROLES = ['Owner'];
const WORK_EFFORTS = ['XS', 'S', 'M', 'L', 'XL'];
const EHRS = ['Epic', 'Cerner', 'All'];
const SERVICE_LINES = [
  'Ambulatory', 'Pharmacy', 'Nursing', 'Cardiology',
  'Emergency Department', 'Inpatient', 'Laboratory', 'Radiology', 'Perioperative', 'Revenue Cycle'
];

// Service lines by specialty
function getServiceLineForMember(firstName: string): string {
  if (firstName === 'Josh' || firstName === 'Van' || firstName === 'Yvette') {
    return 'Pharmacy';
  } else if (firstName === 'Jason') {
    return Math.random() > 0.5 ? 'Emergency Department' : 'Perioperative';
  } else if (firstName === 'Kim') {
    return Math.random() > 0.5 ? 'Perioperative' : 'Revenue Cycle';
  } else if (firstName === 'Marty') {
    return 'Ambulatory';
  } else {
    // Nursing and ancillary for others
    return randomElement(['Nursing', 'Inpatient', 'Laboratory', 'Radiology']);
  }
}

// Healthcare initiative names by specialty
const PHARMACY_INITIATIVES = [
  'Medication Reconciliation Workflow Enhancement',
  'Pharmacy Order Set Standardization',
  'IV to PO Conversion Protocol',
  'Antimicrobial Stewardship Program Build',
  'Medication Safety BPA Implementation',
  'Pharmacy Clinical Decision Support',
  'Controlled Substance Monitoring System',
  'Drug-Drug Interaction Alert Optimization',
  'Pharmacy Dosing Protocols',
  'Medication Therapy Management Program',
];

const ED_PERIOP_INITIATIVES = [
  'Emergency Department Triage Workflow',
  'ED Clinical Decision Unit Protocol',
  'Perioperative Safety Checklist',
  'Surgical Order Set Standardization',
  'Anesthesia Documentation Enhancement',
  'ED Sepsis Bundle Implementation',
  'Perioperative Anticoagulation Protocol',
  'ED Observation Unit Workflow',
  'Surgical Site Infection Prevention',
  'ED Care Coordination Workflow',
];

const PERIOP_REVCYCLE_INITIATIVES = [
  'Perioperative Charge Capture Enhancement',
  'Revenue Cycle Documentation Improvement',
  'Surgical Services Billing Optimization',
  'Charge Description Master Update',
  'Prior Authorization Workflow',
  'Revenue Integrity Dashboard',
  'Denials Management System',
  'Perioperative Cost Tracking',
  'Billing Compliance Monitoring',
  'Revenue Cycle Analytics Platform',
];

const MARTY_INITIATIVES = [
  'Ambulatory Care Coordination Workflow',
  'Social Determinants of Health Screening',
  'Medicare Annual Wellness Visit Protocol',
  'Depression Screening PHQ-9 Integration',
  'Abridge AI Ambient Documentation',
  'Ambulatory Quality Measures Dashboard',
  'SDOH Referral Workflow Enhancement',
  'Preventive Care Alerts System',
  'Ambulatory Visit Planning Tool',
  'Patient Health Assessment Integration',
];

const NURSING_ANCILLARY_INITIATIVES = [
  'Nursing Documentation Workflow Enhancement',
  'Pressure Injury Prevention Protocol',
  'Nursing Handoff Communication Tool',
  'Laboratory Result Notification System',
  'Radiology Order Set Standardization',
  'Nursing Quality Metrics Dashboard',
  'Fall Prevention Assessment Tool',
  'Lab Critical Value Alert System',
  'Nursing Care Plan Integration',
  'Radiology Results Follow-up Workflow',
];

// Real SCI team members and managers from production data
interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TeamMemberData {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string[];
  managerIndex: number;
}

const MANAGERS: Manager[] = [
  { id: faker.string.uuid(), firstName: 'Carrie', lastName: 'Rodriguez', email: 'carrie.rodriguez@commonspirit.org' },
  { id: faker.string.uuid(), firstName: 'Tiffany', lastName: 'Shields-Tettamanti', email: 'tiffany.shields@commonspirit.org' },
];

// Map team members to their managers and specialties (based on production data)
const TEAM_MEMBERS: TeamMemberData[] = [
  { id: faker.string.uuid(), firstName: 'Ashley', lastName: 'Daily', role: 'System CI', specialty: ['Nursing', 'Inpatient'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Brooke', lastName: 'Snow', role: 'System CI', specialty: ['Nursing', 'Inpatient'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Dawn', lastName: 'Jacobson', role: 'System CI', specialty: ['Inpatient', 'Nursing'], managerIndex: 0 },
  { id: faker.string.uuid(), firstName: 'Jason', lastName: 'Mihos', role: 'System CI', specialty: ['Emergency Department', 'Perioperative'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Josh', lastName: 'Greenwood', role: 'System CI', specialty: ['Pharmacy'], managerIndex: 0 },
  { id: faker.string.uuid(), firstName: 'Kim', lastName: 'Willis', role: 'System CI', specialty: ['Revenue Cycle', 'Perioperative'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Lisa', lastName: 'Townsend', role: 'System CI', specialty: ['Nursing', 'Inpatient'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Marisa', lastName: 'Raddick', role: 'System CI', specialty: ['Nursing', 'Inpatient'], managerIndex: 0 },
  { id: faker.string.uuid(), firstName: 'Marty', lastName: 'Koepke', role: 'System CI', specialty: ['Ambulatory', 'Radiology'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Matt', lastName: 'Stuart', role: 'System CI', specialty: ['Other'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Melissa', lastName: 'Plummer', role: 'System CI', specialty: ['Nursing', 'Inpatient'], managerIndex: 0 },
  { id: faker.string.uuid(), firstName: 'Robin', lastName: 'Delorenzo', role: 'System CI', specialty: ['Nursing'], managerIndex: 0 },
  { id: faker.string.uuid(), firstName: 'Sherry', lastName: 'Brennaman', role: 'System CI', specialty: ['Nursing', 'Inpatient'], managerIndex: 1 },
  { id: faker.string.uuid(), firstName: 'Trudy', lastName: 'Finch', role: 'System CI', specialty: ['Other'], managerIndex: 0 },
  { id: faker.string.uuid(), firstName: 'Van', lastName: 'Nguyen', role: 'System CI', specialty: ['Pharmacy'], managerIndex: 0 },
  { id: faker.string.uuid(), firstName: 'Yvette', lastName: 'Kirk', role: 'System CI', specialty: ['Pharmacy'], managerIndex: 0 },
];

// Utility functions
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function sqlString(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlDate(date: Date | null): string {
  if (!date) return 'NULL';
  return `'${date.toISOString().split('T')[0]}'`;
}

function sqlNumber(value: number | null): string {
  if (value === null) return 'NULL';
  return value.toString();
}

function sqlBoolean(value: boolean): string {
  return value ? 'true' : 'false';
}

function generateInitiativeName(teamMemberFirstName: string): string {
  // Assign initiatives based on team member specialty
  if (teamMemberFirstName === 'Josh' || teamMemberFirstName === 'Van' || teamMemberFirstName === 'Yvette') {
    return randomElement(PHARMACY_INITIATIVES);
  } else if (teamMemberFirstName === 'Jason') {
    return randomElement(ED_PERIOP_INITIATIVES);
  } else if (teamMemberFirstName === 'Kim') {
    return randomElement(PERIOP_REVCYCLE_INITIATIVES);
  } else if (teamMemberFirstName === 'Marty') {
    return randomElement(MARTY_INITIATIVES);
  } else {
    // All others: Ashley, Brooke, Dawn, Lisa, Marisa, Matt, Melissa, Robin, Sherry, Trudy
    return randomElement(NURSING_ANCILLARY_INITIATIVES);
  }
}

interface Initiative {
  id: string;
  team_member_id: string;
  owner_name: string;
  initiative_name: string;
  type: string;
  status: string;
  role: string;
  work_effort: string;
  phase: string;
  ehrs_impacted: string;
  service_line: string;
  start_date: Date;
  clinical_sponsor_name: string;
  clinical_sponsor_title: string;
  problem_statement: string;
  desired_outcomes: string;
  is_active: boolean;
  projected_revenue?: number;
  baseline_metric?: number;
  target_metric?: number;
  metric_name?: string;
  metric_unit?: string;
}

function generateInitiatives(): Initiative[] {
  const initiatives: Initiative[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

  for (const teamMember of TEAM_MEMBERS) {
    for (let i = 0; i < CONFIG.INITIATIVES_PER_SCI; i++) {
      const workType = randomElement(WORK_TYPES);
      const status = randomElement(STATUSES);
      const serviceLine = getServiceLineForMember(teamMember.firstName);
      const startDate = new Date(
        threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
      );

      const sponsor = faker.person.fullName();
      const titles = ['MD', 'RN MSN', 'PharmD', 'DO', 'VP Clinical Operations', 'Director of Nursing'];

      // Generate basic metrics (50% chance)
      const hasMetrics = Math.random() > 0.5;
      const metricName = hasMetrics ? randomElement(['Adoption Rate', 'Time Savings', 'Quality Score', 'Cost Reduction']) : undefined;
      const metricUnit = hasMetrics ? randomElement(['Percentage', 'Minutes', 'Points', 'Dollars']) : undefined;
      const baseline = hasMetrics ? Math.floor(Math.random() * 50) + 10 : undefined;
      const target = hasMetrics && baseline ? baseline + Math.floor(Math.random() * 50) + 20 : undefined;

      // Generate projected revenue (60% chance)
      const hasRevenue = Math.random() > 0.4;
      const projectedRevenue = hasRevenue ? Math.floor(Math.random() * 2000000) + 100000 : undefined;

      initiatives.push({
        id: faker.string.uuid(),
        team_member_id: teamMember.id,
        owner_name: `${teamMember.firstName} ${teamMember.lastName}`,
        initiative_name: generateInitiativeName(teamMember.firstName),
        type: workType,
        status: status,
        role: 'Owner',
        work_effort: randomElement(WORK_EFFORTS),
        phase: workType === 'Governance' ? 'N/A' : randomElement(PHASES),
        ehrs_impacted: randomElement(EHRS),
        service_line: serviceLine,
        start_date: startDate,
        clinical_sponsor_name: sponsor,
        clinical_sponsor_title: randomElement(titles),
        problem_statement: `Addressing workflow inefficiencies and quality gaps in ${serviceLine} operations to improve patient outcomes and operational efficiency.`,
        desired_outcomes: `Improve ${metricName?.toLowerCase() || 'operational efficiency'} by ${target && baseline ? Math.round(((target - baseline) / baseline) * 100) : 25}% within 6 months.`,
        is_active: true,
        projected_revenue: projectedRevenue,
        baseline_metric: baseline,
        target_metric: target,
        metric_name: metricName,
        metric_unit: metricUnit,
      });
    }
  }

  return initiatives;
}

function generateSQL() {
  console.log('-- =====================================================');
  console.log('-- SCI Hero Dashboard - Simple Demo Data (5 Per SCI)');
  console.log('-- Generated:', new Date().toISOString());
  console.log('-- =====================================================');
  console.log();
  console.log('-- IMPORTANT: This assumes you have cleared existing data.');
  console.log('-- If managers table is empty, create fake managers first.');
  console.log();

  const initiatives = generateInitiatives();

  console.log('BEGIN;');
  console.log();

  // Team Members
  console.log('-- =====================================================');
  console.log('-- Managers (2 Real Managers)');
  console.log('-- =====================================================');
  console.log();

  for (const manager of MANAGERS) {
    console.log(`INSERT INTO managers (id, first_name, last_name, email, is_active) VALUES`);
    console.log(`  (${sqlString(manager.id)}, ${sqlString(manager.firstName)}, ${sqlString(manager.lastName)}, ${sqlString(manager.email)}, true);`);
  }
  console.log();

  console.log('-- =====================================================');
  console.log('-- Team Members (16 Real SCIs with Specialties)');
  console.log('-- =====================================================');
  console.log();

  for (const member of TEAM_MEMBERS) {
    const managerId = MANAGERS[member.managerIndex].id;
    const specialty = `ARRAY[${member.specialty.map(s => sqlString(s)).join(', ')}]`;
    const fullName = `${member.firstName} ${member.lastName}`;

    console.log(`INSERT INTO team_members (id, name, first_name, last_name, role, specialty, manager_id, is_active) VALUES`);
    console.log(`  (${sqlString(member.id)}, ${sqlString(fullName)}, ${sqlString(member.firstName)}, ${sqlString(member.lastName)}, ${sqlString(member.role)}, ${specialty}, ${sqlString(managerId)}, true);`);
  }
  console.log();

  // Initiatives
  console.log('-- =====================================================');
  console.log('-- Initiatives (5 Per SCI = 80 Total)');
  console.log('-- =====================================================');
  console.log();

  for (const initiative of initiatives) {
    console.log(`INSERT INTO initiatives (`);
    console.log(`  id, team_member_id, owner_name, initiative_name, type, status, role,`);
    console.log(`  work_effort, phase, ehrs_impacted, service_line, start_date,`);
    console.log(`  clinical_sponsor_name, clinical_sponsor_title,`);
    console.log(`  problem_statement, desired_outcomes, is_active`);
    console.log(`) VALUES (`);
    console.log(`  ${sqlString(initiative.id)}, ${sqlString(initiative.team_member_id)}, ${sqlString(initiative.owner_name)},`);
    console.log(`  ${sqlString(initiative.initiative_name)}, ${sqlString(initiative.type)}, ${sqlString(initiative.status)},`);
    console.log(`  ${sqlString(initiative.role)}, ${sqlString(initiative.work_effort)}, ${sqlString(initiative.phase)},`);
    console.log(`  ${sqlString(initiative.ehrs_impacted)}, ${sqlString(initiative.service_line)},`);
    console.log(`  ${sqlDate(initiative.start_date)},`);
    console.log(`  ${sqlString(initiative.clinical_sponsor_name)}, ${sqlString(initiative.clinical_sponsor_title)},`);
    console.log(`  ${sqlString(initiative.problem_statement)}, ${sqlString(initiative.desired_outcomes)},`);
    console.log(`  ${sqlBoolean(initiative.is_active)}`);
    console.log(`);`);
  }
  console.log();

  // Initiative Metrics (only for initiatives that have metrics)
  console.log('-- =====================================================');
  console.log('-- Initiative Metrics (50% of initiatives)');
  console.log('-- =====================================================');
  console.log();

  const initiativesWithMetrics = initiatives.filter(i => i.baseline_metric !== undefined);
  for (const initiative of initiativesWithMetrics) {
    const current = initiative.baseline_metric! + Math.floor(Math.random() * (initiative.target_metric! - initiative.baseline_metric!));
    const improvementPct = Math.round(((current - initiative.baseline_metric!) / initiative.baseline_metric!) * 100);
    const improvementText = improvementPct > 0 ? `+${improvementPct}%` : `${improvementPct}%`;

    // Determine metric_type based on the metric name
    let metricType = 'Quality';
    if (initiative.metric_name?.toLowerCase().includes('adoption') || initiative.metric_name?.toLowerCase().includes('usage')) {
      metricType = 'Adoption';
    } else if (initiative.metric_name?.toLowerCase().includes('time') || initiative.metric_name?.toLowerCase().includes('efficiency')) {
      metricType = 'Efficiency';
    } else if (initiative.metric_name?.toLowerCase().includes('revenue') || initiative.metric_name?.toLowerCase().includes('cost')) {
      metricType = 'Financial';
    }

    console.log(`INSERT INTO initiative_metrics (initiative_id, metric_name, metric_type, baseline_value, current_value, target_value, unit, improvement) VALUES`);
    console.log(`  (${sqlString(initiative.id)}, ${sqlString(initiative.metric_name!)}, ${sqlString(metricType)}, ${sqlNumber(initiative.baseline_metric!)}, ${sqlNumber(current)}, ${sqlNumber(initiative.target_metric!)}, ${sqlString(initiative.metric_unit!)}, ${sqlString(improvementText)});`);
  }
  console.log();

  // Financial Impact (60% of initiatives)
  console.log('-- =====================================================');
  console.log('-- Financial Impact (60% of initiatives)');
  console.log('-- =====================================================');
  console.log();

  const initiativesWithRevenue = initiatives.filter(i => i.projected_revenue !== undefined);
  for (const initiative of initiativesWithRevenue) {
    const methodology = `Revenue projection based on ${randomElement(['user adoption', 'efficiency gains', 'cost savings', 'quality improvements'])} across ${randomElement(['system-wide', 'division', 'market'])} deployment.`;

    console.log(`INSERT INTO initiative_financial_impact (initiative_id, projected_annual, calculation_methodology) VALUES`);
    console.log(`  (${sqlString(initiative.id)}, ${sqlNumber(initiative.projected_revenue!)}, ${sqlString(methodology)});`);
  }
  console.log();

  // Governance Requests (8 requests, some with assignments)
  console.log('-- =====================================================');
  console.log('-- Governance Requests (8 Sample Requests)');
  console.log('-- =====================================================');
  console.log();

  for (let i = 0; i < 8; i++) {
    const id = faker.string.uuid();
    const requestId = `GOV-${CONFIG.CURRENT_YEAR}-${String(i + 100).padStart(3, '0')}`;
    const statuses = ['Draft', 'Ready for Review', 'In Governance', 'Ready for Governance', 'Dismissed'];
    const status = randomElement(statuses);

    // 70% chance of SCI assignment
    const assignedSci = Math.random() > 0.3 ? randomElement(TEAM_MEMBERS) : null;
    const title = assignedSci ? generateInitiativeName(assignedSci.firstName) : 'General Clinical Informatics Consultation Request';

    const submitterName = faker.person.fullName();
    const submitterEmail = faker.internet.email();
    const problemStatement = `Request for clinical informatics support to address workflow and quality challenges in ${randomElement(SERVICE_LINES)}.`;
    const desiredOutcomes = `Improve operational efficiency and patient outcomes through standardized clinical workflows.`;

    console.log(`INSERT INTO governance_requests (`);
    console.log(`  id, request_id, title, submitter_name, submitter_email, division_region,`);
    console.log(`  problem_statement, desired_outcomes, status, submitted_date`);
    if (assignedSci) {
      console.log(`, assigned_sci_id, assigned_sci_name, assigned_role, work_effort`);
    }
    console.log(`) VALUES (`);
    console.log(`  ${sqlString(id)}, ${sqlString(requestId)}, ${sqlString(title)},`);
    console.log(`  ${sqlString(submitterName)}, ${sqlString(submitterEmail)}, 'Demo Region',`);
    console.log(`  ${sqlString(problemStatement)}, ${sqlString(desiredOutcomes)},`);
    console.log(`  ${sqlString(status)}, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'`);
    if (assignedSci) {
      console.log(`  , ${sqlString(assignedSci.id)}, ${sqlString(`${assignedSci.firstName} ${assignedSci.lastName}`)}, 'Owner', ${sqlString(randomElement(WORK_EFFORTS))}`);
    }
    console.log(`);`);
  }
  console.log();

  console.log('COMMIT;');
  console.log();
  console.log('-- =====================================================');
  console.log('-- Simple Demo Data Generation Complete!');
  console.log('-- =====================================================');
  console.log(`-- Generated ${TEAM_MEMBERS.length} team members (fake SCIs)`);
  console.log(`-- Generated ${initiatives.length} initiatives (${CONFIG.INITIATIVES_PER_SCI} per SCI)`);
  console.log(`-- Generated ${initiativesWithMetrics.length} initiative metrics (~50%)`);
  console.log(`-- Generated ${initiativesWithRevenue.length} financial records (~60%)`);
  console.log(`-- Generated 8 governance requests (5-6 with SCI assignments)`);
  console.log('-- =====================================================');
  console.log();
  console.log('-- Work Type Distribution:');
  const systemInitiatives = initiatives.filter(i => i.type === 'System Initiative').length;
  const governance = initiatives.filter(i => i.type === 'Governance').length;
  console.log(`--   System Initiative: ${systemInitiatives}`);
  console.log(`--   Governance: ${governance}`);
  console.log('-- =====================================================');
  console.log();
  console.log('-- Next steps:');
  console.log('-- 1. Review this SQL file');
  console.log('-- 2. Backup your Supabase database (if needed)');
  console.log('-- 3. Run this file in Supabase SQL Editor');
  console.log('-- 4. Validate dashboard shows all 16 SCIs with 5 initiatives each');
  console.log('-- =====================================================');
}

// Run
generateSQL();
