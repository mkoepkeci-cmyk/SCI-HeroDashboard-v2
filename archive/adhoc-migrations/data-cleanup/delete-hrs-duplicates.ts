import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicates() {
  console.log('🗑️  Deleting HRS Integration duplicate records...\n');

  // Records to DELETE
  const duplicateIds = [
    '518d3867-8146-4958-96c4-83314b0c6dea', // [1] System Project - Epic Gold type (wrong)
    '542f82df-ac33-48a7-9bad-b58a721d67aa', // [2] System Project - Epic duplicate
    '51fa6b06-1b8a-46c4-a7bb-f7af74afdb44', // [5] HRS Integration (Cerner Implementation) duplicate
    '84c3cb2e-2c2f-44c4-ba34-ddc96664fedc'  // [6] HRS Integration - already Deleted status
  ];

  // Records to KEEP (for reference)
  console.log('✅ KEEPING these records:');
  console.log('   [3] cfa2e551-c3c6-40c5-8ac9-15b60c10d81f - Project (Cerner, Primary, Completed)');
  console.log('   [4] 26865611-026c-4f52-9eec-a9f54190a4a1 - Project (Epic, Owner, On Hold)\n');

  console.log('❌ DELETING these records:');

  for (const id of duplicateIds) {
    console.log(`\n   Deleting: ${id}`);

    const { error } = await supabase
      .from('initiatives')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`   ❌ Error deleting ${id}:`, error);
    } else {
      console.log(`   ✅ Successfully deleted ${id}`);
    }
  }

  console.log('\n🔍 Verifying deletion...\n');

  // Verify by querying again
  const { data, error } = await supabase
    .from('initiatives')
    .select('id, initiative_name, type, ehrs_impacted, status')
    .ilike('initiative_name', '%HRS Integration%Remote Patient%');

  if (error) {
    console.error('❌ Error verifying:', error);
    return;
  }

  console.log(`✅ Remaining records: ${data.length}\n`);

  data.forEach((record, index) => {
    console.log(`[${index + 1}] ${record.initiative_name}`);
    console.log(`    Type: ${record.type}, EHR: ${record.ehrs_impacted}, Status: ${record.status}`);
    console.log(`    ID: ${record.id}\n`);
  });

  console.log('✅ Deletion complete!');
}

deleteDuplicates();
