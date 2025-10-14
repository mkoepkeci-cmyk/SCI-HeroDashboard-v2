import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface CSVRow {
  Assignment: string;
  'Work Type': string;
  Phase: string;
  Status: string;
  'Work Effort': string;
  'SCI Name': string;
  Role: string;
}

interface TeamMemberData {
  name: string;
  role: string;
  specialty: string;
  assignments: number;
  workTypes: { [key: string]: number };
  ehrs: { [key: string]: number };
  topWork: string[];
  impact?: string;
}

const teamMemberProfiles: { [key: string]: TeamMemberData } = {
  'Josh': {
    name: 'Josh',
    role: 'Sr. Analyst - Pharmacy',
    specialty: 'Pharmacy/Epic Gold',
    assignments: 95,
    workTypes: {},
    ehrs: { 'Epic': 56, 'All': 17 },
    topWork: ['38 Epic Gold CATs', '20 Governance bodies', '5 Major projects'],
  },
  'Marty': {
    name: 'Marty',
    role: 'Sr. Analyst - Ambulatory',
    specialty: 'Ambulatory/Epic Gold',
    assignments: 45,
    workTypes: {},
    ehrs: { 'All': 17, 'Epic': 15, 'Cerner': 7, 'Altera': 4 },
    impact: '$276M+',
    topWork: ['11 Epic Gold CATs', '9 Governance bodies', 'Abridge AI: $274.5M'],
  },
  'Dawn': {
    name: 'Dawn',
    role: 'Analyst - Inpatient',
    specialty: 'Inpatient/Nursing',
    assignments: 32,
    workTypes: {},
    ehrs: { 'Epic': 11, 'All': 11, 'Cerner': 7 },
    topWork: ['11 System initiatives', '4 Active projects', 'Central Telemetry'],
  },
  'Van': {
    name: 'Van',
    role: 'Analyst - Lab/Orders',
    specialty: 'Laboratory/Orders',
    assignments: 31,
    workTypes: {},
    ehrs: { 'Epic': 26, 'Cerner': 7, 'All': 1 },
    topWork: ['16 Epic Gold CATs', 'Pregnancy alerts', 'Code upgrades'],
  },
  'Matt': {
    name: 'Matt',
    role: 'Lead - System Design',
    specialty: 'System Design',
    assignments: 29,
    workTypes: {},
    ehrs: { 'All': 7, 'Epic': 6, 'Cerner': 2 },
    topWork: ['9 System initiatives', 'Central Telemetry lead', 'Integration projects'],
  },
  'Lisa': {
    name: 'Lisa',
    role: 'Analyst - Pop Health',
    specialty: 'Population Health',
    assignments: 27,
    workTypes: {},
    ehrs: { 'All': 13, 'Cerner': 8, 'Epic': 6 },
    topWork: ['13 Support assignments', '4 Active projects', 'DH Nursing Optimization'],
  },
  'Trudy': {
    name: 'Trudy',
    role: 'Analyst - Infection Control',
    specialty: 'Infection Prevention',
    assignments: 25,
    workTypes: {},
    ehrs: { 'All': 12, 'Cerner': 11, 'Epic': 2 },
    topWork: ['12 System initiatives', 'Gilead FOCUS project', 'TheraDoc integration'],
  },
  'Jason': {
    name: 'Jason',
    role: 'Analyst - Emergency',
    specialty: 'Emergency/Acute',
    assignments: 23,
    workTypes: {},
    ehrs: { 'Cerner': 11, 'All': 7, 'Epic': 5 },
    topWork: ['15 System initiatives', 'Gilead ED screening', 'ED workflows'],
  },
  'Sherry': {
    name: 'Sherry',
    role: 'Analyst - Operations',
    specialty: 'Operations/Support',
    assignments: 23,
    workTypes: {},
    ehrs: { 'All': 16, 'Epic': 3, 'Cerner': 3 },
    topWork: ['15 Support assignments', 'SPM migration', 'SCI Guidebook'],
  },
  'Yvette': {
    name: 'Yvette',
    role: 'Analyst - Documentation',
    specialty: 'Clinical Documentation',
    assignments: 21,
    workTypes: {},
    ehrs: { 'Cerner': 17, 'Epic': 12, '3rd Party': 1, 'All': 1 },
    topWork: ['Cerner code upgrades', 'Blood transfusion', 'Documentation support'],
  },
  'Marisa': {
    name: 'Marisa',
    role: 'Analyst - Support',
    specialty: 'General Support',
    assignments: 17,
    workTypes: {},
    ehrs: { 'All': 9, 'Epic': 5, 'Cerner': 3 },
    topWork: ['Gilead FOCUS', 'Nova Notes', 'Alaris Pumps'],
  },
  'Ashley': {
    name: 'Ashley',
    role: 'Analyst - Utilization',
    specialty: 'UM/Case Management',
    assignments: 16,
    workTypes: {},
    ehrs: { 'All': 11, 'Epic': 3, 'Cerner': 2 },
    topWork: ['Xsolis AI integration', 'Readmission project', '6 Support assignments'],
  },
  'Robin': {
    name: 'Robin',
    role: 'Analyst - Care Coord',
    specialty: 'Care Coordination',
    assignments: 15,
    workTypes: {},
    ehrs: { 'Epic': 11, 'All': 4 },
    topWork: ['Care Coordination CAT', 'Value Based Care', 'MyChart support'],
  },
  'Brooke': {
    name: 'Brooke',
    role: 'Analyst - Inpatient',
    specialty: 'Inpatient/Telemetry',
    assignments: 14,
    workTypes: {},
    ehrs: { 'Epic': 11, 'All': 3 },
    topWork: ['Central Telemetry', 'Inpatient Nursing CAT', 'Epic upgrades'],
  },
  'Kim': {
    name: 'Kim',
    role: 'Analyst - Cerner',
    specialty: 'Cerner/Documentation',
    assignments: 13,
    workTypes: {},
    ehrs: { 'Cerner': 7, 'All': 5 },
    topWork: ['5 System initiatives', 'Cerner support', 'Market projects'],
  },
  'Melissa': {
    name: 'Melissa',
    role: 'Analyst - Discharge',
    specialty: 'Discharge/Transitions',
    assignments: 10,
    workTypes: {},
    ehrs: { 'All': 8, 'Epic': 2 },
    topWork: ['Level Up Discharge', 'SPM migration', 'MDR optimization'],
  },
};

function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    if (values.length >= 7) {
      rows.push({
        Assignment: values[0],
        'Work Type': values[1],
        Phase: values[2],
        Status: values[3],
        'Work Effort': values[4],
        'SCI Name': values[5],
        Role: values[6],
      });
    }
  }

  return rows;
}

async function importData() {
  console.log('Starting data import...');

  const csvPath = join(process.cwd(), 'data', 'SCI Assignments Tracker - WIP Looker.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`Parsed ${rows.length} rows from CSV`);

  const workTypeCounts: { [key: string]: { [key: string]: number } } = {};
  rows.forEach(row => {
    const name = row['SCI Name'].trim();
    if (name && teamMemberProfiles[name]) {
      if (!workTypeCounts[name]) {
        workTypeCounts[name] = {};
      }
      const workType = row['Work Type'].trim();
      if (workType) {
        workTypeCounts[name][workType] = (workTypeCounts[name][workType] || 0) + 1;
      }
    }
  });

  Object.keys(teamMemberProfiles).forEach(name => {
    teamMemberProfiles[name].workTypes = workTypeCounts[name] || {};
  });

  for (const profile of Object.values(teamMemberProfiles)) {
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        name: profile.name,
        role: profile.role,
        specialty: profile.specialty,
        total_assignments: profile.assignments,
        revenue_impact: profile.impact,
      })
      .select()
      .maybeSingle();

    if (memberError) {
      console.error(`Error inserting team member ${profile.name}:`, memberError);
      continue;
    }

    if (!member) {
      console.error(`Failed to create team member ${profile.name}`);
      continue;
    }

    console.log(`Created team member: ${profile.name}`);

    for (const [workType, count] of Object.entries(profile.workTypes)) {
      await supabase.from('work_type_summary').insert({
        team_member_id: member.id,
        work_type: workType,
        count,
      });
    }

    for (const [ehr, count] of Object.entries(profile.ehrs)) {
      await supabase.from('ehr_platform_summary').insert({
        team_member_id: member.id,
        ehr_platform: ehr,
        count,
      });
    }

    for (let i = 0; i < profile.topWork.length; i++) {
      await supabase.from('key_highlights').insert({
        team_member_id: member.id,
        highlight: profile.topWork[i],
        order_index: i,
      });
    }
  }

  for (const row of rows) {
    const memberName = row['SCI Name'].trim();
    if (!memberName || !teamMemberProfiles[memberName]) continue;

    const { data: member } = await supabase
      .from('team_members')
      .select('id')
      .eq('name', memberName)
      .maybeSingle();

    if (!member) continue;

    await supabase.from('assignments').insert({
      assignment_name: row.Assignment,
      work_type: row['Work Type'],
      phase: row.Phase,
      status: row.Status,
      work_effort: row['Work Effort'],
      team_member_id: member.id,
      team_member_name: memberName,
      role_type: row.Role,
    });
  }

  console.log('Inserted all assignments');

  const metrics = [
    { metric_name: 'Total Team Members', metric_value: '16', metric_category: 'Overview', display_order: 1 },
    { metric_name: 'Active Assignments', metric_value: '431', metric_category: 'Overview', display_order: 2 },
    { metric_name: 'Annual Revenue Impact', metric_value: '$276M+', metric_category: 'Financial', display_order: 3 },
    { metric_name: 'Hours Saved YTD', metric_value: '7,001', metric_category: 'Efficiency', display_order: 4 },
    { metric_name: 'Workdays Saved', metric_value: '875', metric_category: 'Efficiency', display_order: 5 },
    { metric_name: 'Patient Encounters', metric_value: '688K', metric_category: 'Impact', display_order: 6 },
    { metric_name: 'Extra Visits Per Year', metric_value: '1.83M', metric_category: 'Impact', display_order: 7 },
    { metric_name: 'Governance Bodies', metric_value: '42', metric_category: 'Workstreams', display_order: 8 },
    { metric_name: 'Active Projects', metric_value: '87', metric_category: 'Workstreams', display_order: 9 },
    { metric_name: 'Epic Gold CATs', metric_value: '67', metric_category: 'Workstreams', display_order: 10 },
    { metric_name: 'Market Requests', metric_value: '156', metric_category: 'Workstreams', display_order: 11 },
  ];

  for (const metric of metrics) {
    await supabase.from('team_metrics').insert(metric);
  }

  console.log('Data import completed successfully!');
}

importData().catch(console.error);
