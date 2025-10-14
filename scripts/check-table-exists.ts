import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking if dashboard_metrics table exists...');

  const { data, error } = await supabase
    .from('dashboard_metrics')
    .select('count')
    .limit(1);

  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.log('❌ Table does NOT exist');
      console.log('');
      console.log('You need to run the migration first:');
      console.log('1. Open Supabase SQL Editor');
      console.log('2. Copy migrations/create-dashboard-metrics-table.sql');
      console.log('3. Run it');
      process.exit(1);
    } else {
      console.error('Error:', error);
      process.exit(1);
    }
  }

  console.log('✅ Table EXISTS');

  // Check if it has data
  const { count } = await supabase
    .from('dashboard_metrics')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Table has ${count || 0} rows`);

  if (count === 0) {
    console.log('');
    console.log('Table is empty. Run import script:');
    console.log('npx tsx scripts/import-dashboard-data.ts');
  }

  process.exit(0);
}

checkTable();
