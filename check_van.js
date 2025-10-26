import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVan() {
  // Get Van's team member record
  const { data: members, error: memberError } = await supabase
    .from('team_members')
    .select('*')
    .ilike('name', '%Van%');
  
  if (memberError) {
    console.error('Error fetching Van:', memberError);
    return;
  }
  
  console.log('Van team member:', JSON.stringify(members, null, 2));
  
  if (!members || members.length === 0) {
    console.log('Van not found');
    return;
  }
  
  const van = members[0];
  
  // Get Van's assignments
  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_member_id', van.id)
    .order('status', { ascending: true });
  
  if (assignError) {
    console.error('Error fetching assignments:', assignError);
    return;
  }
  
  console.log(`\n=== Van's Assignments (Total: ${assignments.length}) ===\n`);
  
  const activeStatuses = ['Active', 'Planning', 'Not Started', 'In Progress'];
  const activeAssignments = assignments.filter(a => a.status && activeStatuses.includes(a.status));
  
  console.log(`Active Assignments: ${activeAssignments.length}`);
  
  // Check for missing data in active assignments
  const missingData = activeAssignments.map(a => {
    const missing = [];
    if (!a.work_effort) missing.push('work_effort');
    if (!a.phase) missing.push('phase');
    if (!a.role_type) missing.push('role_type');
    return { ...a, missing };
  }).filter(a => a.missing.length > 0);
  
  console.log(`\nActive assignments with missing data: ${missingData.length}\n`);
  
  missingData.forEach((a, idx) => {
    console.log(`${idx + 1}. ${a.assignment_name || 'Unnamed'}`);
    console.log(`   Status: ${a.status}`);
    console.log(`   Work Type: ${a.work_type || 'N/A'}`);
    console.log(`   Missing: ${a.missing.join(', ')}`);
    console.log('');
  });
  
  // Get dashboard metrics
  const { data: metrics } = await supabase
    .from('dashboard_metrics')
    .select('*')
    .eq('team_member_id', van.id);
  
  if (metrics && metrics.length > 0) {
    console.log('Dashboard Metrics:', JSON.stringify(metrics[0], null, 2));
  }
}

checkVan().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
