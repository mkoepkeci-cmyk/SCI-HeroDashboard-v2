import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkMissingData() {
  console.log('Checking missing data for Josh, Van, and Yvette...\n');

  const names = ['Josh', 'Van', 'Yvette'];

  for (const name of names) {
    console.log(`\n========== ${name} ==========`);

    // Get team member
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('id, name')
      .ilike('name', name)
      .single();

    if (memberError || !member) {
      console.log(`Error finding ${name}:`, memberError);
      continue;
    }

    // Get dashboard metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('dashboard_metrics')
      .select('capacity_status, total_assignments, active_assignments')
      .eq('team_member_id', member.id)
      .single();

    if (metrics) {
      console.log(`\nDashboard Metrics:`);
      console.log(`  Total: ${metrics.total_assignments}, Active: ${metrics.active_assignments}`);
      console.log(`  Capacity Status: "${metrics.capacity_status}"`);
    }

    // Get assignments
    const { data: assignments, error: assignError } = await supabase
      .from('assignments')
      .select('id, assignment_name, work_type, work_effort, phase, role_type, status')
      .eq('team_member_id', member.id);

    if (assignError) {
      console.log(`Error getting assignments:`, assignError);
      continue;
    }

    console.log(`\nTotal assignments in database: ${assignments?.length || 0}`);

    // Check for missing data
    const missingWorkEffort = assignments?.filter(a => !a.work_effort) || [];
    const missingPhase = assignments?.filter(a => !a.phase) || [];
    const missingRole = assignments?.filter(a => !a.role_type) || [];

    console.log(`\nMissing Data:`);
    console.log(`  Work Effort: ${missingWorkEffort.length}`);
    console.log(`  Phase: ${missingPhase.length}`);
    console.log(`  Role Type: ${missingRole.length}`);

    if (missingWorkEffort.length > 0) {
      console.log(`\nAssignments missing Work Effort:`);
      missingWorkEffort.slice(0, 5).forEach(a => {
        console.log(`  - ${a.assignment_name} (${a.work_type})`);
      });
      if (missingWorkEffort.length > 5) {
        console.log(`  ... and ${missingWorkEffort.length - 5} more`);
      }
    }

    if (missingPhase.length > 0) {
      console.log(`\nAssignments missing Phase:`);
      missingPhase.slice(0, 5).forEach(a => {
        console.log(`  - ${a.assignment_name} (${a.work_type})`);
      });
      if (missingPhase.length > 5) {
        console.log(`  ... and ${missingPhase.length - 5} more`);
      }
    }

    if (missingRole.length > 0) {
      console.log(`\nAssignments missing Role Type:`);
      missingRole.slice(0, 5).forEach(a => {
        console.log(`  - ${a.assignment_name} (${a.work_type})`);
      });
      if (missingRole.length > 5) {
        console.log(`  ... and ${missingRole.length - 5} more`);
      }
    }

    // Find assignments with ANY missing data
    const assignmentsWithMissingData = assignments?.filter(a =>
      !a.work_effort || !a.phase || !a.role_type
    ) || [];

    console.log(`\nTotal assignments with ANY missing data: ${assignmentsWithMissingData.length}`);
  }
}

checkMissingData().catch(console.error);
