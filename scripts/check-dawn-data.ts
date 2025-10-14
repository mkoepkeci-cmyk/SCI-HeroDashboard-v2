import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDawnData() {
  const { data: dawn, error: dawnError } = await supabase
    .from('team_members')
    .select('*')
    .eq('name', 'Dawn')
    .single();

  if (dawnError) {
    console.error('Error fetching Dawn:', dawnError);
    process.exit(1);
  }

  console.log('Dawn ID:', dawn.id);
  console.log('');

  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_member_id', dawn.id);

  if (assignError) {
    console.error('Error fetching assignments:', assignError);
    process.exit(1);
  }

  console.log('Total assignments:', assignments.length);
  console.log('');
  console.log('Sample assignments (first 5):');
  console.log('='.repeat(60));

  assignments.slice(0, 5).forEach((a, i) => {
    console.log(`${i+1}. ${a.assignment_name || 'Unnamed'}`);
    console.log(`   Work Type: ${a.work_type || 'NULL'}`);
    console.log(`   Work Effort: ${a.work_effort || 'NULL'}`);
    console.log(`   Status: ${a.status || 'NULL'}`);
    console.log('');
  });

  const withEffort = assignments.filter(a => a.work_effort).length;
  const withoutEffort = assignments.length - withEffort;

  console.log('='.repeat(60));
  console.log('DATA QUALITY SUMMARY:');
  console.log(`✓ Assignments WITH work_effort: ${withEffort}`);
  console.log(`✗ Assignments WITHOUT work_effort: ${withoutEffort}`);
  console.log(`Completion Rate: ${((withEffort / assignments.length) * 100).toFixed(1)}%`);

  if (withoutEffort > 0) {
    console.log('');
    console.log('ISSUE: Dawn has', withoutEffort, 'assignments without work_effort!');
    console.log('This is why the modal shows 0 hours and blank graphs.');
  }

  process.exit(0);
}

checkDawnData();
