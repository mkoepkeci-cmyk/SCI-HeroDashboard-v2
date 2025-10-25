import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAbridgeDetailed() {
  console.log('🔍 Checking Abridge initiatives with is_active field...\n');

  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select('id, initiative_name, owner_name, status, is_active')
    .ilike('initiative_name', '%abridge%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Found', initiatives.length, 'Abridge initiatives:\n');

  initiatives.forEach((init) => {
    console.log(`ID: ${init.id}`);
    console.log(`  Name: ${init.initiative_name}`);
    console.log(`  Owner: ${init.owner_name}`);
    console.log(`  Status: ${init.status}`);
    console.log(`  is_active: ${init.is_active}`);
    console.log('');
  });
}

checkAbridgeDetailed();
