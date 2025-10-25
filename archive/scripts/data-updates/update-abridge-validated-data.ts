import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAbridgeValidatedData() {
  console.log('🔄 Updating Abridge AI Pilot with validated PDF data...\n');

  const initiativeId = '5a8c9e83-3cf9-4120-9f59-a7ac84f1c6e4'; // Abridge AI Pilot - Clinical Documentation Efficiency Analysis

  // STEP 1: Update basic initiative info
  console.log('1️⃣ Updating initiative basic information...');
  const { error: updateError } = await supabase
    .from('initiatives')
    .update({
      timeframe_display: 'April–August 2025',
      updated_at: new Date().toISOString(),
      last_updated_by: 'Marty - Validated Data Update'
    })
    .eq('id', initiativeId);

  if (updateError) {
    console.error('❌ Error updating initiative:', updateError);
    return;
  }
  console.log('✅ Initiative updated\n');

  // STEP 2: Delete all existing metrics (removing regional data)
  console.log('2️⃣ Removing old metrics (including regional data)...');
  const { error: deleteMetricsError } = await supabase
    .from('initiative_metrics')
    .delete()
    .eq('initiative_id', initiativeId);

  if (deleteMetricsError) {
    console.error('❌ Error deleting metrics:', deleteMetricsError);
    return;
  }
  console.log('✅ Old metrics removed\n');

  // STEP 3: Add new validated metrics from PDF
  console.log('3️⃣ Adding validated metrics from PDF...');
  const newMetrics = [
    {
      initiative_id: initiativeId,
      metric_name: 'Time Saved per Appointment',
      metric_type: 'Efficiency',
      baseline_value: 0,
      current_value: 0.61,
      unit: 'minutes',
      improvement: '0.61 min saved per appointment',
      measurement_method: 'Average time saved per appointment',
      baseline_date: '2025-04-01',
      measurement_date: '2025-08-31',
      display_order: 0
    },
    {
      initiative_id: initiativeId,
      metric_name: 'Providers in Pilot',
      metric_type: 'Volume',
      baseline_value: 0,
      current_value: 222,
      unit: 'providers',
      improvement: '222 providers in Epic',
      measurement_method: 'Provider count in pilot',
      baseline_date: '2025-04-01',
      measurement_date: '2025-08-31',
      display_order: 1
    },
    {
      initiative_id: initiativeId,
      metric_name: 'Appointments per Day',
      metric_type: 'Volume',
      baseline_value: 0,
      current_value: 17,
      unit: 'appointments',
      improvement: 'Average 17 appointments/day per provider',
      measurement_method: 'Daily appointment volume per provider',
      baseline_date: '2025-04-01',
      measurement_date: '2025-08-31',
      display_order: 2
    },
    {
      initiative_id: initiativeId,
      metric_name: 'Time Saved per Day (Per Provider)',
      metric_type: 'Efficiency',
      baseline_value: 0,
      current_value: 10.4,
      unit: 'minutes',
      improvement: '10.4 minutes saved per day per provider',
      measurement_method: '0.61 min × 17 appointments',
      baseline_date: '2025-04-01',
      measurement_date: '2025-08-31',
      display_order: 3
    },
    {
      initiative_id: initiativeId,
      metric_name: 'Extra Appointments per Day (Per Provider)',
      metric_type: 'Capacity',
      baseline_value: 0,
      current_value: 1,
      unit: 'appointments',
      improvement: '1 extra appointment per day possible',
      measurement_method: '10.4 min saved ÷ 15-min slots',
      baseline_date: '2025-04-01',
      measurement_date: '2025-08-31',
      display_order: 4
    },
    {
      initiative_id: initiativeId,
      metric_name: 'Extra Visits per Year (Per Provider)',
      metric_type: 'Capacity',
      baseline_value: 0,
      current_value: 250,
      unit: 'visits',
      improvement: '250 extra visits per year per provider',
      measurement_method: '1 appointment/day × 250 workdays',
      baseline_date: '2025-04-01',
      measurement_date: '2025-08-31',
      display_order: 5
    }
  ];

  const { error: metricsError } = await supabase
    .from('initiative_metrics')
    .insert(newMetrics);

  if (metricsError) {
    console.error('❌ Error adding metrics:', metricsError);
    return;
  }
  console.log('✅ Added 6 validated metrics\n');

  // STEP 4: Update financial impact
  console.log('4️⃣ Updating financial impact data...');
  const { error: deleteFinancialError } = await supabase
    .from('initiative_financial_impact')
    .delete()
    .eq('initiative_id', initiativeId);

  if (deleteFinancialError) {
    console.error('❌ Error deleting financial data:', deleteFinancialError);
    return;
  }

  const { error: financialError } = await supabase
    .from('initiative_financial_impact')
    .insert({
      initiative_id: initiativeId,
      actual_revenue: 8330000, // $8.33M pilot revenue
      projected_annual: 168750000, // $168.75M system-wide
      actual_timeframe: 'Annual projection based on 4-month pilot (April-August 2025)',
      projection_basis: '222 Epic providers in pilot → 4,500 providers system-wide (75% of 6,000)',
      measurement_start_date: '2025-04-01',
      measurement_end_date: '2025-08-31',
      key_assumptions: [
        '0.61 min saved per appointment',
        '17 appointments per day per provider',
        '250 workdays per year',
        '$150 revenue per visit',
        '75% deployment rate (4,500 of 6,000 providers)'
      ],
      calculation_methodology: 'Per Provider: 10.4 min saved/day = 1 extra appointment/day × 250 days = 250 extra visits/year × $150 = $37,500/provider. Pilot: 222 providers × $37,500 = $8.33M. System-Wide: 4,500 providers × $37,500 = $168.75M'
    });

  if (financialError) {
    console.error('❌ Error adding financial data:', financialError);
    return;
  }
  console.log('✅ Financial impact updated\n');

  // STEP 5: Update performance data
  console.log('5️⃣ Updating performance data...');
  const { error: deletePerfError } = await supabase
    .from('initiative_performance_data')
    .delete()
    .eq('initiative_id', initiativeId);

  if (deletePerfError) {
    console.error('❌ Error deleting performance data:', deletePerfError);
    return;
  }

  const { error: perfError } = await supabase
    .from('initiative_performance_data')
    .insert({
      initiative_id: initiativeId,
      users_deployed: 222,
      total_potential_users: 6000,
      adoption_rate: 3.7, // 222/6000 = 3.7%
      sample_size: '222 providers in Epic over 4-month pilot',
      measurement_period: 'April–August 2025',
      measurement_method: 'System analytics tracking documentation time and appointment capacity',
      primary_outcome: '0.61 minutes saved per appointment; 10.4 minutes saved per day per provider; 1 extra appointment capacity per day',
      calculation_formula: 'Time saved = 0.61 min × 17 appointments/day = 10.4 min/day. Extra capacity = 10.4 min ÷ 15-min slots = 1 appointment/day',
      annual_impact_calculated: 'Per provider: 250 extra visits/year. Pilot: 55,000 extra visits/year. System-wide: 1,125,000 extra visits/year'
    });

  if (perfError) {
    console.error('❌ Error adding performance data:', perfError);
    return;
  }
  console.log('✅ Performance data updated\n');

  // STEP 6: Update projections
  console.log('6️⃣ Updating projection scenarios...');
  const { error: deleteProjError } = await supabase
    .from('initiative_projections')
    .delete()
    .eq('initiative_id', initiativeId);

  if (deleteProjError) {
    console.error('❌ Error deleting projections:', deleteProjError);
    return;
  }

  const newProjections = [
    {
      initiative_id: initiativeId,
      scenario_description: 'Pilot Results (222 Epic Providers)',
      projected_users: 222,
      percent_of_organization: 3.7,
      projected_time_savings: '55,000 extra visits per year',
      projected_dollar_value: '$8.33M annually',
      revenue_impact: '$8.33M annually ($37,500 per provider)',
      calculation_method: '222 providers × 250 extra visits/year = 55,000 visits × $150 = $8.33M',
      assumptions: [
        '0.61 min saved per appointment',
        '17 appointments per day',
        '250 workdays per year',
        '1 extra appointment per day per provider',
        '$150 revenue per visit'
      ],
      sensitivity_notes: 'Actual pilot results from 4-month period',
      additional_benefits: 'Reduced documentation burden, improved provider satisfaction'
    },
    {
      initiative_id: initiativeId,
      scenario_description: 'System-Wide Deployment (75% of 6,000 = 4,500 Providers)',
      projected_users: 4500,
      percent_of_organization: 75,
      projected_time_savings: '1,125,000 extra visits per year',
      projected_dollar_value: '$168.75M annually',
      revenue_impact: '$168.75M annually ($37,500 per provider)',
      calculation_method: '4,500 providers × 250 extra visits/year = 1,125,000 visits × $150 = $168.75M',
      assumptions: [
        '75% deployment rate (conservative)',
        'Same performance as pilot',
        '0.61 min saved per appointment maintained at scale',
        '17 appointments per day average',
        '$150 revenue per visit'
      ],
      sensitivity_notes: 'Conservative projection assuming 75% provider adoption',
      additional_benefits: 'System-wide capacity increase, reduced provider burnout, improved patient access'
    }
  ];

  const { error: projError } = await supabase
    .from('initiative_projections')
    .insert(newProjections);

  if (projError) {
    console.error('❌ Error adding projections:', projError);
    return;
  }
  console.log('✅ Added 2 projection scenarios\n');

  // STEP 7: Update story
  console.log('7️⃣ Updating initiative story...');
  const { error: deleteStoryError } = await supabase
    .from('initiative_stories')
    .delete()
    .eq('initiative_id', initiativeId);

  if (deleteStoryError) {
    console.error('❌ Error deleting story:', deleteStoryError);
    return;
  }

  const { error: storyError } = await supabase
    .from('initiative_stories')
    .insert({
      initiative_id: initiativeId,
      challenge: 'Clinical documentation was consuming significant provider time, reducing patient access and contributing to provider burnout. Providers needed a solution to reduce documentation burden while maintaining quality.',
      approach: 'Implemented Abridge AI-powered clinical documentation tool in a 4-month pilot (April–August 2025) with 222 Epic providers. Monitored time savings per appointment, daily documentation efficiency, and provider capacity gains. Tracked performance to validate scalability for system-wide deployment.',
      outcome: 'Pilot achieved 0.61 minutes saved per appointment, translating to 10.4 minutes saved per day per provider. This created capacity for 1 additional appointment per day, resulting in 250 extra visits per year per provider. Pilot generated $8.33M in annual revenue potential across 222 providers. System-wide projection: $168.75M annually with deployment to 4,500 providers (75% of organization).',
      collaboration_detail: 'Clinical sponsors across ambulatory departments. IT integration team for Epic deployment. Provider champions for adoption and feedback. Analytics team for measurement and validation.'
    });

  if (storyError) {
    console.error('❌ Error adding story:', storyError);
    return;
  }
  console.log('✅ Story updated\n');

  console.log('✅✅✅ COMPLETE! Abridge initiative updated with validated PDF data.\n');
  console.log('Summary of changes:');
  console.log('  - Removed regional market-level data');
  console.log('  - Updated to 222 providers (Epic pilot)');
  console.log('  - Updated to 17 appointments/day per provider');
  console.log('  - Updated pilot revenue: $8.33M');
  console.log('  - Updated system-wide projection: $168.75M (4,500 providers at 75%)');
  console.log('  - Replaced 8 old metrics with 6 validated metrics');
  console.log('  - Updated all financial, performance, and projection data');
  console.log('  - Updated story to reflect validated data');
}

updateAbridgeValidatedData();
