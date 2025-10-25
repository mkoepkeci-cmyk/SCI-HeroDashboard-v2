# FIX WORKLOAD TAB NOW - 2 MINUTES

## The Problem
Your Workload tab shows **inflated numbers** because it's calculating instead of using Excel data:
- Dawn shows 203% (should be 29.6%)
- Marty shows 163% (should be 97.7%)
- Average 180% (should be ~68%)

## The Solution
Import the pre-calculated data from your Excel Dashboard tab.

---

## STEP 1: Run Migration (30 seconds)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Open this file in your editor: `migrations/create-dashboard-metrics-table.sql`
5. **Copy ALL** the SQL (Ctrl+A, Ctrl+C)
6. **Paste** into Supabase SQL Editor
7. Click **"Run"** button (or Ctrl+Enter)

**You should see:**
```
status: dashboard_metrics table created successfully
```

---

## STEP 2: Import Excel Data (30 seconds)

Open your terminal and run:

```bash
npx tsx scripts/import-dashboard-data.ts
```

**You should see:**
```
✅ Dawn: 11.86h/wk (29.6%)
✅ Marty: 39.09h/wk (97.7%)
...
✅ Imported: 18 staff members
```

---

## STEP 3: Tell Me "done"

Once you see the success messages, just reply with **"done"** or **"migration complete"** and I will:

1. Rewrite WorkloadView to use the imported data
2. Remove all broken calculation logic
3. Make the dashboard match Excel exactly

---

## Why This Matters

**Current (BROKEN):**
- App tries to calculate capacity
- Has bugs in string matching
- Shows 203% for Dawn ❌

**After Fix (CORRECT):**
- App reads Excel Dashboard data
- No calculations, just display
- Shows 29.6% for Dawn ✅

---

## Quick Start

```bash
# 1. Open Supabase, run migration SQL
# 2. Then run this:
npx tsx scripts/import-dashboard-data.ts
# 3. Reply "done"
```

That's it! 2 minutes total.
