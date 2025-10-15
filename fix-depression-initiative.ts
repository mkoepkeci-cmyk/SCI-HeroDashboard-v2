import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDepressionInitiative() {
  const initiativeId = 'dc97c561-54a1-4e49-b9cd-b2cf72bf5b94';

  console.log('\n=== FIXING DEPRESSION STUFF INITIATIVE ===');
  console.log('Setting is_active = true and status = Active');

  const { data, error } = await supabase
    .from('initiatives')
    .update({
      is_active: true,
      status: 'Active'
    })
    .eq('id', initiativeId)
    .select();

  if (error) {
    console.error('Error updating initiative:', error);
  } else {
    console.log('\nSuccessfully updated initiative:');
    console.log(JSON.stringify(data, null, 2));
  }
}

fixDepressionInitiative().catch(console.error);
