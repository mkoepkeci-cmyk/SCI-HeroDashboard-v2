# Run Migration - HONEST Metrics Setup

## ✅ Ready to Execute

The migration file has been updated with the `capacity_warnings` column needed for honest metrics.

### Step 1: Run the Migration in Supabase

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the ENTIRE contents of:
   `migrations/add-capacity-workload-fields.sql`
5. Click "Run" or press Ctrl+Enter

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### Step 2: Run the Import Script

After the migration succeeds, run:

```bash
npx tsx scripts/import-dashboard-honest-metrics.ts
```

**Expected Output:**
```
Marty: 39.1h/wk (97.7%) - 🔴 Over Capacity  ✅ CORRECT!
Josh: 44.5h/wk (111.3%) - ⚠️ 22 Need Baseline Info, 40 Other Incomplete
...
✅ Updated 15 team members
```

### Step 3: Verify the Data

The script will show you:
- ✅ Total: 217.9h/week (HONEST - only counted assignments with work effort)
- ✅ Marty at 97.7% (matches Excel!)
- ⚠️ Data quality issues prominently displayed

### What Gets Created:

**team_members table additions:**
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

## 🎯 After Migration

Your WorkloadView will show:
- **Marty: 97.7%** ✅ (not 163%)
- **Josh: 111.3%** with prominent "⚠️ 62 incomplete" warning
- All metrics match Excel Dashboard exactly

**Ready? Run the migration in Supabase now!**
