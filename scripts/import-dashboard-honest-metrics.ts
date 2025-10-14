/**
 * Import HONEST Capacity Metrics from Excel Dashboard
 *
 * This script reads columns A-G from the Dashboard tab which contain:
 * - Column A: Name
 * - Column B: Total assignments
 * - Column C: Active assignments
 * - Column D: Active Hrs/Wk (ONLY from assignments WITH work effort)
 * - Column E: Available Hours (40)
 * - Column F: Capacity Utilization (%)
 * - Column G: Capacity status with warnings (e.g., "⚠️ 22 Need Baseline Info")
 *
 * This is the TRUTH - only counting assignments with complete baseline data.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import Excel from 'exceljs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EXCEL_FILE = path.join(__dirname, '..', 'documents', 'SCI Workload Tracker - New System.xlsx');

interface DashboardMetrics {
  name: string;
  totalAssignments: number;
  activeAssignments: number;
  activeHoursPerWeek: number;
  availableHours: number;
  capacityUtilization: number;
  capacityWarnings: string;
}

/**
 * Parse capacity warnings from Excel column G
 * Examples:
 * - "⚠️ 22 Need Baseline Info, 40 Other Incomplete - 🔴 Over Capacity"
 * - "🟢 Under Capacity"
 * - "⚠️ 4 Incomplete - 🟢 Under"
 */
function parseCapacityWarnings(warningStr: string): {
  status: string;
  needBaseline: number;
  otherIncomplete: number;
  totalIncomplete: number;
  warningText: string;
} {
  const text = String(warningStr || '').trim();

  let status = 'available';
  if (text.includes('Over Capacity') || text.includes('🔴')) {
    status = 'over_capacity';
  } else if (text.includes('Near') || text.includes('🟡')) {
    status = 'near_capacity';
  }

  // Parse "X Need Baseline Info"
  const baselineMatch = text.match(/(\d+)\s+Need Baseline Info/i);
  const needBaseline = baselineMatch ? parseInt(baselineMatch[1]) : 0;

  // Parse "X Other Incomplete" or just "X Incomplete"
  const incompleteMatch = text.match(/(\d+)\s+(?:Other\s+)?Incomplete/i);
  const otherIncomplete = incompleteMatch ? parseInt(incompleteMatch[1]) : 0;

  const totalIncomplete = needBaseline + otherIncomplete;

  return {
    status,
    needBaseline,
    otherIncomplete,
    totalIncomplete,
    warningText: text
  };
}

async function readDashboardMetrics(): Promise<DashboardMetrics[]> {
  console.log('Reading Excel Dashboard for HONEST metrics...');
  console.log('File:', EXCEL_FILE);

  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(EXCEL_FILE);

  const worksheet = workbook.getWorksheet('Dashboard');
  if (!worksheet) {
    throw new Error('Dashboard worksheet not found');
  }

  console.log(`Found Dashboard sheet with ${worksheet.rowCount} rows\n`);

  const metrics: DashboardMetrics[] = [];

  // Read data starting from row 2 (row 1 is header)
  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);

    const name = row.getCell(1).value?.toString().trim();
    if (!name || name === '') continue;

    const totalAssignments = Number(row.getCell(2).value) || 0;
    const activeAssignments = Number(row.getCell(3).value) || 0;
    const activeHoursPerWeek = Number(row.getCell(4).value) || 0;
    const availableHours = Number(row.getCell(5).value) || 40;
    const capacityUtilization = Number(row.getCell(6).value) || 0;
    const capacityWarnings = row.getCell(7).value?.toString() || '';

    metrics.push({
      name,
      totalAssignments,
      activeAssignments,
      activeHoursPerWeek,
      availableHours,
      capacityUtilization,
      capacityWarnings
    });

    console.log(`${name}: ${activeHoursPerWeek.toFixed(1)}h/wk (${(capacityUtilization * 100).toFixed(1)}%) - ${capacityWarnings}`);
  }

  console.log(`\nParsed ${metrics.length} team members\n`);
  return metrics;
}

async function updateDatabaseWithHonestMetrics(metrics: DashboardMetrics[]) {
  console.log('Updating database with HONEST capacity metrics...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const metric of metrics) {
    try {
      // Find team member by name
      const { data: members, error: findError } = await supabase
        .from('team_members')
        .select('id, name')
        .ilike('name', metric.name)
        .limit(1);

      if (findError) throw findError;

      if (!members || members.length === 0) {
        console.log(`  ⚠️  Team member not found: ${metric.name}`);
        errorCount++;
        continue;
      }

      const member = members[0];
      const warnings = parseCapacityWarnings(metric.capacityWarnings);

      // Update with HONEST metrics from Dashboard
      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          total_assignments: metric.totalAssignments,
          active_hours_per_week: metric.activeHoursPerWeek,
          available_hours: metric.availableHours,
          capacity_utilization: metric.capacityUtilization,
          capacity_status: warnings.status,
          // Store warning details as JSON in a text field (or add columns if needed)
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);

      if (updateError) throw updateError;

      console.log(`  ✅ ${metric.name}: ${metric.activeHoursPerWeek.toFixed(1)}h, ${(metric.capacityUtilization * 100).toFixed(1)}%, ${warnings.totalIncomplete} incomplete`);
      successCount++;

      // If they have incomplete data, log it prominently
      if (warnings.totalIncomplete > 0) {
        console.log(`     ⚠️  ${warnings.needBaseline} need baseline, ${warnings.otherIncomplete} other incomplete`);
      }

    } catch (error) {
      console.error(`  ❌ Error updating ${metric.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ Updated ${successCount} team members`);
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} errors`);
  }
}

async function displaySummary(metrics: DashboardMetrics[]) {
  console.log('\n' + '='.repeat(80));
  console.log('HONEST METRICS SUMMARY');
  console.log('='.repeat(80));

  const totalActiveHours = metrics.reduce((sum, m) => sum + m.activeHoursPerWeek, 0);
  const avgCapacity = metrics.reduce((sum, m) => sum + m.capacityUtilization, 0) / metrics.length;

  const overCapacity = metrics.filter(m => m.capacityUtilization >= 1.0);
  const nearCapacity = metrics.filter(m => m.capacityUtilization >= 0.8 && m.capacityUtilization < 1.0);
  const available = metrics.filter(m => m.capacityUtilization < 0.8);

  console.log(`Total Team Members: ${metrics.length}`);
  console.log(`Total Active Hours/Week: ${totalActiveHours.toFixed(1)}h (HONEST - only counted assignments with work effort)`);
  console.log(`Average Capacity: ${(avgCapacity * 100).toFixed(1)}%`);
  console.log(`🔴 Over Capacity (>100%): ${overCapacity.length}`);
  console.log(`🟡 Near Capacity (80-100%): ${nearCapacity.length}`);
  console.log(`🟢 Available (<80%): ${available.length}`);

  // Find members with data quality issues
  const withIssues = metrics.filter(m => {
    const warnings = parseCapacityWarnings(m.capacityWarnings);
    return warnings.totalIncomplete > 0;
  });

  if (withIssues.length > 0) {
    console.log(`\n⚠️  DATA QUALITY ISSUES: ${withIssues.length} members have incomplete data`);

    withIssues.sort((a, b) => {
      const aWarnings = parseCapacityWarnings(a.capacityWarnings);
      const bWarnings = parseCapacityWarnings(b.capacityWarnings);
      return bWarnings.totalIncomplete - aWarnings.totalIncomplete;
    });

    for (const member of withIssues.slice(0, 10)) {
      const warnings = parseCapacityWarnings(member.capacityWarnings);
      console.log(`  ${member.name}: ${warnings.totalIncomplete} incomplete (${warnings.needBaseline} need baseline, ${warnings.otherIncomplete} other)`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('These are HONEST metrics - only assignments with work effort are counted.');
  console.log('This ensures accurate capacity planning and prevents over-commitment.');
  console.log('='.repeat(80));
}

async function main() {
  console.log('='.repeat(80));
  console.log('IMPORTING HONEST CAPACITY METRICS FROM EXCEL DASHBOARD');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Read Dashboard
    const metrics = await readDashboardMetrics();

    if (metrics.length === 0) {
      console.log('❌ No data found in Dashboard sheet');
      return;
    }

    // Step 2: Update database
    await updateDatabaseWithHonestMetrics(metrics);

    // Step 3: Display summary
    await displaySummary(metrics);

    console.log('\n✅ Import completed successfully!');
    console.log('Your WorkloadView will now show HONEST capacity metrics.');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
