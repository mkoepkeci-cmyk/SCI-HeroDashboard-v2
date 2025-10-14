import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function verifyDashboardMetrics() {
  console.log('Checking dashboard_metrics table...\n');

  // Get all team members
  const { data: teamMembers, error: tmError } = await supabase
    .from('team_members')
    .select('id, name')
    .order('name');

  if (tmError) {
    console.error('Error fetching team members:', tmError);
    return;
  }

  console.log(`Total team members in database: ${teamMembers.length}`);

  // Get all dashboard metrics
  const { data: metrics, error: metricsError } = await supabase
    .from('dashboard_metrics')
    .select('*');

  if (metricsError) {
    console.error('Error fetching dashboard metrics:', metricsError);
    return;
  }

  console.log(`Total dashboard_metrics records: ${metrics?.length || 0}\n`);

  // Create a map of team member IDs to metrics
  const metricsMap = new Map(metrics?.map(m => [m.team_member_id, m]) || []);

  console.log('Dashboard Metrics Status:');
  console.log('='.repeat(80));

  for (const member of teamMembers) {
    const hasMetrics = metricsMap.has(member.id);
    const status = hasMetrics ? '✓' : '✗';

    console.log(`${status} ${member.name.padEnd(15)} ${hasMetrics ? 'HAS METRICS' : 'MISSING METRICS'}`);

    if (hasMetrics) {
      const m = metricsMap.get(member.id)!;
      console.log(`   Total: ${m.total_assignments}, Active: ${m.active_assignments}, Hours: ${m.active_hours_per_week}h/wk`);
      console.log(`   Capacity: ${(m.capacity_utilization * 100).toFixed(1)}% - ${m.capacity_status}`);
    }
  }

  console.log('='.repeat(80));

  // Check if any metrics exist for members not in team_members
  const orphanedMetrics = metrics?.filter(m =>
    !teamMembers.some(tm => tm.id === m.team_member_id)
  ) || [];

  if (orphanedMetrics.length > 0) {
    console.log(`\n⚠️  Found ${orphanedMetrics.length} orphaned metrics (no matching team member)`);
  }
}

verifyDashboardMetrics().catch(console.error);
