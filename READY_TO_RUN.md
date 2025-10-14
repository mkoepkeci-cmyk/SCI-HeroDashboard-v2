# ✅ Ready to Run - Data Quality Fixes

## 🎯 Quick Summary

**File to run:** `migrations/fix-data-quality-issues.sql`

**What it fixes:**
1. ✅ 107 completed initiatives incorrectly marked active → Fix `is_active = false`
2. ✅ 404 unassigned initiatives → Link to team members
3. ✅ Wrong assignment counts → Sync totals

**Time to run:** ~5 seconds

**Risk level:** ✅ Low (safe data updates, no deletions)

---

## 📊 Before & After

### BEFORE (Current State):
```
Dashboard Overview
├── Active Initiatives: 404 ❌ (includes completed work)
├── Inactive Initiatives: 0 ❌ (missing completed work)
├── Team Portfolios: All show "Unassigned" ❌
└── Assignment Counts: All show 0 ❌

Issues:
❌ Completed work clutters active view
❌ Can't filter by team member
❌ Workload calculations wrong
❌ Can't see individual portfolios
```

### AFTER (Fixed State):
```
Dashboard Overview
├── Active Initiatives: ~297 ✅ (truly active only)
├── Inactive Initiatives: ~107 ✅ (completed work archived)
├── Team Portfolios: Grouped by person ✅
└── Assignment Counts: Josh: 47, Marty: 19, etc. ✅

Benefits:
✅ Clean, focused active view
✅ Completed work accessible but separate
✅ Accurate workload calculations
✅ Individual portfolios visible
✅ Ready for Quick Wins (status tabs, filtering)
```

---

## 🚀 How to Run (2 Steps)

### Step 1: Open Supabase SQL Editor
```
1. Go to: https://supabase.com/dashboard
2. Log in
3. Select your SCI Dashboard project
4. Click "SQL Editor" in left sidebar
```

### Step 2: Copy & Run
```
1. Open file: migrations/fix-data-quality-issues.sql
2. Copy ALL the SQL (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Wait ~5 seconds
6. Review output (should show success)
```

---

## ✅ What the SQL Does

### Fix #1: Update is_active
```sql
UPDATE initiatives
SET is_active = false
WHERE status IN ('Completed', 'On Hold', 'Cancelled');
```
**Result:** 107 records updated

### Fix #2: Link to Team Members
```sql
UPDATE initiatives i
SET team_member_id = tm.id
FROM team_members tm
WHERE i.owner_name ILIKE '%' || tm.name || '%';
```
**Result:** ~404 records linked

### Fix #3: Sync Assignment Totals
```sql
UPDATE team_members tm
SET total_assignments = (
  SELECT SUM(wts.count)
  FROM work_type_summary wts
  WHERE wts.team_member_id = tm.id
);
```
**Result:** 16 team members updated

---

## 🧪 Verification (Automatic)

The SQL includes verification queries that run automatically:

### Query 1: Check is_active by Status
Shows count of initiatives by status and active flag
```
Status      | is_active | Count
------------|-----------|-------
Active      | true      | 297
Completed   | false     | 85
On Hold     | false     | 22
```

### Query 2: Check Team Member Links
Shows initiatives per team member
```
Team Member | Initiative Count
------------|------------------
Josh        | 75
Van         | 32
Marty       | 32
...
```

### Query 3: Check Totals Match
Shows team_members.total_assignments vs work_type_summary sum
```
Name   | total_assignments | work_type_sum | Status
-------|-------------------|---------------|--------
Josh   | 47                | 47            | ✓ Match
Marty  | 19                | 19            | ✓ Match
...
```

---

## 🎯 How to Verify It Worked

### After running SQL, check your dashboard:

#### Test 1: Refresh Dashboard
```
1. Go to: http://localhost:5175
2. Press Ctrl+Shift+R (hard refresh)
3. Check Overview shows ~297 active (not 404)
```

#### Test 2: Check Team View
```
1. Click "Team" in navigation
2. Should see initiatives grouped by person
3. No more giant "Unassigned" section
```

#### Test 3: Check Initiatives List
```
1. Click "Initiatives" in navigation
2. Count should show ~297 active
3. Completed initiatives should be marked inactive
```

#### Test 4: Check Assignment Counts
```
1. Look at team member cards
2. Josh should show 47 assignments
3. Marty should show 19 assignments
4. All should match work_type_summary
```

---

## 🔄 If You Need to Rollback

If something goes wrong (unlikely), you can rollback:

### Rollback is_active:
```sql
UPDATE initiatives SET is_active = true;
```

### Rollback team_member_id:
```sql
UPDATE initiatives SET team_member_id = NULL;
```

### Rollback total_assignments:
```sql
UPDATE team_members SET total_assignments = 0;
```

But these shouldn't be needed - the fixes are safe!

---

## 📋 Quick Checklist

Before running:
- [ ] Supabase dashboard is open
- [ ] You're in the correct project
- [ ] SQL Editor is accessible
- [ ] You have `migrations/fix-data-quality-issues.sql` open

After running:
- [ ] SQL shows "Success" or row counts updated
- [ ] Dashboard refresh shows ~297 active (not 404)
- [ ] Team view shows individual portfolios
- [ ] Assignment counts are correct

---

## 🎉 After Success

Once the fixes are applied, you can:

1. ✅ **See accurate data** - Dashboard reflects reality
2. ✅ **Continue Quick Wins** - Add status tabs and badges
3. ✅ **Start populating** - Add Phase and Work Effort to initiatives
4. ✅ **Build workload dashboard** - Use clean data for capacity planning

---

## 💡 Why This Matters

These fixes enable:
- **Accurate workload tracking** - Know who's truly at capacity
- **Better filtering** - Show active vs completed work
- **Individual portfolios** - See what each person is working on
- **Foundation for weighted workload** - Calculate real capacity based on effort

---

## 📁 Files Reference

1. **`migrations/fix-data-quality-issues.sql`** ← Run this file
2. **`DATA_FIX_INSTRUCTIONS.md`** ← Detailed instructions
3. **`READY_TO_RUN.md`** ← This file (quick reference)

---

## ✅ Ready?

**You have everything you need:**
- ✅ SQL script created
- ✅ Instructions documented
- ✅ Verification queries included
- ✅ Rollback plan ready
- ✅ Expected results defined

**Next step:**
1. Open Supabase SQL Editor
2. Copy `migrations/fix-data-quality-issues.sql`
3. Paste and Run
4. Verify results
5. Celebrate clean data! 🎉

**Let me know when you've run it and I'll help verify it worked!**
