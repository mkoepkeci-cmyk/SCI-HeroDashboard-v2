import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
);

async function runMigration() {
  console.log('Running migration to add missing assignment columns...\n');

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'migrations', 'add-missing-assignment-columns.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split by semicolon and filter out comments and empty lines
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'));

  for (const statement of statements) {
    if (!statement) continue;

    console.log(`Executing: ${statement.substring(0, 80)}...`);

    const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

    if (error) {
      console.error('Error:', error.message);
      // Continue anyway - column might already exist
    } else {
      console.log('✓ Success\n');
    }
  }

  console.log('\nVerifying new columns...');

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .limit(1);

  if (data && data.length > 0) {
    const newColumns = ['short_description', 'ehrs_impacted', 'projected_go_live_date', 'sponsor', 'service_line', 'assignment_date', 'comments_details'];
    console.log('\nNew columns status:');
    newColumns.forEach(col => {
      const exists = col in data[0];
      console.log(`  ${exists ? '✓' : '✗'} ${col}`);
    });
  }
}

runMigration().catch(console.error);
