# ✅ Verify Data Quality Fixes

## 🎯 How to Verify the Fixes Worked

Since you've run the SQL, let's verify everything is correct.

---

## 📊 **Step 1: Refresh Your Dashboard**

1. **Open the dashboard:**
   - URL: http://localhost:5175

2. **Hard refresh the page:**
   - Windows: Press `Ctrl + Shift + R`
   - Mac: Press `Cmd + Shift + R`

3. **Check the Overview:**
   - Look at the total initiative count
   - **Before:** Should have shown ~404
   - **After:** Should now show ~297 (only active)

---

## 🧪 **Step 2: Check Specific Areas**

### **Test 1: Overview Dashboard**
**What to check:**
- Active initiative count should be lower (~297 instead of 404)
- Team member cards should show correct assignment counts
- Josh should show 47 assignments
- Marty should show 19 assignments

**Status:**
- [ ] Initiative count is ~297 (not 404)
- [ ] Josh shows 47 assignments
- [ ] Marty shows 19 assignments

---

### **Test 2: Team View**
**What to check:**
- Click "Team" in navigation
- Initiatives should be grouped by team member name
- Should NOT see a giant "Unassigned" section
- Each person should show their initiatives

**Status:**
- [ ] Initiatives grouped by person
- [ ] No large "Unassigned" section
- [ ] Each team member has their initiatives

---

### **Test 3: Initiatives List**
**What to check:**
- Click "Initiatives" in navigation
- Should see list of initiatives
- Each initiative should show team member name (not "Unassigned")
- Completed initiatives should be marked differently

**Status:**
- [ ] Initiatives show team member names
- [ ] Very few or no "Unassigned" initiatives
- [ ] Can see status (Active/Completed)

---

## 🔍 **Step 3: Verify in Supabase Dashboard**

If you want to double-check in the database directly:

### **1. Check is_active by Status:**
```sql
SELECT status, is_active, COUNT(*) as count
FROM initiatives
GROUP BY status, is_active
ORDER BY status;
```

**Expected Result:**
```
status      | is_active | count
------------|-----------|-------
Active      | true      | ~280
Completed   | false     | ~85
On Hold     | false     | ~20
Planning    | true      | ~10
Scaling     | true      | ~7
```

All "Completed" and "On Hold" should have `is_active = false`

---

### **2. Check Team Member Links:**
```sql
SELECT
  tm.name as team_member,
  COUNT(i.id) as initiative_count
FROM team_members tm
LEFT JOIN initiatives i ON i.team_member_id = tm.id
GROUP BY tm.name
ORDER BY initiative_count DESC;
```

**Expected Result:**
```
team_member | initiative_count
------------|------------------
Josh        | ~75
Van         | ~32
Marty       | ~32
Dawn        | ~30
...
(null)      | 0 or very few
```

Most or all initiatives should be assigned to a team member.

---

### **3. Check Assignment Totals:**
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

**Expected Result:**
```
name    | total_assignments | work_type_sum
--------|-------------------|---------------
Ashley  | 16                | 16
Brooke  | 14                | 14
Josh    | 47                | 47
Marty   | 19                | 19
...
```

The two numbers should match for each person.

---

## ✅ **Success Criteria**

### **The fixes worked if:**

1. ✅ **is_active is correct:**
   - Completed/On Hold initiatives have `is_active = false`
   - Active/Planning/Scaling initiatives have `is_active = true`

2. ✅ **Team members are linked:**
   - Most initiatives show a team member name (not "Unassigned")
   - Initiatives are grouped by person in Team view

3. ✅ **Totals match:**
   - `team_members.total_assignments` = sum of `work_type_summary`
   - Josh shows 47, Marty shows 19, etc.

4. ✅ **Dashboard is accurate:**
   - Overview shows ~297 active initiatives (not 404)
   - Team view shows individual portfolios
   - Assignment counts are correct

---

## 🐛 **If Something Doesn't Look Right**

### **Issue: Dashboard still shows 404 active initiatives**
**Possible causes:**
- Browser cache not cleared
- Page not refreshed
- SQL didn't run completely

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check Supabase SQL Editor for any error messages
3. Re-run the verification queries in Supabase

---

### **Issue: Initiatives still show "Unassigned"**
**Possible causes:**
- Owner names don't match team member names exactly
- team_member_id link didn't update

**Solution:**
Run this query to check owner names:
```sql
SELECT DISTINCT owner_name FROM initiatives WHERE team_member_id IS NULL LIMIT 10;
```

If you see names that don't match team_members.name, we may need to adjust the matching logic.

---

### **Issue: total_assignments still 0**
**Possible causes:**
- UPDATE query didn't run
- work_type_summary doesn't have data

**Solution:**
Re-run just the UPDATE query:
```sql
UPDATE team_members tm
SET total_assignments = (
  SELECT COALESCE(SUM(wts.count), 0)
  FROM work_type_summary wts
  WHERE wts.team_member_id = tm.id
);
```

---

## 📋 **Verification Checklist**

Check each item:

**Dashboard Visual Check:**
- [ ] Overview shows ~297 active initiatives
- [ ] Team member cards show correct assignment counts (Josh: 47, Marty: 19)
- [ ] Team view shows initiatives grouped by person
- [ ] Very few or no "Unassigned" initiatives
- [ ] Completed initiatives are visually distinct from active

**Database Query Check (Optional):**
- [ ] is_active matches status correctly
- [ ] team_member_id is set for most/all initiatives
- [ ] total_assignments matches work_type_summary

---

## 🎉 **Once Verified**

If everything looks good, you're ready for:

1. **Quick Wins #3-5:**
   - Status-based tabs (Active/Completed filtering)
   - Phase/Effort badges on cards
   - Filter overview by active only

2. **Data Population:**
   - Add Phase and Work Effort to existing initiatives
   - Start with Marty's 7 initiatives
   - Continue with other team members

3. **Weighted Workload Implementation:**
   - Calculate actual hours per week
   - Build capacity dashboard
   - Implement full roadmap

---

## 📝 **Report Back**

Let me know:

1. **What does the Overview show for active initiative count?**
   - Before: 404
   - After: ???

2. **Does the Team view show initiatives grouped by person?**
   - Yes / No

3. **Do assignment counts look correct?**
   - Josh: 47? Marty: 19?

4. **Any issues or error messages?**

This will help me confirm the fixes worked and guide next steps! 🚀
