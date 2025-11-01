/**
 * Fetch current team members from Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('id, first_name, last_name, role, specialty, manager_id, is_active')
    .eq('is_active', true)
    .order('first_name');

  if (error) {
    console.error('Error fetching team members:', error);
    return;
  }

  console.log('Current Team Members:');
  console.log('====================');
  console.log();

  if (!data || data.length === 0) {
    console.log('No team members found in database.');
    return;
  }

  data.forEach((member, index) => {
    console.log(`${index + 1}. ${member.first_name} ${member.last_name}`);
    console.log(`   ID: ${member.id}`);
    console.log(`   Role: ${member.role}`);
    console.log(`   Specialty: ${member.specialty || 'N/A'}`);
    console.log();
  });

  console.log(`Total: ${data.length} active team members`);
  console.log();
  console.log('TypeScript array format:');
  console.log('========================');
  console.log('const TEAM_MEMBERS = [');
  data.forEach((member) => {
    console.log(`  { id: '${member.id}', firstName: '${member.first_name}', lastName: '${member.last_name}', role: '${member.role}' },`);
  });
  console.log('];');
}

fetchTeamMembers();
