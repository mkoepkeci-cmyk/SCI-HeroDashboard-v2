# Populate All Initiatives Script

## Overview

The `populate-all-initiatives.ts` script is a comprehensive TypeScript utility that reads all SCI team member CSV files from the `documents/` folder and populates non-governance initiatives into the Supabase database.

## Features

- **Automated CSV Processing**: Processes all 16 team member CSV files automatically
- **Smart Filtering**: Excludes governance items and invalid data
- **Data Normalization**: Normalizes status, EHR, and role values
- **Error Handling**: Continues processing even if individual items fail
- **Progress Tracking**: Shows detailed statistics by team member
- **Dry Run Mode**: Preview changes before committing to database
- **Verbose Output**: Optional detailed logging of all operations

## Quick Start

### 1. Preview what will be created (Recommended first step)

```bash
npx tsx populate-all-initiatives.ts --dry-run
```

This shows a summary of what would be created without making any database changes.

### 2. Preview with detailed output

```bash
npx tsx populate-all-initiatives.ts --dry-run --verbose
```

Shows every item being processed, including skipped items and reasons.

### 3. Actually populate the database

```bash
npx tsx populate-all-initiatives.ts
```

**WARNING**: This will insert data into the database. Run dry-run first!

## Command Line Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Run without making database changes (preview only) |
| `--verbose` or `-v` | Show detailed output including skipped items |
| `--help` or `-h` | Show help message |

## What Gets Created

### For Each Non-Governance Assignment:

1. **Initiative Record** (`initiatives` table)
   - Basic information (name, owner, type, status)
   - Role, EHRs impacted, service line
   - Dates (start, end)
   - Clinical sponsor
   - Set as `is_draft = false`

2. **Initiative Story** (`initiative_stories` table)
   - Challenge: From "Short Description" CSV column
   - Approach: From "Comments/Details" CSV column
   - (Only if description or comments exist)

### What Gets Skipped:

- **Governance items**: Any row with Work Type containing "governance"
- **Invalid data**: Empty assignments, malformed data, continuation text
- **Already populated**: Marty's initiatives (already in database)

## CSV Column Mapping

| CSV Column | Database Field | Notes |
|------------|----------------|-------|
| SCI | `team_member_id` | Looked up from `team_members` table |
| SCI | `owner_name` | Uses actual team member name |
| Assignment | `initiative_name` | Trimmed and validated |
| Work Type | `type` | Direct mapping |
| Status | `status` | Normalized to Active/Completed/Planning/On Hold |
| Role | `role` | Normalized to Primary/Co-Owner/Secondary/Support |
| EHR/s Impacted | `ehrs_impacted` | Normalized to All/Epic/Cerner/Altera |
| Service Line | `service_line` | Direct mapping |
| Projected Go-Live Date | `end_date` | Parsed to YYYY-MM-DD |
| Assignment Date | `start_date` | Parsed to YYYY-MM-DD |
| Sponsor | `clinical_sponsor_name` | Direct mapping |
| Short Description | Story: `challenge` | For context |
| Comments/Details | Story: `approach` | For details |

## Expected Results

Based on dry run testing with current CSV files:

- **Total Rows Processed**: ~438
- **Initiatives Created**: ~379 (non-governance)
- **Governance Skipped**: ~59
- **Team Members**: 16

### Breakdown by Team Member:

| Team Member | Processed | Created | Skipped (Governance) |
|-------------|-----------|---------|---------------------|
| Josh | 95 | 73 | 22 |
| Dawn | 35 | 30 | 5 |
| Van | 31 | 31 | 0 |
| Matt | 31 | 23 | 8 |
| Marty | 33 | 19 | 14 |
| Lisa | 27 | 27 | 0 |
| Trudy | 25 | 25 | 0 |
| Jason | 23 | 23 | 0 |
| Sherry | 23 | 23 | 0 |
| Robin | 21 | 15 | 6 |
| Yvette | 21 | 20 | 1 |
| Ashley | 17 | 16 | 1 |
| Marisa | 17 | 17 | 0 |
| Kim | 15 | 13 | 2 |
| Brooke | 14 | 14 | 0 |
| Melissa | 10 | 10 | 0 |

## Data Quality Notes

### What the script DOES:

- ✅ Creates basic initiative records from CSV data
- ✅ Adds stories from descriptions and comments
- ✅ Normalizes status, EHR, and role values
- ✅ Validates data before inserting
- ✅ Handles multi-line CSV fields correctly

### What the script DOES NOT do:

- ❌ Create financial impact data (not in CSV)
- ❌ Create metrics/KPIs (not in CSV)
- ❌ Create performance data (not in CSV)
- ❌ Create projections (not in CSV)
- ❌ Modify `work_type_summary` counts (by design - these are aggregate counts)

These fields can be populated later through the UI or separate scripts.

## Important Principles

### 1. DO NOT Duplicate work_type_summary Counts

The script follows the principle that initiatives are a "drill-down" into existing assignments, not new assignments. The `work_type_summary` table contains aggregate counts that should NOT change when adding initiatives.

Example:
- Josh has 47 total assignments (in `work_type_summary`)
- Script creates 73 initiative records from those assignments
- Josh still shows 47 total assignments (count unchanged)

### 2. Use Actual Team Member Names

The script uses the actual team member name from the CSV (e.g., "Josh", "Van") as the `owner_name`, not a generic name like "Marty". This ensures proper attribution.

### 3. Quality Over Quantity

The script creates complete records from CSV data rather than half-empty records with invented data. Fields not in the CSV are left `null` or empty arrays, to be populated later when accurate data is available.

## Troubleshooting

### Error: "Team member not found in database"

The team member name in the CSV filename doesn't match a name in the `team_members` table. Check the database and CSV filename for discrepancies.

### Error: "Documents folder not found"

The script looks for CSV files in `documents/` relative to the current working directory. Make sure you're running from the project root.

### CSV Parsing Issues

The script includes a robust CSV parser that handles:
- Multi-line quoted fields
- Escaped quotes
- Various line endings (LF, CRLF)

If you encounter parsing issues, check the CSV file for:
- Unmatched quotes
- Invalid characters
- Encoding issues (should be UTF-8)

### Duplicate Initiatives

If you run the script multiple times, it will create duplicate initiatives. Before running in live mode:
1. Run `--dry-run` to preview
2. Check database for existing initiatives
3. Consider clearing test data if needed

## Advanced Usage

### Process Only Specific Team Members

Currently not supported - the script processes all CSV files. To process only specific team members, you can:
1. Temporarily move unwanted CSV files out of `documents/`
2. Run the script
3. Move files back

Or modify the script to accept team member names as arguments.

### Customize Validation Rules

Edit the `isValidInitiative()` function to change what gets filtered out. Current rules skip:
- Assignments < 5 characters
- Just years (e.g., "2025")
- Common continuation words
- Missing SCI field

### Export Results

Redirect output to a file for later review:

```bash
npx tsx populate-all-initiatives.ts --dry-run > preview.txt
```

## Script Architecture

### Main Components:

1. **CSV Parser** (`parseCSV()`): Robust parser handling multi-line fields
2. **Normalizers**: Functions to normalize status, EHR, role values
3. **Validators** (`isValidInitiative()`): Check if row is a real initiative
4. **Row Processor** (`processRow()`): Create initiative and story records
5. **File Processor** (`processCSVFile()`): Handle one team member's CSV
6. **Main Loop**: Process all CSV files and show summary

### Error Handling:

- Continues processing if one team member fails
- Continues processing if one initiative fails
- Logs all errors with details
- Tracks statistics separately for each team member

## Related Files

- **Source CSVs**: `documents/SCI Assignments Tracker - [Name].csv`
- **Reference Scripts**:
  - `populate-marty-initiatives.ts` - Manual example for Marty
  - `add-completed-initiatives.ts` - Manual example for completed items
- **Database**: Supabase tables (`initiatives`, `initiative_stories`, `team_members`)

## Support

For questions or issues:
1. Check the dry run output first
2. Use `--verbose` mode to see details
3. Review the CSV files for data quality
4. Check Supabase database for existing data
5. Refer to CLAUDE.md for project context

## Version History

- **v1.0** (2025-10-09): Initial release
  - Automated CSV processing for all 16 team members
  - Robust CSV parser with multi-line support
  - Smart filtering and validation
  - Dry run and verbose modes
  - Comprehensive statistics and error handling
