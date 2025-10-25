import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addCompletedInitiatives() {
  // Get Marty's team_member_id
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

  // Completed Initiative 1: HRS Integration - Remote Patient Monitoring (Cerner)
  console.log('\n1. Creating HRS Integration - Remote Patient Monitoring (Cerner - Completed)...');
  const { data: initiative1, error: error1 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      role: 'Primary',
      initiative_name: 'HRS Integration - Remote Patient Monitoring (Cerner Implementation)',
      type: 'Project',
      status: 'Completed',
      ehrs_impacted: 'Cerner',
      service_line: 'Ambulatory',
      start_date: null,
      end_date: '2025-07-29',
      timeframe_display: 'Did We Deliver → Go-Live 7/29/25',
      clinical_sponsor_name: 'Dr. Christine Braid',
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Marty'
    })
    .select()
    .single();

  if (error1) {
    console.error('Error creating initiative 1:', error1);
  } else {
    console.log('✓ Created initiative 1:', initiative1.id);

    // Add story
    await supabase.from('initiative_stories').insert({
      initiative_id: initiative1.id,
      challenge: 'Design outbound orders for enrollment in Remote Pt Monitoring program, and supporting note return back to the EHR',
      approach: 'Worked with HRS and Cerner to design integration workflow',
      outcome: '7/30: Remediating one last item, then will be ready to close. Successfully delivered on 7/29/25.',
      collaboration_detail: 'Dr. Christine Braid (sponsor), HRS team, Cerner build team. Reference: FETR0101077, ALM 4426'
    });
  }

  // Completed Initiative 2: Zoom/Epic/Cerner Integration FHIR Migration
  console.log('\n2. Creating Zoom/Epic/Cerner Integration FHIR Migration (Completed)...');
  const { data: initiative2, error: error2 } = await supabase
    .from('initiatives')
    .insert({
      team_member_id: martyId,
      owner_name: 'Marty',
      role: 'Primary',
      initiative_name: 'Zoom Integration FHIR Migration',
      type: 'Project',
      status: 'Completed',
      ehrs_impacted: 'All',
      service_line: 'Ambulatory',
      start_date: null,
      end_date: null,
      timeframe_display: 'Did We Deliver → Completed before Feb 2025 deadline',
      clinical_sponsor_name: 'Dr. Erine Erickson',
      clinical_sponsor_title: null,
      key_collaborators: [],
      governance_bodies: [],
      is_draft: false,
      last_updated_by: 'Marty'
    })
    .select()
    .single();

  if (error2) {
    console.error('Error creating initiative 2:', error2);
  } else {
    console.log('✓ Created initiative 2:', initiative2.id);

    // Add story
    await supabase.from('initiative_stories').insert({
      initiative_id: initiative2.id,
      challenge: 'Zoom was deprecating their old integration standard in February 2025, requiring a system-wide migration to the new FHIR standard across all EHR platforms.',
      approach: 'Updated Zoom integration to the new required FHIR standard. Coordinated migration across both Epic and Cerner platforms while maintaining service continuity.',
      outcome: 'Successfully completed system-wide migration to FHIR standard before the February 2025 deprecation deadline. All EHR platforms (Epic and Cerner) now using the new standard.',
      collaboration_detail: 'Dr. Erine Erickson (sponsor), Zoom team, Epic and Cerner IT build teams'
    });
  }

  console.log('\n✅ Completed initiatives added successfully!');
  console.log('\nMarty now has 7 total initiatives:');
  console.log('- 1 Completed (Abridge)');
  console.log('- 4 Active (HRS Epic, Notable, SDOH, CI Website)');
  console.log('- 2 Completed (HRS Cerner, Zoom FHIR)');
}

addCompletedInitiatives();
