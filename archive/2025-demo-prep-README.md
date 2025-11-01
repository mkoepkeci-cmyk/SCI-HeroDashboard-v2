# Archive: 2025 Demo Preparation

**Date Archived:** October 31, 2025
**Archived By:** Claude Code
**Reason:** Cleaned up repository for demo preparation

---

## Overview

This archive contains **57 files** that were moved from the root and `/documents/` directories to clean up the repository for demo purposes. All files are preserved for historical reference but are not needed for running the application.

---

## Archive Structure

### `/archive/2025-10-30-work-session/` (4 files)

Work session notes and audit scripts from October 30, 2025:
- `2025-10-30-WORK-SUMMARY.md` - Work session notes
- `audit-gov-2025-004-data-flow.sql` - Audit script for governance request GOV-2025-004
- `audit-gov-2025-005-data-flow.sql` - Audit script for governance request GOV-2025-005
- `check-gov-003.ts` - Debug script for governance request

**Context:** These files were created during the end-to-end validation of the governance portal Phase 1/2 workflow.

---

### `/archive/adhoc-migrations/rls-fixes/` (8 files)

Row Level Security (RLS) debugging and fix scripts:
- `ADD_MISSING_COLUMN.sql`
- `CHECK_ALL_RLS.sql`
- `CHECK_CURRENT_POLICIES.sql`
- `CHECK_RLS_STATUS.sql`
- `DISABLE_RLS.sql`
- `ENABLE_RLS_WITH_POLICIES.sql`
- `FIX_PERMISSIONS.sql`
- `FIX_RLS_POLICIES.sql`

**Context:** Ad-hoc scripts created to diagnose and fix RLS policy issues during development. These were necessary before formal migrations were created.

---

### `/archive/adhoc-migrations/data-cleanup/` (4 files)

Data quality and duplication cleanup scripts:
- `RUN_THIS_IN_SUPABASE.sql` - Ad-hoc migration script
- `check-current-hrs-status.ts` - Debug script for effort_logs duplicates
- `delete-hrs-duplicates.ts` - Script to remove duplicate effort_logs
- `query-hrs-duplicates.ts` - Query to find duplicate effort_logs

**Context:** Created during investigation of duplicate effort_logs entries caused by race conditions.

---

### `/archive/test-artifacts/` (3 files)

HTML test pages and diagnostic tools:
- `DIAGNOSTIC.html` - Diagnostic page for troubleshooting
- `test-initiatives.html` - Test page for initiative features
- `.keep` - Empty placeholder file

**Context:** Static HTML pages used for isolated feature testing outside the main app.

---

### `/archive/source-data/excel-files/` (2 files, ~2.7 MB)

Legacy Excel data source files:
- `SCI Workload Tracker - New System (3).xlsx` (1.3 MB)
- `SCI Workload Tracker - New System.xlsx` (1.4 MB)

**Context:** Original Excel spreadsheets used before migration to Supabase. These were the source of truth during the Google Sheets → Supabase sync phase. Now replaced by demo data.

---

### `/archive/source-data/csv-exports/` (16 files, ~163 KB)

CSV exports from Excel workbook, one per team member:
- `SCI Workload Tracker - New System - Ashley.csv`
- `SCI Workload Tracker - New System - Brooke.csv`
- `SCI Workload Tracker - New System - Dawn.csv`
- `SCI Workload Tracker - New System - How Workload is Calculated.csv`
- `SCI Workload Tracker - New System - Jason.csv`
- `SCI Workload Tracker - New System - Josh.csv`
- `SCI Workload Tracker - New System - Kim.csv`
- `SCI Workload Tracker - New System - Lisa.csv`
- `SCI Workload Tracker - New System - Marisa.csv`
- `SCI Workload Tracker - New System - Marty.csv`
- `SCI Workload Tracker - New System - Melissa.csv`
- `SCI Workload Tracker - New System - Robin.csv`
- `SCI Workload Tracker - New System - Sherry.csv`
- `SCI Workload Tracker - New System - Trudy.csv`
- `SCI Workload Tracker - New System - Van.csv`
- `SCI Workload Tracker - New System - Yvette.csv`

**Context:** Individual team member worksheets exported from Excel. Used during data migration and validation. Now replaced by demo data.

---

### `/archive/development-docs/migration-planning/` (4 files)

Planning documents for data migration:
- `ACTION_CHECKLIST.md` - Migration task checklist
- `ADD_NEW_FIELDS_MIGRATION.md` - Instructions for adding new database fields
- `ADD_ROLE_FIELD_INSTRUCTIONS.md` - Instructions for adding role field to assignments
- `MARTY_INITIATIVES_PLAN.md` - Plan for migrating Marty's initiatives

**Context:** Implementation notes created during the assignments → initiatives migration (October 30, 2025).

---

### `/archive/development-docs/data-analysis/` (4 files)

Data quality and analysis documentation:
- `DATA_OPTIMIZATION_STRATEGY.md` - Strategy for optimizing data structure
- `DATA_POPULATION_ANALYSIS.md` - Analysis of data completeness
- `DATA_QUALITY_FINDINGS.md` - Data quality issues discovered
- `EXCEL_DASHBOARD_ANALYSIS.md` - Analysis of Excel workbook structure

**Context:** Analysis documents created during data migration planning to understand existing data patterns and quality issues.

---

### `/archive/development-docs/feature-implementations/` (6 files)

Feature implementation notes and summaries:
- `COMPLETED_CHANGES_SUMMARY.md` - Summary of completed changes
- `WORKLOAD_DASHBOARD_REDESIGN.md` - Design doc for workload dashboard redesign
- `WORKLOAD_REDESIGN_SUMMARY.md` - Summary of workload redesign
- `WORKLOAD_VIEW_COMPLETED.md` - Completion notes for workload view
- `Sample capacity calculations.md` - Examples of capacity calculations
- `Carry Through_Capacity Symbol - Copy.md` - Notes on capacity symbols

**Context:** Implementation notes created during the October 27, 2025 workload dashboard redesign.

---

### `/archive/development-docs/screenshots/` (5 files, ~238 KB)

Development screenshots for documentation:
- `Screenshot 2025-10-26 175409.png` (107 KB)
- `Screenshot 2025-10-26 175441.png` (13 KB)
- `Screenshot 2025-10-29 185409.png` (74 KB)
- `Screenshot 2025-10-29 190800.png` (20 KB)
- `Screenshot 2025-10-29 190822.png` (24 KB)

**Context:** Screenshots captured during development for documentation or issue reporting.

---

## Files Preserved in Original Locations

The following files were **NOT archived** because they are essential for the application:

### Root Directory
- `README.md` - Project overview (referenced in documentation)
- `CLAUDE.md` - Developer guide (essential technical documentation)
- All config files: `package.json`, `tsconfig*.json`, `vite.config.ts`, `vercel.json`, etc.
- `index.html` - Application entry point

### `/documents/` Directory
- `SCI_HERO_DASHBOARD_BUSINESS_CASE.md` - Business requirements reference
- `SCI Value metrics.pdf` - Business metrics reference (58 KB)

### `/docs/` Directory (All 4 files preserved)
- `/docs/architecture/DATA_FLOW.md` - Architecture documentation
- `/docs/database/SCHEMA_OVERVIEW.md` - Database schema reference
- `/docs/database/MIGRATION_HISTORY.md` - Migration history
- `/docs/deployment/SETUP.md` - Setup guide

### `/src/` and `/supabase/` (Untouched)
- All application source code
- All database migrations

---

## Related Archive Folders (Pre-existing)

### `/archive/migrations/2025-10-30-assignment-migration/`
Contains 31 SQL scripts documenting the assignments → initiatives migration (October 30, 2025). See that folder's README for details.

### `/archive/documentation/`
Contains 30 markdown files with historical implementation notes and progress tracking from earlier development phases.

### `/archive/scripts/`
Contains 30 TypeScript scripts for data population, validation, and audit from earlier development phases.

---

## Total Archive Statistics

**Files Moved (This Cleanup):** 57 files
**Total Size:** ~3.4 MB
**Breakdown:**
- SQL scripts: 12 files
- TypeScript scripts: 4 files
- Markdown docs: 14 files
- Excel files: 2 files (2.7 MB)
- CSV files: 16 files (163 KB)
- Screenshots: 5 files (238 KB)
- HTML files: 2 files
- JSON files: 1 file
- Other: 1 file (.keep)

---

## Context: Demo Preparation

These files were archived as part of demo preparation on October 31, 2025. The goals were:

1. **Clean up repository** - Remove development artifacts from root and documents folders
2. **Replace real data with demo data** - See `/scripts/generate-demo-data.ts`
3. **Maintain historical context** - All files preserved, just organized

**Demo data generated:**
- 2 fake managers (Sarah Mitchell, David Thompson)
- 16 fake team members (System CIs)
- 415 initiatives with realistic healthcare names
- Complete related data (metrics, financials, stories, etc.)
- 12 weeks of effort logs

**Production data backup:** Ensure Supabase backup was created before clearing production data.

---

## Accessing Archived Files

All archived files remain in the git repository. To access:

```bash
# View files in archive
ls -R archive/

# Read a specific file
cat archive/2025-10-30-work-session/2025-10-30-WORK-SUMMARY.md

# Restore a file if needed
cp archive/source-data/excel-files/SCI\ Workload\ Tracker\ -\ New\ System.xlsx documents/
```

---

## Notes

- **No data loss** - All files preserved in git history even if deleted later
- **No application impact** - Moving these files does not affect the running application
- **Organized for clarity** - Files grouped by purpose (migrations, data, docs, tests)
- **Demo-ready** - Repository root is now clean and professional for demo purposes

---

## References

- Main documentation: `/README.md`
- Developer guide: `/CLAUDE.md`
- Demo data instructions: `/scripts/DEMO_DATA_INSTRUCTIONS.md`
- Data generation script: `/scripts/generate-demo-data.ts`
- Assignment migration archive: `/archive/migrations/2025-10-30-assignment-migration/README.md`
