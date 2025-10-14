# Complete Database Update Plan for Marty

## Current State (Verified)
- **4 initiatives** in database for Marty
- **Missing columns:** role, ehrs_impacted, service_line
- **Need to add:** 2 completed initiatives (HRS Cerner, Zoom FHIR)

## Existing Initiatives (4)
1. ✅ Abridge AI Pilot - Completed - System Initiative
2. 🔵 HRS Integration - Remote Patient Monitoring - Active - Project
3. 🔵 Notable Health - RPM to API Migration - Active - System Initiative
4. 🔵 Social Determinants of Health (SDOH) Standardization - Active - General Support

## Target State
- **6 initiatives** total for Marty
- All with role, ehrs_impacted, service_line populated
- 3 completed, 3 active

---

## STEP 1: Add Database Columns ⚠️ DO THIS FIRST

**Open Supabase SQL Editor:** https://fiyaolxiarzkihlbhtmz.supabase.co

**Run this SQL:**
```sql
-- Add all three new columns
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS role TEXT;

ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS ehrs_impacted TEXT;

ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS service_line TEXT;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'initiatives'
AND column_name IN ('role', 'ehrs_impacted', 'service_line')
ORDER BY column_name;
```

**Expected Result:** You should see 3 rows confirming the columns exist.

---

## STEP 2: Update Existing 4 Initiatives with New Field Data

Based on CSV data from `documents/SCI Assignments Tracker - Marty.csv`:

```sql
-- 1. Update Abridge AI Pilot (Completed)
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Abridge AI Pilot - Clinical Documentation Efficiency Analysis'
AND owner_name = 'Marty';

-- 2. Update HRS Integration - Remote Patient Monitoring (Active - Epic)
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'Epic',
    service_line = 'Ambulatory'
WHERE initiative_name = 'HRS Integration - Remote Patient Monitoring'
AND owner_name = 'Marty'
AND status = 'Active';

-- 3. Update Notable Health - RPM to API Migration
UPDATE initiatives
SET role = 'Primary',
    ehrs_impacted = 'Cerner',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Notable Health - RPM to API Migration'
AND owner_name = 'Marty';

-- 4. Update SDOH Standardization
UPDATE initiatives
SET role = 'Support',
    ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name LIKE 'Social Determinants of Health%'
AND owner_name = 'Marty';

-- Verify updates
SELECT initiative_name, status, role, ehrs_impacted, service_line
FROM initiatives
WHERE owner_name = 'Marty'
ORDER BY status DESC, initiative_name;
```

---

## STEP 3: Add 2 Completed Initiatives

After Step 1 and Step 2 are done, run this in your terminal:

```bash
npx tsx add-completed-initiatives.ts
```

This will add:

### Initiative 5: HRS Integration - RPM (Cerner - Completed)
From CSV completed section:
- **Name:** HRS Integration - Remote Patient Monitoring (Cerner Implementation)
- **Type:** Project
- **Status:** Completed
- **Role:** Primary
- **EHRs Impacted:** Cerner
- **Service Line:** Ambulatory
- **Go-Live:** 7/29/25
- **Sponsor:** Dr. Christine Braid
- **Story:**
  - Challenge: Design outbound orders for enrollment in Remote Pt Monitoring program, and supporting note return back to the EHR
  - Outcome: Successfully delivered on 7/29/25. Reference: FETR0101077, ALM 4426

### Initiative 6: Zoom Integration FHIR Migration (Completed)
From CSV completed section:
- **Name:** Zoom Integration FHIR Migration
- **Type:** Project
- **Status:** Completed
- **Role:** Primary
- **EHRs Impacted:** All
- **Service Line:** Ambulatory
- **Timeframe:** Completed before Feb 2025 deadline
- **Sponsor:** Dr. Erine Erickson
- **Story:**
  - Challenge: Zoom deprecating old integration standard in February 2025
  - Approach: Updated Zoom integration to new required FHIR standard across Epic and Cerner
  - Outcome: Successfully completed system-wide migration before deadline

---

## STEP 4: Verify Final State

Run this SQL to verify everything is correct:

```sql
-- Get all Marty's initiatives with new fields
SELECT
    initiative_name,
    type,
    status,
    role,
    ehrs_impacted,
    service_line,
    CASE WHEN end_date IS NOT NULL THEN end_date ELSE 'N/A' END as end_date
FROM initiatives
WHERE owner_name = 'Marty'
ORDER BY
    CASE status
        WHEN 'Completed' THEN 1
        WHEN 'Active' THEN 2
        ELSE 3
    END,
    type,
    initiative_name;
```

**Expected Result: 6 initiatives**

| Initiative Name | Type | Status | Role | EHRs | Service Line |
|----------------|------|--------|------|------|--------------|
| Abridge AI Pilot | System Initiative | Completed | Primary | All | Ambulatory |
| HRS Integration (Cerner) | Project | Completed | Primary | Cerner | Ambulatory |
| Zoom Integration FHIR | Project | Completed | Primary | All | Ambulatory |
| HRS Integration (Epic) | Project | Active | Primary | Epic | Ambulatory |
| Notable Health - RPM | System Initiative | Active | Primary | Cerner | Ambulatory |
| SDOH Standardization | General Support | Active | Support | All | Ambulatory |

---

## STEP 5: Verify in the App

1. **Hard refresh** browser at http://localhost:5175 (Ctrl+Shift+R)
2. Go to **Team** tab
3. Click on **Marty**
4. Scroll to initiatives section

**You should see:**
- Total: **6 initiatives**
- Grouped by category:
  - **Project (3):** HRS Cerner ✅, Zoom ✅, HRS Epic 🔵
  - **System Initiative (2):** Abridge ✅, Notable 🔵
  - **General Support (1):** SDOH 🔵

---

## Data Mapping Reference

### From CSV to Database

| CSV Field | Database Field | Marty's Data |
|-----------|---------------|--------------|
| Role | role | Primary (most), Support (SDOH) |
| EHR/s Impacted | ehrs_impacted | All, Epic, Cerner |
| Service Line | service_line | Ambulatory (all of Marty's) |
| Status | status | Completed or Active |
| Work Type | type | Project, System Initiative, General Support |

---

## Important Notes

### ✅ DO:
- Run SQL in exact order (Step 1, then 2, then 3)
- Verify each step before moving to next
- Hard refresh browser after completion

### ❌ DON'T:
- Skip Step 1 (columns must exist first)
- Modify total_assignments in team_members (should stay 19)
- Modify work_type_summary counts
- Run the script multiple times (will create duplicates)

---

## Rollback Plan (If Needed)

If something goes wrong:

```sql
-- Remove the 2 new completed initiatives
DELETE FROM initiatives
WHERE initiative_name IN (
    'HRS Integration - Remote Patient Monitoring (Cerner Implementation)',
    'Zoom Integration FHIR Migration'
)
AND owner_name = 'Marty';

-- Remove the new columns (if needed)
ALTER TABLE initiatives DROP COLUMN IF EXISTS role;
ALTER TABLE initiatives DROP COLUMN IF EXISTS ehrs_impacted;
ALTER TABLE initiatives DROP COLUMN IF EXISTS service_line;
```

---

## Success Criteria

✅ All steps complete when:
1. Database has 3 new columns (role, ehrs_impacted, service_line)
2. Marty has 6 initiatives in database
3. All initiatives have role, ehrs_impacted, service_line populated
4. App shows 6 initiatives grouped by category
5. Marty's total_assignments still shows 19 (unchanged)

---

## Quick Reference Commands

```bash
# After SQL migrations in Step 1 and 2
npx tsx add-completed-initiatives.ts

# Check if dev server needs restart
# (Usually not needed - hot reload should work)
```
