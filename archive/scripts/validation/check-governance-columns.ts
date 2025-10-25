import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  console.log('🔍 Checking governance_requests table columns...\n');

  // Try to query the table with new fields
  const { data, error } = await supabase
    .from('governance_requests')
    .select('id, impact_commonspirit_board_goal, groups_nurses, regions_impacted, required_date, additional_comments')
    .limit(1);

  if (error) {
    console.error('❌ Error querying table:', error.message);
    console.log('\n⚠️  New columns may not exist yet. Please run the migration SQL file.');
    console.log('\nYou can apply it manually by:');
    console.log('1. Going to Supabase Dashboard → SQL Editor');
    console.log('2. Running the SQL from: supabase/migrations/20250116000000_add_governance_request_fields.sql');
  } else {
    console.log('✅ New columns exist! Query successful.');
    console.log('Data returned:', data);
  }
}

checkColumns();
