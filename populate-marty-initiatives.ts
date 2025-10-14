import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateMartyInitiatives() {
  // First, get Marty's team_member_id
  const { data: martyData, error: martyError } = await supabase
    .from('team_members')
    .select('id')
    .eq('name', 'Marty')
    .single();

  if (martyError) {
    console.error('Error finding Marty:', martyError);
    return;
  }

  const martyId = martyData.id;
  console.log('Marty ID:', martyId);

  // Initiative 1: HRS Integration - Remote Patient Monitoring
  console.log('\n1. Creating HRS Integration - Remote Patient Monitoring...');
  const { data: initiative1, error: error1 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      initiative_name: 'HRS Integration - Remote Patient Monitoring',
      type: 'Project',
      status: 'Active',
      start_date: null,  // Not in CSV
      end_date: '2025-07-29',  // Projected Go-Live Date from CSV
      timeframe_display: 'Discovery/Define → Go-Live 7/29/25',
      clinical_sponsor_name: 'Dr. Christine Braid',
      clinical_sponsor_title: null,  // Not in CSV
      key_collaborators: [],  // Not in CSV
      governance_bodies: [],  // Not in CSV
      is_draft: false,
      last_updated_by: 'Marty'
    })
    .select()
    .single();

  if (error1) {
    console.error('Error creating initiative 1:', error1);
  } else {
    console.log('✓ Created initiative 1:', initiative1.id);

    // Add story from CSV
    await supabase.from('initiative_stories').insert({
      initiative_id: initiative1.id,
      challenge: 'In Discovery',
      approach: null,
      outcome: null,
      collaboration_detail: null
    });
  }

  // Initiative 2: Notable Health - RPM to API Migration
  console.log('\n2. Creating Notable Health - RPM to API Migration...');
  const { data: initiative2, error: error2 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      initiative_name: 'Notable Health - RPM to API Migration',
      type: 'System Initiative',
      status: 'Active',
      start_date: null,  // Not in CSV
      end_date: null,  // Not in CSV
      timeframe_display: 'In Progress - Testing Phase',
      clinical_sponsor_name: 'Dr. Marijka Grey',
      clinical_sponsor_title: null,  // Not in CSV
      key_collaborators: ['Notable team'],  // Implied from CSV description
      governance_bodies: [],  // Not in CSV
      is_draft: false,
      last_updated_by: 'Marty'
    })
    .select()
    .single();

  if (error2) {
    console.error('Error creating initiative 2:', error2);
  } else {
    console.log('✓ Created initiative 2:', initiative2.id);

    // Add story from CSV description
    await supabase.from('initiative_stories').insert({
      initiative_id: initiative2.id,
      challenge: 'Supporting Notable\'s transition from RPM to API format.',
      approach: 'Support Notable team during development, testing and rollout',
      outcome: '7/30: Testing underway for migration to API',
      collaboration_detail: 'Notable team'
    });
  }

  // Initiative 3: SDOH Standardization
  console.log('\n3. Creating SDOH Standardization...');
  const { data: initiative3, error: error3 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      initiative_name: 'Social Determinants of Health (SDOH) Standardization for Amb/ED/HOD',
      type: 'General Support',
      status: 'Active',
      start_date: null,  // Not in CSV
      end_date: null,  // Not in CSV
      timeframe_display: 'Design Phase',
      clinical_sponsor_name: 'Ankita Sagar',
      clinical_sponsor_title: null,  // Not in CSV
      key_collaborators: ['Lisa'],  // From CSV comments
      governance_bodies: ['SDOH collaborative'],  // From CSV comments
      is_draft: false,
      last_updated_by: 'Marty'
    })
    .select()
    .single();

  if (error3) {
    console.error('Error creating initiative 3:', error3);
  } else {
    console.log('✓ Created initiative 3:', initiative3.id);

    // Add story from CSV description
    await supabase.from('initiative_stories').insert({
      initiative_id: initiative3.id,
      challenge: 'Design session prep in progress. Multiple open questions about scope: Will ED get abuse/neglect? Update just Cerner or include Epic? Align Epic/Cerner abuse/neglect FU? Update Gold to new standard only?',
      approach: 'Lisa wants to ensure other detail related questions are answered before scheduling design. Will be attending SDOH collaborative on Friday for open items to be reviewed.',
      outcome: '7/30: Design session prep in progress',
      collaboration_detail: 'Lisa, SDOH collaborative team'
    });
  }

  // Initiative 4: Clinical Informatics Website
  console.log('\n4. Creating Clinical Informatics Website...');
  const { data: initiative4, error: error4 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      initiative_name: 'Clinical Informatics Enterprise Website',
      type: 'System Initiative',
      status: 'Active',
      start_date: null,  // Not in CSV
      end_date: null,  // Not in CSV
      timeframe_display: 'Discovery/Define',
      clinical_sponsor_name: 'Boomie Harvey',
      clinical_sponsor_title: null,  // Not in CSV
      key_collaborators: [],  // Not in CSV
      governance_bodies: [],  // Not in CSV
      is_draft: false,
      last_updated_by: 'Marty'
    })
    .select()
    .single();

  if (error4) {
    console.error('Error creating initiative 4:', error4);
  } else {
    console.log('✓ Created initiative 4:', initiative4.id);

    // Add story from CSV
    await supabase.from('initiative_stories').insert({
      initiative_id: initiative4.id,
      challenge: 'Implement a new CI website for use by enterprise',
      approach: null,
      outcome: null,
      collaboration_detail: null
    });
  }

  console.log('\n✅ All initiatives created successfully!');
  console.log('\nNote: Abridge initiative was NOT touched - it remains as-is in the database.');
}

populateMartyInitiatives();
