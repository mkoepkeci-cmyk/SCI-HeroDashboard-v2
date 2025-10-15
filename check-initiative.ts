import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInitiative() {
  console.log('Searching for "Study Epic for W2 Go Live"...\n');

  // Search for the initiative
  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select('id, initiative_name, owner_name, status, team_member_id')
    .ilike('initiative_name', '%Study Epic for W2%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!initiatives || initiatives.length === 0) {
    console.log('❌ Initiative not found in database');

    // Try broader search
    const { data: broader } = await supabase
      .from('initiatives')
      .select('id, initiative_name, owner_name, status')
      .ilike('initiative_name', '%W2%');

    console.log(`\nFound ${broader?.length || 0} initiatives with "W2" in name:`);
    broader?.forEach(i => {
      console.log(`  - ${i.initiative_name} (Owner: ${i.owner_name}, Status: ${i.status})`);
    });
    return;
  }

  console.log(`✅ Found ${initiatives.length} matching initiative(s):\n`);
  initiatives.forEach(i => {
    console.log('Initiative Details:');
    console.log(`  Name: ${i.initiative_name}`);
    console.log(`  Owner: ${i.owner_name}`);
    console.log(`  Status: ${i.status}`);
    console.log(`  Team Member ID: ${i.team_member_id || 'Not set'}`);
    console.log(`  ID: ${i.id}`);
    console.log('');
  });

  // Also check what Marty's name is in team_members
  const { data: marty } = await supabase
    .from('team_members')
    .select('id, name')
    .ilike('name', '%Marty%');

  console.log('Marty in team_members table:');
  marty?.forEach(m => {
    console.log(`  ID: ${m.id}`);
    console.log(`  Name: ${m.name}`);
  });
}

checkInitiative();
