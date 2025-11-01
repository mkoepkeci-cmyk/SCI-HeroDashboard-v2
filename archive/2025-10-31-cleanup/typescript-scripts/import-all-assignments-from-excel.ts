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

const STAFF_NAMES = [
  'Ashley', 'Brooke', 'Dawn', 'Jason', 'Josh', 'Kim', 'Lisa', 'Marisa',
  'Marty', 'Matt', 'Melissa', 'Robin', 'Sherry', 'Trudy', 'Van', 'Yvette'
];

async function importAllAssignments() {
  console.log('========================================');
  console.log('COMPREHENSIVE ASSIGNMENT IMPORT');
  console.log('========================================\n');

  console.log('Step 1: Export Excel sheets to CSV using Python...\n');

  // Create a Python script to export each sheet
  const pythonScript = `
import pandas as pd
import json
import sys
import numpy as np

excel_file = 'documents/SCI Workload Tracker - New System.xlsx'
staff_names = ${JSON.stringify(STAFF_NAMES)}

all_data = {}

def clean_value(val):
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (np.integer, np.floating)):
        if np.isnan(val) or np.isinf(val):
            return None
        return float(val)
    if isinstance(val, bool):
        return bool(val)
    return str(val)

for staff_name in staff_names:
    try:
        df = pd.read_excel(excel_file, sheet_name=staff_name)
        # Convert to records and clean all values
        records = []
        for _, row in df.iterrows():
            clean_row = {k: clean_value(v) for k, v in row.items()}
            records.append(clean_row)
        all_data[staff_name] = records
        print(f"✓ Exported {len(records)} assignments for {staff_name}", file=sys.stderr)
    except Exception as e:
        print(f"✗ Error for {staff_name}: {e}", file=sys.stderr)

# Output JSON to stdout
print(json.dumps(all_data))
`;

  fs.writeFileSync('scripts/temp_export.py', pythonScript);

  let allData: any;
  try {
    const { stdout, stderr } = await execAsync('python scripts/temp_export.py');
    console.log(stderr);
    allData = JSON.parse(stdout);
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

  console.log('\nStep 3: Process and import assignments...\n');

  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const [staffName, assignments] of Object.entries(allData) as [string, any[]][]) {
    const memberId = memberMap.get(staffName);
    if (!memberId) {
      console.log(`✗ ${staffName}: Member not found in database`);
      continue;
    }

    console.log(`\n${staffName} (${assignments.length} assignments):`);

    for (const row of assignments) {
      // Skip header row or empty rows
      if (!row['Assignment '] || row['Assignment '] === 'Assignment ') {
        totalSkipped++;
        continue;
      }

      const assignment = {
        team_member_id: memberId,
        team_member_name: staffName,
        assignment_name: row['Assignment ']?.toString().trim() || '',
        short_description: row['Short Description']?.toString().trim() || null,
        role_type: row['Role']?.toString().trim() || null,
        work_effort: row['Work Effort']?.toString().trim() || null,
        expander_over_15_hrs: row['Expander >15 hrs'] ? true : false,
        work_type: row['Work Type']?.toString().trim() || null,
        ehrs_impacted: row['EHR/s Impacted']?.toString().trim() || null,
        status: row['Status']?.toString().trim() || 'Unknown',
        phase: row['Phase']?.toString().trim() || null,
        projected_go_live_date: row['System Projected Go-Live Date'] || null,
        sponsor: row['Sponsor']?.toString().trim() || null,
        service_line: row['Service Line']?.toString().trim() || null,
        assignment_date: row['Assignment Date'] || null,
        comments_details: row['Comments/Details']?.toString().trim() || null,
      };

      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('assignments')
        .select('id')
        .eq('team_member_id', memberId)
        .eq('assignment_name', assignment.assignment_name)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('assignments')
          .update(assignment)
          .eq('id', existing.id);

        if (error) {
          console.log(`  ✗ Error updating: ${assignment.assignment_name.substring(0, 40)}`);
          totalErrors++;
        } else {
          console.log(`  ↻ Updated: ${assignment.assignment_name.substring(0, 40)}`);
          totalImported++;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('assignments')
          .insert([assignment]);

        if (error) {
          console.log(`  ✗ Error inserting: ${assignment.assignment_name.substring(0, 40)}`);
          console.log(`     ${error.message}`);
          totalErrors++;
        } else {
          console.log(`  ✓ Inserted: ${assignment.assignment_name.substring(0, 40)}`);
          totalImported++;
        }
      }
    }
  }

  console.log('\n========================================');
  console.log('IMPORT SUMMARY');
  console.log('========================================');
  console.log(`Total processed: ${totalImported}`);
  console.log(`Skipped (empty): ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
  console.log('========================================\n');

  // Clean up temp file
  fs.unlinkSync('scripts/temp_export.py');
}

importAllAssignments().catch(console.error);
