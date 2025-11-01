import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetGovernanceRequests() {
  console.log('🔄 Resetting all governance requests to Draft status...\n');

  // Get all governance requests
  const { data: requests, error: fetchError } = await supabase
    .from('governance_requests')
    .select('id, request_id, title, status, linked_initiative_id');

  if (fetchError) {
    console.error('❌ Error fetching governance requests:', fetchError);
    return;
  }

  console.log(`📋 Found ${requests.length} governance requests\n`);

  let resetCount = 0;
  let deletedInitiatives = 0;

  for (const request of requests) {
    console.log(`Processing ${request.request_id}: ${request.title}`);
    console.log(`  Current status: ${request.status}`);

    // If it has a linked initiative, delete it
    if (request.linked_initiative_id) {
      console.log(`  🗑️  Deleting linked initiative: ${request.linked_initiative_id}`);

      const { error: deleteError } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', request.linked_initiative_id);

      if (deleteError) {
        console.error(`  ❌ Error deleting initiative:`, deleteError.message);
      } else {
        deletedInitiatives++;
        console.log(`  ✅ Initiative deleted`);
      }
    }

    // Reset the governance request to Draft
    const { error: updateError } = await supabase
      .from('governance_requests')
      .update({
        status: 'Draft',
        linked_initiative_id: null,
        assigned_sci_id: null,
        assigned_sci_name: null,
        assigned_role: null,
        work_effort: null,
        work_type: null
      })
      .eq('id', request.id);

    if (updateError) {
      console.error(`  ❌ Error updating request:`, updateError.message);
    } else {
      resetCount++;
      console.log(`  ✅ Reset to Draft\n`);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ Summary:`);
  console.log(`   ${resetCount} governance requests reset to Draft`);
  console.log(`   ${deletedInitiatives} linked initiatives deleted`);
  console.log('');
  console.log('📝 All governance requests are now in Draft status');
  console.log('   You can now progress them through the workflow:');
  console.log('   1. Edit the request and fill out details');
  console.log('   2. Assign an SCI');
  console.log('   3. Change status to "Ready for Review" → Phase 1 creates initiative');
  console.log('   4. Change status to "Ready for Governance" → Phase 2 populates details');
  console.log('='.repeat(60));
}

resetGovernanceRequests().catch(console.error);
