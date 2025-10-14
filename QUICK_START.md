# Quick Start: Populate All Initiatives

## TL;DR

```bash
# Step 1: Preview what will be created (SAFE - no database changes)
npx tsx populate-all-initiatives.ts --dry-run

# Step 2: If preview looks good, run it for real
npx tsx populate-all-initiatives.ts
```

## What This Does

Reads all 16 CSV files in `documents/` folder and creates ~379 initiative records in the Supabase database, automatically filtering out governance items.

## Expected Results

- **379 initiatives created** (from 438 rows)
- **59 governance items skipped**
- **All 16 team members processed**
- **Each initiative gets**:
  - Basic info (name, type, status, owner)
  - Role, EHRs, service line (from CSV)
  - Dates and sponsor (from CSV)
  - Story with challenge/approach (from CSV descriptions)

## Safety Features

- ✅ **Dry run mode** - preview before committing
- ✅ **Smart filtering** - skips governance and invalid data
- ✅ **Error handling** - continues even if one item fails
- ✅ **Progress tracking** - see what's happening in real-time
- ✅ **Statistics** - detailed counts by team member

## Common Commands

```bash
# Show help
npx tsx populate-all-initiatives.ts --help

# Dry run (preview)
npx tsx populate-all-initiatives.ts --dry-run

# Dry run with details
npx tsx populate-all-initiatives.ts --dry-run --verbose

# Actually insert data (after reviewing dry run!)
npx tsx populate-all-initiatives.ts
```

## Important Notes

1. **Run dry-run first!** Always preview before inserting
2. **No duplicates check** - Running twice will create duplicates
3. **Governance items excluded** - Only non-governance work is created
4. **Marty's data** - Script will process all CSVs including Marty's
5. **Incomplete data** - Financial/metrics fields left empty (populate later via UI)

## What Gets Skipped

- Governance work type items (e.g., "Epic Governance", "System Governance")
- Invalid/malformed data (empty assignments, continuation text)
- Rows without SCI field

## Detailed Documentation

See `POPULATE_INITIATIVES_README.md` for full documentation including:
- Column mapping details
- Data normalization rules
- Troubleshooting guide
- Script architecture
- Expected results by team member
