import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMartyInitiatives() {
  console.log('Checking Marty\'s initiatives...\n');

  // First, get Marty's info
  const { data: marty } = await supabase
    .from('team_members')
    .select('id, name')
    .ilike('name', '%Marty%')
    .single();

  if (!marty) {
    console.log('❌ Marty not found in team_members table');
    return;
  }

  console.log(`✅ Found Marty: ${marty.name} (ID: ${marty.id})\n`);

  // Get initiatives by owner_name
  const { data: byName, error: nameError } = await supabase
    .from('initiatives')
    .select('id, initiative_name, owner_name, status, team_member_id')
    .eq('owner_name', marty.name)
    .order('initiative_name');

  console.log(`\n📋 Initiatives where owner_name = "${marty.name}": ${byName?.length || 0}`);
  byName?.forEach((i, idx) => {
    console.log(`  ${idx + 1}. ${i.initiative_name}`);
    console.log(`     Status: ${i.status}, Team Member ID: ${i.team_member_id || 'not set'}`);
  });

  // Get initiatives by team_member_id
  const { data: byId, error: idError } = await supabase
    .from('initiatives')
    .select('id, initiative_name, owner_name, status')
    .eq('team_member_id', marty.id)
    .order('initiative_name');

  console.log(`\n📋 Initiatives where team_member_id = "${marty.id}": ${byId?.length || 0}`);
  byId?.forEach((i, idx) => {
    console.log(`  ${idx + 1}. ${i.initiative_name}`);
    console.log(`     Owner: ${i.owner_name}, Status: ${i.status}`);
  });

  // Get all active/planning initiatives (what the app sees before filtering)
  const { data: allActive } = await supabase
    .from('initiatives')
    .select('id, initiative_name, owner_name, status')
    .in('status', ['Active', 'Planning'])
    .order('initiative_name');

  console.log(`\n📊 Total Active/Planning initiatives in database: ${allActive?.length || 0}`);

  // Search for anything with "Study" or "Epic" or "W2"
  const { data: studySearch } = await supabase
    .from('initiatives')
    .select('id, initiative_name, owner_name, status')
    .or('initiative_name.ilike.%Study%,initiative_name.ilike.%Epic%,initiative_name.ilike.%W2%')
    .order('initiative_name');

  console.log(`\n🔍 Initiatives with "Study", "Epic", or "W2" in name: ${studySearch?.length || 0}`);
  studySearch?.slice(0, 10).forEach((i, idx) => {
    console.log(`  ${idx + 1}. ${i.initiative_name} (Owner: ${i.owner_name})`);
  });
}

checkMartyInitiatives();
