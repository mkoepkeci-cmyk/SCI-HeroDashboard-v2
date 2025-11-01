import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGov003() {
  console.log('🔍 Checking GOV-2025-003 and its linked initiative...\n');

  // Find the governance request
  const { data: govRequest, error: govError } = await supabase
    .from('governance_requests')
    .select('*')
    .eq('request_id', 'GOV-2025-003')
    .single();

  if (govError) {
    console.error('❌ Error fetching governance request:', govError);
    return;
  }

  if (!govRequest) {
    console.error('❌ Governance request GOV-2025-003 not found');
    return;
  }

  console.log('📋 GOVERNANCE REQUEST:');
  console.log('=====================================');
  console.log('ID:', govRequest.id);
  console.log('Request ID:', govRequest.request_id);
  console.log('Title:', govRequest.title);
  console.log('Status:', govRequest.status);
  console.log('Assigned SCI ID:', govRequest.assigned_sci_id);
  console.log('Assigned SCI Name:', govRequest.assigned_sci_name);
  console.log('Linked Initiative ID:', govRequest.linked_initiative_id);
  console.log('=====================================\n');

  if (!govRequest.linked_initiative_id) {
    console.log('⚠️  No linked initiative found. Phase 1 may not have run.');
    return;
  }

  // Fetch the linked initiative
  const { data: initiative, error: initError } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', govRequest.linked_initiative_id)
    .single();

  if (initError) {
    console.error('❌ Error fetching initiative:', initError);
    return;
  }

  if (!initiative) {
    console.error('❌ Linked initiative not found (orphaned link)');
    return;
  }

  console.log('🎯 LINKED INITIATIVE:');
  console.log('=====================================');
  console.log('ID:', initiative.id);
  console.log('Name:', initiative.initiative_name);
  console.log('Type:', initiative.type);
  console.log('Status:', initiative.status);
  console.log('Phase:', initiative.phase);
  console.log('Owner Name:', initiative.owner_name);
  console.log('Team Member ID:', initiative.team_member_id);
  console.log('Work Effort:', initiative.work_effort);
  console.log('Role:', initiative.role);
  console.log('EHRs Impacted:', initiative.ehrs_impacted);
  console.log('Service Line:', initiative.service_line);
  console.log('Is Active:', initiative.is_active);
  console.log('Is Draft:', initiative.is_draft);
  console.log('Created At:', new Date(initiative.created_at).toLocaleString());
  console.log('Updated At:', new Date(initiative.updated_at).toLocaleString());
  console.log('Governance Request ID:', initiative.governance_request_id);
  console.log('Request ID:', initiative.request_id);
  console.log('=====================================\n');

  // Check filtering logic from BulkEffortEntry.tsx
  console.log('🔍 FILTERING CHECKS:');
  console.log('=====================================');

  // Check 1: Status filter (lines 264-269 in BulkEffortEntry.tsx)
  const validStatuses = ['Active', 'Planning', 'Scaling', 'Not Started', 'In Progress', 'On Hold'];
  const passesStatusFilter = validStatuses.includes(initiative.status || '');
  console.log('Status Filter (must be one of:', validStatuses.join(', ') + ')');
  console.log('  Current status:', initiative.status);
  console.log('  Passes filter:', passesStatusFilter ? '✅ YES' : '❌ NO');
  console.log('');

  // Check 2: Owner name filter (lines 272-278 in BulkEffortEntry.tsx)
  const teamMemberName = 'Lisa Townsend';
  const passesOwnerFilter = 
    initiative.owner_name === teamMemberName || 
    initiative.team_member_id === govRequest.assigned_sci_id;
  console.log('Owner Filter (must match Lisa Townsend):');
  console.log('  Owner name:', initiative.owner_name);
  console.log('  Team member ID matches:', initiative.team_member_id === govRequest.assigned_sci_id);
  console.log('  Passes filter:', passesOwnerFilter ? '✅ YES' : '❌ NO');
  console.log('');

  // Check 3: Dashboard Overview filter (lines 436-442 in App.tsx)
  const dashboardActiveStatuses = ['Active', 'Planning', 'Scaling', 'Not Started', 'In Progress'];
  const passesDashboardFilter = dashboardActiveStatuses.includes(initiative.status || '');
  console.log('Dashboard "Active" Tab Filter (must be one of:', dashboardActiveStatuses.join(', ') + ')');
  console.log('  Current status:', initiative.status);
  console.log('  Passes filter:', passesDashboardFilter ? '✅ YES' : '❌ NO');
  console.log('');

  // Check 4: Not deleted
  const passesDeletedFilter = initiative.status !== 'Deleted';
  console.log('Not Deleted Filter:');
  console.log('  Status:', initiative.status);
  console.log('  Passes filter:', passesDeletedFilter ? '✅ YES' : '❌ NO');
  console.log('=====================================\n');

  // Final verdict
  console.log('📊 FINAL VERDICT:');
  console.log('=====================================');
  console.log('Should appear in BulkEffortEntry (SCI View):', 
    passesStatusFilter && passesOwnerFilter && passesDeletedFilter ? '✅ YES' : '❌ NO');
  console.log('Should appear in Dashboard Overview (Active tab):', 
    passesDashboardFilter && passesDeletedFilter ? '✅ YES' : '❌ NO');
  console.log('=====================================\n');

  if (!passesStatusFilter) {
    console.log('⚠️  ROOT CAUSE: Initiative status "' + initiative.status + '" is not in the allowed list.');
    console.log('   Expected Phase 2 to set status to "In Progress" but it may have failed or not run.');
  }

  if (!passesOwnerFilter) {
    console.log('⚠️  ROOT CAUSE: Initiative owner "' + initiative.owner_name + '" does not match Lisa Townsend.');
    console.log('   Expected Phase 1 or Phase 2 to set owner to "' + teamMemberName + '".');
  }
}

checkGov003();
