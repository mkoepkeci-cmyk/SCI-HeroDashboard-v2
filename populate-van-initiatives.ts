import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateVanInitiatives() {
  // First, get Van's team_member_id
  const { data: vanData, error: vanError } = await supabase
    .from('team_members')
    .select('id')
    .eq('name', 'Van')
    .single();

  if (vanError) {
    console.error('Error finding Van:', vanError);
    return;
  }

  const vanId = vanData.id;
  console.log('Van ID:', vanId);

  // Initiative 1: Epic Gold: Charges
  console.log('\n1. Creating Epic Gold: Charges...');
  const { data: initiative1, error: error1 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: vanId,
      owner_name: 'Van',
      initiative_name: 'Epic Gold: Medication Charges - HCPCS, Waste, EAP',
      type: 'Epic Gold',
      status: 'Active',
      role: 'Primary',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: '2025-05-18',
      end_date: '2026-02-05',
      timeframe_display: 'Wave 3 - 5.2.2026',
      clinical_sponsor_name: null,
      clinical_sponsor_title: null,
      key_collaborators: ['IT build team'],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Van'
    })
    .select()
    .single();

  if (error1) {
    console.error('Error creating initiative 1:', error1);
  } else {
    console.log('✓ Created initiative 1:', initiative1.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative1.id,
      challenge: 'Populate GOLD erx with billing info (hcpcs, waste ind, EAP) in collaboration with IT',
      approach: 'Design phase work in collaboration with IT build team',
      outcome: null,
      collaboration_detail: 'IT build team'
    });
  }

  // Initiative 2: TPN Standardization
  console.log('\n2. Creating TPN Standardization...');
  const { data: initiative2, error: error2 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: vanId,
      owner_name: 'Van',
      initiative_name: 'TPN Standardization',
      type: 'Epic Gold',
      status: 'Completed',
      role: 'Co-owner',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Delivered - Awaiting testing',
      clinical_sponsor_name: 'System IT and Rx',
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Van'
    })
    .select()
    .single();

  if (error2) {
    console.error('Error creating initiative 2:', error2);
  } else {
    console.log('✓ Created initiative 2:', initiative2.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative2.id,
      challenge: 'Standardization of guiding principles for TPN build',
      approach: null,
      outcome: 'Standards delivered to IT build. Awaiting testing for gold',
      collaboration_detail: 'System IT and Rx teams'
    });
  }

  // Initiative 3: Frequency Standardization
  console.log('\n3. Creating Frequency Standardization...');
  const { data: initiative3, error: error3 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: vanId,
      owner_name: 'Van',
      initiative_name: 'Frequency Standardization',
      type: 'Epic Gold',
      status: 'Completed',
      role: 'Primary',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Delivered',
      clinical_sponsor_name: 'System IT and Rx',
      clinical_sponsor_title: null,
      key_collaborators: ['Nursing', 'RT leaders'],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Van'
    })
    .select()
    .single();

  if (error3) {
    console.error('Error creating initiative 3:', error3);
  } else {
    console.log('✓ Created initiative 3:', initiative3.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative3.id,
      challenge: 'Standardizing gold freq list to that used in SOUTH. Working with nursing to standardize admin times of scheduled times',
      approach: 'Spreadsheet analysis for standardization recommendations. Vet with nursing and RT leaders to determine system standard times',
      outcome: 'Standardization recommendations delivered',
      collaboration_detail: 'Nursing, RT leaders'
    });
  }

  // Initiative 4: MAR Flowsheet Row Standardization
  console.log('\n4. Creating MAR Flowsheet Row Standardization...');
  const { data: initiative4, error: error4 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: vanId,
      owner_name: 'Van',
      initiative_name: 'MAR Flowsheet Row Standardization',
      type: 'Epic Gold',
      status: 'Completed',
      role: 'Primary',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Delivered',
      clinical_sponsor_name: 'System IT and Rx',
      clinical_sponsor_title: null,
      key_collaborators: ['Karen McConnell'],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Van'
    })
    .select()
    .single();

  if (error4) {
    console.error('Error creating initiative 4:', error4);
  } else {
    console.log('✓ Created initiative 4:', initiative4.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative4.id,
      challenge: 'Standardization of which flowsheet rows belong to which meds or med classes',
      approach: 'Work with Karen on compiling design on meds with flowsheet rows for standardization',
      outcome: 'Design delivered',
      collaboration_detail: 'Karen McConnell'
    });
  }

  // Initiative 5: ERX Analysis - Order Instructions
  console.log('\n5. Creating ERX Analysis - Order Instructions...');
  const { data: initiative5, error: error5 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: vanId,
      owner_name: 'Van',
      initiative_name: 'ERX Analysis, Standard Design, Validation - Order Instructions',
      type: 'Epic Gold',
      status: 'Completed',
      role: 'Co-owner',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Design Phase - Completed',
      clinical_sponsor_name: 'System IT and Rx',
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Van'
    })
    .select()
    .single();

  if (error5) {
    console.error('Error creating initiative 5:', error5);
  } else {
    console.log('✓ Created initiative 5:', initiative5.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative5.id,
      challenge: 'Identify Epic gold ERX for all meds that require order instructions',
      approach: 'Spreadsheet review and design',
      outcome: 'Design completed and delivered',
      collaboration_detail: null
    });
  }

  // Initiative 6: MTN 340B Extension Build
  console.log('\n6. Creating MTN 340B Extension Build...');
  const { data: initiative6, error: error6 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: vanId,
      owner_name: 'Van',
      initiative_name: 'MTN 340B Extension Build',
      type: 'General Support',
      status: 'Completed',
      role: 'Co-owner',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: '2025-04-08',
      end_date: null,
      timeframe_display: 'Develop - Completed',
      clinical_sponsor_name: null,
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Van'
    })
    .select()
    .single();

  if (error6) {
    console.error('Error creating initiative 6:', error6);
  } else {
    console.log('✓ Created initiative 6:', initiative6.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative6.id,
      challenge: 'UD modifiers build to drop appropriately on 340B sites',
      approach: null,
      outcome: 'Completed work. Maintenance handed to O&M teams',
      collaboration_detail: null
    });
  }

  // Initiative 7: MTN Charge Workqueues
  console.log('\n7. Creating MTN Charge Workqueues...');
  const { data: initiative7, error: error7 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: vanId,
      owner_name: 'Van',
      initiative_name: 'MTN Charge Workqueues - Revenue Recovery',
      type: 'General Support',
      status: 'Active',
      role: 'Support',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: '2025-04-07',
      end_date: null,
      timeframe_display: 'Ongoing support as needed',
      clinical_sponsor_name: null,
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Van'
    })
    .select()
    .single();

  if (error7) {
    console.error('Error creating initiative 7:', error7);
  } else {
    console.log('✓ Created initiative 7:', initiative7.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative7.id,
      challenge: '3 large active workqueues for cleanup (over 1000 line items) holding up to over 125 mil in revenue. Consultant with support',
      approach: null,
      outcome: 'Bulk work completed. Consult role for select issues',
      collaboration_detail: null
    });
  }

  console.log('\n✅ All Van initiatives created successfully!');
}

populateVanInitiatives();
