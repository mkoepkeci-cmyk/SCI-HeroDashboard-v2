import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDawnStatus() {
  const { data: dawn } = await supabase
    .from('team_members')
    .select('*')
    .eq('name', 'Dawn')
    .single();

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_member_id', dawn?.id);

  if (!assignments) return;

  console.log('DAWN ASSIGNMENT STATUS BREAKDOWN');
  console.log('='.repeat(70));
  console.log('');

  const statusCounts: Record<string, { count: number; assignments: any[] }> = {};

  assignments.forEach(a => {
    const status = a.status || 'No Status';
    if (!statusCounts[status]) {
      statusCounts[status] = { count: 0, assignments: [] };
    }
    statusCounts[status].count++;
    statusCounts[status].assignments.push(a);
  });

  console.log(`Total Assignments: ${assignments.length}`);
  console.log('');
  console.log('By Status:');
  Object.entries(statusCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([status, data]) => {
      console.log(`  ${status}: ${data.count} assignments`);
    });

  console.log('');
  console.log('EXCEL vs DATABASE:');
  console.log('-'.repeat(70));
  console.log('Excel Dashboard shows:');
  console.log('  - Total: 22 assignments');
  console.log('  - Active: 20 assignments');
  console.log('  - 11.86 hrs/wk (29.6% capacity)');
  console.log('');
  console.log('Database shows:');
  console.log(`  - Total: ${assignments.length} assignments`);
  console.log(`  - In progress: ${statusCounts['In progress']?.count || 0}`);
  console.log(`  - Complete: ${statusCounts['Complete']?.count || 0}`);
  console.log('');

  // Calculate hours for "In progress" only
  let activeHours = 0;
  const activeAssignments = assignments.filter(a =>
    a.status && a.status.toLowerCase().includes('progress')
  );

  activeAssignments.forEach(a => {
    if (a.work_effort) {
      const effort = a.work_effort.toUpperCase();
      if (effort.includes('S -')) activeHours += 1.5;
      else if (effort.includes('M -')) activeHours += 3.5;
      else if (effort.includes('L -')) activeHours += 7.5;
      else if (effort.includes('XL')) activeHours += 15;
      else if (effort.includes('XS')) activeHours += 0.75;
    }
  });

  console.log('If we filter to "In progress" only:');
  console.log(`  - ${activeAssignments.length} assignments`);
  console.log(`  - ${activeHours.toFixed(2)} hrs/wk`);
  console.log(`  - ${((activeHours / 40) * 100).toFixed(1)}% capacity`);
  console.log('');

  console.log('RECOMMENDATION:');
  console.log('-'.repeat(70));
  if (statusCounts['Complete']?.count > 0) {
    console.log('✅ Database has completed assignments that Excel filtered out');
    console.log('   Consider filtering Workload tab to active assignments only');
  } else {
    console.log('⚠️  All assignments show same status - check status values');
  }

  process.exit(0);
}

checkDawnStatus();
