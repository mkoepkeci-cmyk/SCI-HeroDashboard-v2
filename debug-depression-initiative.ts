import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDepression() {
  console.log('\n=== CHECKING INITIATIVES TABLE ===');

  // Find depression initiative
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('*')
    .ilike('initiative_name', '%depression%');

  if (initError) {
    console.error('Error querying initiatives:', initError);
  } else {
    console.log(`Found ${initiatives?.length || 0} initiatives with "depression" in name:`);
    initiatives?.forEach(init => {
      console.log('\nInitiative:');
      console.log('  ID:', init.id);
      console.log('  Name:', init.initiative_name);
      console.log('  Status:', init.status);
      console.log('  Type:', init.type);
      console.log('  Team Member ID:', init.team_member_id);
      console.log('  Owner Name:', init.owner_name);
      console.log('  Is Active:', init.is_active);
      console.log('  Governance Request ID:', init.governance_request_id);
      console.log('  Created:', init.created_at);
      console.log('  Updated:', init.updated_at);
    });
  }

  console.log('\n=== CHECKING GOVERNANCE REQUESTS TABLE ===');

  // Find depression governance request
  const { data: govRequests, error: govError } = await supabase
    .from('governance_requests')
    .select('*')
    .ilike('initiative_name', '%depression%');

  if (govError) {
    console.error('Error querying governance requests:', govError);
  } else {
    console.log(`Found ${govRequests?.length || 0} governance requests with "depression" in name:`);
    govRequests?.forEach(req => {
      console.log('\nGovernance Request:');
      console.log('  ID:', req.id);
      console.log('  Name:', req.initiative_name);
      console.log('  Status:', req.status);
      console.log('  Assigned SCI ID:', req.assigned_sci_id);
      console.log('  Assigned SCI Name:', req.assigned_sci_name);
      console.log('  Linked Initiative ID:', req.linked_initiative_id);
      console.log('  Created:', req.created_at);
    });
  }

  console.log('\n=== CHECKING TEAM MEMBERS ===');

  // Get team members to see which one should have this initiative
  const { data: members, error: memberError } = await supabase
    .from('team_members')
    .select('id, name')
    .order('name');

  if (memberError) {
    console.error('Error querying team members:', memberError);
  } else {
    console.log(`\nTeam Members (${members?.length || 0} total):`);
    members?.forEach(member => {
      console.log(`  ${member.id}: ${member.name}`);
    });
  }
}

debugDepression().catch(console.error);
