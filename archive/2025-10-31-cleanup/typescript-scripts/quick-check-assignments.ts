import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCheck() {
  // Check assignments table
  const { data: assignments, error: aError } = await supabase
    .from('assignments')
    .select('work_effort')
    .limit(10);

  console.log('First 10 assignments work_effort values:');
  console.log(assignments);
  console.log('');

  // Count total
  const { count, error: cError } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true });

  console.log(`Total assignments: ${count}`);

  // Count with work_effort
  const { count: withEffort } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .not('work_effort', 'is', null);

  console.log(`With work_effort: ${withEffort}`);
  console.log(`Without work_effort: ${(count || 0) - (withEffort || 0)}`);
}

quickCheck();
