import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDataCounts() {
  console.log('='.repeat(60));
  console.log('DATA COUNT VERIFICATION');
  console.log('Date:', new Date().toISOString());
  console.log('='.repeat(60));

  try {
    // Count team members
    const { data: teamMembers, error: tmError } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true });
    if (tmError) throw tmError;

    // Count managers
    const { data: managers, error: mgError } = await supabase
      .from('managers')
      .select('id', { count: 'exact', head: true });
    if (mgError) throw mgError;

    // Count initiatives (active only)
    const { data: initiatives, error: initError } = await supabase
      .from('initiatives')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    if (initError) throw initError;

    // Count all initiatives (including inactive)
    const { data: allInitiatives, error: allInitError } = await supabase
      .from('initiatives')
      .select('id', { count: 'exact', head: true });
    if (allInitError) throw allInitError;

    // Count initiative stories
    const { data: stories, error: storiesError } = await supabase
      .from('initiative_stories')
      .select('id', { count: 'exact', head: true });
    if (storiesError) throw storiesError;

    // Count effort logs
    const { data: effortLogs, error: effortError } = await supabase
      .from('effort_logs')
      .select('id', { count: 'exact', head: true });
    if (effortError) throw effortError;

    // Count governance requests
    const { data: govRequests, error: govError } = await supabase
      .from('governance_requests')
      .select('id', { count: 'exact', head: true });
    if (govError) throw govError;

    // Count initiative metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('initiative_metrics')
      .select('id', { count: 'exact', head: true });
    if (metricsError) throw metricsError;

    // Count financial impact records
    const { data: financial, error: financialError } = await supabase
      .from('initiative_financial_impact')
      .select('id', { count: 'exact', head: true });
    if (financialError) throw financialError;

    // Count performance data records
    const { data: performance, error: performanceError } = await supabase
      .from('initiative_performance_data')
      .select('id', { count: 'exact', head: true });
    if (performanceError) throw performanceError;

    console.log('\n📊 CORE DATA COUNTS:');
    console.log('-'.repeat(60));
    console.log(`Team Members:              ${teamMembers?.length ?? 0}`);
    console.log(`Managers:                  ${managers?.length ?? 0}`);
    console.log(`Active Initiatives:        ${initiatives?.length ?? 0}`);
    console.log(`Total Initiatives:         ${allInitiatives?.length ?? 0}`);
    console.log(`Initiative Stories:        ${stories?.length ?? 0}`);
    console.log(`Effort Logs:               ${effortLogs?.length ?? 0}`);
    console.log(`Governance Requests:       ${govRequests?.length ?? 0}`);

    console.log('\n📈 RELATED DATA COUNTS:');
    console.log('-'.repeat(60));
    console.log(`Initiative Metrics:        ${metrics?.length ?? 0}`);
    console.log(`Financial Impact Records:  ${financial?.length ?? 0}`);
    console.log(`Performance Data Records:  ${performance?.length ?? 0}`);

    console.log('\n✅ VERIFICATION SUMMARY:');
    console.log('-'.repeat(60));

    const expectedCounts = {
      teamMembers: 16,
      managers: 2,
      initiatives: 415,
      stories: 352,
      effortLogs: 300,
      govRequests: 8,
    };

    const actualCounts = {
      teamMembers: teamMembers?.length ?? 0,
      managers: managers?.length ?? 0,
      initiatives: initiatives?.length ?? 0,
      stories: stories?.length ?? 0,
      effortLogs: effortLogs?.length ?? 0,
      govRequests: govRequests?.length ?? 0,
    };

    console.log('\nExpected vs Actual:');
    console.log(`Team Members:     ${expectedCounts.teamMembers} expected, ${actualCounts.teamMembers} actual - ${actualCounts.teamMembers === expectedCounts.teamMembers ? '✅' : '❌'}`);
    console.log(`Managers:         ${expectedCounts.managers} expected, ${actualCounts.managers} actual - ${actualCounts.managers === expectedCounts.managers ? '✅' : '❌'}`);
    console.log(`Initiatives:      ${expectedCounts.initiatives} expected, ${actualCounts.initiatives} actual - ${actualCounts.initiatives === expectedCounts.initiatives ? '✅' : '❌'}`);
    console.log(`Stories:          ${expectedCounts.stories} expected, ${actualCounts.stories} actual - ${actualCounts.stories === expectedCounts.stories ? '✅' : '❌'}`);
    console.log(`Effort Logs:      ~${expectedCounts.effortLogs} expected, ${actualCounts.effortLogs} actual - ${Math.abs(actualCounts.effortLogs - expectedCounts.effortLogs) < 50 ? '✅' : '❌'}`);
    console.log(`Gov Requests:     ${expectedCounts.govRequests} expected, ${actualCounts.govRequests} actual - ${actualCounts.govRequests === expectedCounts.govRequests ? '✅' : '❌'}`);

    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(60));

  } catch (err) {
    console.error('❌ Error verifying counts:', err);
  }
}

verifyDataCounts();
