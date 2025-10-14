import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRemoteData() {
  console.log('\n' + '='.repeat(80));
  console.log('VERIFYING REMOTE SUPABASE DATA');
  console.log('='.repeat(80));
  console.log(`Database: ${supabaseUrl}`);
  console.log('='.repeat(80) + '\n');

  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error getting total count:', countError);
    return;
  }

  console.log(`✓ Total initiatives in remote database: ${totalCount}\n`);

  // Get count by team member
  const { data: initiatives, error: initiativesError } = await supabase
    .from('initiatives')
    .select('owner_name, type');

  if (initiativesError) {
    console.error('Error getting initiatives:', initiativesError);
    return;
  }

  // Count by team member
  const byOwner: Record<string, number> = {};
  const byType: Record<string, number> = {};

  initiatives?.forEach(initiative => {
    byOwner[initiative.owner_name] = (byOwner[initiative.owner_name] || 0) + 1;
    byType[initiative.type] = (byType[initiative.type] || 0) + 1;
  });

  console.log('BY TEAM MEMBER:');
  console.log('-'.repeat(80));
  Object.entries(byOwner)
    .sort((a, b) => b[1] - a[1])
    .forEach(([owner, count]) => {
      console.log(`  ${owner.padEnd(20)} ${count.toString().padStart(3)} initiatives`);
    });

  console.log('\n\nBY WORK TYPE:');
  console.log('-'.repeat(80));
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type.padEnd(30)} ${count.toString().padStart(3)} initiatives`);
    });

  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION COMPLETE');
  console.log('='.repeat(80) + '\n');
}

verifyRemoteData();
