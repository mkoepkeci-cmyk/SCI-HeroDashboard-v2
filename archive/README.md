# Archive

This folder contains historical development artifacts that are no longer needed for production operation but are preserved for reference and audit purposes.

## Contents

### `/scripts/` - Development Scripts

One-time scripts used during initial data setup, migration, and debugging. These were essential during development but are not used by the running application.

#### `/scripts/data-population/` (6 files)
Scripts that initially populated the database with team member and initiative data:
- `populate-all-initiatives.ts`
- `populate-all-scis.ts`
- `populate-josh-initiatives.ts`
- `populate-marty-initiatives.ts`
- `populate-van-initiatives.ts`
- `add-completed-initiatives.ts`

#### `/scripts/data-updates/` (3 files)
Scripts that added or updated specific data fields:
- `add-role-column.ts`
- `add-validated-cerner-initiatives.ts`
- `update-abridge-validated-data.ts`

#### `/scripts/validation/` (10 files)
Scripts used to validate data integrity and check specific records:
- `check-abridge.ts`, `check-abridge-detailed.ts`
- `check-browse-visibility.ts`
- `check-all-duplicates.ts`
- `check-data.ts`
- `check-governance-columns.ts`
- `check-initiative.ts`, `check-initiative-counts.ts`
- `check-marty-initiatives.ts`
- `check-van-assignments.ts`

#### `/scripts/analysis/` (3 files)
Scripts that analyzed Excel data before importing:
- `analyze-excel.ts`
- `analyze-initiative-types.ts`
- `analyze-workload-tab.ts`

#### `/scripts/audit/` (5 files)
Scripts that audited database state and verified data quality:
- `audit-current-database.ts`
- `audit-dashboard-data.ts`
- `verify-data-integrity.ts`
- `verify-migration.ts`
- `verify-remote-data.ts`

#### `/scripts/migrations/` (2 TypeScript files)
TypeScript scripts related to running migrations:
- `run-migration.ts` - Helper script to run SQL migrations
- `deduplicate-assignments.ts` - Cleanup script for duplicate records

#### `/scripts/migrations-adhoc/` (12 SQL files)
Ad-hoc SQL migrations from October 2025 that were run manually (not via Supabase CLI):

**Schema Changes:**
- `add-capacity-workload-fields.sql` - Added capacity tracking fields
- `add-missing-assignment-columns.sql` - Fixed missing columns
- `add-weighted-workload-fields.sql` - Added workload calculation fields
- `create-dashboard-metrics-table.sql` - Created metrics aggregation table
- `STEP_1_ADD_COLUMNS.sql` - Added role, ehrs_impacted, service_line columns
- `STEP_2_UPDATE_EXISTING.sql` - Updated existing data with new field values
- `RUN_THIS_SQL_FIRST.sql` - Added initiative fields (role, EHRs, service line)
- `RUN_THIS_EXACT_SQL_IN_SUPABASE.sql` - Manual schema updates
- `VERIFY_COLUMNS_EXIST.sql` - Verification queries

**Data Cleanup:**
- `fix-data-quality-issues.sql` - Data cleanup and quality fixes
- `DEDUPLICATE_ASSIGNMENTS.sql` - Removed duplicate assignment records
- `test-governance-data.sql` - Test data for governance portal

**Note**: The official database migrations are in `/supabase/migrations/` (not archived).
These ad-hoc migrations were applied directly to the database during development.

### `/documentation/` - Historical Documentation (30 files)

Implementation notes, migration guides, testing documentation, and progress tracking from the development phase. These documents chronicle the evolution of the project but are not needed for ongoing operation.

Examples include:
- Migration and execution guides
- Data population strategies and checklists
- Feature implementation notes
- Testing and verification documentation
- Progress tracking and summaries

## Why Are These Archived?

All scripts in this folder were **one-time tools** used during development:
- They are **not imported** by the application code in `/src/`
- They are **not listed** in `package.json` scripts
- They **directly connect** to Supabase and run standalone
- Their purpose has been **fulfilled** (data populated, validations complete)

The application runs entirely from `/src/` and does not depend on any of these archived files.

## Git History

All files are preserved in git history. You can:
- View the full history with `git log -- archive/`
- See when files were moved with `git log --follow`
- Restore any file if needed with `git checkout <commit> -- <file>`

## When to Reference These Files

- **Auditing**: Understanding how data was initially populated
- **Debugging**: Checking validation logic used during development
- **Learning**: Understanding the evolution of the project
- **Data Migration**: Creating similar scripts for new environments

## Do Not Delete

Keep this archive intact for:
- Compliance and audit requirements
- Historical project documentation
- Knowledge transfer to new team members
- Future reference if similar work is needed
