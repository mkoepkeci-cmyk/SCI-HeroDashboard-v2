import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addValidatedCernerInitiatives() {
  console.log('🔄 Adding validated Cerner initiatives from PDF...\n');

  // Get Marty's team_member_id
  const { data: martyData, error: martyError } = await supabase
    .from('team_members')
    .select('id')
    .eq('name', 'Marty')
    .single();

  if (martyError) {
    console.error('❌ Error finding Marty:', martyError);
    return;
  }

  const martyId = martyData.id;
  console.log('✅ Found Marty ID:', martyId, '\n');

  // ============================================================
  // INITIATIVE 1: Medicare Annual Wellness Visits (AWV)
  // ============================================================
  console.log('1️⃣ Creating Medicare Annual Wellness Visits (AWV) initiative...');

  const { data: awvInitiative, error: awvError } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      initiative_name: 'Medicare Annual Wellness Visits (AWV)',
      type: 'System Initiative',
      status: 'Completed',
      role: 'Primary',
      ehrs_impacted: 'Cerner',
      service_line: 'Ambulatory',
      start_date: null, // Not provided in PDF
      end_date: null, // Completed but no specific end date
      timeframe_display: 'FY2023 → FY2024',
      clinical_sponsor_name: null, // Not provided
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Marty - Validated Data'
    })
    .select()
    .single();

  if (awvError) {
    console.error('❌ Error creating AWV initiative:', awvError);
    return;
  }
  console.log('✅ AWV initiative created:', awvInitiative.id);

  // Add AWV metrics
  console.log('  📊 Adding AWV metrics...');
  await supabase.from('initiative_metrics').insert([
    {
      initiative_id: awvInitiative.id,
      metric_name: 'FY2024 Completed AWVs',
      metric_type: 'Volume',
      baseline_value: 25648,
      current_value: 36413,
      unit: 'visits',
      improvement: '+42% increase (+10,765 visits)',
      measurement_method: 'Annual wellness visit completion tracking',
      baseline_date: '2023-07-01',
      measurement_date: '2024-06-30',
      display_order: 0
    },
    {
      initiative_id: awvInitiative.id,
      metric_name: 'Year-over-Year Growth',
      metric_type: 'Performance',
      baseline_value: 0,
      current_value: 42,
      unit: 'percent',
      improvement: '42% increase from FY2023',
      measurement_method: 'Comparison of FY2024 vs FY2023 completion rates',
      baseline_date: '2023-07-01',
      measurement_date: '2024-06-30',
      display_order: 1
    }
  ]);
  console.log('  ✅ Metrics added');

  // Add AWV financial impact
  console.log('  💰 Adding AWV financial impact...');
  await supabase.from('initiative_financial_impact').insert({
    initiative_id: awvInitiative.id,
    actual_revenue: 1290000, // $1.29M at $120/visit
    projected_annual: null, // Work is completed, no future projection
    actual_timeframe: 'FY2024 (July 2023 - June 2024)',
    projection_basis: null,
    measurement_start_date: '2023-07-01',
    measurement_end_date: '2024-06-30',
    key_assumptions: [
      '36,413 completed AWVs in FY2024',
      '$120/visit reimbursement rate (conservative)',
      'Alternative calculation: $1.61M at $150/visit',
      '42% increase from FY2023 baseline of 25,648 visits'
    ],
    calculation_methodology: 'Revenue Range: 36,413 visits × $120 = $1,290,000 (conservative) | 36,413 visits × $150 = $1,610,000 (higher estimate). Using conservative $120 rate for actual revenue.'
  });
  console.log('  ✅ Financial impact added');

  // Add AWV performance data
  console.log('  📈 Adding AWV performance data...');
  await supabase.from('initiative_performance_data').insert({
    initiative_id: awvInitiative.id,
    users_deployed: null, // Not applicable
    total_potential_users: null,
    adoption_rate: null,
    sample_size: '36,413 completed AWVs in FY2024',
    measurement_period: 'FY2024 (July 2023 - June 2024)',
    measurement_method: 'Annual completion tracking across Cerner markets',
    primary_outcome: '42% increase in completed AWVs (from 25,648 to 36,413), generating $1.29M-$1.61M in revenue',
    calculation_formula: 'FY2024 AWVs (36,413) - FY2023 AWVs (25,648) = +10,765 additional visits (+42%)',
    annual_impact_calculated: '36,413 AWVs completed × $120-$150 per visit = $1.29M-$1.61M revenue'
  });
  console.log('  ✅ Performance data added');

  // Add AWV story
  console.log('  📖 Adding AWV story...');
  await supabase.from('initiative_stories').insert({
    initiative_id: awvInitiative.id,
    challenge: 'Medicare Annual Wellness Visits are critical for preventive care and revenue capture, but completion rates needed improvement to meet organizational targets and maximize patient benefit.',
    approach: 'Implemented systematic improvements to AWV workflows in Cerner markets, including documentation optimization, provider education, and EHR workflow enhancements to increase completion rates.',
    outcome: 'Achieved 42% increase in completed AWVs from FY2023 to FY2024 (25,648 → 36,413 visits), adding 10,765 additional wellness visits. Generated $1.29M-$1.61M in actual revenue based on Medicare reimbursement rates.',
    collaboration_detail: 'Ambulatory teams across Cerner markets, billing/revenue cycle teams for tracking, clinical informatics for EHR optimization'
  });
  console.log('  ✅ Story added\n');

  // ============================================================
  // INITIATIVE 2: Depression Screening and Follow-Up
  // ============================================================
  console.log('2️⃣ Creating Depression Screening and Follow-Up initiative...');

  const { data: depressionInitiative, error: depressionError } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      initiative_name: 'Depression Screening and Follow-Up',
      type: 'System Initiative',
      status: 'Completed',
      role: 'Primary',
      ehrs_impacted: 'Cerner',
      service_line: 'Ambulatory',
      start_date: null,
      end_date: null,
      timeframe_display: 'FY2023 → FY2024',
      clinical_sponsor_name: null,
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Marty - Validated Data'
    })
    .select()
    .single();

  if (depressionError) {
    console.error('❌ Error creating Depression Screening initiative:', depressionError);
    return;
  }
  console.log('✅ Depression Screening initiative created:', depressionInitiative.id);

  // Add Depression Screening metrics
  console.log('  📊 Adding Depression Screening metrics...');
  await supabase.from('initiative_metrics').insert([
    {
      initiative_id: depressionInitiative.id,
      metric_name: 'FY2024 Screenings Completed',
      metric_type: 'Volume',
      baseline_value: 195897,
      current_value: 229193,
      unit: 'screenings',
      improvement: '+17% increase (+33,296 screenings)',
      measurement_method: 'Depression screening completion tracking',
      baseline_date: '2023-07-01',
      measurement_date: '2024-06-30',
      display_order: 0
    },
    {
      initiative_id: depressionInitiative.id,
      metric_name: 'Additional Screenings Year-over-Year',
      metric_type: 'Volume',
      baseline_value: 0,
      current_value: 33296,
      unit: 'screenings',
      improvement: '33,296 additional screenings',
      measurement_method: 'FY2024 vs FY2023 comparison',
      baseline_date: '2023-07-01',
      measurement_date: '2024-06-30',
      display_order: 1
    },
    {
      initiative_id: depressionInitiative.id,
      metric_name: 'Year-over-Year Growth Rate',
      metric_type: 'Performance',
      baseline_value: 0,
      current_value: 17,
      unit: 'percent',
      improvement: '17% increase from FY2023',
      measurement_method: 'Percentage growth calculation',
      baseline_date: '2023-07-01',
      measurement_date: '2024-06-30',
      display_order: 2
    }
  ]);
  console.log('  ✅ Metrics added');

  // Add Depression Screening financial impact
  console.log('  💰 Adding Depression Screening financial impact...');
  await supabase.from('initiative_financial_impact').insert({
    initiative_id: depressionInitiative.id,
    actual_revenue: 166000, // $166K at $5/screen (conservative)
    projected_annual: null,
    actual_timeframe: 'FY2024 (July 2023 - June 2024)',
    projection_basis: null,
    measurement_start_date: '2023-07-01',
    measurement_end_date: '2024-06-30',
    key_assumptions: [
      '33,296 additional screenings in FY2024',
      '$5-$6 reimbursement per screening',
      '229,193 total screenings completed',
      '17% increase from FY2023 baseline of 195,897'
    ],
    calculation_methodology: 'Revenue Range: 33,296 additional screenings × $5 = $166,480 (conservative) | 33,296 × $6 = $199,776 (higher estimate). Using conservative $5 rate for actual revenue.'
  });
  console.log('  ✅ Financial impact added');

  // Add Depression Screening performance data
  console.log('  📈 Adding Depression Screening performance data...');
  await supabase.from('initiative_performance_data').insert({
    initiative_id: depressionInitiative.id,
    users_deployed: null,
    total_potential_users: null,
    adoption_rate: null,
    sample_size: '229,193 depression screenings completed in FY2024',
    measurement_period: 'FY2024 (July 2023 - June 2024)',
    measurement_method: 'Screening completion tracking across Cerner markets',
    primary_outcome: '17% increase in completed screenings (from 195,897 to 229,193), adding 33,296 screenings and generating $166K-$200K in revenue',
    calculation_formula: 'FY2024 Screenings (229,193) - FY2023 Screenings (195,897) = +33,296 additional screenings (+17%)',
    annual_impact_calculated: '33,296 additional screenings × $5-$6 per screening = $166K-$200K revenue'
  });
  console.log('  ✅ Performance data added');

  // Add Depression Screening story
  console.log('  📖 Adding Depression Screening story...');
  await supabase.from('initiative_stories').insert({
    initiative_id: depressionInitiative.id,
    challenge: 'Depression screening and follow-up are essential for identifying at-risk patients and ensuring appropriate care, but completion rates needed improvement to meet quality standards and maximize patient safety.',
    approach: 'Enhanced depression screening workflows in Cerner markets through EHR optimization, provider education, and systematic follow-up processes to increase screening completion and follow-up rates.',
    outcome: 'Achieved 17% increase in completed depression screenings from FY2023 to FY2024 (195,897 → 229,193 screenings), adding 33,296 additional screenings. Generated $166K-$200K in actual revenue based on screening reimbursement rates.',
    collaboration_detail: 'Behavioral health teams across Cerner markets, primary care providers for screening integration, clinical informatics for EHR workflow optimization'
  });
  console.log('  ✅ Story added\n');

  console.log('✅✅✅ COMPLETE! Both validated Cerner initiatives added.\n');
  console.log('Summary:');
  console.log('  1. Medicare Annual Wellness Visits (AWV)');
  console.log('     - Status: Completed');
  console.log('     - FY2024: 36,413 visits (+42% from FY2023)');
  console.log('     - Revenue: $1.29M-$1.61M');
  console.log('     - EHR: Cerner only');
  console.log('');
  console.log('  2. Depression Screening and Follow-Up');
  console.log('     - Status: Completed');
  console.log('     - FY2024: 229,193 screenings (+17% from FY2023)');
  console.log('     - Revenue: $166K-$200K');
  console.log('     - EHR: Cerner only');
}

addValidatedCernerInitiatives();
