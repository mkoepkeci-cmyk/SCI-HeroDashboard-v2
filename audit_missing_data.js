import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditMissingData() {
  console.log('=== DATABASE AUDIT: Missing Critical Data Fields ===\n');

  // Get all team members
  const { data: members, error: memberError } = await supabase
    .from('team_members')
    .select('*')
    .order('name', { ascending: true });

  if (memberError) {
    console.error('Error fetching team members:', memberError);
    return;
  }

  // Get all assignments
  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select('*');

  if (assignError) {
    console.error('Error fetching assignments:', assignError);
    return;
  }

  console.log(`Total Team Members: ${members.length}`);
  console.log(`Total Assignments: ${assignments.length}\n`);

  const activeStatuses = ['Active', 'Planning', 'Not Started', 'In Progress'];
  let totalIssues = 0;

  // Audit each team member
  for (const member of members) {
    const memberAssignments = assignments.filter(a => a.team_member_id === member.id);
    const activeAssignments = memberAssignments.filter(a =>
      a.status && activeStatuses.includes(a.status)
    );

    // Check for missing/unknown values in critical fields
    const incompleteAssignments = activeAssignments.filter(a => {
      const issues = [];

      // Check work_type
      if (!a.work_type || a.work_type === 'Unknown') {
        issues.push('work_type');
      }

      // Check work_effort
      if (!a.work_effort || a.work_effort === 'Unknown') {
        issues.push('work_effort');
      }

      // Check phase
      if (!a.phase || a.phase === 'Unknown') {
        issues.push('phase');
      }

      // Check status (should not be Unknown if it got past filter)
      if (!a.status || a.status === 'Unknown') {
        issues.push('status');
      }

      return issues.length > 0;
    });

    if (incompleteAssignments.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`${member.name}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Total Assignments: ${memberAssignments.length}`);
      console.log(`Active Assignments: ${activeAssignments.length}`);
      console.log(`⚠️  Incomplete Active Assignments: ${incompleteAssignments.length}\n`);

      incompleteAssignments.forEach((a, idx) => {
        const issues = [];
        if (!a.work_type || a.work_type === 'Unknown') issues.push('work_type');
        if (!a.work_effort || a.work_effort === 'Unknown') issues.push('work_effort');
        if (!a.phase || a.phase === 'Unknown') issues.push('phase');
        if (!a.status || a.status === 'Unknown') issues.push('status');

        console.log(`  ${idx + 1}. ${a.assignment_name || 'Unnamed Assignment'}`);
        console.log(`     Status: ${a.status || 'NULL'}`);
        console.log(`     Work Type: ${a.work_type || 'NULL'}`);
        console.log(`     Work Effort: ${a.work_effort || 'NULL'}`);
        console.log(`     Phase: ${a.phase || 'NULL'}`);
        console.log(`     ❌ Missing: ${issues.join(', ')}`);
        console.log('');

        totalIssues++;
      });
    }
  }

  // Check for assignments with "Unknown" status (not filtered as active)
  const unknownStatusAssignments = assignments.filter(a => a.status === 'Unknown');
  if (unknownStatusAssignments.length > 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`ASSIGNMENTS WITH STATUS = "Unknown"`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Count: ${unknownStatusAssignments.length}\n`);

    unknownStatusAssignments.forEach((a, idx) => {
      const member = members.find(m => m.id === a.team_member_id);
      console.log(`  ${idx + 1}. ${a.assignment_name || 'Unnamed'} (${member?.name || 'Unknown Member'})`);
      console.log(`     Work Type: ${a.work_type || 'NULL'}`);
      console.log(`     Work Effort: ${a.work_effort || 'NULL'}`);
      console.log(`     Phase: ${a.phase || 'NULL'}`);
      console.log('');
    });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total active assignments with missing data: ${totalIssues}`);
  console.log(`Total assignments with "Unknown" status: ${unknownStatusAssignments.length}`);
  console.log('');
}

auditMissingData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
