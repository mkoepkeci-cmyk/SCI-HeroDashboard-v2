import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Use service role key for schema changes
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function addColumns() {
  console.log('Adding missing columns to assignments table...\n');

  const columns = [
    { name: 'short_description', type: 'TEXT' },
    { name: 'ehrs_impacted', type: 'TEXT' },
    { name: 'projected_go_live_date', type: 'DATE' },
    { name: 'sponsor', type: 'TEXT' },
    { name: 'service_line', type: 'TEXT' },
    { name: 'assignment_date', type: 'DATE' },
    { name: 'comments_details', type: 'TEXT' }
  ];

  console.log('Note: You may need to run this migration manually in Supabase SQL Editor:\n');
  console.log('```sql');
  console.log('ALTER TABLE assignments');
  columns.forEach((col, idx) => {
    console.log(`  ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${idx < columns.length - 1 ? ',' : ';'}`);
  });
  console.log('```\n');

  console.log('Checking current schema...\n');

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error checking schema:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Current columns in assignments table:');
    Object.keys(data[0]).sort().forEach(key => {
      console.log(`  ✓ ${key}`);
    });

    console.log('\nMissing columns (need to be added):');
    columns.forEach(col => {
      if (!(col.name in data[0])) {
        console.log(`  ✗ ${col.name}`);
      }
    });
  }
}

addColumns().catch(console.error);
