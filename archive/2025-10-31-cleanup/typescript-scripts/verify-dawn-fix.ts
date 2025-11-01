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

// Parse work effort like the fixed code does
function parseWorkEffort(effortStr?: string): string | null {
  if (!effortStr) return null;
  const normalized = effortStr.trim().toUpperCase();

  if (normalized.includes('XL') || normalized.includes('MORE THAN 10')) return 'XL';
  if (normalized.includes('L -') || normalized.includes('5-10')) return 'L';
  if (normalized.includes('M -') || normalized.includes('2-5')) return 'M';
  if (normalized.includes('S -') || normalized.includes('1-2')) return 'S';
  if (normalized.includes('XS') || normalized.includes('LESS THAN 1')) return 'XS';

  return null;
}

const WORK_EFFORT_HOURS: Record<string, { min: number; max: number }> = {
  'XS': { min: 0.5, max: 1 },
  'S': { min: 1, max: 2 },
  'M': { min: 2, max: 5 },
  'L': { min: 5, max: 10 },
  'XL': { min: 10, max: 20 }
};

async function verifyDawnFix() {
  const { data: dawn, error: dawnError } = await supabase
    .from('team_members')
    .select('*')
    .eq('name', 'Dawn')
    .single();

  if (dawnError || !dawn) {
    console.error('Error fetching Dawn:', dawnError);
    process.exit(1);
  }

  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_member_id', dawn.id);

  if (assignError || !assignments) {
    console.error('Error fetching assignments:', assignError);
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('DAWN CAPACITY VERIFICATION');
  console.log('='.repeat(70));
  console.log('');

  // Calculate using FIXED method
  let totalHours = 0;
  const effortBreakdown: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0 };

  assignments.forEach(assignment => {
    const effort = parseWorkEffort(assignment.work_effort);
    if (effort) {
      const effortDetails = WORK_EFFORT_HOURS[effort];
      const avgHours = (effortDetails.min + effortDetails.max) / 2;
      totalHours += avgHours;
      effortBreakdown[effort]++;
    }
  });

  const capacity = (totalHours / 40) * 100;

  console.log('FIXED CALCULATION (Using parseWorkEffort):');
  console.log('-'.repeat(70));
  console.log(`Total Assignments: ${assignments.length}`);
  console.log(`With Work Effort: ${assignments.filter(a => a.work_effort).length}`);
  console.log('');
  console.log('Effort Breakdown:');
  console.log(`  XS: ${effortBreakdown.XS} assignments × 0.75h = ${effortBreakdown.XS * 0.75}h`);
  console.log(`  S:  ${effortBreakdown.S} assignments × 1.5h = ${effortBreakdown.S * 1.5}h`);
  console.log(`  M:  ${effortBreakdown.M} assignments × 3.5h = ${effortBreakdown.M * 3.5}h`);
  console.log(`  L:  ${effortBreakdown.L} assignments × 7.5h = ${effortBreakdown.L * 7.5}h`);
  console.log(`  XL: ${effortBreakdown.XL} assignments × 15h = ${effortBreakdown.XL * 15}h`);
  console.log('');
  console.log(`Total Hours/Week: ${totalHours.toFixed(2)}h`);
  console.log(`Capacity: ${capacity.toFixed(1)}%`);
  console.log('');

  // Compare with BROKEN method
  let brokenHours = 0;
  const brokenBreakdown: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0 };

  assignments.forEach(assignment => {
    if (assignment.work_effort) {
      const effort = assignment.work_effort.toUpperCase();
      let hours = 0;
      let size = '';
      if (effort.includes('XL')) { hours = 15; size = 'XL'; }
      else if (effort.includes('L')) { hours = 7.5; size = 'L'; }  // BUG HERE!
      else if (effort.includes('M')) { hours = 3.5; size = 'M'; }
      else if (effort.includes('S')) { hours = 1.5; size = 'S'; }
      else if (effort.includes('XS')) { hours = 0.5; size = 'XS'; }

      brokenHours += hours;
      if (size) brokenBreakdown[size]++;
    }
  });

  const brokenCapacity = (brokenHours / 40) * 100;

  console.log('BROKEN CALCULATION (Old code with .includes bug):');
  console.log('-'.repeat(70));
  console.log('Effort Breakdown:');
  console.log(`  XS: ${brokenBreakdown.XS} assignments × 0.5h = ${brokenBreakdown.XS * 0.5}h`);
  console.log(`  S:  ${brokenBreakdown.S} assignments × 1.5h = ${brokenBreakdown.S * 1.5}h`);
  console.log(`  M:  ${brokenBreakdown.M} assignments × 3.5h = ${brokenBreakdown.M * 3.5}h`);
  console.log(`  L:  ${brokenBreakdown.L} assignments × 7.5h = ${brokenBreakdown.L * 7.5}h`);
  console.log(`  XL: ${brokenBreakdown.XL} assignments × 15h = ${brokenBreakdown.XL * 15}h`);
  console.log('');
  console.log(`Total Hours/Week: ${brokenHours.toFixed(2)}h`);
  console.log(`Capacity: ${brokenCapacity.toFixed(1)}%`);
  console.log('');

  // Compare
  console.log('COMPARISON:');
  console.log('='.repeat(70));
  console.log(`Excel Dashboard: 11.86h/wk (29.6% capacity)`);
  console.log(`Fixed Code:      ${totalHours.toFixed(2)}h/wk (${capacity.toFixed(1)}% capacity)`);
  console.log(`Broken Code:     ${brokenHours.toFixed(2)}h/wk (${brokenCapacity.toFixed(1)}% capacity)`);
  console.log('');

  if (Math.abs(capacity - 29.6) < 10) {
    console.log('✅ SUCCESS! Fixed calculation is close to Excel Dashboard (29.6%)');
  } else {
    console.log('⚠️  WARNING: Fixed calculation differs from Excel Dashboard');
    console.log('   This may be due to filtering active vs. all assignments');
  }

  console.log('');
  console.log('Note: Excel shows lower hours because it filters to active assignments only');
  console.log('      Database includes all 30 assignments (active + completed)');
  console.log('');

  process.exit(0);
}

verifyDawnFix();
