# 🚀 DO THESE STEPS NOW - Marty Database Update

## Current State
- ✅ You have **4 initiatives** for Marty
- ❌ Missing 3 database columns
- ❌ Missing 2 completed initiatives (HRS Cerner, Zoom)

## Target State
- ✅ **6 initiatives** for Marty (3 completed, 3 active)
- ✅ All with role, ehrs_impacted, service_line data

---

## ⚠️ STEP 1: Add Database Columns (5 minutes)

1. **Open:** https://fiyaolxiarzkihlbhtmz.supabase.co
2. **Click:** SQL Editor → New query
3. **Open file:** `STEP_1_ADD_COLUMNS.sql`
4. **Copy all SQL** from that file
5. **Paste** into Supabase SQL Editor
6. **Click:** RUN
7. **Verify:** You should see 3 rows returned (role, ehrs_impacted, service_line)

---

## ⚠️ STEP 2: Update Existing 4 Initiatives (2 minutes)

1. **In Supabase SQL Editor** (same tab)
2. **Open file:** `STEP_2_UPDATE_EXISTING.sql`
3. **Copy all SQL** from that file
4. **Paste** into Supabase SQL Editor
5. **Click:** RUN
6. **Verify:** Query at bottom should show 4 initiatives with role, EHR, and service line populated

---

## ⚠️ STEP 3: Add 2 Completed Initiatives (1 minute)

1. **In your terminal**, run:
   ```bash
   npx tsx add-completed-initiatives.ts
   ```
2. **Verify:** You should see:
   ```
   ✓ Created initiative 1: [uuid]
   ✓ Created initiative 2: [uuid]
   ✅ Completed initiatives added successfully!
   ```

---

## ⚠️ STEP 4: Verify in App (1 minute)

1. **Open:** http://localhost:5175
2. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Click:** Team tab
4. **Click:** Marty's card
5. **Scroll down** to initiatives section

**You should see:**
```
Major Initiatives & Impact (6 initiatives)

● Project (3)
  [✓] HRS Integration - Remote Patient Monitoring (Cerner Implementation) - Completed
  [✓] Zoom Integration FHIR Migration - Completed
  [○] HRS Integration - Remote Patient Monitoring - Active

● System Initiative (2)
  [✓] Abridge AI Pilot - Clinical Documentation Efficiency Analysis - Completed
  [○] Notable Health - RPM to API Migration - Active

● General Support (1)
  [○] Social Determinants of Health (SDOH) Standardization - Active
```

---

## ✅ Success Checklist

After all steps:
- [ ] 3 database columns added (role, ehrs_impacted, service_line)
- [ ] 4 existing initiatives updated with new field data
- [ ] 2 completed initiatives added (HRS Cerner, Zoom)
- [ ] App shows 6 total initiatives for Marty
- [ ] Initiatives grouped by category (Project, System Initiative, General Support)
- [ ] 3 completed (✓) and 3 active (○)

---

## 📁 Files Reference

- **COMPLETE_DATABASE_UPDATE_PLAN.md** - Full detailed plan
- **STEP_1_ADD_COLUMNS.sql** - SQL for adding columns
- **STEP_2_UPDATE_EXISTING.sql** - SQL for updating 4 initiatives
- **add-completed-initiatives.ts** - Script for adding 2 completed

---

## ❓ Troubleshooting

**If script fails with "column doesn't exist":**
- Make sure you completed Step 1 first
- Verify columns exist in Supabase

**If you don't see 6 initiatives:**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors (F12)
- Verify script ran without errors

**If you see duplicates:**
- Don't run the script multiple times
- Check database to see if initiatives already exist

---

## 🎯 Time Estimate
Total time: **~10 minutes**
- Step 1: 5 min (SQL in Supabase)
- Step 2: 2 min (SQL in Supabase)
- Step 3: 1 min (Terminal command)
- Step 4: 1 min (Verify in app)
