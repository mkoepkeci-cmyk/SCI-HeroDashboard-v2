# Demo Data Setup Instructions

This guide walks you through replacing production data with realistic fake data for demos.

---

## Overview

**Generated Demo Data:**
- 2 fake managers
- 16 fake team members (System CIs)
- 415 initiatives (distributed across team members)
- 352 initiative stories
- 49 initiative metrics
- 103 financial impact records
- 83 performance data records
- 29 projections
- 8 governance requests
- ~200-300 effort logs (last 12 weeks, sparse)
- ~100 multi-role assignments (junction table)

**Data Preserved:**
- `workload_calculator_config` table (33 rows - capacity calculation weights)

---

## Prerequisites

1. **Access to Supabase SQL Editor**
   - Log in to your Supabase project
   - Navigate to SQL Editor

2. **Node.js and npm installed**
   - Required to regenerate SQL if needed

---

## Step-by-Step Instructions

### Step 1: Backup Your Database ⚠️

**CRITICAL: Do this first!**

In Supabase Dashboard:
1. Go to **Database** → **Backups**
2. Click **"Create Backup"**
3. Wait for backup to complete
4. Verify backup appears in list

Alternative: Export tables manually
```sql
-- Run in Supabase SQL Editor to export as CSV
COPY (SELECT * FROM initiatives) TO '/tmp/initiatives_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM team_members) TO '/tmp/team_members_backup.csv' WITH CSV HEADER;
-- etc. for all tables
```

---

### Step 2: Review Generated SQL (Optional)

**Files to review:**
- `scripts/demo-data.sql` (10,674 lines - already generated)
- `scripts/clear-real-data.sql` (verification queries included)

**To regenerate SQL with different data:**
```bash
# From project root
npx tsx scripts/generate-demo-data.ts > scripts/demo-data.sql
```

**Configuration options** (edit `scripts/generate-demo-data.ts`):
```typescript
const CONFIG = {
  NUM_TEAM_MEMBERS: 16,       // Change if needed
  NUM_INITIATIVES: 420,        // Target number
  EFFORT_LOG_WEEKS: 12,        // Historical weeks
  NUM_GOVERNANCE_REQUESTS: 8,  // Number of gov requests
};
```

---

### Step 3: Clear Production Data

1. Open Supabase SQL Editor
2. Create a new query
3. Copy contents of `scripts/clear-real-data.sql`
4. Click **"Run"**

**Verification:** After running, you should see a table showing:
```
table_name                              | remaining_rows
----------------------------------------|---------------
initiatives                             |             0
initiative_stories                      |             0
initiative_metrics                      |             0
initiative_financial_impact             |             0
initiative_performance_data             |             0
initiative_projections                  |             0
initiative_team_members                 |             0
effort_logs                             |             0
governance_requests                     |             0
team_members                            |             0
managers                                |             0
work_type_summary                       |             0
ehr_platform_summary                    |             0
key_highlights                          |             0
dashboard_metrics                       |             0
team_metrics                            |             0
workload_calculator_config (SHOULD NOT BE 0) |        33
```

**✅ Expected:** All counts are 0 EXCEPT `workload_calculator_config` which should be 33.

---

### Step 4: Load Demo Data

1. Open Supabase SQL Editor
2. Create a new query
3. Copy contents of `scripts/demo-data.sql` (10,674 lines)
4. Click **"Run"**
5. Wait for completion (may take 30-60 seconds)

**Expected output:**
```
BEGIN
-- ... many INSERT statements ...
COMMIT
```

---

### Step 5: Verify Data Load

Run this query in Supabase SQL Editor:

```sql
SELECT 'managers' as table_name, COUNT(*) as rows FROM managers
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'initiatives', COUNT(*) FROM initiatives
UNION ALL
SELECT 'initiative_stories', COUNT(*) FROM initiative_stories
UNION ALL
SELECT 'initiative_metrics', COUNT(*) FROM initiative_metrics
UNION ALL
SELECT 'initiative_financial_impact', COUNT(*) FROM initiative_financial_impact
UNION ALL
SELECT 'initiative_performance_data', COUNT(*) FROM initiative_performance_data
UNION ALL
SELECT 'initiative_projections', COUNT(*) FROM initiative_projections
UNION ALL
SELECT 'initiative_team_members', COUNT(*) FROM initiative_team_members
UNION ALL
SELECT 'effort_logs', COUNT(*) FROM effort_logs
UNION ALL
SELECT 'governance_requests', COUNT(*) FROM governance_requests
ORDER BY table_name;
```

**Expected results (approximate):**
```
table_name                      | rows
--------------------------------|------
effort_logs                     |  ~300
governance_requests             |     8
initiative_financial_impact     |   103
initiative_metrics              |    49
initiative_performance_data     |    83
initiative_projections          |    29
initiative_stories              |   352
initiative_team_members         |   ~90
initiatives                     |   415
managers                        |     2
team_members                    |    16
```

---

### Step 6: Validate Dashboard Functionality

1. **Open the dashboard** in your browser
2. **Check Dashboard → Overview**
   - Should show ~415 total initiatives
   - Revenue impact should be calculated
   - Charts should render

3. **Check Dashboard → Team View**
   - Should show 16 team members
   - Each should have initiatives assigned
   - Click on a team member to see their detail modal

4. **Check Browse Initiatives**
   - Should show categorized initiatives
   - Search should work
   - Filter tabs (All, Active, Completed) should work

5. **Check My Effort**
   - Select a team member from dropdown
   - Should show their active initiatives
   - Try editing an effort entry (don't save if you want to preserve data)

6. **Check Workload → SCI View**
   - Select a team member
   - Should show capacity header (Planned %, Actual %, Variance)
   - Should show initiatives in table grouped by work type

7. **Check Workload → Team View**
   - Should show 16 capacity cards
   - Try manager filter buttons
   - Click a card to see 6-metric productivity modal

8. **Check SCI Requests**
   - Should show 8 governance requests
   - Try viewing a request detail

---

## Troubleshooting

### Issue: "Foreign key violation" error

**Cause:** Tables not cleared in correct order

**Solution:**
1. Run `clear-real-data.sql` again
2. Ensure it completes without errors
3. Verify all tables show 0 rows (except workload_calculator_config)
4. Then re-run `demo-data.sql`

---

### Issue: "Unique constraint violation" error

**Cause:** Duplicate data or previous data not fully cleared

**Solution:**
1. Run `clear-real-data.sql` again
2. Regenerate SQL with new random data:
   ```bash
   npx tsx scripts/generate-demo-data.ts > scripts/demo-data.sql
   ```
3. Run new `demo-data.sql`

---

### Issue: Dashboard shows no data

**Causes:**
1. RLS policies preventing access
2. Data not committed
3. Browser cache

**Solutions:**
1. Check RLS policies in Supabase Dashboard → Authentication → Policies
   - Ensure policies allow SELECT on all tables
2. Verify data loaded with query in Step 5
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for errors

---

### Issue: Capacity calculations show 0%

**Cause:** Missing workload_calculator_config data

**Solution:**
1. Verify config table:
   ```sql
   SELECT COUNT(*) FROM workload_calculator_config;
   -- Should return 33
   ```
2. If 0, you need to re-run the migration:
   ```sql
   -- Re-run from: supabase/migrations/20251026000001_seed_calculator_config.sql
   ```

---

### Issue: Some initiatives missing stories/metrics

**Expected behavior!** Demo data intentionally uses sparse population:
- 85% of initiatives have stories
- 12% have metrics
- 25% have financial data
- 20% have performance data
- 7% have projections

This matches real-world data distribution.

---

## Restoring Production Data

If you need to restore production data:

### Option 1: Use Supabase Backup

1. Go to Supabase Dashboard → Database → Backups
2. Find your backup from Step 1
3. Click **"Restore"**
4. Confirm restoration
5. Wait for completion

### Option 2: Re-run Google Sheets Sync

If your production data is synced from Google Sheets:
1. Run your Apps Script sync function
2. Wait for sync to complete
3. Verify data appears in dashboard

---

## Customizing Demo Data

### Change number of initiatives per team member

Edit `scripts/generate-demo-data.ts`:

```typescript
// Line ~150 - Adjust range for initiatives per member
const numInitiatives = Math.floor(initiativesPerMember * (0.5 + Math.random()));
// Change to fixed number:
const numInitiatives = 30; // Each member gets exactly 30
```

### Change work type distribution

Edit `scripts/generate-demo-data.ts`:

```typescript
// Line ~30 - Adjust weights
const WORK_TYPES = [
  { name: 'System Initiative', weight: 40 },  // Increase
  { name: 'System Project', weight: 20 },
  { name: 'Governance', weight: 10 },         // Decrease
  // ...
];
```

### Change status distribution

Edit `scripts/generate-demo-data.ts`:

```typescript
// Line ~40 - Adjust weights
const STATUSES = [
  { name: 'In Progress', weight: 60 },        // More active
  { name: 'Completed', weight: 20 },
  { name: 'Not Started', weight: 20 },
  // ...
];
```

### After editing, regenerate:

```bash
npx tsx scripts/generate-demo-data.ts > scripts/demo-data.sql
```

Then repeat Steps 3-6.

---

## Notes

- **Demo data uses faker.js** for realistic but fake names, emails, and text
- **All UUIDs are randomly generated** - no connection to production data
- **Manager names** are hardcoded as "Sarah Mitchell" and "David Thompson"
- **Request IDs** use format GOV-2025-100 through GOV-2025-107
- **Dates are realistic** - start dates in past year, effort logs in last 12 weeks
- **Relationships are maintained** - all foreign keys valid, no orphaned records

---

## File Reference

- `scripts/generate-demo-data.ts` - TypeScript generator script
- `scripts/demo-data.sql` - Generated SQL (10,674 lines)
- `scripts/clear-real-data.sql` - Cleanup script
- `scripts/DEMO_DATA_INSTRUCTIONS.md` - This file

---

## Support

If you encounter issues:
1. Check Troubleshooting section above
2. Review Supabase SQL Editor error messages
3. Verify all prerequisites are met
4. Check browser console for client-side errors
5. Ensure .env file has correct Supabase credentials
