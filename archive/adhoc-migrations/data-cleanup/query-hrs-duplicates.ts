import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryHRSDuplicates() {
  console.log('🔍 Querying for HRS Integration initiatives...\n');

  const { data, error } = await supabase
    .from('initiatives')
    .select('id, initiative_name, type, ehrs_impacted, role, status, service_line, created_at, updated_at')
    .ilike('initiative_name', '%HRS Integration%Remote Patient%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error querying:', error);
    return;
  }

  console.log(`Found ${data.length} records:\n`);

  data.forEach((record, index) => {
    console.log(`\n[${index + 1}] ID: ${record.id}`);
    console.log(`    Name: ${record.initiative_name}`);
    console.log(`    Type: ${record.type}`);
    console.log(`    EHR: ${record.ehrs_impacted || 'Not specified'}`);
    console.log(`    Role: ${record.role || 'Not specified'}`);
    console.log(`    Status: ${record.status}`);
    console.log(`    Service Line: ${record.service_line || 'Not specified'}`);
    console.log(`    Created: ${new Date(record.created_at).toLocaleString()}`);
    console.log(`    Updated: ${new Date(record.updated_at).toLocaleString()}`);
  });

  console.log('\n✅ Query complete');
}

queryHRSDuplicates();
