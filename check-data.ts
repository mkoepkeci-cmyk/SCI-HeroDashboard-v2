import { createClient } from '@supabase/supabase-js';

// Try to connect with the env credentials
const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMjU5MTcsImV4cCI6MjA1MjgwMTkxN30.UIDUwXKEVvH3cxDIzOZ3uWq_z6ZhWjzOoSvh1O6Ppr0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('='.repeat(80));
  console.log('DATABASE DIAGNOSTIC CHECK');
  console.log('='.repeat(80));
  console.log('\nConnecting to:', supabaseUrl);
  console.log('Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

  try {
    // Check team members
    console.log('\n📊 Checking team_members table...');
    const { data: members, error: membersError, count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact' });

    if (membersError) {
      console.error('❌ ERROR:', membersError.message);
      console.log('\nThis means either:');
      console.log('  1. The API key is invalid/expired');
      console.log('  2. The table doesn\'t exist');
      console.log('  3. Permissions are not set correctly');
      return;
    }

    console.log(`✅ SUCCESS! Found ${members?.length || 0} team members`);
    if (members && members.length > 0) {
      console.log('\nTeam Members:');
      members.forEach(m => console.log(`  - ${m.name} (${m.total_assignments} assignments)`));
    } else {
      console.log('⚠️  Table exists but is EMPTY - no team members added yet');
    }

    // Check initiatives
    console.log('\n📊 Checking initiatives table...');
    const { data: initiatives, error: initError } = await supabase
      .from('initiatives')
      .select('*');

    if (initError) {
      console.error('❌ ERROR:', initError.message);
      return;
    }

    console.log(`✅ SUCCESS! Found ${initiatives?.length || 0} initiatives`);
    if (initiatives && initiatives.length > 0) {
      console.log('\nFirst 5 initiatives:');
      initiatives.slice(0, 5).forEach(i => {
        console.log(`  - ${i.initiative_name} (${i.status})`);
      });
    } else {
      console.log('⚠️  Table exists but is EMPTY - no initiatives added yet');
    }

    // Check work_type_summary
    console.log('\n📊 Checking work_type_summary table...');
    const { data: workTypes, error: wtError } = await supabase
      .from('work_type_summary')
      .select('*');

    if (wtError) {
      console.error('❌ ERROR:', wtError.message);
      return;
    }

    console.log(`✅ SUCCESS! Found ${workTypes?.length || 0} work type entries`);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Team Members: ${members?.length || 0}`);
    console.log(`Initiatives: ${initiatives?.length || 0}`);
    console.log(`Work Type Summaries: ${workTypes?.length || 0}`);

    if ((members?.length || 0) === 0) {
      console.log('\n⚠️  YOUR DATABASE IS EMPTY!');
      console.log('\nThis is why the dashboard shows nothing.');
      console.log('\nTo fix this, you need to:');
      console.log('  1. Populate team_members table');
      console.log('  2. Populate work_type_summary table');
      console.log('  3. Add initiatives');
      console.log('\nDo you have existing data that needs to be imported?');
    } else {
      console.log('\n✅ Database has data and is working correctly!');
    }

  } catch (error: any) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message);
  }
}

checkDatabase();
