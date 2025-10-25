import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAbridgeData() {
  console.log('🔍 Checking all Abridge-related initiatives...\n');

  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select(`
      id,
      initiative_name,
      owner_name,
      status,
      type
    `)
    .ilike('initiative_name', '%abridge%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Found', initiatives.length, 'Abridge initiatives:\n');

  for (const init of initiatives) {
    console.log(`ID: ${init.id}`);
    console.log(`  Name: ${init.initiative_name}`);
    console.log(`  Owner: ${init.owner_name}`);
    console.log(`  Status: ${init.status}`);
    console.log(`  Type: ${init.type}`);

    // Get financial data separately
    const { data: financial } = await supabase
      .from('initiative_financial_impact')
      .select('actual_revenue, projected_annual')
      .eq('initiative_id', init.id)
      .single();

    if (financial) {
      console.log(`  Actual Revenue: $${financial.actual_revenue?.toLocaleString() || 0}`);
      console.log(`  Projected Annual: $${financial.projected_annual?.toLocaleString() || 0}`);
    }
    console.log('');
  }
}

checkAbridgeData();
