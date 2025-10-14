import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deduplicateAssignments() {
  console.log('Starting deduplication process...\n');

  // Get all team members
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .order('name');

  if (membersError) {
    console.error('Error fetching members:', membersError);
    return;
  }

  let totalDeleted = 0;

  for (const member of members || []) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('team_member_id', member.id)
      .order('created_at', { ascending: true }); // Keep oldest

    if (!assignments || assignments.length === 0) continue;

    // Group by assignment_name
    const grouped = assignments.reduce((acc, assignment) => {
      const name = assignment.assignment_name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(assignment);
      return acc;
    }, {} as Record<string, typeof assignments>);

    // Find duplicates
    const toDelete: string[] = [];
    let memberDuplicates = 0;

    Object.entries(grouped).forEach(([name, group]) => {
      if (group.length > 1) {
        // Keep the first one (oldest), delete the rest
        const idsToDelete = group.slice(1).map(a => a.id);
        toDelete.push(...idsToDelete);
        memberDuplicates += idsToDelete.length;
      }
    });

    if (toDelete.length > 0) {
      console.log(`${member.name}: Deleting ${toDelete.length} duplicate(s)...`);
      console.log(`  IDs to delete:`, toDelete.slice(0, 3), '...');

      const { data: deleteData, error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .in('id', toDelete)
        .select();

      if (deleteError) {
        console.error(`  ❌ Error deleting duplicates for ${member.name}:`, deleteError);
        console.error(`  Error details:`, JSON.stringify(deleteError, null, 2));
      } else {
        console.log(`  ✅ Deleted ${deleteData?.length || 0} records`);
        totalDeleted += (deleteData?.length || 0);
      }
    } else {
      console.log(`${member.name}: No duplicates found`);
    }
  }

  console.log(`\n✨ Deduplication complete!`);
  console.log(`Total duplicates removed: ${totalDeleted}`);

  // Verify
  console.log('\nVerifying results...');
  const { count: finalCount } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true });

  console.log(`Final assignment count: ${finalCount}`);
  console.log(`Expected: ${530 - totalDeleted}`);
}

deduplicateAssignments().then(() => {
  console.log('\nDeduplication script complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
