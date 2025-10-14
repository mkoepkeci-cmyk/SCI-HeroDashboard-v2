/**
 * Import Capacity Data from Excel Dashboard
 *
 * This script reads the Dashboard tab from the Excel workload tracker
 * and populates team_members and work_type_hours tables with capacity data
 *
 * Usage: npx tsx scripts/import-dashboard-capacity-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as Excel from 'exceljs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Excel file path
const EXCEL_FILE = path.join(__dirname, '..', 'documents', 'SCI Workload Tracker - New System.xlsx');

interface DashboardRow {
  name: string;
  total: number;
  activeAssignments: number;
  activeHoursPerWeek: number;
  availableHours: number;
  capacityUtilization: number;
  capacityStatus: string;
  epicGoldCount: number;
  epicGoldHours: number;
  governanceCount: number;
  governanceHours: number;
  sysInitCount: number;
  sysInitHours: number;
  sysProjCount: number;
  sysProjHours: number;
  epicUpgCount: number;
  epicUpgHours: number;
  genSupCount: number;
  genSupHours: number;
  policyCount: number;
  policyHours: number;
  marketCount: number;
  marketHours: number;
  ticketCount: number;
  ticketHours: number;
}

/**
 * Read Dashboard tab from Excel file
 */
async function readDashboardData(): Promise<DashboardRow[]> {
  console.log('📖 Reading Excel file...');

  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(EXCEL_FILE);

  const worksheet = workbook.getWorksheet('Dashboard');
  if (!worksheet) {
    throw new Error('Dashboard worksheet not found in Excel file');
  }

  console.log(`✅ Found Dashboard sheet with ${worksheet.rowCount} rows`);

  const dashboardData: DashboardRow[] = [];

  // Skip header row (row 1), start from row 2
  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);

    // Check if this row has data (first cell is name)
    const name = row.getCell(1).value?.toString().trim();
    if (!name || name === '') continue;

    const rowData: DashboardRow = {
      name: name,
      total: Number(row.getCell(2).value) || 0,
      activeAssignments: Number(row.getCell(3).value) || 0,
      activeHoursPerWeek: Number(row.getCell(4).value) || 0,
      availableHours: Number(row.getCell(5).value) || 40,
      capacityUtilization: Number(row.getCell(6).value) || 0,
      capacityStatus: row.getCell(7).value?.toString() || '',
      epicGoldCount: Number(row.getCell(8).value) || 0,
      epicGoldHours: Number(row.getCell(9).value) || 0,
      governanceCount: Number(row.getCell(10).value) || 0,
      governanceHours: Number(row.getCell(11).value) || 0,
      sysInitCount: Number(row.getCell(12).value) || 0,
      sysInitHours: Number(row.getCell(13).value) || 0,
      sysProjCount: Number(row.getCell(14).value) || 0,
      sysProjHours: Number(row.getCell(15).value) || 0,
      epicUpgCount: Number(row.getCell(16).value) || 0,
      epicUpgHours: Number(row.getCell(17).value) || 0,
      genSupCount: Number(row.getCell(18).value) || 0,
      genSupHours: Number(row.getCell(19).value) || 0,
      policyCount: Number(row.getCell(20).value) || 0,
      policyHours: Number(row.getCell(21).value) || 0,
      marketCount: Number(row.getCell(22).value) || 0,
      marketHours: Number(row.getCell(23).value) || 0,
      ticketCount: Number(row.getCell(24).value) || 0,
      ticketHours: Number(row.getCell(25).value) || 0,
    };

    dashboardData.push(rowData);
  }

  console.log(`✅ Parsed ${dashboardData.length} team members from Dashboard`);
  return dashboardData;
}

/**
 * Map capacity status from Excel to database format
 */
function parseCapacityStatus(statusStr: string): string {
  const normalized = statusStr.toLowerCase();

  if (normalized.includes('over') || normalized.includes('🔴')) {
    return 'over_capacity';
  } else if (normalized.includes('near') || normalized.includes('🟡')) {
    return 'near_capacity';
  } else {
    return 'available';
  }
}

/**
 * Update team_members table with capacity data
 */
async function updateTeamMembersCapacity(dashboardData: DashboardRow[]) {
  console.log('\n📝 Updating team_members capacity data...');

  let successCount = 0;
  let errorCount = 0;

  for (const row of dashboardData) {
    try {
      // Find team member by name
      const { data: members, error: findError } = await supabase
        .from('team_members')
        .select('id, name')
        .ilike('name', row.name)
        .limit(1);

      if (findError) throw findError;

      if (!members || members.length === 0) {
        console.log(`  ⚠️  Team member not found: ${row.name}`);
        errorCount++;
        continue;
      }

      const member = members[0];
      const capacityStatus = parseCapacityStatus(row.capacityStatus);

      // Update capacity fields
      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          active_hours_per_week: row.activeHoursPerWeek,
          available_hours: row.availableHours,
          capacity_utilization: row.capacityUtilization,
          capacity_status: capacityStatus,
        })
        .eq('id', member.id);

      if (updateError) throw updateError;

      console.log(`  ✅ ${row.name}: ${row.activeHoursPerWeek}h/wk, ${(row.capacityUtilization * 100).toFixed(1)}%, ${capacityStatus}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error updating ${row.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ Updated ${successCount} team members, ${errorCount} errors`);
}

/**
 * Populate work_type_hours table
 */
async function populateWorkTypeHours(dashboardData: DashboardRow[]) {
  console.log('\n📝 Populating work_type_hours data...');

  let successCount = 0;
  let errorCount = 0;

  for (const row of dashboardData) {
    try {
      // Find team member by name
      const { data: members, error: findError } = await supabase
        .from('team_members')
        .select('id, name')
        .ilike('name', row.name)
        .limit(1);

      if (findError) throw findError;

      if (!members || members.length === 0) {
        console.log(`  ⚠️  Team member not found: ${row.name}`);
        errorCount++;
        continue;
      }

      const member = members[0];

      // Define work types with their data
      const workTypes = [
        { type: 'Epic Gold', count: row.epicGoldCount, hours: row.epicGoldHours },
        { type: 'Governance', count: row.governanceCount, hours: row.governanceHours },
        { type: 'System Initiative', count: row.sysInitCount, hours: row.sysInitHours },
        { type: 'System Project', count: row.sysProjCount, hours: row.sysProjHours },
        { type: 'Epic Upgrades', count: row.epicUpgCount, hours: row.epicUpgHours },
        { type: 'General Support', count: row.genSupCount, hours: row.genSupHours },
        { type: 'Policy/Guidelines', count: row.policyCount, hours: row.policyHours },
        { type: 'Market Project', count: row.marketCount, hours: row.marketHours },
        { type: 'Ticket', count: row.ticketCount, hours: row.ticketHours },
      ];

      // Insert or update work type hours
      for (const wt of workTypes) {
        // Skip if no count and no hours
        if (wt.count === 0 && wt.hours === 0) continue;

        const { error: upsertError } = await supabase
          .from('work_type_hours')
          .upsert(
            {
              team_member_id: member.id,
              work_type: wt.type,
              count: wt.count,
              hours_per_week: wt.hours,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'team_member_id,work_type',
            }
          );

        if (upsertError) {
          console.error(`  ❌ Error upserting ${member.name} - ${wt.type}:`, upsertError);
          errorCount++;
        } else {
          successCount++;
        }
      }

      console.log(`  ✅ ${row.name}: Processed work type hours`);
    } catch (error) {
      console.error(`  ❌ Error processing ${row.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ Processed ${successCount} work type records, ${errorCount} errors`);
}

/**
 * Create initial capacity snapshot
 */
async function createCapacitySnapshot(dashboardData: DashboardRow[]) {
  console.log('\n📸 Creating capacity snapshot...');

  const snapshotDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let successCount = 0;
  let errorCount = 0;

  for (const row of dashboardData) {
    try {
      // Find team member by name
      const { data: members, error: findError } = await supabase
        .from('team_members')
        .select('id, name')
        .ilike('name', row.name)
        .limit(1);

      if (findError) throw findError;

      if (!members || members.length === 0) {
        errorCount++;
        continue;
      }

      const member = members[0];
      const capacityStatus = parseCapacityStatus(row.capacityStatus);

      // Insert snapshot (will skip if already exists for today)
      const { error: insertError } = await supabase
        .from('capacity_history')
        .upsert(
          {
            team_member_id: member.id,
            snapshot_date: snapshotDate,
            active_hours: row.activeHoursPerWeek,
            capacity_utilization: row.capacityUtilization,
            total_assignments: row.activeAssignments,
            capacity_status: capacityStatus,
          },
          {
            onConflict: 'team_member_id,snapshot_date',
          }
        );

      if (insertError) throw insertError;

      successCount++;
    } catch (error) {
      console.error(`  ❌ Error creating snapshot for ${row.name}:`, error);
      errorCount++;
    }
  }

  console.log(`✅ Created ${successCount} capacity snapshots, ${errorCount} errors`);
}

/**
 * Display summary statistics
 */
async function displaySummary() {
  console.log('\n📊 Summary Statistics:');

  // Get capacity distribution
  const { data: capacityData, error: capacityError } = await supabase
    .from('team_members')
    .select('capacity_status, capacity_utilization, active_hours_per_week')
    .not('capacity_status', 'is', null);

  if (capacityError) {
    console.error('Error fetching summary:', capacityError);
    return;
  }

  const overCapacity = capacityData.filter((m: any) => m.capacity_status === 'over_capacity');
  const nearCapacity = capacityData.filter((m: any) => m.capacity_status === 'near_capacity');
  const available = capacityData.filter((m: any) => m.capacity_status === 'available');

  const totalHours = capacityData.reduce((sum: number, m: any) => sum + (m.active_hours_per_week || 0), 0);
  const avgUtilization = capacityData.reduce((sum: number, m: any) => sum + (m.capacity_utilization || 0), 0) / capacityData.length;

  console.log(`  Total Team Members: ${capacityData.length}`);
  console.log(`  Total Active Hours: ${totalHours.toFixed(1)} hrs/week`);
  console.log(`  Average Utilization: ${(avgUtilization * 100).toFixed(1)}%`);
  console.log(`  🔴 Over Capacity: ${overCapacity.length}`);
  console.log(`  🟡 Near Capacity: ${nearCapacity.length}`);
  console.log(`  🟢 Available: ${available.length}`);

  // Get work type distribution
  const { data: workTypeData, error: workTypeError } = await supabase
    .from('work_type_hours')
    .select('work_type, count, hours_per_week');

  if (!workTypeError && workTypeData) {
    console.log('\n  Work Type Distribution:');

    const workTypeAgg = workTypeData.reduce((acc: any, row: any) => {
      if (!acc[row.work_type]) {
        acc[row.work_type] = { count: 0, hours: 0 };
      }
      acc[row.work_type].count += row.count || 0;
      acc[row.work_type].hours += row.hours_per_week || 0;
      return acc;
    }, {});

    Object.entries(workTypeAgg)
      .sort((a: any, b: any) => b[1].hours - a[1].hours)
      .forEach(([type, data]: [string, any]) => {
        console.log(`    ${type}: ${data.count} assignments, ${data.hours.toFixed(1)} hrs/wk`);
      });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Dashboard Capacity Data Import\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Read Excel data
    const dashboardData = await readDashboardData();

    if (dashboardData.length === 0) {
      console.log('❌ No data found in Dashboard sheet');
      return;
    }

    // Step 2: Update team_members capacity data
    await updateTeamMembersCapacity(dashboardData);

    // Step 3: Populate work_type_hours
    await populateWorkTypeHours(dashboardData);

    // Step 4: Create capacity snapshot
    await createCapacitySnapshot(dashboardData);

    // Step 5: Display summary
    await displaySummary();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Import completed successfully!');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
