# Populate All Initiatives - Complete Documentation Index

## Quick Navigation

| I want to... | Go to... |
|--------------|----------|
| **Get started quickly** | [QUICK_START.md](QUICK_START.md) |
| **Understand what the script does** | [SCRIPT_SUMMARY.md](SCRIPT_SUMMARY.md) |
| **Read full documentation** | [POPULATE_INITIATIVES_README.md](POPULATE_INITIATIVES_README.md) |
| **Execute the script** | [EXECUTION_CHECKLIST.md](EXECUTION_CHECKLIST.md) |
| **See help from script** | Run `npx tsx populate-all-initiatives.ts --help` |

---

## Documentation Files

### 1. QUICK_START.md
**Purpose**: Get running in 2 minutes
**Contains**:
- TL;DR commands
- Expected results
- Safety features
- Common commands

**Read this if**: You want to execute quickly and know what you're doing

---

### 2. SCRIPT_SUMMARY.md
**Purpose**: Technical overview and design documentation
**Contains**:
- Script architecture
- Key features
- CSV column mapping
- Expected results by team member
- Testing performed
- Success criteria

**Read this if**: You want to understand how the script works

---

### 3. POPULATE_INITIATIVES_README.md
**Purpose**: Comprehensive reference documentation
**Contains**:
- Detailed feature descriptions
- Column mapping reference
- Data quality notes
- Troubleshooting guide
- Advanced usage
- Version history

**Read this if**: You need detailed information or troubleshooting help

---

### 4. EXECUTION_CHECKLIST.md
**Purpose**: Step-by-step execution guide
**Contains**:
- Pre-execution checklist
- Execution steps with checkpoints
- Verification steps
- Post-execution tasks
- Rollback plan
- Success criteria

**Read this if**: You're about to run the script and want to do it right

---

## The Script

### populate-all-initiatives.ts

**Size**: 495 lines
**Language**: TypeScript
**Execution**: `npx tsx populate-all-initiatives.ts [options]`

**Key Features**:
- Automated CSV processing for all 16 team members
- Smart filtering (governance items excluded)
- Robust CSV parser (handles multi-line fields)
- Data normalization (status, EHR, role)
- Comprehensive error handling
- Dry run and verbose modes
- Statistics tracking

**Dependencies**:
- `@supabase/supabase-js` (database client)
- `fs` (Node.js built-in)
- `path` (Node.js built-in)

---

## Source Data

### CSV Files
**Location**: `documents/`
**Count**: 16 files
**Format**: `SCI Assignments Tracker - [Name].csv`

**Team Members**:
1. Ashley (17 rows → 16 initiatives)
2. Brooke (14 rows → 14 initiatives)
3. Dawn (35 rows → 30 initiatives)
4. Jason (23 rows → 23 initiatives)
5. Josh (95 rows → 73 initiatives)
6. Kim (15 rows → 13 initiatives)
7. Lisa (27 rows → 27 initiatives)
8. Marisa (17 rows → 17 initiatives)
9. Marty (33 rows → 19 initiatives)
10. Matt (31 rows → 23 initiatives)
11. Melissa (10 rows → 10 initiatives)
12. Robin (21 rows → 15 initiatives)
13. Sherry (23 rows → 23 initiatives)
14. Trudy (25 rows → 25 initiatives)
15. Van (31 rows → 31 initiatives)
16. Yvette (21 rows → 20 initiatives)

**Totals**: 438 rows → 379 initiatives (59 governance items excluded)

---

## Expected Results

### Database Impact
- **Initiatives table**: +379 records
- **Initiative_stories table**: +379 records (approx)
- **Team_members table**: No changes
- **Work_type_summary table**: No changes (by design)

### Data Created
Each initiative gets:
- ✅ Basic info (name, type, status, owner)
- ✅ Role, EHRs impacted, service line (from CSV)
- ✅ Dates (start, end) - if available in CSV
- ✅ Clinical sponsor (from CSV)
- ✅ Story with challenge/approach (from CSV descriptions)
- ❌ Financial data (not in CSV - populate later)
- ❌ Metrics/KPIs (not in CSV - populate later)
- ❌ Performance data (not in CSV - populate later)

---

## Usage Workflow

### Recommended Execution Flow

```
1. Read QUICK_START.md
   ↓
2. Run dry-run: npx tsx populate-all-initiatives.ts --dry-run
   ↓
3. Review output (should show ~379 initiatives)
   ↓
4. Read EXECUTION_CHECKLIST.md
   ↓
5. Follow checklist steps
   ↓
6. Run live: npx tsx populate-all-initiatives.ts
   ↓
7. Verify in database and UI
   ↓
8. Complete post-execution tasks
```

### Alternative: Just Do It

```bash
# Quick execution (if you know what you're doing)
npx tsx populate-all-initiatives.ts --dry-run
npx tsx populate-all-initiatives.ts
```

---

## Key Commands

### Help
```bash
npx tsx populate-all-initiatives.ts --help
```

### Dry Run (Preview)
```bash
npx tsx populate-all-initiatives.ts --dry-run
```

### Dry Run with Details
```bash
npx tsx populate-all-initiatives.ts --dry-run --verbose
```

### Live Execution
```bash
npx tsx populate-all-initiatives.ts
```

### Save Preview to File
```bash
npx tsx populate-all-initiatives.ts --dry-run > preview.txt
```

---

## Safety Features

1. **Dry Run Mode**: Preview without database changes
2. **Duplicate Warning**: Warns about existing initiatives before inserting
3. **Countdown Delay**: 5-second pause before live insertion
4. **Verbose Logging**: See exactly what's happening
5. **Error Isolation**: Failures don't stop entire process
6. **Statistics Tracking**: Know exactly what was created

---

## Important Principles

### 1. Quality Over Quantity
- Create complete records from CSV data
- Don't invent data
- Leave fields empty if not in CSV
- Populate missing data later with accurate information

### 2. No Duplicate Counts
- Initiatives are drill-downs into existing work
- Don't modify `work_type_summary` counts
- Don't increase `total_assignments`
- Example: Josh has 47 assignments + 73 initiative details = still 47 assignments

### 3. Actual Attribution
- Use actual team member names (Josh, Van, Lisa)
- Not generic names like "Marty"
- Proper ownership tracking

### 4. Governance Exclusion
- All governance items filtered out
- They remain in work_type_summary
- Don't get detailed initiative records
- Reduces noise, focuses on deliverables

---

## CSV Column Mapping Quick Reference

| CSV → Database |
|----------------|
| `SCI` → `team_member_id` (lookup) |
| `SCI` → `owner_name` |
| `Assignment` → `initiative_name` |
| `Work Type` → `type` |
| `Status` → `status` (normalized) |
| `Role` → `role` (normalized) |
| `EHR/s Impacted` → `ehrs_impacted` (normalized) |
| `Service Line` → `service_line` |
| `Projected Go-Live Date` → `end_date` |
| `Assignment Date` → `start_date` |
| `Sponsor` → `clinical_sponsor_name` |
| `Short Description` → `story.challenge` |
| `Comments/Details` → `story.approach` |

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Team member not found" | Check team_members table, verify CSV filename |
| "Documents folder not found" | Run from project root, verify path |
| Duplicates created | Check created_at, delete by timestamp |
| Governance items created | Check Work Type column in CSV |
| Script crashes | Check Node.js version, dependencies installed |

See [POPULATE_INITIATIVES_README.md](POPULATE_INITIATIVES_README.md) for full troubleshooting guide.

---

## Success Metrics

### Quantitative
- ✅ 379 initiatives created
- ✅ 0 errors during execution
- ✅ 16 team members processed
- ✅ ~59 governance items skipped

### Qualitative
- ✅ Initiative names make sense
- ✅ Team member attribution correct
- ✅ Status values normalized
- ✅ Stories exist where expected
- ✅ UI displays correctly

### Integration
- ✅ work_type_summary counts unchanged
- ✅ Team total_assignments unchanged
- ✅ Initiatives drill down into existing work
- ✅ Dashboard metrics accurate

---

## Next Steps After Population

1. **Financial Data**: Add via UI or separate script
2. **Metrics/KPIs**: Add baseline/current/target values
3. **Performance Data**: Add operational metrics
4. **Projections**: Add scaling scenarios
5. **Stories**: Enhance with detailed outcomes
6. **Governance**: Add governance bodies where applicable
7. **Collaborators**: Add key collaborators where known

---

## File Reference

### Created Files (4)
1. `populate-all-initiatives.ts` - Main script
2. `QUICK_START.md` - Quick reference
3. `POPULATE_INITIATIVES_README.md` - Full documentation
4. `SCRIPT_SUMMARY.md` - Technical details
5. `EXECUTION_CHECKLIST.md` - Step-by-step guide
6. `POPULATE_INITIATIVES_INDEX.md` - This file

### Source Files (16)
- `documents/SCI Assignments Tracker - [Name].csv`

### Related Files
- `populate-marty-initiatives.ts` - Example for Marty
- `add-completed-initiatives.ts` - Example for completed items
- `CLAUDE.md` - Project instructions
- Various documentation files in `documents/` folder

---

## Support

### Getting Help

1. **Quick Questions**: Check QUICK_START.md
2. **How-To**: Check EXECUTION_CHECKLIST.md
3. **Technical**: Check SCRIPT_SUMMARY.md
4. **Troubleshooting**: Check POPULATE_INITIATIVES_README.md
5. **Understanding Project**: Check CLAUDE.md

### Common Questions

**Q: Will this duplicate existing data?**
A: Yes, if run multiple times. Use dry-run first and understand database state.

**Q: Can I undo this?**
A: Yes, using database rollback or by deleting by created_at timestamp.

**Q: What about Marty's data?**
A: Script processes all CSVs including Marty's. May create duplicates if already exists.

**Q: Why not governance items?**
A: Project principle - focus on deliverable work, keep governance in summary counts.

**Q: Can I run this in production?**
A: Yes, but understand implications. Dry-run first, have rollback plan.

---

## Version

**Script Version**: 1.0
**Date Created**: 2025-10-09
**Created By**: Claude Code (Anthropic)
**Tested With**: 16 CSV files, 438 total rows

---

## Final Checklist

Before executing:
- [ ] Read QUICK_START.md
- [ ] Run dry-run
- [ ] Understand results
- [ ] Read EXECUTION_CHECKLIST.md
- [ ] Have rollback plan
- [ ] Execute with confidence

**Ready to start?** → [QUICK_START.md](QUICK_START.md)
