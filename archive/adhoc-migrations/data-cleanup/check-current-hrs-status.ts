import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentStatus() {
  console.log('🔍 Checking CURRENT database state for Epic HRS Initiative...\n');

  const { data, error } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', '26865611-026c-4f52-9eec-a9f54190a4a1')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 CURRENT DATABASE RECORD:');
  console.log('=====================================');
  console.log('ID:', data.id);
  console.log('Name:', data.initiative_name);
  console.log('Type:', data.type);
  console.log('Status:', data.status);
  console.log('Phase:', data.phase);
  console.log('Work Effort:', data.work_effort);
  console.log('EHR:', data.ehrs_impacted);
  console.log('Service Line:', data.service_line);
  console.log('Role:', data.role);
  console.log('Owner:', data.owner_name);
  console.log('Team Member ID:', data.team_member_id);
  console.log('Created:', new Date(data.created_at).toLocaleString());
  console.log('Updated:', new Date(data.updated_at).toLocaleString());
  console.log('=====================================\n');

  // Also check what Dashboard is seeing
  console.log('🔍 Checking ALL initiatives for Marty...\n');

  const { data: allMarty, error: martyError } = await supabase
    .from('initiatives')
    .select('id, initiative_name, type, status, owner_name')
    .eq('owner_name', 'Marty Koepke')
    .order('initiative_name');

  if (martyError) {
    console.error('❌ Error:', martyError);
    return;
  }

  console.log(`Found ${allMarty.length} initiatives for Marty Koepke:\n`);
  allMarty.forEach((init, idx) => {
    console.log(`[${idx + 1}] ${init.initiative_name}`);
    console.log(`    Type: ${init.type}, Status: ${init.status}`);
  });
}

checkCurrentStatus();
