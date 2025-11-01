import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateAppFetch() {
  console.log('Simulating what the app fetches...\n');

  // This is exactly what the app does
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .order('name', { ascending: true });

  if (membersError) {
    console.error('Error fetching team members:', membersError);
    return;
  }

  console.log(`Fetched ${members?.length} team members\n`);

  const { data: dashboardMetrics, error: dashboardError } = await supabase
    .from('dashboard_metrics')
    .select('*');

  if (dashboardError) {
    console.warn('Dashboard metrics error:', dashboardError);
    return;
  }

  console.log(`Fetched ${dashboardMetrics?.length} dashboard metrics\n`);

  // Show first 3 members with their metrics
  if (members && dashboardMetrics) {
    for (let i = 0; i < Math.min(3, members.length); i++) {
      const member = members[i];
      const metrics = dashboardMetrics.find((m: any) => m.team_member_id === member.id);

      console.log(`${member.name}:`);
      if (metrics) {
        console.log(`  Total assignments: ${metrics.total_assignments}`);
        console.log(`  Active assignments: ${metrics.active_assignments}`);
        console.log(`  Active hours/week: ${metrics.active_hours_per_week}`);
        console.log(`  Capacity: ${(metrics.capacity_utilization * 100).toFixed(0)}%`);
        console.log(`  Status: ${metrics.capacity_status}`);
      } else {
        console.log('  ❌ No dashboard metrics found!');
      }
      console.log('');
    }
  }
}

simulateAppFetch();
