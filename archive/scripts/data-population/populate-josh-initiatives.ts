import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateJoshInitiatives() {
  // First, get Josh's team_member_id
  const { data: joshData, error: joshError } = await supabase
    .from('team_members')
    .select('id')
    .eq('name', 'Josh')
    .single();

  if (joshError) {
    console.error('Error finding Josh:', joshError);
    return;
  }

  const joshId = joshData.id;
  console.log('Josh ID:', joshId);

  // Initiative 1: C5 Titrations of Medications Workgroup
  console.log('\n1. Creating C5 Titrations of Medications Workgroup...');
  const { data: initiative1, error: error1 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: joshId,
      owner_name: 'Josh',
      initiative_name: 'C5 Titrations of Medications Workgroup - Critical Care',
      type: 'System Initiative',
      status: 'Active',
      role: 'Co-owner',
      ehrs_impacted: 'All',
      service_line: 'Acute Institute & Cardiology',
      start_date: null,
      end_date: '2025-06-03',
      timeframe_display: 'Go-Live 6/3/25',
      clinical_sponsor_name: 'John Morelli',
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Josh'
    })
    .select()
    .single();

  if (error1) {
    console.error('Error creating initiative 1:', error1);
  } else {
    console.log('✓ Created initiative 1:', initiative1.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative1.id,
      challenge: 'Standardize titration of critical care medications across CommonSpirit Health with go-live date 6/3/25',
      approach: null,
      outcome: null,
      collaboration_detail: null
    });
  }

  // Initiative 2: Alaris Pumps Standardization Project
  console.log('\n2. Creating Alaris Pumps Standardization Project...');
  const { data: initiative2, error: error2 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: joshId,
      owner_name: 'Josh',
      initiative_name: 'Alaris Pumps Standardization Project - Pharmacy Discussion',
      type: 'Project',
      status: 'Active',
      role: 'Co-owner',
      ehrs_impacted: 'All',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Weekly meetings in progress',
      clinical_sponsor_name: 'Karen McConnell',
      clinical_sponsor_title: 'CO-Englewood',
      key_collaborators: ['Pharmacy operations', 'IT'],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Josh'
    })
    .select()
    .single();

  if (error2) {
    console.error('Error creating initiative 2:', error2);
  } else {
    console.log('✓ Created initiative 2:', initiative2.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative2.id,
      challenge: 'Weekly meeting for pharmacy CIs, pharmacy operations, and IT to discuss what is needed from the system for the Alaris pump one library and how this matches up with the Epic Gold Project as they are starting to replace all pumps to BD alaris.',
      approach: null,
      outcome: null,
      collaboration_detail: 'Pharmacy operations, IT'
    });
  }

  // Initiative 3: Standardizing Medication Charging
  console.log('\n3. Creating Standardizing Medication Charging...');
  const { data: initiative3, error: error3 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: joshId,
      owner_name: 'Josh',
      initiative_name: 'Standardizing Charging for All Hospitals for Medications',
      type: 'Epic Gold',
      status: 'Active',
      role: 'Co-owner',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Design Phase',
      clinical_sponsor_name: 'Karen McConnell, Mathew Linderman',
      clinical_sponsor_title: 'CO-Englewood, ID',
      key_collaborators: ['IT build team', 'Finance Team', 'Van', 'Yvette'],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Josh'
    })
    .select()
    .single();

  if (error3) {
    console.error('Error creating initiative 3:', error3);
  } else {
    console.log('✓ Created initiative 3:', initiative3.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative3.id,
      challenge: 'Working with the IT build team, finance Team, and Van and Yvette to try to come up with a plan to standardize all medication charges for all of CommonSpirit Health',
      approach: 'Collaboration across multiple teams to design standardized charging methodology',
      outcome: null,
      collaboration_detail: 'IT build team, Finance Team, Van, Yvette'
    });
  }

  // Initiative 4: Heparin Drip Calculator Standardization
  console.log('\n4. Creating Heparin Drip Calculator Standardization...');
  const { data: initiative4, error: error4 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: joshId,
      owner_name: 'Josh',
      initiative_name: 'Heparin Drip - Calculator Standardization',
      type: 'Epic Gold',
      status: 'Active',
      role: 'Co-owner',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology, Nursing, Lab, Acute Institute & Cardiology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Design Phase',
      clinical_sponsor_name: 'Karen McConnell',
      clinical_sponsor_title: 'CO-Englewood',
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Josh'
    })
    .select()
    .single();

  if (error4) {
    console.error('Error creating initiative 4:', error4);
  } else {
    console.log('✓ Created initiative 4:', initiative4.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative4.id,
      challenge: 'Leading the conversation and discovery of what we could use as possible standardized Heparin Drips for our calculators for all of CommonSpirit Health',
      approach: null,
      outcome: null,
      collaboration_detail: null
    });
  }

  // Initiative 5: Epic Upgrade Nova Note Review - Willow Inpatient
  console.log('\n5. Creating Epic Upgrade Nova Note Review - Willow Inpatient...');
  const { data: initiative5, error: error5 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: joshId,
      owner_name: 'Josh',
      initiative_name: 'Epic Upgrade Nova Note Review May 24 (November go-live) - Willow Inpatient',
      type: 'Epic Upgrades',
      status: 'Completed',
      role: 'Co-owner',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Discovery/Define - Completed',
      clinical_sponsor_name: 'Karen McConnell',
      clinical_sponsor_title: 'CO-Englewood',
      key_collaborators: ['Pharmacy operations', 'Build team'],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Josh'
    })
    .select()
    .single();

  if (error5) {
    console.error('Error creating initiative 5:', error5);
  } else {
    console.log('✓ Created initiative 5:', initiative5.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative5.id,
      challenge: 'Review Epic Nova Notes for May 24 upgrade with November go-live',
      approach: 'Leading the conversations and meetings to ensure that the Willow Inpatient pharmacy operations have reviewed the nova notes for the upgrade and made their decisions that the build team needs to complete the work',
      outcome: 'Successfully completed review and decisions for upgrade',
      collaboration_detail: 'Pharmacy operations, Build team'
    });
  }

  // Initiative 6: VTE Prophylaxis Standardization
  console.log('\n6. Creating VTE Prophylaxis Standardization...');
  const { data: initiative6, error: error6 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: joshId,
      owner_name: 'Josh',
      initiative_name: 'VTE Prophylaxis Standardization',
      type: 'System Initiative',
      status: 'Active',
      role: 'Co-owner',
      ehrs_impacted: 'All',
      service_line: 'Acute Institute & Cardiology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Design Phase',
      clinical_sponsor_name: 'John Morelli',
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Josh'
    })
    .select()
    .single();

  if (error6) {
    console.error('Error creating initiative 6:', error6);
  } else {
    console.log('✓ Created initiative 6:', initiative6.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative6.id,
      challenge: 'Focus on the medication build for Epic for VTE Prophylaxis standardization across the system',
      approach: null,
      outcome: null,
      collaboration_detail: null
    });
  }

  // Initiative 7: Pediatric & Neonatal Titration Parameters for Epic Gold
  console.log('\n7. Creating Pediatric & Neonatal Titration Parameters...');
  const { data: initiative7, error: error7 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: joshId,
      owner_name: 'Josh',
      initiative_name: 'Pediatric & Neonatal Titration Parameters, Concentrations for Epic Gold',
      type: 'System Initiative',
      status: 'Active',
      role: 'Co-owner',
      ehrs_impacted: 'Epic',
      service_line: 'Pharmacy & Oncology',
      start_date: null,
      end_date: null,
      timeframe_display: 'Discovery/Define',
      clinical_sponsor_name: 'Eric Wymore',
      clinical_sponsor_title: 'WA-Tacoma',
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Josh'
    })
    .select()
    .single();

  if (error7) {
    console.error('Error creating initiative 7:', error7);
  } else {
    console.log('✓ Created initiative 7:', initiative7.id);

    await supabase.from('initiative_stories').insert({
      initiative_id: initiative7.id,
      challenge: 'Standardization of concentrations, mixtures, and parameters for pediatric and neonatal populations. To be implemented in Epic Gold (parameters previously implemented in Cerner)',
      approach: null,
      outcome: null,
      collaboration_detail: null
    });
  }

  console.log('\n✅ All Josh initiatives created successfully!');
}

populateJoshInitiatives();
