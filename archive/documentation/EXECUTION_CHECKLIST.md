# Execution Checklist: populate-all-initiatives.ts

## Pre-Execution Checklist

### 1. Environment Check
- [ ] Node.js v18+ installed (`node --version`)
- [ ] TypeScript execution available (`npx tsx --version`)
- [ ] In correct directory (`c:\Users\marty\sci-hero-board-main`)
- [ ] All CSV files present in `documents/` folder (16 files)

### 2. Database Check
- [ ] Supabase connection working
- [ ] Know current count of initiatives in database
- [ ] Have database backup or can restore if needed
- [ ] Understand that this will ADD ~379 initiatives

### 3. Data Check
- [ ] CSV files are up-to-date
- [ ] CSV files are in correct format
- [ ] Know that Marty's data will be processed (may create duplicates if already exists)

## Execution Steps

### Step 1: Review Documentation
```bash
# Read the quick start guide
cat QUICK_START.md

# Or show help
npx tsx populate-all-initiatives.ts --help
```

**Checkpoint**: Understand what the script does and what will be created

---

### Step 2: Dry Run (Preview)
```bash
npx tsx populate-all-initiatives.ts --dry-run
```

**Expected Output**:
- Processing: [Team Member Names]
- Total rows processed: ~438
- Total initiatives created: ~379
- Total skipped: ~59 (governance items)
- Total errors: 0

**Checkpoint**:
- [ ] Numbers look reasonable
- [ ] No errors reported
- [ ] Team members processed: 16

---

### Step 3: Detailed Dry Run (Optional)
```bash
npx tsx populate-all-initiatives.ts --dry-run --verbose > preview-detailed.txt
```

**Review preview-detailed.txt**:
- [ ] Initiative names look correct
- [ ] Governance items being skipped as expected
- [ ] No unexpected skips

**Checkpoint**: Data quality looks good

---

### Step 4: Decision Point

**Before proceeding, answer these questions**:

1. **Are there existing initiatives for these team members?**
   - If YES → This will create duplicates
   - If NO → Safe to proceed

2. **Do you want to exclude Marty's data?**
   - If YES → Move `documents/SCI Assignments Tracker - Marty.csv` temporarily
   - If NO → Accept that Marty will get new initiatives

3. **Is this a production or test environment?**
   - If TEST → Proceed
   - If PRODUCTION → Ensure you have backup/restore plan

**Checkpoint**:
- [ ] Understand duplicate implications
- [ ] Made decision about Marty's data
- [ ] Have recovery plan if needed

---

### Step 5: Execute (Live Run)

```bash
npx tsx populate-all-initiatives.ts
```

**You will see**:
- Warning about existing initiatives
- 5-second countdown
- Press Ctrl+C to cancel during countdown

**During execution**:
- Watch for errors (should be 0)
- Watch progress through team members
- Don't interrupt (unless error occurs)

**Checkpoint**:
- [ ] Execution completed
- [ ] No errors reported
- [ ] Statistics match dry run

---

### Step 6: Verification

**Check database**:
```sql
-- Count total initiatives
SELECT COUNT(*) FROM initiatives;

-- Count by team member
SELECT tm.name, COUNT(i.id) as initiative_count
FROM team_members tm
LEFT JOIN initiatives i ON i.team_member_id = tm.id
GROUP BY tm.name
ORDER BY tm.name;

-- Count non-draft initiatives
SELECT COUNT(*) FROM initiatives WHERE is_draft = false;

-- Sample a few initiatives
SELECT initiative_name, owner_name, type, status
FROM initiatives
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Results**:
- [ ] ~379 new initiatives added
- [ ] All have `is_draft = false`
- [ ] Owner names match team member names
- [ ] Types are correct (not all "Governance")
- [ ] Stories exist for initiatives with descriptions

**Checkpoint**: Database data looks correct

---

### Step 7: UI Verification

**Check in the application** (`http://localhost:5175`):

1. **Team View**:
   - [ ] Each team member shows initiatives
   - [ ] Initiatives categorized by work type
   - [ ] Governance section NOT inflated
   - [ ] Counts look reasonable

2. **Initiatives View**:
   - [ ] All new initiatives visible
   - [ ] Initiative cards display correctly
   - [ ] Stories show in cards (when available)
   - [ ] Filters work

3. **Specific Team Member** (test with Josh - highest count):
   - [ ] Shows 73 initiatives
   - [ ] Categorized correctly
   - [ ] Can click and view details

**Checkpoint**: UI displays data correctly

---

## Post-Execution Tasks

### Clean-up (if needed)
```sql
-- If duplicates created, can identify by created_at timestamp
SELECT initiative_name, owner_name, created_at
FROM initiatives
ORDER BY created_at DESC;

-- To remove duplicates created in last hour (CAREFUL!)
-- DELETE FROM initiatives
-- WHERE created_at > NOW() - INTERVAL '1 hour';
```

### Documentation
- [ ] Update project notes with execution date
- [ ] Document any issues encountered
- [ ] Note any data quality issues found
- [ ] Record final counts

### Next Steps
- [ ] Populate financial data (via UI or separate script)
- [ ] Add metrics/KPIs (via UI or separate script)
- [ ] Add performance data (via UI or separate script)
- [ ] Review and enhance initiative descriptions
- [ ] Add missing governance/collaboration details

---

## Troubleshooting

### Error: "Team member not found"
**Solution**: Team member name in CSV filename doesn't match database
- Check `team_members` table for exact name
- Verify CSV filename format: `SCI Assignments Tracker - [Name].csv`

### Error: "Documents folder not found"
**Solution**: Running from wrong directory
- `cd c:\Users\marty\sci-hero-board-main`
- Verify with `ls documents/`

### Too many duplicates
**Solution**: Script was run multiple times
- Review created_at timestamps
- Manually remove duplicates, or
- Restore from backup

### Governance items created
**Solution**: Work Type didn't contain "governance" exactly
- Check CSV file Work Type column
- May need to manually categorize or delete

---

## Rollback Plan

### Option 1: Delete by timestamp
```sql
-- Delete all initiatives created in last 5 minutes
DELETE FROM initiatives
WHERE created_at > NOW() - INTERVAL '5 minutes';

-- Delete associated stories (if foreign key doesn't cascade)
DELETE FROM initiative_stories
WHERE initiative_id NOT IN (SELECT id FROM initiatives);
```

### Option 2: Database restore
- Restore from Supabase backup
- Or restore from manual backup if created

### Option 3: Manual cleanup
- Use UI to review and delete individual initiatives
- Time-consuming but most precise

---

## Success Criteria

### Quantitative
- [ ] 379 initiatives created
- [ ] 0 errors during execution
- [ ] All 16 team members processed
- [ ] ~59 governance items skipped

### Qualitative
- [ ] Initiative names make sense
- [ ] Team member attribution correct
- [ ] Status values normalized
- [ ] Stories exist where expected
- [ ] UI displays correctly

### Integration
- [ ] work_type_summary counts UNCHANGED
- [ ] Team total_assignments UNCHANGED
- [ ] Initiatives drill down into existing work
- [ ] Dashboard metrics still accurate

---

## Final Checklist

Before considering this task complete:

- [ ] Script executed successfully
- [ ] Database verified
- [ ] UI verified
- [ ] No errors or data quality issues
- [ ] Documentation updated
- [ ] Next steps identified
- [ ] Rollback plan understood

**Date Executed**: _______________

**Executed By**: _______________

**Final Initiative Count**: _______________

**Notes**:
```
[Add any notes about execution, issues, or deviations from expected results]
```

---

## Quick Reference

```bash
# Dry run (always start here)
npx tsx populate-all-initiatives.ts --dry-run

# Live run
npx tsx populate-all-initiatives.ts

# Help
npx tsx populate-all-initiatives.ts --help
```

**Documentation Files**:
- `QUICK_START.md` - Quick reference
- `POPULATE_INITIATIVES_README.md` - Full documentation
- `SCRIPT_SUMMARY.md` - Technical details
- `EXECUTION_CHECKLIST.md` - This file
