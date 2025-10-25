import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkVanAssignments() {
  // Get Van's team member record
  const { data: van, error: vanError } = await supabase
    .from('team_members')
    .select('*')
    .eq('name', 'Van')
    .single();

  if (vanError) {
    console.error('Error fetching Van:', vanError);
    return;
  }

  console.log('Van Team Member Record:');
  console.log('  ID:', van.id);
  console.log('  Name:', van.name);
  console.log('  Total Assignments (from team_members):', van.total_assignments);
  console.log('');

  // Get Van's assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_member_id', van.id);

  if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError);
    return;
  }

  console.log('Van Assignments from DB:');
  console.log('  Count:', assignments?.length || 0);
  console.log('');

  // Check for duplicates
  const assignmentNames = assignments?.map(a => a.assignment_name) || [];
  const uniqueNames = new Set(assignmentNames);

  console.log('Duplicate Check:');
  console.log('  Total assignments:', assignmentNames.length);
  console.log('  Unique assignment names:', uniqueNames.size);
  console.log('  Duplicates:', assignmentNames.length - uniqueNames.size);
  console.log('');

  if (assignmentNames.length !== uniqueNames.size) {
    console.log('DUPLICATES FOUND:');
    const nameCount: Record<string, number> = {};
    assignmentNames.forEach(name => {
      nameCount[name] = (nameCount[name] || 0) + 1;
    });

    Object.entries(nameCount)
      .filter(([_, count]) => count > 1)
      .forEach(([name, count]) => {
        console.log(`  "${name}": ${count} times`);
      });
    console.log('');
  }

  // Show work effort breakdown
  const effortBreakdown: Record<string, number> = {};
  assignments?.forEach(a => {
    const effort = a.work_effort || 'Unknown';
    effortBreakdown[effort] = (effortBreakdown[effort] || 0) + 1;
  });

  console.log('Work Effort Breakdown:');
  Object.entries(effortBreakdown)
    .sort((a, b) => b[1] - a[1])
    .forEach(([effort, count]) => {
      console.log(`  ${effort}: ${count}`);
    });
}

checkVanAssignments().then(() => {
  console.log('Check complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
