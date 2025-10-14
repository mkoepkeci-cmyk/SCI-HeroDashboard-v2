import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkCounts() {
  console.log('📊 Checking Initiative Counts\n');

  // Get all initiatives with their status and is_active
  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select('id, initiative_name, status, is_active')
    .order('status');

  if (error) {
    console.error('Error fetching initiatives:', error);
    return;
  }

  // Count by status
  const statusCounts: Record<string, number> = {};
  initiatives?.forEach(i => {
    statusCounts[i.status || 'NULL'] = (statusCounts[i.status || 'NULL'] || 0) + 1;
  });

  console.log('Counts by STATUS field:');
  Object.entries(statusCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  // Count by is_active
  const activeCount = initiatives?.filter(i => i.is_active === true).length || 0;
  const inactiveCount = initiatives?.filter(i => i.is_active === false).length || 0;
  const nullCount = initiatives?.filter(i => i.is_active === null).length || 0;

  console.log('\nCounts by IS_ACTIVE field:');
  console.log(`  is_active = true: ${activeCount}`);
  console.log(`  is_active = false: ${inactiveCount}`);
  console.log(`  is_active = null: ${nullCount}`);

  console.log(`\nTotal initiatives: ${initiatives?.length || 0}`);

  // Show some examples of completed initiatives
  const completedButActive = initiatives?.filter(i => 
    i.status === 'Completed' && i.is_active === true
  );

  if (completedButActive && completedButActive.length > 0) {
    console.log(`\n⚠️  WARNING: Found ${completedButActive.length} initiatives with status='Completed' but is_active=true`);
    console.log('Examples:');
    completedButActive.slice(0, 5).forEach(i => {
      console.log(`  - ${i.initiative_name} (${i.status}, is_active=${i.is_active})`);
    });
  }
}

checkCounts();
