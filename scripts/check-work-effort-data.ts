import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWorkEffortData() {
  console.log('Checking work effort data...\n');

  // Get all assignments
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('id, team_member_name, assignment_name, work_effort, phase, role_type')
    .order('team_member_name');

  if (error) {
    console.error('Error fetching assignments:', error);
    return;
  }

  if (!assignments || assignments.length === 0) {
    console.log('❌ No assignments found in database!');
    return;
  }

  console.log(`Total assignments: ${assignments.length}\n`);

  // Count assignments with/without work effort
  const withWorkEffort = assignments.filter(a => a.work_effort);
  const withoutWorkEffort = assignments.filter(a => !a.work_effort);

  console.log(`Assignments WITH work_effort: ${withWorkEffort.length}`);
  console.log(`Assignments WITHOUT work_effort: ${withoutWorkEffort.length}\n`);

  // Break down by team member
  const byMember: { [key: string]: { total: number; withEffort: number; withoutEffort: number } } = {};

  for (const assignment of assignments) {
    const name = assignment.team_member_name || 'Unknown';
    if (!byMember[name]) {
      byMember[name] = { total: 0, withEffort: 0, withoutEffort: 0 };
    }
    byMember[name].total++;
    if (assignment.work_effort) {
      byMember[name].withEffort++;
    } else {
      byMember[name].withoutEffort++;
    }
  }

  console.log('Breakdown by team member:');
  console.log('='.repeat(70));
  console.log(`${'Name'.padEnd(20)} ${'Total'.padStart(8)} ${'With Effort'.padStart(12)} ${'Missing'.padStart(10)}`);
  console.log('='.repeat(70));

  for (const [name, counts] of Object.entries(byMember).sort()) {
    console.log(
      `${name.padEnd(20)} ${counts.total.toString().padStart(8)} ${counts.withEffort.toString().padStart(12)} ${counts.withoutEffort.toString().padStart(10)}`
    );
  }

  console.log('='.repeat(70));

  // Show a sample of assignments without work effort
  if (withoutWorkEffort.length > 0) {
    console.log('\n\nSample assignments WITHOUT work_effort (first 10):');
    console.log('-'.repeat(100));
    for (let i = 0; i < Math.min(10, withoutWorkEffort.length); i++) {
      const a = withoutWorkEffort[i];
      console.log(`${a.team_member_name}: ${a.assignment_name}`);
      console.log(`  work_effort: ${a.work_effort || 'NULL'}, phase: ${a.phase || 'NULL'}, role_type: ${a.role_type || 'NULL'}`);
    }
  }

  // Show a sample of assignments WITH work effort
  if (withWorkEffort.length > 0) {
    console.log('\n\nSample assignments WITH work_effort (first 5):');
    console.log('-'.repeat(100));
    for (let i = 0; i < Math.min(5, withWorkEffort.length); i++) {
      const a = withWorkEffort[i];
      console.log(`${a.team_member_name}: ${a.assignment_name}`);
      console.log(`  work_effort: ${a.work_effort}, phase: ${a.phase || 'NULL'}, role_type: ${a.role_type || 'NULL'}`);
    }
  }
}

checkWorkEffortData().catch(console.error);
