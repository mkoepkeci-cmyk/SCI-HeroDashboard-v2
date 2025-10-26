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

async function auditMartyMetrics() {
  console.log('=== AUDIT: Marty\'s Metrics Across All Views ===\n');

  // Get Marty's team member record
  const { data: members, error: memberError } = await supabase
    .from('team_members')
    .select('*')
    .ilike('name', '%Marty%');

  if (memberError || !members || members.length === 0) {
    console.error('Error finding Marty:', memberError);
    return;
  }

  const marty = members[0];
  console.log('Team Member Record:');
  console.log(`  Name: ${marty.name}`);
  console.log(`  Role: ${marty.role}`);
  console.log(`  Total Assignments (static field): ${marty.total_assignments}`);
  console.log(`  Revenue Impact (static field): ${marty.revenue_impact}`);
  console.log('');

  // Get Marty's initiatives with financial impact
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('*')
    .eq('owner_name', marty.name)
    .neq('status', 'Deleted');

  if (initError) {
    console.error('Error fetching initiatives:', initError);
    return;
  }

  console.log(`Initiatives Count: ${initiatives.length}\n`);

  // Get financial impact for each initiative
  const { data: financialImpacts, error: finError } = await supabase
    .from('initiative_financial_impact')
    .select('*')
    .in('initiative_id', initiatives.map(i => i.id));

  if (finError) {
    console.error('Error fetching financial impacts:', finError);
    return;
  }

  console.log('=== Initiatives with Financial Impact ===\n');

  let totalProjectedRevenue = 0;
  let totalActualRevenue = 0;
  let initiativesWithMetrics = 0;

  initiatives.forEach(initiative => {
    const financial = financialImpacts?.find(f => f.initiative_id === initiative.id);

    if (financial && (financial.projected_annual || financial.actual_revenue)) {
      initiativesWithMetrics++;
      const projected = financial.projected_annual || 0;
      const actual = financial.actual_revenue || 0;

      totalProjectedRevenue += projected;
      totalActualRevenue += actual;

      console.log(`${initiativesWithMetrics}. ${initiative.initiative_name}`);
      console.log(`   Status: ${initiative.status}`);
      console.log(`   Type: ${initiative.type}`);
      console.log(`   Projected Annual: $${projected.toLocaleString()}`);
      console.log(`   Actual Revenue: $${actual.toLocaleString()}`);
      console.log('');
    }
  });

  console.log('=== SUMMARY ===\n');
  console.log(`Initiatives with metrics: ${initiativesWithMetrics} of ${initiatives.length}`);
  console.log(`Total Projected Revenue: $${totalProjectedRevenue.toLocaleString()}`);
  console.log(`Total Actual Revenue: $${totalActualRevenue.toLocaleString()}`);
  console.log('');

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  console.log('=== WHAT SHOULD DISPLAY ===\n');
  console.log('Overview Tab (team total from all initiatives):');
  console.log(`  Displays: ${formatCurrency(totalProjectedRevenue)} (aggregated from all team members)\n`);

  console.log('Team Tab (Marty\'s card):');
  console.log(`  CURRENT (WRONG): ${marty.revenue_impact} (static field from team_members table)`);
  console.log(`  SHOULD BE: ${formatCurrency(totalProjectedRevenue)} (calculated from Marty's initiatives)\n`);

  console.log('=== DATA FLOW ISSUE ===');
  console.log('The team_members.revenue_impact field is a STATIC TEXT field from Google Sheets.');
  console.log('It does NOT update when initiatives are created/edited in the app.');
  console.log('This causes inconsistency between Overview (dynamic) and Team (static) views.');
}

auditMartyMetrics()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
