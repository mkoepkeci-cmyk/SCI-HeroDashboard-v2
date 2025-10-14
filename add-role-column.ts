import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addRoleColumn() {
  console.log('Adding role column to initiatives table...');

  // Note: The anon key may not have permission to alter tables
  // This SQL command should be run in the Supabase SQL editor instead:
  const sql = `
    ALTER TABLE initiatives
    ADD COLUMN IF NOT EXISTS role TEXT;
  `;

  console.log('\n⚠️  You need to run this SQL in your Supabase SQL editor:');
  console.log('\n' + sql);
  console.log('\nAfter running the SQL, the role field will be available in the form.');
}

addRoleColumn();
