import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDataIntegrity() {
  console.log('🔍 Verifying Data Integrity...\n');

  // Get all team members with their initiatives
  const { data: teamMembers, error: teamError } = await supabase
    .from('team_members')
    .select(`
      id,
      name,
      total_assignments
    `)
    .order('name');

  if (teamError) {
    console.error('Error fetching team members:', teamError);
    return;
  }

  console.log('📊 Team Member Summary:\n');

  for (const member of teamMembers) {
    // Get work_type_summary total
    const { data: workTypeSummary, error: wtsError } = await supabase
      .from('work_type_summary')
      .select('assignment_count')
      .eq('team_member_id', member.id);

    const workTypeTotalCount = workTypeSummary?.reduce((sum, wts) => sum + (wts.assignment_count || 0), 0) || 0;

    // Get initiatives count
    const { data: initiatives, error: initError } = await supabase
      .from('initiatives')
      .select('id, initiative_name, status')
      .eq('team_member_id', member.id);

    const initiativesCount = initiatives?.length || 0;

    console.log(`${member.name}:`);
    console.log(`  ✓ Total Assignments: ${member.total_assignments || 0}`);
    console.log(`  ✓ Work Type Summary Count: ${workTypeTotalCount}`);
    console.log(`  ✓ Initiatives Created: ${initiativesCount}`);

    if (member.total_assignments !== workTypeTotalCount) {
      console.log(`  ⚠️  WARNING: Mismatch between total_assignments and work_type_summary!`);
    }

    console.log('');
  }

  // Get overall counts
  const { data: allInitiatives } = await supabase
    .from('initiatives')
    .select('id, status');

  const activeCount = allInitiatives?.filter(i => i.status === 'Active').length || 0;
  const completedCount = allInitiatives?.filter(i => i.status === 'Completed').length || 0;
  const totalCount = allInitiatives?.length || 0;

  console.log('📈 Overall Initiative Statistics:');
  console.log(`  Total Initiatives: ${totalCount}`);
  console.log(`  Active: ${activeCount}`);
  console.log(`  Completed: ${completedCount}`);
  console.log(`  Other: ${totalCount - activeCount - completedCount}`);

  console.log('\n✅ Data integrity verification complete!');
}

verifyDataIntegrity();
