import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the known Supabase instance
const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMjU5MTcsImV4cCI6MjA1MjgwMTkxN30.UIDUwXKEVvH3cxDIzOZ3uWq_z6ZhWjzOoSvh1O6Ppr0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('='.repeat(80));
  console.log('RUNNING MIGRATION: Add Weighted Workload Fields');
  console.log('='.repeat(80));

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'migrations', 'add-weighted-workload-fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('\n📝 Migration SQL loaded successfully\n');

    // Note: Supabase client doesn't support raw SQL execution directly
    // You'll need to run this via Supabase Dashboard SQL Editor or use the REST API
    console.log('⚠️  IMPORTANT: This migration needs to be run manually in Supabase Dashboard\n');
    console.log('Steps:');
    console.log('1. Go to: https://fiyaolxiarzkihlbhtmz.supabase.co/project/_/sql');
    console.log('2. Copy the SQL from: migrations/add-weighted-workload-fields.sql');
    console.log('3. Paste and run in the SQL Editor');
    console.log('4. Verify the fields were added\n');

    console.log('Alternatively, here is the SQL to run:\n');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));

    // Test if fields exist by querying one initiative
    console.log('\n🔍 Checking current database schema...\n');

    const { data, error } = await supabase
      .from('initiatives')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying initiatives:', error.message);
      return;
    }

    if (data && data.length > 0) {
      const sample = data[0];
      console.log('Current fields in initiatives table:');
      console.log('  ✓ Basic fields present');

      const hasNewFields = {
        phase: 'phase' in sample,
        work_effort: 'work_effort' in sample,
        is_active: 'is_active' in sample,
      };

      console.log('\nNew fields status:');
      console.log(`  ${hasNewFields.phase ? '✅' : '❌'} phase`);
      console.log(`  ${hasNewFields.work_effort ? '✅' : '❌'} work_effort`);
      console.log(`  ${hasNewFields.is_active ? '✅' : '❌'} is_active`);

      if (hasNewFields.phase && hasNewFields.work_effort && hasNewFields.is_active) {
        console.log('\n✅ Migration already applied! New fields are present.');

        // Show sample data
        const { data: initiatives } = await supabase
          .from('initiatives')
          .select('initiative_name, status, is_active, phase, work_effort')
          .limit(5);

        if (initiatives) {
          console.log('\n📊 Sample data:');
          initiatives.forEach(init => {
            console.log(`  - ${init.initiative_name}`);
            console.log(`    Status: ${init.status}, Active: ${init.is_active}, Phase: ${init.phase || 'not set'}, Effort: ${init.work_effort || 'not set'}`);
          });
        }
      } else {
        console.log('\n⚠️  Migration NOT yet applied. Please run the SQL above in Supabase Dashboard.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runMigration();
