import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeTypes() {
  console.log('📊 ROOT CAUSE ANALYSIS - Initiative Types in Database\n');
  console.log('='.repeat(60));

  const { data: initiatives } = await supabase
    .from('initiatives')
    .select('type, status')
    .neq('status', 'Deleted');

  if (!initiatives) {
    console.log('No data returned');
    return;
  }

  // Group by type and count
  const typeCounts: Record<string, number> = {};
  initiatives.forEach(i => {
    const type = i.type || 'NULL';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  console.log('\nACTUAL INITIATIVE TYPES IN DATABASE (excluding Deleted):');
  console.log('-'.repeat(60));

  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([type, count]) => {
    console.log(`  ${type.padEnd(40)} : ${count} initiatives`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL: ${initiatives.length} initiatives\n`);
}

analyzeTypes();
