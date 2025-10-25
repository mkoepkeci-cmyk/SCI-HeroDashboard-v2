# Data Quality Fix Instructions

## 🎯 Purpose
Fix 3 critical data quality issues found in the dashboard audit:
1. ✅ **is_active flag** - 107 completed initiatives incorrectly marked as active
2. ✅ **Team member links** - 404 initiatives not linked to team members
3. ✅ **Total assignments** - Counts don't match between tables

---

## 🔍 Issues Found

### Issue #1: is_active Flag Incorrect
- **Problem:** 107 initiatives marked "Completed" or "On Hold" but `is_active = true`
- **Impact:** Completed work showing in active counts, inflating workload metrics
- **Fix:** Set `is_active = false` for Completed/On Hold/Cancelled status

### Issue #2: Initiatives Not Linked to Team Members
- **Problem:** All 404 initiatives have `team_member_id = null`
- **Impact:** Can't filter by team member, can't show individual portfolios
- **Fix:** Match `owner_name` in initiatives to `name` in team_members

### Issue #3: total_assignments Mismatch
- **Problem:** `team_members.total_assignments = 0` but work_type_summary shows correct counts
- **Impact:** Dashboard shows wrong assignment counts
- **Fix:** Sync total_assignments with sum of work_type_summary

---

## 🚀 How to Run the Fix

### Option A: Run in Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Navigate to SQL Editor

2. **Copy the SQL:**
   - Open: `migrations/fix-data-quality-issues.sql`
   - Copy all the SQL code

3. **Run the Fix:**
   - Paste into SQL Editor
   - Click "Run"
   - Wait for completion (~5 seconds)

4. **Review Results:**
   - The script includes verification queries
   - Check the output to confirm all fixes applied

---

## 📊 Expected Results

### Before Fix:
```
Active initiatives: 404 (incorrect - includes completed work)
Inactive initiatives: 0
Unassigned initiatives: 404
Team member totals: All show 0
```

### After Fix:
```
Active initiatives: ~297 (only truly active work)
Inactive initiatives: ~107 (completed/on hold work)
Unassigned initiatives: ~0 (all linked to team members)
Team member totals: Match work_type_summary (Josh: 47, Marty: 19, etc.)
```

---

## 🧪 Verification Queries

After running the fix, you can verify with these queries:

### Check is_active by status:
```sql
SELECT status, is_active, COUNT(*) as count
FROM initiatives
GROUP BY status, is_active
ORDER BY status;
```

**Expected:**
- Active → is_active = true
- Completed → is_active = false
- On Hold → is_active = false

### Check team member assignments:
```sql
SELECT
  tm.name,
  COUNT(i.id) as initiative_count
FROM team_members tm
LEFT JOIN initiatives i ON i.team_member_id = tm.id
GROUP BY tm.name
ORDER BY initiative_count DESC;
```

**Expected:**
- Each team member has initiatives assigned
- Few or no "NULL" (unassigned)

### Check total_assignments sync:
```sql
SELECT
  tm.name,
  tm.total_assignments,
  COALESCE(SUM(wts.count), 0) as work_type_sum
FROM team_members tm
LEFT JOIN work_type_summary wts ON wts.team_member_id = tm.id
GROUP BY tm.name, tm.total_assignments
ORDER BY tm.name;
```

**Expected:**
- total_assignments = work_type_sum for each team member

---

## ⚠️ Important Notes

### Safe to Run:
- ✅ This is a data UPDATE, not DELETE
- ✅ No data will be lost
- ✅ Changes can be reviewed before committing
- ✅ All changes are reversible if needed

### What Gets Changed:
1. `initiatives.is_active` column (107 records updated)
2. `initiatives.team_member_id` column (404 records updated)
3. `team_members.total_assignments` column (16 records updated)

### Backup Recommended:
While safe, you may want to backup before running:
1. Go to Database → Backups in Supabase
2. Create a manual backup
3. Then run the fix

---

## 🐛 Troubleshooting

### Issue: "No rows updated" for team_member_id
**Cause:** Owner names don't match team member names exactly

**Solution:** Check owner name format:
```sql
SELECT DISTINCT owner_name FROM initiatives LIMIT 10;
SELECT name FROM team_members;
```

If they don't match, we may need to adjust the matching logic.

### Issue: Some initiatives still unassigned
**Cause:** Owner name format is different (e.g., "Marty Smith" vs "Marty")

**Solution:** Run a more specific mapping query or provide a manual mapping.

### Issue: is_active didn't update
**Cause:** Trigger might be overriding the update

**Solution:** Temporarily disable trigger:
```sql
ALTER TABLE initiatives DISABLE TRIGGER trigger_update_is_active;
-- Run update
UPDATE initiatives SET is_active = false WHERE status IN ('Completed', 'On Hold', 'Cancelled');
-- Re-enable trigger
ALTER TABLE initiatives ENABLE TRIGGER trigger_update_is_active;
```

---

## 📈 Dashboard Impact

### What You'll See After Fix:

#### **Overview Dashboard:**
- Accurate active initiative counts
- Completed work no longer inflating metrics
- Correct team capacity calculations

#### **Team View:**
- Each team member shows their initiatives
- No more "Unassigned" bulk group
- Individual portfolios are visible

#### **Initiatives List:**
- Can filter by team member
- Status reflects true active state
- Better organization and findability

#### **Workload View:**
- Total assignments match work_type_summary
- Accurate workload distribution
- Reliable capacity planning data

---

## ✅ Post-Fix Checklist

After running the fix, verify:

- [ ] Run verification queries in SQL Editor
- [ ] Refresh dashboard (http://localhost:5175)
- [ ] Check Overview shows ~297 active (not 404)
- [ ] Check Team view shows initiatives per person (not all unassigned)
- [ ] Check team member totals are correct (Josh: 47, Marty: 19, etc.)
- [ ] Create a test initiative and verify is_active works automatically
- [ ] Review a few initiatives to confirm team_member_id is set

---

## 🎉 Success Criteria

You'll know the fix worked when:

1. ✅ **is_active is correct:**
   - Completed initiatives show `is_active = false`
   - Active initiatives show `is_active = true`

2. ✅ **Team members linked:**
   - Initiatives grouped by actual team member
   - Very few or no "Unassigned" initiatives

3. ✅ **Totals match:**
   - team_members.total_assignments = sum of work_type_summary

4. ✅ **Dashboard accurate:**
   - Overview shows correct active count
   - Team view shows individual portfolios
   - Filtering by team member works

---

## 📋 Next Steps After Fix

Once data is clean:

1. **Test the dashboard** - Verify everything looks correct
2. **Continue Quick Wins** - Add status tabs and badges
3. **Populate Phase/Work Effort** - Start adding new field data
4. **Build workload dashboard** - Use accurate data for capacity planning

---

## 🚨 Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Run the verification queries to diagnose
3. Share the query output and I can help debug

---

## 📝 SQL File Location

**Full fix script:** `migrations/fix-data-quality-issues.sql`

This file contains:
- All 3 fixes
- Verification queries
- Rollback instructions (if needed)
- Summary report

---

**Ready to run? Copy the SQL from `migrations/fix-data-quality-issues.sql` and paste into Supabase SQL Editor!** 🚀
