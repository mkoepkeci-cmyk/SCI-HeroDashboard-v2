import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function importFromCSV(staffName: string, csvPath: string) {
  console.log(`\n========== Importing ${staffName} ==========`);

  // Get team member ID
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .select('id')
    .ilike('name', staffName)
    .single();

  if (memberError || !member) {
    console.error(`Error finding ${staffName}:`, memberError);
    return;
  }

  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`Found ${records.length} rows in CSV\n`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const row of records) {
    const assignmentName = row['Assignment '] || row['Assignment'];
    if (!assignmentName || assignmentName === 'Assignment') {
      continue; // Skip header or empty rows
    }

    const assignment = {
      team_member_id: member.id,
      team_member_name: staffName,
      assignment_name: assignmentName.trim(),
      short_description: row['Short Description']?.trim() || null,
      role_type: row['Role']?.trim() || null,
      work_effort: row['Work Effort']?.trim() || null,
      expander_over_15_hrs: row['Expander >15 hrs'] ? true : false,
      work_type: row['Work Type']?.trim() || 'Unknown',
      ehrs_impacted: row['EHR/s Impacted']?.trim() || null,
      status: row['Status']?.trim() || 'Unknown',
      phase: row['Phase']?.trim() || null,
      projected_go_live_date: row['System Projected Go-Live Date'] || row['Projected Go-Live Date'] || null,
      sponsor: row['Sponsor']?.trim() || null,
      service_line: row['Service Line']?.trim() || null,
      assignment_date: row['Assignment Date'] || null,
      comments_details: row['Comments/Details']?.trim() || null,
    };

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from('assignments')
      .select('id')
      .eq('team_member_id', member.id)
      .eq('assignment_name', assignment.assignment_name)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('assignments')
        .update(assignment)
        .eq('id', existing.id);

      if (error) {
        console.log(`  ✗ Error updating: ${assignment.assignment_name.substring(0, 50)}`);
        console.log(`     ${error.message}`);
        errors++;
      } else {
        console.log(`  ↻ Updated: ${assignment.assignment_name.substring(0, 50)}`);
        updated++;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('assignments')
        .insert([assignment]);

      if (error) {
        console.log(`  ✗ Error inserting: ${assignment.assignment_name.substring(0, 50)}`);
        console.log(`     ${error.message}`);
        errors++;
      } else {
        console.log(`  ✓ Inserted: ${assignment.assignment_name.substring(0, 50)}`);
        inserted++;
      }
    }
  }

  console.log(`\n${staffName} Summary:`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
}

async function main() {
  console.log('========================================');
  console.log('IMPORT VAN & YVETTE FROM CSV');
  console.log('========================================');

  await importFromCSV('Van', 'documents/SCI Workload Tracker - New System - Van.csv');
  await importFromCSV('Yvette', 'documents/SCI Workload Tracker - New System - Yvette.csv');

  console.log('\n========================================');
  console.log('IMPORT COMPLETE');
  console.log('========================================\n');

  // Check final results
  console.log('Checking final assignment counts...\n');

  for (const name of ['Van', 'Yvette']) {
    const { data: member } = await supabase
      .from('team_members')
      .select('id')
      .ilike('name', name)
      .single();

    if (!member) continue;

    const { data: assignments, count } = await supabase
      .from('assignments')
      .select('*', { count: 'exact' })
      .eq('team_member_id', member.id);

    const missing = assignments?.filter(a =>
      !a.work_effort || !a.phase || !a.role_type
    ) || [];

    console.log(`${name}: ${count} total assignments, ${missing.length} with missing data`);

    if (missing.length > 0) {
      const missingEffort = missing.filter(a => !a.work_effort).length;
      const missingPhase = missing.filter(a => !a.phase).length;
      const missingRole = missing.filter(a => !a.role_type).length;
      console.log(`  - Missing Work Effort: ${missingEffort}`);
      console.log(`  - Missing Phase: ${missingPhase}`);
      console.log(`  - Missing Role: ${missingRole}`);
    }
  }
}

main().catch(console.error);
