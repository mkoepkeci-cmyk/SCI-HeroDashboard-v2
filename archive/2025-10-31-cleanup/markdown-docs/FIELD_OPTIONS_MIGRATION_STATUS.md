# Field Options Migration Status

**Date:** October 31, 2025
**Status:** ⚠️ PARTIAL - Database and Admin UI Complete, Component Migration Pending

---

## Current State

### ✅ What Works (Phase 1 Complete)

1. **Database Storage**
   - `field_options` table created and seeded with 48 options
   - All field types stored: work_type, role, phase, work_effort, service_line, ehr_platform, status
   - Color support (primary, chart, badge colors)
   - Admin can add/edit/delete options via UI

2. **Admin UI**
   - Admin Configurations → Field Options tab
   - Draft mode for safe editing
   - Color picker with preset palette
   - Usage validation before deletion
   - Visual feedback for changes

3. **Capacity Thresholds** (BONUS)
   - Dynamic capacity threshold system created
   - 7-level granular color gradient (green → lime → yellow → orange → red)
   - Admin can customize ranges and colors
   - `TeamCapacityCard` updated to use dynamic thresholds ✅

---

### ⚠️ What Doesn't Work Yet (Phase 2 Pending)

**The following components still use HARDCODED field options:**

#### 1. **WorkloadCalculatorSettings.tsx**
   - **Issue**: Work Type Weights tab shows hardcoded list
   - **Why**: Component doesn't load options from `field_options` table
   - **Example**: You renamed "Ticket" → "Market Ticket" in Field Options, but Calculator Settings still shows "Ticket"

#### 2. **UnifiedWorkItemForm/Tab2Content.tsx**
   - **Issue**: All dropdown menus use hardcoded `<option>` elements
   - **Dropdowns affected**:
     - Work Type (line 182-190)
     - Status (line 205-209)
     - Phase (line 222-232)
     - Work Effort (line 245-249)
     - EHRs Impacted (line 262-266)
     - Service Line (line 279-291)

#### 3. **GovernanceRequestDetail.tsx**
   - **Issue**: SCI assignment dropdowns use hardcoded options
   - **Dropdowns affected**: Work Type, Work Effort

#### 4. **ReassignModal.tsx**
   - **Issue**: Role dropdown uses hardcoded array
   - **Line 26**: `const roles = ['Owner', 'Co-Owner', 'Secondary', 'Support']`

#### 5. **App.tsx**
   - **Issue**: Color mappings hardcoded in `getWorkTypeColor()` function
   - **Line 382-396**: Static color object
   - **Impact**: Changing colors in Field Options admin doesn't affect charts/badges

#### 6. **BulkEffortEntry.tsx**
   - **Issue**: Work type display order hardcoded
   - **Line 446**: Manually ordered work type list

---

## Why This Happens

**Design Decision**: The Phase 1 implementation focused on:
1. Creating the database infrastructure
2. Building the admin UI for managing options
3. Proving the concept works

**Phase 2 (not yet implemented)** would:
1. Create a shared `useFieldOptions(fieldType)` hook
2. Replace all hardcoded dropdowns with dynamic loading
3. Update color mappings to use database colors
4. Add runtime validation (TypeScript types would become `string` instead of literal unions)

---

## Workaround (Current Behavior)

### For Field Option Changes:
1. **Change in Admin UI**: Edit "Ticket" → "Market Ticket" in Field Options
2. **Database Updates**: ✅ Value saved to `field_options` table
3. **Forms Still Show**: "Ticket" (old hardcoded value)
4. **Existing Data**: Unaffected (initiatives with type="Ticket" still work)

### For Calculator Weights:
- **Calculator Settings** and **Field Options** are SEPARATE systems
- Changing field option names doesn't affect calculator weights
- Calculator weights stored in `workload_calculator_config` table (separate from `field_options`)

---

## Migration Path (Phase 2)

### Step 1: Create Shared Hook (2-3 hours)

**File**: `src/lib/useFieldOptions.ts`

```typescript
export function useFieldOptions(fieldType: FieldType) {
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptions(fieldType).then(setOptions);
  }, [fieldType]);

  return { options, loading };
}
```

### Step 2: Update Forms (4-6 hours)

**Example**: UnifiedWorkItemForm/Tab2Content.tsx

```typescript
// OLD (hardcoded):
<select>
  <option value="Ticket">Ticket</option>
  <option value="Governance">Governance</option>
</select>

// NEW (dynamic):
const { options: workTypeOptions } = useFieldOptions('work_type');

<select>
  {workTypeOptions.map(opt => (
    <option key={opt.id} value={opt.key}>{opt.label}</option>
  ))}
</select>
```

### Step 3: Update Color Mappings (2-3 hours)

**Example**: App.tsx `getWorkTypeColor()`

```typescript
// OLD (hardcoded):
const getWorkTypeColor = (type: string): string => {
  const colors = {
    'Governance': '#6F47D0',
    'Ticket': '#F58025',
  };
  return colors[type] || '#565658';
};

// NEW (dynamic):
const { getColorForWorkType } = useFieldOptions('work_type');
const color = getColorForWorkType(type);
```

### Step 4: Update Calculator Settings (2-3 hours)

Load work types from `field_options` table instead of hardcoded list.

### Step 5: Add Runtime Validation (1-2 hours)

Replace TypeScript literal types with Zod schemas for runtime validation.

---

## Immediate Recommendations

### Option A: Keep Current Behavior (No Action)
- ✅ Admin can manage field options for future use
- ✅ Existing data continues to work
- ⚠️ Changes won't appear in forms until Phase 2 migration
- **Use case**: You want to prepare options for later activation

### Option B: Manual Synchronization
- When you change a field option, also:
  1. Update hardcoded values in components (requires code changes)
  2. Update Calculator Settings weights if applicable
  3. Commit and deploy
- **Use case**: Immediate need for renamed options

### Option C: Phase 2 Migration (Recommended for Long-Term)
- Implement `useFieldOptions` hook
- Migrate all 6 components listed above
- Test thoroughly (forms, validation, color rendering)
- **Estimated**: 12-16 hours total
- **Benefit**: Single source of truth, no more manual sync

---

## Current Workaround for Your Specific Case

**Issue**: "Ticket" → "Market Ticket" not showing in forms

**Temporary Fix** (until Phase 2):

1. **Update form dropdown** (UnifiedWorkItemForm/Tab2Content.tsx line 190):
   ```typescript
   <option value="Ticket">Market Ticket</option>
   ```

2. **Update calculator settings** (WorkloadCalculatorSettings.tsx):
   - The calculator weights are separate - they reference the key "Ticket"
   - Display label can be shown differently in the UI, but the key stays "Ticket"

3. **OR** keep using "Ticket" as the internal key, "Market Ticket" as the label in `field_options`
   - This way existing data doesn't break
   - Future migration will use the label from database

---

## Testing After Phase 2 Migration

When Phase 2 is implemented, test:

1. **Admin changes reflect immediately**:
   - Change "Ticket" → "Market Ticket" in Admin
   - Refresh form page
   - Dropdown should show "Market Ticket"

2. **Existing data preserved**:
   - Initiatives with type="Ticket" still render correctly
   - Historical data not affected

3. **Color changes apply**:
   - Change work type color in Admin
   - Charts and badges update across all views

4. **Validation still works**:
   - Can't save initiative without selecting work type
   - TypeScript types still provide safety

---

## Summary

**What you built today** (Phase 1):
- ✅ Comprehensive admin system for managing field options
- ✅ Database storage with color support
- ✅ Draft mode for safe testing
- ✅ Dynamic capacity thresholds (BONUS - fully working!)

**What's next** (Phase 2 - optional):
- Migrate forms to load options from database
- Estimated 12-16 hours
- Would eliminate the disconnect you experienced

**For now**:
- Your field options are safely stored in the database
- To see changes in forms, you'll need either:
  - Manual code updates to hardcoded values, OR
  - Phase 2 migration implementation

---

## Questions?

**"Why didn't you implement Phase 2 today?"**
- Wanted to get Phase 1 working first (infrastructure)
- Phase 2 is higher risk (affects all forms, validation, data entry)
- Better to test Phase 1, then decide if Phase 2 is needed

**"Can I use the field options database now?"**
- Yes! The data is stored correctly
- Just know that forms won't show your changes until Phase 2
- Capacity thresholds ARE fully working (different system)

**"Should I do Phase 2?"**
- If you frequently change field options: YES
- If field options are mostly stable: MAYBE (current workaround sufficient)
- If you want true single source of truth: YES
