import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDashboardMetrics() {
  console.log('Checking dashboard_metrics table...\n');

  const { data: metrics, error } = await supabase
    .from('dashboard_metrics')
    .select('*')
    .order('team_member_name');

  if (error) {
    console.error('Error fetching dashboard metrics:', error);
    return;
  }

  if (!metrics || metrics.length === 0) {
    console.log('❌ No dashboard metrics found!');
    return;
  }

  console.log(`Total records: ${metrics.length}\n`);
  console.log('Dashboard Metrics Summary:');
  console.log('='.repeat(100));
  console.log(
    `${'Name'.padEnd(15)} ${'Total'.padStart(6)} ${'Active'.padStart(7)} ${'Hours/Wk'.padStart(10)} ${'Capacity %'.padStart(11)} ${'Status'.padEnd(25)}`
  );
  console.log('='.repeat(100));

  for (const m of metrics) {
    const capacityPct = ((m.capacity_utilization || 0) * 100).toFixed(0);
    console.log(
      `${(m.team_member_name || 'Unknown').padEnd(15)} ${(m.total_assignments || 0).toString().padStart(6)} ${(m.active_assignments || 0).toString().padStart(7)} ${(m.active_hours_per_week || 0).toFixed(1).padStart(10)} ${capacityPct.padStart(10)}% ${(m.capacity_status || 'N/A').padEnd(25)}`
    );
  }

  console.log('='.repeat(100));
}

checkDashboardMetrics().catch(console.error);
