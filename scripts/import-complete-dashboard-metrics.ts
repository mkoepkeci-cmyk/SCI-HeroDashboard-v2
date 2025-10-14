import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

dotenv.config();

const execAsync = promisify(exec);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function importDashboardMetrics() {
  console.log('========================================');
  console.log('COMPLETE DASHBOARD METRICS IMPORT');
  console.log('========================================\n');

  console.log('Step 1: Export Dashboard tab using Python...\n');

  // Create a Python script to export Dashboard data
  const pythonScript = `
import pandas as pd
import json
import sys

excel_file = 'documents/SCI Workload Tracker - New System.xlsx'

# Read Dashboard sheet
df = pd.read_excel(excel_file, sheet_name='Dashboard')

# Convert to records and handle NaN/NaT
records = df.where(pd.notnull(df), None).to_dict('records')

print(f"✓ Exported {len(records)} rows from Dashboard tab", file=sys.stderr)

# Output JSON to stdout
print(json.dumps(records, default=str))
`;

  fs.writeFileSync('scripts/temp_dashboard_export.py', pythonScript);

  let dashboardData: any[];
  try {
    const { stdout, stderr } = await execAsync('python scripts/temp_dashboard_export.py');
    console.log(stderr);
    dashboardData = JSON.parse(stdout);
  } catch (error) {
    console.error('Error running Python script:', error);
    return;
  }

  console.log('\nStep 2: Get team member IDs from Supabase...\n');

  const { data: teamMembers, error: teamError } = await supabase
    .from('team_members')
    .select('id, name');

  if (teamError) {
    console.error('Error fetching team members:', teamError);
    return;
  }

  const memberMap = new Map(teamMembers.map(m => [m.name, m.id]));

  console.log('\nStep 3: Process and import dashboard metrics...\n');

  let totalImported = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const row of dashboardData) {
    const staffName = row['Name'];
    if (!staffName) {
      console.log('✗ Skipping row with no name');
      continue;
    }

    const memberId = memberMap.get(staffName);
    if (!memberId) {
      console.log(`✗ ${staffName}: Member not found in database`);
      totalErrors++;
      continue;
    }

    const metrics = {
      team_member_id: memberId,
      total_assignments: parseInt(row['Total']) || 0,
      active_assignments: parseInt(row['Active Assignments']) || 0,
      active_hours_per_week: parseFloat(row['Active Hrs/Wk']) || 0,
      available_hours: parseFloat(row['Available Hours']) || 40,
      capacity_utilization: parseFloat(row['Capacity Utilization']) || 0,
      capacity_status: row['Capacity']?.toString() || '',
      epic_gold_count: parseInt(row['EpicGold_Count']) || 0,
      epic_gold_hours: parseFloat(row['EpicGold_Hours']) || 0,
      governance_count: parseInt(row['Governance_Coun']) || 0,
      governance_hours: parseFloat(row['Governance_Hours']) || 0,
      system_initiative_count: parseInt(row['SysInit_Count']) || 0,
      system_initiative_hours: parseFloat(row['SysInit_Hours']) || 0,
      system_projects_count: parseInt(row['SysProj_Count']) || 0,
      system_projects_hours: parseFloat(row['SysProj_Hours']) || 0,
      epic_upgrades_count: parseInt(row['EpicUpg_Count']) || 0,
      epic_upgrades_hours: parseFloat(row['EpicUpg_Hours']) || 0,
      general_support_count: parseInt(row['GenSup_Count']) || 0,
      general_support_hours: parseFloat(row['GenSup_Hours']) || 0,
      policy_count: parseInt(row['Policy_Count']) || 0,
      policy_hours: parseFloat(row['Policy_Hours']) || 0,
      market_count: parseInt(row['Market_Count']) || 0,
      market_hours: parseFloat(row['Market_Hours']) || 0,
      ticket_count: parseInt(row['Ticket_Count']) || 0,
      ticket_hours: parseFloat(row['Ticket_Hours']) || 0,
    };

    // Check if metrics already exist for this member
    const { data: existing } = await supabase
      .from('dashboard_metrics')
      .select('team_member_id')
      .eq('team_member_id', memberId)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('dashboard_metrics')
        .update(metrics)
        .eq('team_member_id', memberId);

      if (error) {
        console.log(`✗ ${staffName}: Error updating - ${error.message}`);
        totalErrors++;
      } else {
        console.log(`↻ ${staffName}: Updated (${metrics.total_assignments} total, ${metrics.active_assignments} active, ${metrics.active_hours_per_week.toFixed(1)}h/wk)`);
        totalUpdated++;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('dashboard_metrics')
        .insert([metrics]);

      if (error) {
        console.log(`✗ ${staffName}: Error inserting - ${error.message}`);
        totalErrors++;
      } else {
        console.log(`✓ ${staffName}: Inserted (${metrics.total_assignments} total, ${metrics.active_assignments} active, ${metrics.active_hours_per_week.toFixed(1)}h/wk)`);
        totalImported++;
      }
    }
  }

  console.log('\n========================================');
  console.log('IMPORT SUMMARY');
  console.log('========================================');
  console.log(`New records inserted: ${totalImported}`);
  console.log(`Existing records updated: ${totalUpdated}`);
  console.log(`Errors: ${totalErrors}`);
  console.log('========================================\n');

  // Clean up temp file
  fs.unlinkSync('scripts/temp_dashboard_export.py');
}

importDashboardMetrics().catch(console.error);
