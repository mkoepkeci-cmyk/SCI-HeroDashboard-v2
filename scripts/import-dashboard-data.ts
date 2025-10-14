import Excel from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface DashboardRow {
  name: string;
  // Summary metrics (Columns A-G)
  total_assignments: number;
  active_assignments: number;
  active_hours_per_week: number;
  available_hours: number;
  capacity_utilization: number;
  capacity_status: string;
  // Work type breakdowns (Columns H-Y)
  epic_gold_count: number;
  epic_gold_hours: number;
  governance_count: number;
  governance_hours: number;
  system_initiative_count: number;
  system_initiative_hours: number;
  system_projects_count: number;
  system_projects_hours: number;
  epic_upgrades_count: number;
  epic_upgrades_hours: number;
  general_support_count: number;
  general_support_hours: number;
  policy_count: number;
  policy_hours: number;
  market_count: number;
  market_hours: number;
  ticket_count: number;
  ticket_hours: number;
}

async function importDashboardData() {
  console.log('📊 IMPORTING DASHBOARD DATA FROM EXCEL');
  console.log('='.repeat(80));
  console.log('');

  // Read Excel file
  const excelPath = path.join(__dirname, '..', 'documents', 'SCI Workload Tracker - New System.xlsx');
  console.log('📁 Reading Excel file:', excelPath);

  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const dashboard = workbook.getWorksheet('Dashboard');
  if (!dashboard) {
    console.error('❌ Dashboard sheet not found in Excel file');
    process.exit(1);
  }

  console.log('✅ Found Dashboard sheet');
  console.log('');

  // Parse dashboard rows
  const dashboardData: DashboardRow[] = [];

  dashboard.eachRow((row, rowNumber) => {
    // Skip header row
    if (rowNumber === 1) return;

    const name = row.getCell(1).value?.toString().trim();
    if (!name) return;

    // Helper function to get numeric value or 0
    const getNum = (colNum: number): number => {
      const val = row.getCell(colNum).value;
      if (val === null || val === undefined) return 0;
      return typeof val === 'number' ? val : parseFloat(val.toString()) || 0;
    };

    // Helper function to get string value
    const getStr = (colNum: number): string => {
      const val = row.getCell(colNum).value;
      return val?.toString() || '';
    };

    dashboardData.push({
      name,
      // Columns A-G: Summary Metrics
      total_assignments: getNum(2),
      active_assignments: getNum(3),
      active_hours_per_week: getNum(4),
      available_hours: getNum(5),
      capacity_utilization: getNum(6),
      capacity_status: getStr(7),
      // Columns H-I: Epic Gold
      epic_gold_count: getNum(8),
      epic_gold_hours: getNum(9),
      // Columns J-K: Governance
      governance_count: getNum(10),
      governance_hours: getNum(11),
      // Columns L-M: System Initiatives
      system_initiative_count: getNum(12),
      system_initiative_hours: getNum(13),
      // Columns N-O: System Projects
      system_projects_count: getNum(14),
      system_projects_hours: getNum(15),
      // Columns P-Q: Epic Upgrades
      epic_upgrades_count: getNum(16),
      epic_upgrades_hours: getNum(17),
      // Columns R-S: General Support
      general_support_count: getNum(18),
      general_support_hours: getNum(19),
      // Columns T-U: Policy
      policy_count: getNum(20),
      policy_hours: getNum(21),
      // Columns V-W: Market
      market_count: getNum(22),
      market_hours: getNum(23),
      // Columns X-Y: Ticket
      ticket_count: getNum(24),
      ticket_hours: getNum(25),
    });
  });

  console.log(`📋 Parsed ${dashboardData.length} staff members from Dashboard tab`);
  console.log('');

  // Get team members from database
  const { data: teamMembers, error: teamError } = await supabase
    .from('team_members')
    .select('id, name');

  if (teamError) {
    console.error('❌ Error fetching team members:', teamError);
    process.exit(1);
  }

  console.log(`👥 Found ${teamMembers.length} team members in database`);
  console.log('');

  // Match and insert/update dashboard metrics
  console.log('💾 Importing dashboard metrics...');
  console.log('-'.repeat(80));

  let imported = 0;
  let skipped = 0;

  for (const dashRow of dashboardData) {
    const member = teamMembers.find(m => m.name === dashRow.name);

    if (!member) {
      console.log(`⚠️  Skipped: ${dashRow.name} (not found in database)`);
      skipped++;
      continue;
    }

    // Upsert dashboard metrics
    const { error: upsertError } = await supabase
      .from('dashboard_metrics')
      .upsert({
        team_member_id: member.id,
        total_assignments: dashRow.total_assignments,
        active_assignments: dashRow.active_assignments,
        active_hours_per_week: dashRow.active_hours_per_week,
        available_hours: dashRow.available_hours,
        capacity_utilization: dashRow.capacity_utilization,
        capacity_status: dashRow.capacity_status,
        epic_gold_count: dashRow.epic_gold_count,
        epic_gold_hours: dashRow.epic_gold_hours,
        governance_count: dashRow.governance_count,
        governance_hours: dashRow.governance_hours,
        system_initiative_count: dashRow.system_initiative_count,
        system_initiative_hours: dashRow.system_initiative_hours,
        system_projects_count: dashRow.system_projects_count,
        system_projects_hours: dashRow.system_projects_hours,
        epic_upgrades_count: dashRow.epic_upgrades_count,
        epic_upgrades_hours: dashRow.epic_upgrades_hours,
        general_support_count: dashRow.general_support_count,
        general_support_hours: dashRow.general_support_hours,
        policy_count: dashRow.policy_count,
        policy_hours: dashRow.policy_hours,
        market_count: dashRow.market_count,
        market_hours: dashRow.market_hours,
        ticket_count: dashRow.ticket_count,
        ticket_hours: dashRow.ticket_hours,
      }, { onConflict: 'team_member_id' });

    if (upsertError) {
      console.log(`❌ Error importing ${dashRow.name}:`, upsertError.message);
      continue;
    }

    const capacityPct = (dashRow.capacity_utilization * 100).toFixed(1);
    console.log(`✅ ${dashRow.name}: ${dashRow.active_hours_per_week.toFixed(2)}h/wk (${capacityPct}%)`);
    imported++;
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('📊 IMPORT COMPLETE');
  console.log('-'.repeat(80));
  console.log(`✅ Imported: ${imported} staff members`);
  console.log(`⚠️  Skipped: ${skipped} staff members`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Refresh your dashboard at http://localhost:5176/');
  console.log('2. Go to Workload tab');
  console.log('3. Verify data matches Excel Dashboard exactly');
  console.log('');

  process.exit(0);
}

importDashboardData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
