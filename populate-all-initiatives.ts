import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const DOCUMENTS_FOLDER = path.join(process.cwd(), 'documents');

// Statistics tracking
interface Stats {
  totalProcessed: number;
  totalCreated: number;
  totalSkipped: number;
  totalErrors: number;
  byTeamMember: Record<string, { processed: number; created: number; skipped: number; errors: number }>;
}

const stats: Stats = {
  totalProcessed: 0,
  totalCreated: 0,
  totalSkipped: 0,
  totalErrors: 0,
  byTeamMember: {}
};

// Simple CSV parser (no external dependencies needed)
// Handles multi-line quoted fields properly
function parseCSV(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (!inQuotes && char === ',') {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      // End of row
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      }
      // Skip \r\n combinations
      if (char === '\r' && nextChar === '\n') {
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    // Regular character
    currentField += char;
    i++;
  }

  // Handle last field and row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  // First row is headers
  const headers = rows[0];
  const dataRows: Record<string, string>[] = [];

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    dataRows.push(row);
  }

  return dataRows;
}

// Normalize status values
function normalizeStatus(status: string): string {
  const normalized = status.toLowerCase().trim();

  if (normalized.includes('progress') || normalized === 'in progress') return 'Active';
  if (normalized.includes('complete') || normalized === 'complete') return 'Completed';
  if (normalized.includes('hold') || normalized === 'on hold') return 'On Hold';
  if (normalized.includes('plan')) return 'Planning';

  return 'Active'; // Default
}

// Normalize EHR values
function normalizeEHR(ehr: string): string | null {
  if (!ehr || ehr.trim() === '') return null;

  const normalized = ehr.toLowerCase().trim();

  if (normalized === 'all') return 'All';
  if (normalized === 'epic') return 'Epic';
  if (normalized === 'cerner') return 'Cerner';
  if (normalized === 'altera') return 'Altera';
  if (normalized.includes('epic') && normalized.includes('cerner')) return 'Epic and Cerner';

  return ehr; // Return as-is if not matching known values
}

// Normalize role values
function normalizeRole(role: string): string | null {
  if (!role || role.trim() === '') return null;

  const normalized = role.toLowerCase().trim();

  if (normalized.includes('primary') || normalized === 'primary') return 'Primary';
  if (normalized.includes('co-owner') || normalized === 'co-owner') return 'Co-Owner';
  if (normalized.includes('secondary') || normalized === 'secondary') return 'Secondary';
  if (normalized.includes('support') || normalized === 'support') return 'Support';

  return null;
}

// Parse date from various formats
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;

  try {
    // Try parsing common date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
  } catch (e) {
    // Ignore parse errors
  }

  return null;
}

// Extract team member name from filename
function extractTeamMemberName(filename: string): string {
  // Format: "SCI Assignments Tracker - [Name].csv"
  const match = filename.match(/SCI Assignments Tracker - (.+)\.csv/);
  return match ? match[1].trim() : '';
}

// Get team member ID from database
async function getTeamMemberId(name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('id')
    .eq('name', name)
    .single();

  if (error) {
    console.error(`Error finding team member ${name}:`, error.message);
    return null;
  }

  return data?.id || null;
}

// Check if a row looks like a valid initiative
function isValidInitiative(assignment: string, row: Record<string, string>): boolean {
  if (!assignment || assignment.trim() === '') return false;

  const cleaned = assignment.trim();

  // Skip if assignment is too short (likely garbage data)
  if (cleaned.length < 5) return false;

  // Skip if it looks like partial data or formatting artifacts
  if (/^\d{4}\.?$/.test(cleaned)) return false; // Just a year
  if (/^(and|or|the|to|from|with|for|in|on|at)$/i.test(cleaned)) return false; // Common words
  if (/^[,.\-;:]+$/.test(cleaned)) return false; // Just punctuation

  // Skip if it looks like continuation text (starts with lowercase or common continuation words)
  if (/^(will|currently|validation|week of|go-live|soft activation)/i.test(cleaned)) return false;

  // Skip if the SCI field doesn't match the expected team member name
  const sciField = row['SCI'];
  if (!sciField || sciField.trim() === '') return false;

  return true;
}

// Cache for existing initiatives (loaded once at startup)
let existingInitiatives: Set<string> = new Set();

// Load existing initiatives to prevent duplicates
async function loadExistingInitiatives() {
  const { data, error } = await supabase
    .from('initiatives')
    .select('initiative_name, owner_name');

  if (error) {
    console.error('Error loading existing initiatives:', error);
    return;
  }

  existingInitiatives = new Set(
    (data || []).map(i => `${i.owner_name}::${i.initiative_name}`.toLowerCase())
  );

  console.log(`\n✓ Loaded ${existingInitiatives.size} existing initiatives to prevent duplicates`);
}

// Process a single CSV row
async function processRow(
  row: Record<string, string>,
  teamMemberId: string,
  teamMemberName: string
): Promise<boolean> {
  const assignment = row['Assignment'] || row['Assignment '];
  const workType = row['Work Type'];

  // Skip if no assignment name
  if (!assignment || assignment.trim() === '') {
    stats.totalSkipped++;
    if (VERBOSE) console.log(`  [SKIP] Empty assignment`);
    return false;
  }

  // Validate if it's a real initiative
  if (!isValidInitiative(assignment, row)) {
    stats.totalSkipped++;
    if (VERBOSE) console.log(`  [SKIP] Invalid: ${assignment.substring(0, 50)}`);
    return false;
  }

  // Skip governance items
  if (workType && workType.toLowerCase().includes('governance')) {
    stats.totalSkipped++;
    if (VERBOSE) console.log(`  [SKIP] Governance: ${assignment.substring(0, 50)}`);
    return false;
  }

  const initiativeName = assignment.trim();

  // Check for duplicates
  const duplicateKey = `${teamMemberName}::${initiativeName}`.toLowerCase();
  if (existingInitiatives.has(duplicateKey)) {
    stats.totalSkipped++;
    if (VERBOSE) console.log(`  [SKIP] Duplicate: ${initiativeName.substring(0, 50)}`);
    return false;
  }
  const status = normalizeStatus(row['Status'] || 'Active');
  const type = row['Work Type'] || 'General Support';
  const role = normalizeRole(row['Role'] || '');
  const ehrsImpacted = normalizeEHR(row['EHR/s Impacted'] || '');
  const serviceLine = row['Service Line'] || null;
  const startDate = parseDate(row['Assignment Date'] || '');
  const endDate = parseDate(row['Projected Go-Live Date'] || '');
  const sponsor = row['Sponsor'] || null;
  const shortDescription = row['Short Description'] || '';
  const comments = row['Comments/Details'] || '';

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would create: ${initiativeName}`);
    stats.totalCreated++;
    return true;
  }

  try {
    // Create initiative record
    const { data: initiative, error: initiativeError } = await supabase
      .from('initiatives')
      .insert({
        team_member_id: teamMemberId,
        owner_name: teamMemberName, // Use actual team member name, not "Marty"
        initiative_name: initiativeName,
        type: type,
        status: status,
        role: role,
        ehrs_impacted: ehrsImpacted,
        service_line: serviceLine,
        start_date: startDate,
        end_date: endDate,
        timeframe_display: null, // Can be added later
        clinical_sponsor_name: sponsor,
        clinical_sponsor_title: null,
        key_collaborators: [],
        governance_bodies: [],
        is_draft: false,
        last_updated_by: teamMemberName
      })
      .select()
      .single();

    if (initiativeError) {
      // Check if it's a duplicate error
      if (initiativeError.message && initiativeError.message.includes('duplicate')) {
        stats.totalSkipped++;
        if (VERBOSE) console.log(`  [SKIP] Duplicate detected by DB: ${initiativeName.substring(0, 50)}`);
        return false;
      }

      console.error(`  ✗ Error creating initiative "${initiativeName}":`, initiativeError.message);
      stats.totalErrors++;
      return false;
    }

    console.log(`  ✓ Created: ${initiativeName}`);

    // Add story if there's description or comments
    if (shortDescription || comments) {
      const challenge = shortDescription || null;
      const approach = comments || null;

      await supabase.from('initiative_stories').insert({
        initiative_id: initiative.id,
        challenge: challenge,
        approach: approach,
        outcome: null,
        collaboration_detail: null
      });
    }

    stats.totalCreated++;
    return true;
  } catch (error: any) {
    console.error(`  ✗ Exception creating initiative "${initiativeName}":`, error.message);
    stats.totalErrors++;
    return false;
  }
}

// Process a single CSV file
async function processCSVFile(filePath: string): Promise<void> {
  const filename = path.basename(filePath);
  const teamMemberName = extractTeamMemberName(filename);

  if (!teamMemberName) {
    console.log(`⚠ Skipping file ${filename} - could not extract team member name`);
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Processing: ${teamMemberName}`);
  console.log(`${'='.repeat(80)}`);

  // Initialize stats for this team member
  if (!stats.byTeamMember[teamMemberName]) {
    stats.byTeamMember[teamMemberName] = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: 0
    };
  }

  const teamMemberStats = stats.byTeamMember[teamMemberName];

  // Get team member ID
  const teamMemberId = await getTeamMemberId(teamMemberName);
  if (!teamMemberId) {
    console.log(`✗ Team member "${teamMemberName}" not found in database. Skipping.`);
    return;
  }

  console.log(`Team Member ID: ${teamMemberId}`);

  // Read and parse CSV
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`Total rows in CSV: ${rows.length}`);

  // Process each row
  for (const row of rows) {
    teamMemberStats.processed++;
    stats.totalProcessed++;

    const created = await processRow(row, teamMemberId, teamMemberName);
    if (created) {
      teamMemberStats.created++;
    } else {
      teamMemberStats.skipped++;
    }
  }

  console.log(`\nCompleted ${teamMemberName}:`);
  console.log(`  Processed: ${teamMemberStats.processed}`);
  console.log(`  Created: ${teamMemberStats.created}`);
  console.log(`  Skipped: ${teamMemberStats.skipped}`);
  console.log(`  Errors: ${teamMemberStats.errors}`);
}

// Show help message
function showHelp() {
  console.log(`
SCI Initiatives Population Script
==================================

Usage: npx tsx populate-all-initiatives.ts [options]

Options:
  --dry-run    Run without making database changes (preview only)
  --verbose    Show detailed output including skipped items
  -v           Short form of --verbose
  --help       Show this help message

Examples:
  npx tsx populate-all-initiatives.ts --dry-run       # Preview what would be created
  npx tsx populate-all-initiatives.ts --dry-run -v    # Preview with details
  npx tsx populate-all-initiatives.ts                 # Actually insert data

Description:
  This script reads all CSV files in the documents/ folder and populates
  non-governance initiatives into the Supabase database. It automatically:
  - Filters out governance work types
  - Validates initiative data
  - Maps CSV columns to database fields
  - Creates initiative records and stories
  - Tracks statistics by team member

CSV Column Mapping:
  SCI → team_member_id (lookup)
  Assignment → initiative_name
  Work Type → type
  Status → status (normalized)
  Role → role
  EHR/s Impacted → ehrs_impacted (normalized)
  Service Line → service_line
  Projected Go-Live Date → end_date
  Assignment Date → start_date
  Sponsor → clinical_sponsor_name
  Short Description → story.challenge
  Comments/Details → story.approach
`);
}

// Main function
async function main() {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  console.log('\n' + '='.repeat(80));
  console.log('SCI INITIATIVES POPULATION SCRIPT');
  console.log('='.repeat(80));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no database changes)' : 'LIVE (will insert data)'}`);
  console.log(`Verbose: ${VERBOSE ? 'ON' : 'OFF'}`);
  console.log(`Documents folder: ${DOCUMENTS_FOLDER}`);
  console.log('='.repeat(80));

  // If not dry run, check existing initiatives and warn
  if (!DRY_RUN) {
    const { count, error } = await supabase
      .from('initiatives')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`\n✗ Error checking existing initiatives:`, error.message);
      process.exit(1);
    }

    console.log(`\n✓ Database currently has ${count} existing initiatives`);
    console.log(`✓ Script will skip any duplicates automatically`);

    // Load existing initiatives to prevent duplicates
    await loadExistingInitiatives();

    console.log(`\n⚠  Running in LIVE mode - will insert data in 5 seconds...`);
    console.log(`   Press Ctrl+C to cancel\n`);

    // Wait 5 seconds to give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    // Load existing initiatives even in dry-run mode
    await loadExistingInitiatives();
  }

  // Check if documents folder exists
  if (!fs.existsSync(DOCUMENTS_FOLDER)) {
    console.error(`\n✗ Documents folder not found: ${DOCUMENTS_FOLDER}`);
    process.exit(1);
  }

  // Get all CSV files
  const files = fs.readdirSync(DOCUMENTS_FOLDER)
    .filter(file => file.startsWith('SCI Assignments Tracker -') && file.endsWith('.csv'))
    .map(file => path.join(DOCUMENTS_FOLDER, file))
    .sort();

  console.log(`\nFound ${files.length} CSV files to process`);

  if (files.length === 0) {
    console.log('\n✗ No CSV files found matching pattern "SCI Assignments Tracker - *.csv"');
    process.exit(1);
  }

  // Process each file
  for (const file of files) {
    await processCSVFile(file);
  }

  // Print final summary
  console.log('\n' + '='.repeat(80));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total rows processed: ${stats.totalProcessed}`);
  console.log(`Total initiatives created: ${stats.totalCreated}`);
  console.log(`Total skipped: ${stats.totalSkipped}`);
  console.log(`Total errors: ${stats.totalErrors}`);

  console.log('\n' + '-'.repeat(80));
  console.log('BY TEAM MEMBER:');
  console.log('-'.repeat(80));

  const teamMembers = Object.keys(stats.byTeamMember).sort();
  for (const member of teamMembers) {
    const s = stats.byTeamMember[member];
    console.log(`\n${member}:`);
    console.log(`  Processed: ${s.processed}, Created: ${s.created}, Skipped: ${s.skipped}, Errors: ${s.errors}`);
  }

  console.log('\n' + '='.repeat(80));
  if (DRY_RUN) {
    console.log('DRY RUN COMPLETE - No data was written to the database');
    console.log('Run without --dry-run flag to actually insert data');
  } else {
    console.log('POPULATION COMPLETE');
  }
  console.log('='.repeat(80) + '\n');
}

// Run the script
main().catch(error => {
  console.error('\n✗ Fatal error:', error);
  process.exit(1);
});
