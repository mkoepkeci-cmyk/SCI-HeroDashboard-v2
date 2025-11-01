import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkAssignmentsSchema() {
  console.log('Checking assignments table schema...\n');

  // Get one assignment to see all fields
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Current fields in assignments table:');
    Object.keys(data[0]).sort().forEach(key => {
      console.log(`  - ${key}: ${typeof data[0][key]} = ${JSON.stringify(data[0][key]).substring(0, 50)}`);
    });
  }
}

checkAssignmentsSchema().catch(console.error);
