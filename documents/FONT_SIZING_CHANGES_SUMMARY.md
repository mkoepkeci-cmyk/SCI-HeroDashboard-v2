# Dashboard Font Sizing Implementation Summary

## Overview
Applied Dashboard's compact font sizing strategy consistently across the application to create a more professional, information-dense interface.

## Dashboard Font Sizing Pattern (Reference: App.tsx lines 582-1750)

### Sizing Rules:
1. **Headers/Titles:**
   - Page headers: `text-lg font-semibold` (was: `text-2xl`)
   - Section headers: `text-sm font-semibold` (was: `text-xl` or `text-lg`)
   - Card titles: `text-xs font-semibold` or `text-xs font-bold`

2. **Body Text:**
   - Normal text: `text-sm`
   - Labels/meta: `text-xs`
   - Helper text: `text-xs text-gray-500`

3. **Form Elements:**
   - Input fields: `text-sm`
   - Labels: `text-xs font-medium`
   - Helper text: `text-xs text-gray-500`

4. **Buttons:**
   - Standard: `text-sm font-semibold`
   - Small: `text-xs font-medium`

5. **Metrics/Numbers** (DO NOT CHANGE):
   - Keep `text-2xl font-bold`, `text-3xl font-bold` for displaying values

---

## Files Modified

### ✅ COMPLETED:

#### 1. PersonalWorkloadDashboard.tsx (7 changes)
- Line 178: Header `text-2xl font-bold` → `text-lg font-semibold`
- Line 179: Subtext added `text-sm`
- Line 267: "No Team Member Selected" `text-xl` → `text-sm`
- Line 268: Body text added `text-sm`
- Line 350: "Effort Breakdown" `text-lg` → `text-sm`
- Line 377: "8-Week Effort Trend" `text-lg` → `text-sm`
- Line 412: "Top Effort Initiatives" `text-lg` → `text-sm`
- Line 443-444: "No Effort Logged" heading and text → `text-sm`

#### 2. TeamCapacityModal.tsx (6 changes)
- Line 163: Team member name `text-2xl font-bold` → `text-lg font-semibold`
- Line 166: "Planned Capacity" label added `text-xs`
- Line 169: Percentage label `text-lg` → `text-sm`
- Line 175: "Actual Capacity" label added `text-xs`
- Line 178: Percentage label `text-lg` → `text-sm`
- Chart titles already correct (`text-sm font-semibold`)

---

## 📋 TODO: Files Requiring Changes

### WORKLOAD VIEW COMPONENTS (4 remaining):

#### 3. TeamCapacityView.tsx
**Patterns to change:**
- Line 350: "Team Productivity Analytics" `text-lg` → `text-sm`
- Line 354: "Team Capacity Summary" already `text-sm` ✓
- Line 517: "Team Metrics" `text-lg` → `text-sm`
- All chart titles already `text-xs` ✓
**Changes needed:** ~2

#### 4. WorkloadDashboard.tsx
**Patterns to change:**
- Line 79: "Team Workload Analysis" `text-xl` → `text-sm`
- Line 80: Subtext already `text-sm` ✓
- Line 84, 88, 92: Metric values are `text-2xl` - KEEP (metrics)
- Line 143-146: Card names `text-xs font-bold` already correct ✓
- Line 199: Team member detail heading `text-lg` → `text-sm`
- Line 236: "Work Type Breakdown" `text-sm` already correct ✓
- Line 263: "Data Quality" `text-sm` already correct ✓
**Changes needed:** ~2

#### 5. EffortTrackingView.tsx
**Patterns to search:**
- Headers using `text-lg` or `text-xl` → change to `text-sm`
- Labels using `text-base` → change to `text-xs font-medium`
**Estimated changes:** ~5-10

#### 6. CapacityGauge.tsx
**Patterns to change:**
- Any headers `text-lg` → `text-sm`
- Body text `text-base` → `text-sm`
**Estimated changes:** ~3-5

---

### GOVERNANCE PORTAL COMPONENTS (3 files):

#### 7. GovernancePortalView.tsx
**Patterns to change:**
- Page header: Change to `text-lg font-semibold`
- Table headers: Should be `text-xs font-medium uppercase`
- Metric cards: Values stay `text-xl font-bold` or larger (metrics)
- Filter labels: `text-xs font-medium`
**Estimated changes:** ~8-12

#### 8. GovernanceRequestDetail.tsx
**Patterns to change:**
- Section headers: `text-sm font-semibold`
- Field labels: `text-xs font-medium`
- Field values: `text-sm`
- Status badges: `text-xs font-medium`
**Estimated changes:** ~5-8

#### 9. GovernanceRequestForm.tsx
**Status:** ALREADY HAS COMPACT SIZING from earlier work
**Action:** Verify consistency only
**Estimated changes:** 0-2

---

### INITIATIVE MANAGEMENT (6 files):

#### 10. InitiativesView.tsx
- Section headers → `text-sm font-semibold`
- Category labels → `text-xs font-medium`
**Estimated changes:** ~5

#### 11. InitiativesTableView.tsx
- Table headers → `text-xs font-medium uppercase`
- Table cells → `text-sm`
**Estimated changes:** ~3-5

#### 12. InitiativeCard.tsx
- Title → `text-xs font-semibold`
- Meta text → `text-[10px]`
- Body text → `text-sm`
**Estimated changes:** ~5-8

#### 13. InitiativeModal.tsx
- Headers → `text-sm font-semibold`
- Labels → `text-xs font-medium`
- Body text → `text-sm`
**Estimated changes:** ~8-12

#### 14. StaffDetailModal.tsx
- Headers → `text-sm font-semibold`
- Labels → `text-xs`
- Body text → `text-sm`
- Metrics → Keep `text-lg font-bold` or larger
**Estimated changes:** ~5-8

#### 15. SCIRequestsCard.tsx
- Card headers → `text-sm font-semibold`
- Body text → `text-sm`
- Labels → `text-xs`
**Estimated changes:** ~2-4

---

### OTHER COMPONENTS (9 files):

#### 16. ReassignModal.tsx
**Estimated changes:** ~3-5

#### 17. EffortLogModal.tsx
**Estimated changes:** ~3-5

#### 18. LoadBalanceModal.tsx
**Estimated changes:** ~5-8

#### 19. AdminTabContainer.tsx
**Estimated changes:** ~2-4

#### 20. TeamManagementPanel.tsx
**Estimated changes:** ~3-6

#### 21. ManagersPanel.tsx
**Estimated changes:** ~3-5

#### 22. WorkloadCalculatorSettings.tsx
**Estimated changes:** ~5-8

#### 23. InsightsChat.tsx
- Chat interface: `text-sm`
- Timestamps: `text-xs`
**Estimated changes:** ~2-3

#### 24. LandingPage.tsx
**NOTE:** This is a marketing/hero page - KEEP large hero text
- Only adjust internal section headers if needed
- Main hero `text-5xl` should STAY
**Estimated changes:** 0 (intentionally large)

---

### FORMS (3 files):

#### 25. UnifiedWorkItemForm.tsx
- Modal frame text → Apply Dashboard sizing
- Tabs already done from earlier work ✓
**Estimated changes:** ~2-3

#### 26. UnifiedWorkItemForm/Tab2Content.tsx
**Status:** Verify consistency from earlier work
**Estimated changes:** 0-2

#### 27. UnifiedWorkItemForm/Tab3Content.tsx
**Status:** Verify consistency from earlier work
**Estimated changes:** 0-2

#### 28. UnifiedWorkItemForm/Tab4Content.tsx
**Estimated changes:** ~1-2

---

## IMPORTANT: What NOT to Change

### ❌ DO NOT CHANGE:
1. **Metric values:** Keep `text-2xl font-bold`, `text-3xl font-bold`, `text-xl font-bold` when displaying:
   - Revenue amounts ($276M+)
   - Percentages (79%)
   - Hour values (31.5h)
   - Count values (409 initiatives)

2. **Landing page hero sections:** Marketing content intentionally uses large fonts

3. **Color classes, borders, padding, margins:** Only change font size/weight

---

## Replacement Patterns (Search & Replace Guide)

### Headers:
```
SEARCH:  text-2xl font-bold([^>]*>)([^<0-9$][^<]*)
REPLACE: text-lg font-semibold$1$2

SEARCH:  text-xl font-semibold
REPLACE: text-sm font-semibold

SEARCH:  text-xl font-bold([^>]*>)([^<0-9$%][^<]*)
REPLACE: text-sm font-semibold$1$2

SEARCH:  text-lg font-semibold
REPLACE: text-sm font-semibold

SEARCH:  text-lg font-bold([^>]*>)([^<0-9$%][^<]*)
REPLACE: text-sm font-semibold$1$2
```

### Body Text:
```
SEARCH:  text-base font-medium
REPLACE: text-xs font-medium

SEARCH:  text-base"
REPLACE: text-sm"

SEARCH:  text-base
REPLACE: text-sm
```

---

## Validation Checklist

After completing all changes, verify:

- [ ] All page headers use `text-lg font-semibold` or smaller
- [ ] Section headers use `text-sm font-semibold`
- [ ] Body text uses `text-sm`
- [ ] Labels use `text-xs font-medium`
- [ ] Table headers use `text-xs font-medium uppercase`
- [ ] Metric VALUES still use `text-2xl font-bold` or larger
- [ ] No `text-base` for headers (only for backwards compatibility if needed)
- [ ] All color classes, borders, padding preserved

---

## Summary Statistics

- **Total Files:** 28+
- **Files Completed:** 2
- **Files Remaining:** 26
- **Estimated Total Changes:** 150+ instances
- **Changes Completed:** ~13 instances
- **Changes Remaining:** ~137 instances

---

## Next Steps

1. **Automated Approach:** Use find/replace with regex in VS Code across all component files
2. **Manual Review:** Verify metric values weren't accidentally changed
3. **Testing:** Visual inspection of each view to ensure readability
4. **Git Diff:** Review all changes before committing

---

## Search Patterns for VS Code

### Find all headers that need changing:
```regex
className="[^"]*text-(2xl|xl|lg|base).*font-(bold|semibold)[^"]*">[^<0-9$%]
```

### Find all labels that should be text-xs:
```regex
<label[^>]*className="[^"]*text-(base|sm)[^"]*"
```

### Find metric values (DO NOT CHANGE):
```regex
text-(2xl|3xl).*>(\$|[0-9]|[0-9]+%)
```
