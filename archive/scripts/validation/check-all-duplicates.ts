import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllDuplicates() {
  // Get all team members
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .order('name');

  if (membersError) {
    console.error('Error fetching members:', membersError);
    return;
  }

  console.log('Checking all team members for duplicate assignments...\n');

  for (const member of members || []) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('team_member_id', member.id);

    const assignmentNames = assignments?.map(a => a.assignment_name) || [];
    const uniqueNames = new Set(assignmentNames);
    const duplicates = assignmentNames.length - uniqueNames.size;

    if (duplicates > 0) {
      console.log(`❌ ${member.name}:`);
      console.log(`   Total: ${assignmentNames.length}, Unique: ${uniqueNames.size}, Duplicates: ${duplicates}`);
    } else {
      console.log(`✅ ${member.name}: ${assignmentNames.length} assignments (no duplicates)`);
    }
  }

  // Get total counts
  const { count: totalAssignments } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal assignments in database: ${totalAssignments}`);
}

checkAllDuplicates().then(() => {
  console.log('\nCheck complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
