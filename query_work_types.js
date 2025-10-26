import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryWorkTypes() {
  // Get distinct work types from initiatives
  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select('type');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const uniqueTypes = [...new Set(initiatives.map(i => i.type).filter(Boolean))];
  console.log('\nUnique Work Types in Database:\n');
  uniqueTypes.sort().forEach(type => {
    const count = initiatives.filter(i => i.type === type).length;
    console.log(`  ${type}: ${count} initiatives`);
  });
  
  console.log(`\nTotal: ${uniqueTypes.length} unique work types`);
}

queryWorkTypes().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
