# Workload Tab Redesign - Progress Report

## ✅ Phase 1: COMPLETED - Database & Import Infrastructure

### Created Files:

1. **[migrations/create-dashboard-metrics-table.sql](migrations/create-dashboard-metrics-table.sql)**
   - Creates `dashboard_metrics` table with 25 columns
   - Maps to Excel Dashboard columns A-Y
   - Includes triggers for auto-timestamp updates
   - Fully documented with comments

2. **[scripts/import-dashboard-data.ts](scripts/import-dashboard-data.ts)**
   - Reads Excel Dashboard tab (all 25 columns)
   - Parses numeric and text values
   - Matches staff names to database team_members
   - Upserts data into dashboard_metrics table
   - Shows progress and validation output

3. **[src/lib/supabase.ts](src/lib/supabase.ts)** - Updated
   - Added `DashboardMetrics` interface
   - Added `TeamMemberWithDashboard` interface
   - Added `Database` type definition for TypeScript
   - Fully typed for all 25 Dashboard columns

4. **[DASHBOARD_METRICS_SETUP.md](DASHBOARD_METRICS_SETUP.md)**
   - Step-by-step instructions for user
   - Migration and import commands
   - Verification steps
   - Troubleshooting guide

### Database Schema:

```sql
dashboard_metrics (
  team_member_id UUID PRIMARY KEY,

  -- Summary (A-G)
  total_assignments INTEGER,
  active_assignments INTEGER,
  active_hours_per_week DECIMAL(10,2),
  available_hours DECIMAL(10,2),
  capacity_utilization DECIMAL(5,4),
  capacity_status TEXT,

  -- Work Types (H-Y) - 9 types × 2 columns each
  epic_gold_count INTEGER,
  epic_gold_hours DECIMAL(10,2),
  governance_count INTEGER,
  governance_hours DECIMAL(10,2),
  system_initiative_count INTEGER,
  system_initiative_hours DECIMAL(10,2),
  system_projects_count INTEGER,
  system_projects_hours DECIMAL(10,2),
  epic_upgrades_count INTEGER,
  epic_upgrades_hours DECIMAL(10,2),
  general_support_count INTEGER,
  general_support_hours DECIMAL(10,2),
  policy_count INTEGER,
  policy_hours DECIMAL(10,2),
  market_count INTEGER,
  market_hours DECIMAL(10,2),
  ticket_count INTEGER,
  ticket_hours DECIMAL(10,2),

  last_updated TIMESTAMP
)
```

---

## ⏸️ WAITING: User Action Required

### User Must Complete:

1. ✅ Run migration in Supabase SQL Editor
2. ✅ Run import script: `npx tsx scripts/import-dashboard-data.ts`
3. ✅ Verify data in Supabase dashboard_metrics table

**See [DASHBOARD_METRICS_SETUP.md](DASHBOARD_METRICS_SETUP.md) for detailed instructions.**

---

## 🔜 Phase 2: PENDING - WorkloadView Rewrite

### Will Remove:
- ❌ All calculation logic from App.tsx WorkloadView
- ❌ `calculateWorkload()` function calls
- ❌ `parseWorkEffort()` usage for capacity
- ❌ Manual hour calculations
- ❌ Status filtering logic
- ❌ Flawed `.includes()` string matching

### Will Add:
- ✅ Fetch from `dashboard_metrics` table
- ✅ Display capacity from `capacity_utilization` column
- ✅ Display status from `capacity_status` column
- ✅ Show work type breakdowns (9 types)
- ✅ Team overview metrics
- ✅ Staff cards with accurate data
- ✅ Sort/filter by capacity
- ✅ Data quality warnings display

---

## 🔜 Phase 3: PENDING - StaffDetailModal Update

### Will Remove:
- ❌ All calculation logic
- ❌ `parseWorkEffort()` for hours
- ❌ `getWorkEffortHours()` calculations
- ❌ Manual work type breakdown calculations

### Will Add:
- ✅ Display work type counts from dashboard_metrics
- ✅ Display work type hours from dashboard_metrics
- ✅ Pie chart of 9 work types
- ✅ Bar chart of hours distribution
- ✅ Capacity summary from pre-calculated data
- ✅ Data quality alerts from capacity_status

---

## 🔜 Phase 4: PENDING - Testing & Validation

### Will Verify:
- ✅ Dawn shows 29.6% capacity (not 203%)
- ✅ Marty shows 97.7% capacity
- ✅ All staff match Excel Dashboard exactly
- ✅ Work type breakdowns correct
- ✅ Capacity warnings display correctly
- ✅ No calculation errors
- ✅ Fast performance (no runtime calculations)

---

## Benefits of New Approach

### Accuracy
- ✅ **Single source of truth**: Excel Dashboard
- ✅ **No calculation errors**: Pre-calculated data
- ✅ **Respects Excel formulas**: All considerations preserved

### Performance
- ✅ **Fast**: No runtime calculations
- ✅ **Scalable**: Just database reads
- ✅ **Cacheable**: Data doesn't change often

### Maintainability
- ✅ **Simple code**: Just display data
- ✅ **No parsing logic**: Excel does the work
- ✅ **Easy to update**: Re-run import script

### Features
- ✅ **Rich data**: 9 work types with counts + hours
- ✅ **Data quality**: Shows missing info
- ✅ **Historical tracking**: Can store snapshots over time

---

## Example Data (Dawn)

### Excel Dashboard (Source of Truth):
```
Name: Dawn
Total: 22
Active Assignments: 20
Active Hrs/Wk: 11.86
Available Hours: 40
Capacity: 29.6%
Status: ⚠️ 2 Need Baseline Info, 4 Other Incomplete - 🟢 Under

Work Types:
- System Initiative: 15 items, 6.2h/wk
- Governance: 3 items, 4.5h/wk
- System Projects: 2 items, 1.2h/wk
...
```

### After Import (dashboard_metrics table):
```sql
team_member_id: <uuid>
total_assignments: 22
active_assignments: 20
active_hours_per_week: 11.85625
available_hours: 40
capacity_utilization: 0.29640625
capacity_status: "⚠️ 2 Need Baseline Info, 4 Other Incomplete - 🟢 Under"
system_initiative_count: 15
system_initiative_hours: 6.2
governance_count: 3
governance_hours: 4.5
...
```

### After WorkloadView Rewrite (UI Display):
```
┌─────────────────────────┐
│ Dawn                    │
│ 11.9h/wk • 29.6% 🟢    │
│ ⚠️ 2 Need Baseline     │
└─────────────────────────┘
```

---

## Timeline

✅ **Phase 1**: COMPLETE (Database & Import)
⏸️ **Waiting**: User runs migration + import (5 minutes)
🔜 **Phase 2**: WorkloadView rewrite (30 minutes)
🔜 **Phase 3**: StaffDetailModal update (20 minutes)
🔜 **Phase 4**: Testing & validation (10 minutes)

**Total Time Remaining**: ~1 hour after user completes migration/import

---

## Current Status

**Blocked on:** User must run migration and import script

**See:** [DASHBOARD_METRICS_SETUP.md](DASHBOARD_METRICS_SETUP.MD) for instructions

**Next:** Once user confirms "migration complete", continue with Phase 2

---

## Files Modified So Far

1. ✅ `migrations/create-dashboard-metrics-table.sql` (new)
2. ✅ `scripts/import-dashboard-data.ts` (new)
3. ✅ `src/lib/supabase.ts` (updated - added types)
4. ✅ `DASHBOARD_METRICS_SETUP.md` (new)
5. ✅ `WORKLOAD_REDESIGN_PROGRESS.md` (new - this file)

**Files to Modify Next:**
- `src/App.tsx` - WorkloadView function (complete rewrite)
- `src/components/StaffDetailModal.tsx` - Remove calculations, use dashboard data

---

## Key Principle

**NEVER CALCULATE CAPACITY IN THE APP**

The Excel Dashboard has formulas, considerations, and business logic that we cannot (and should not) replicate. Our job is to:
1. Import the truth
2. Store the truth
3. Display the truth

That's it!
