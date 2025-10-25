# Execute Migration NOW - Step-by-Step

## Step 1: Open Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your SCI Dashboard project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

## Step 2: Copy the Migration SQL

Copy the ENTIRE contents of: `migrations/add-capacity-workload-fields.sql`

**Important:** Copy ALL 208 lines, from the first comment to the last line.

## Step 3: Paste and Execute

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** (or press `Ctrl+Enter`)
3. Wait for confirmation message

## Step 4: Verify Success

You should see output showing:
- ✅ Columns added to team_members table
- ✅ New tables created (work_type_hours, capacity_history)
- ✅ Sample data structure displayed

Expected verification output:
```
column_name              | data_type | column_default | is_nullable
-------------------------|-----------|----------------|------------
active_hours_per_week    | numeric   | 0              | YES
available_hours          | numeric   | 40.0           | YES
capacity_utilization     | numeric   | 0              | YES
capacity_status          | text      | 'available'    | YES
capacity_warnings        | text      | NULL           | YES
```

## Step 5: Run the Import Script

After successful migration, open your terminal in this project directory and run:

```bash
npx tsx scripts/import-dashboard-honest-metrics.ts
```

**Expected Output:**
```
Reading Excel file: documents/SCI Workload Tracker - New System.xlsx
Found Dashboard sheet with 18 rows

📊 HONEST METRICS (only assignments WITH work effort):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Marty: 39.1h/wk (97.7%) - 🔴 Over Capacity  ✅ CORRECT!
Josh: 44.5h/wk (111.3%) - ⚠️ 22 Need Baseline Info, 40 Other Incomplete
...

✅ Updated 15 team members with HONEST capacity metrics
✅ Total: 217.9h/week (only counted assignments with work effort)
```

## Step 6: Refresh Your Dashboard

1. Go to http://localhost:5175
2. Navigate to **Workload** tab
3. You should now see HONEST metrics with capacity warnings

## Troubleshooting

**If migration fails:**
- Check that you copied the ENTIRE SQL file
- Verify you're connected to the correct database
- Check for any syntax errors in the output

**If import fails:**
- Ensure migration completed successfully first
- Verify Excel file exists at: `documents/SCI Workload Tracker - New System.xlsx`
- Check that file is not open in Excel (close it first)

## What This Creates

**New columns in team_members:**
- `active_hours_per_week` - HONEST hours (only from assignments WITH work_effort)
- `available_hours` - Capacity (default 40)
- `capacity_utilization` - Percentage (0.977 for Marty = 97.7%)
- `capacity_status` - 'over_capacity', 'near_capacity', or 'available'
- `capacity_warnings` - "⚠️ 22 Need Baseline Info, 40 Other Incomplete"

**New tables:**
- `work_type_hours` - Hours per work type per person
- `capacity_history` - Historical snapshots for trending

**Triggers:**
- Auto-calculate capacity_utilization when hours change
- Auto-update timestamps

---

## 🎯 Ready to Execute!

**Your Action:** Copy `migrations/add-capacity-workload-fields.sql` contents into Supabase SQL Editor and click RUN.
