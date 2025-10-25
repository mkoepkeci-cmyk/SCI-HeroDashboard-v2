# Dashboard Metrics Setup - REQUIRED BEFORE CONTINUING

## Overview
The Workload tab now uses **ONLY** data from the Excel Dashboard tab. No more calculations or guesswork - just displaying the pre-calculated truth from your Excel file.

## ⚠️ REQUIRED STEPS - DO THESE NOW

### Step 1: Run Database Migration
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your SCI Dashboard project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**
5. Copy ALL contents of: `migrations/create-dashboard-metrics-table.sql`
6. Paste into SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)
8. Verify success message appears

**Expected Output:**
```
status: dashboard_metrics table created successfully
next_step: Use import-dashboard-data.ts to populate from Excel
```

### Step 2: Import Dashboard Data from Excel
Run this command in your terminal:

```bash
npx tsx scripts/import-dashboard-data.ts
```

**Expected Output:**
```
📊 IMPORTING DASHBOARD DATA FROM EXCEL
================================================================================

📁 Reading Excel file: documents/SCI Workload Tracker - New System.xlsx
✅ Found Dashboard sheet

📋 Parsed 18 staff members from Dashboard tab

👥 Found 18 team members in database

💾 Importing dashboard metrics...
--------------------------------------------------------------------------------
✅ Dawn: 11.86h/wk (29.6%)
✅ Marty: 39.09h/wk (97.7%)
...

================================================================================
📊 IMPORT COMPLETE
--------------------------------------------------------------------------------
✅ Imported: 18 staff members
⚠️  Skipped: 0 staff members
```

### Step 3: Verify Data
After import completes, check in Supabase:

1. Go to **Table Editor** in Supabase
2. Find **dashboard_metrics** table
3. View data - should see all 18 staff members
4. Verify Dawn shows:
   - `active_hours_per_week`: 11.85625
   - `capacity_utilization`: 0.29640625
   - `capacity_status`: "⚠️ 2 Need Baseline Info, 4 Other Incomplete - 🟢 Under"

## What This Creates

### New Database Table: `dashboard_metrics`
**25 columns** from Excel Dashboard (A-Y):

**Summary Metrics (A-G):**
- `total_assignments` - Total assignment count
- `active_assignments` - Active assignment count
- `active_hours_per_week` - Pre-calculated hours/week
- `available_hours` - Capacity (default 40)
- `capacity_utilization` - Decimal percentage (0.2964 = 29.64%)
- `capacity_status` - Full status text with warnings

**Work Type Breakdowns (H-Y):**
- `epic_gold_count` + `epic_gold_hours`
- `governance_count` + `governance_hours`
- `system_initiative_count` + `system_initiative_hours`
- `system_projects_count` + `system_projects_hours`
- `epic_upgrades_count` + `epic_upgrades_hours`
- `general_support_count` + `general_support_hours`
- `policy_count` + `policy_hours`
- `market_count` + `market_hours`
- `ticket_count` + `ticket_hours`

## Next Steps (After Migration/Import)

Once you've completed Steps 1-3 above, I will:

1. ✅ Rewrite WorkloadView to fetch from `dashboard_metrics` table
2. ✅ Remove ALL calculation logic
3. ✅ Display the Excel data exactly as-is
4. ✅ Create rich visualizations using the 9 work types
5. ✅ Update StaffDetailModal to show work type breakdowns
6. ✅ Test that everything matches Excel Dashboard perfectly

## Why This Approach?

❌ **OLD WAY:**
- Calculate capacity by parsing assignments
- Guess at hour values
- Filter by status
- Apply formulas
- Result: 203% capacity for Dawn (WRONG!)

✅ **NEW WAY:**
- Read Excel Dashboard columns A-Y
- Store in database
- Display the data
- Result: 29.6% capacity for Dawn (CORRECT!)

## Troubleshooting

**If migration fails:**
- Check you copied the ENTIRE SQL file
- Verify you're in the correct database
- Look for error messages in SQL Editor output

**If import shows "Skipped" staff:**
- That person exists in Excel but not in database
- Add them to team_members table first
- Re-run import script

**If numbers don't match Excel:**
- Check Excel file is the correct version (SCI Workload Tracker - New System.xlsx)
- Verify file is in `documents/` folder
- Make sure Excel file isn't open (close it first)
- Re-run import script

## Ready?

✅ **Run Step 1 (Migration)** - Takes 5 seconds
✅ **Run Step 2 (Import)** - Takes 10 seconds
✅ **Verify Step 3** - Takes 30 seconds

**Then tell me "migration complete" and I'll continue with the WorkloadView rewrite!**
