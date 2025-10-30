# Lisa Townsend Migration Guide

## Overview
This migration will move **2 unique assignments** from the `assignments` table to the `initiatives` table for Lisa Townsend.

## What Will Happen
- **2 new initiatives** will be created:
  1. ALM to SPM System Project - UAT testing and Train the Trainer
  2. DH Nursing Optimization System Project
- **27 existing duplicates** will be marked but NOT migrated (already in initiatives)
- **1 governance initiative** (GOV-2025-003) will remain untouched
- Lisa's total initiatives will go from **1 → 3**

## Files Created

### Main Scripts (Run in Order)
1. `migrate-lisa-step1-name-standardization.sql` - Fixes "Lisa" → "Lisa Townsend"
2. `migrate-lisa-step2-migrate-unique-assignments.sql` - Migrates 2 unique items
3. `migrate-lisa-step3-mark-migrated.sql` - Marks assignments as migrated
4. `migrate-lisa-step4-validation.sql` - Validation queries
5. `migrate-lisa-step5-recalculate-metrics.sql` - Updates dashboard metrics

### Master Scripts (Convenience)
- `migrate-lisa-MASTER-SCRIPT.sql` - **Run this for complete migration** (all steps in one)
- `migrate-lisa-ROLLBACK.sql` - Undo migration if needed

## How to Run

### Option 1: Run Master Script (Recommended)
1. Open Supabase SQL Editor
2. Copy and paste contents of `migrate-lisa-MASTER-SCRIPT.sql`
3. Click "Run"
4. Review validation results at the bottom

### Option 2: Run Individual Steps
1. Run each step script in order (1 → 2 → 3 → 4 → 5)
2. Review results after each step

## Expected Results

### Before Migration
```
Lisa's Assignments: 29
Lisa's Initiatives: 1
Capacity Card Badge: 1
```

### After Migration
```
Lisa's Assignments: 29 (marked as migrated)
Lisa's Initiatives: 3
  - 1 governance (GOV-2025-003)
  - 2 migrated (ALM to SPM, DH Nursing)
Capacity Card Badge: 3
```

## Validation Checklist

After running the migration, verify:

✅ **Step 1**: Run `migrate-lisa-step4-validation.sql` to see:
- Total initiatives = 3
- Newly migrated = 2
- Governance initiative exists (GOV-2025-003)

✅ **Step 2**: Check Capacity Card in UI:
- Open http://localhost:5173
- Go to Workload → Team View
- Find Lisa Townsend's card
- Badge should show **3** initiatives (was 1)

✅ **Step 3**: Check SCI View:
- Go to Workload → SCI View
- Filter to Lisa Townsend
- Should see 3 initiatives in System Initiatives table

## Rollback (If Needed)

If anything goes wrong:
1. Open Supabase SQL Editor
2. Copy and paste contents of `migrate-lisa-ROLLBACK.sql`
3. Click "Run"
4. Verify: `SELECT COUNT(*) FROM initiatives WHERE owner_name = 'Lisa Townsend' AND status != 'Deleted';`
   - Should return **1** (back to original state)

## Post-Migration

### UI Refresh
After migration, refresh the dashboard:
1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Verify Lisa's capacity card shows 3 initiatives

### Next Steps
Once Lisa's migration is validated:
1. Apply same process to other SCIs with negative differences
2. Eventually migrate all assignments table data
3. Deprecate assignments table

## Troubleshooting

### Issue: Capacity card still shows 1
**Solution**: Dashboard metrics need recalculation
- The app should auto-refresh on page load
- If not, run: `SELECT recalculateDashboardMetrics('<lisa-team-member-id>');`

### Issue: Duplicate initiatives created
**Solution**: Run rollback script immediately
- Check for duplicates: `SELECT initiative_name, COUNT(*) FROM initiatives WHERE owner_name = 'Lisa Townsend' GROUP BY initiative_name HAVING COUNT(*) > 1;`

### Issue: Name mismatch errors
**Solution**: Step 1 (name standardization) should fix this
- Verify: `SELECT DISTINCT owner_name FROM initiatives WHERE team_member_id = (SELECT id FROM team_members WHERE name = 'Lisa Townsend');`
- Should only return "Lisa Townsend"

## Contact
If you encounter issues, check:
1. Supabase SQL Editor error messages
2. Browser console (F12 → Console tab)
3. Rollback script is available for quick recovery
