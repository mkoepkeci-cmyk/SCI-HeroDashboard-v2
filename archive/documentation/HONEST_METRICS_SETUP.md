# Setting Up HONEST Capacity Metrics

## ✅ What I've Created

1. **Import Script**: `scripts/import-dashboard-honest-metrics.ts`
   - Reads Excel Dashboard columns A-G (the TRUTH)
   - Imports HONEST metrics (only assignments with work effort)
   - Shows Marty at 97.7% (correct!) not 163%

2. **Data Validated**: Script successfully reads:
   - Marty: 39.1h/wk (97.7%) - 🔴 Over Capacity ✅ CORRECT
   - Josh: 44.5h/wk (111.3%) - ⚠️ 22 Need Baseline Info, 40 Other Incomplete
   - Total: 217.9h/wk team-wide (honest metrics)

## 🔧 Next Steps to Complete

### Step 1: Run Database Migration
The columns needed don't exist yet. Run this in your Supabase SQL Editor:

```sql
-- Add capacity fields to team_members (if not already done)
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS active_hours_per_week DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_hours DECIMAL(5,2) DEFAULT 40.0,
ADD COLUMN IF NOT EXISTS capacity_utilization DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capacity_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS capacity_warnings TEXT;

COMMENT ON COLUMN team_members.active_hours_per_week IS 'HONEST hours - only from assignments WITH work effort';
COMMENT ON COLUMN team_members.capacity_warnings IS 'Warning text from Excel Dashboard (e.g., "⚠️ 22 Need Baseline Info")';
```

### Step 2: Run Import Script
```bash
npx tsx scripts/import-dashboard-honest-metrics.ts
```

This will populate:
- Marty: 39.1h, 97.7% ✅
- Josh: 44.5h, 111.3% with warnings about 62 incomplete
- All others with HONEST metrics

### Step 3: Update WorkloadView
I'll update the WorkloadView to:
- Show HONEST capacity % from database
- Display warnings prominently ("⚠️ 22 Need Baseline Info")
- Color-code data quality issues
- Make incomplete data VERY visible

## 📊 What You'll See After Setup

**Compact Card Example:**
```
Marty
Capacity: 97.7% 🔴
Hours: 39.1h/wk
Quality: 100% ✅ All baseline data complete
```

**Josh's Card:**
```
Josh
Capacity: 111.3% 🔴
Hours: 44.5h/wk
⚠️ WARNING: 62 incomplete
  • 22 Need Baseline Info
  • 40 Other Incomplete
  TRUE LOAD UNKNOWN
```

## 🎯 Honest Metrics Guarantee

After this setup:
- ✅ Only assignments WITH work effort count toward capacity
- ✅ Numbers match Excel Dashboard exactly
- ✅ Data quality issues are PROMINENT
- ✅ Managers can trust the numbers for planning
- ✅ No duplication or inflated metrics

**Ready to proceed with Step 1?**
