import { createClient } from '@supabase/supabase-js';

// Use the known Supabase instance
const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMjU5MTcsImV4cCI6MjA1MjgwMTkxN30.UIDUwXKEVvH3cxDIzOZ3uWq_z6ZhWjzOoSvh1O6Ppr0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('='.repeat(80));
  console.log('VERIFYING DATABASE MIGRATION');
  console.log('='.repeat(80));

  try {
    // Query initiatives with new fields
    const { data: initiatives, error } = await supabase
      .from('initiatives')
      .select('initiative_name, status, is_active, phase, work_effort')
      .limit(10);

    if (error) {
      console.error('\n❌ Error querying initiatives:', error.message);
      console.log('\nThis might mean the migration has not been run yet.');
      return;
    }

    console.log('\n✅ SUCCESS! New fields are present in the database.\n');

    // Check if fields exist in the response
    if (initiatives && initiatives.length > 0) {
      const sample = initiatives[0];
      const hasNewFields = {
        is_active: 'is_active' in sample,
        phase: 'phase' in sample,
        work_effort: 'work_effort' in sample,
      };

      console.log('Field Status:');
      console.log(`  ${hasNewFields.is_active ? '✅' : '❌'} is_active`);
      console.log(`  ${hasNewFields.phase ? '✅' : '❌'} phase`);
      console.log(`  ${hasNewFields.work_effort ? '✅' : '❌'} work_effort`);

      // Show sample data
      console.log('\n' + '─'.repeat(80));
      console.log('SAMPLE INITIATIVES:');
      console.log('─'.repeat(80));

      initiatives.forEach((init, index) => {
        console.log(`\n${index + 1}. ${init.initiative_name}`);
        console.log(`   Status: ${init.status}`);
        console.log(`   Is Active: ${init.is_active !== null ? init.is_active : 'NULL'}`);
        console.log(`   Phase: ${init.phase || 'not set'}`);
        console.log(`   Work Effort: ${init.work_effort || 'not set'}`);
      });

      // Count active vs inactive
      const activeCount = initiatives.filter(i => i.is_active === true).length;
      const inactiveCount = initiatives.filter(i => i.is_active === false).length;
      const nullCount = initiatives.filter(i => i.is_active === null).length;

      console.log('\n' + '─'.repeat(80));
      console.log('SUMMARY (from sample of 10):');
      console.log('─'.repeat(80));
      console.log(`  Active initiatives: ${activeCount}`);
      console.log(`  Inactive initiatives: ${inactiveCount}`);
      console.log(`  NULL is_active: ${nullCount}`);

      if (nullCount > 0) {
        console.log('\n⚠️  Some initiatives have NULL is_active. The backfill might not have run.');
        console.log('   Run this SQL to fix:');
        console.log('   UPDATE initiatives SET is_active = (status IN (\'Planning\', \'Active\', \'Scaling\'))');
      }

      // Count how many have phase/work_effort set
      const withPhase = initiatives.filter(i => i.phase).length;
      const withEffort = initiatives.filter(i => i.work_effort).length;

      console.log(`\n  Initiatives with Phase set: ${withPhase}`);
      console.log(`  Initiatives with Work Effort set: ${withEffort}`);

      if (withPhase === 0 && withEffort === 0) {
        console.log('\n💡 TIP: These are new fields, so existing initiatives won\'t have them yet.');
        console.log('   You can now edit initiatives to add Phase and Work Effort!');
      }

    } else {
      console.log('\nNo initiatives found in database.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ MIGRATION VERIFIED - New fields are working!');
    console.log('='.repeat(80));
    console.log('\n📝 Next steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Open app: http://localhost:5173');
    console.log('  3. Click "Add Data" or edit an existing initiative');
    console.log('  4. You should see Phase and Work Effort dropdowns');
    console.log('  5. Test creating/editing with these new fields\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyMigration();
