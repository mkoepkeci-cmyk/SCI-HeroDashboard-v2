# Capacity Thresholds - Unified System

**Date:** October 31, 2025
**Status:** ✅ UNIFIED - Single Source of Truth

---

## Overview

Capacity thresholds are now managed in **ONE LOCATION ONLY**:

**Admin → Admin Configurations → Capacity Thresholds tab**

This system allows you to:
- View all capacity threshold ranges (e.g., 0-45%, 45-60%, etc.)
- Adjust existing thresholds (change percentages, colors, labels)
- Add new threshold levels for more granularity
- Delete thresholds you don't need
- See visual preview of the color gradient

---

## Single Source of Truth

### ✅ Correct Location: `capacity_thresholds` Table

**Purpose**: Store dynamic, customizable capacity threshold ranges

**Features**:
- Unlimited threshold levels (default: 7 levels)
- Custom percentage ranges (min to max)
- Custom colors (hex format with color picker)
- Custom labels (e.g., "Well Under Capacity", "At Capacity")
- Custom emojis (🟢 🟡 🟠 🔴)
- Display order for evaluation
- Active/inactive toggle

**Access**:
- **Admin UI**: Admin → Admin Configurations → Capacity Thresholds
- **Database**: `capacity_thresholds` table
- **Code**: `useCapacityThresholds()` hook

---

## Where Capacity Colors Are Used

### 1. Team Capacity Cards (`TeamCapacityCard.tsx`)
**Updated:** ✅ Uses dynamic thresholds

Shows capacity percentage with color-coded avatar border:
- Planned hours percentage → determines color
- Actual hours percentage → determines color
- Colors pulled from `capacity_thresholds` table

**Example**:
- Planned: 31.5h (79%) → **Yellow-Orange** (in 75-85% range)
- Actual: 39.0h (98%) → **Red-Orange** (in 95-105% range)

### 2. Bulk Effort Entry (`BulkEffortEntry.tsx`)
**Status:** ⏳ To be updated

Currently shows capacity header:
- Planned: 31.5 hrs/wk (79%)
- Actual: 39.0 hrs (98%)

**Next step**: Add color-coded indicators using `useCapacityThresholds()`

### 3. Team Capacity Modal (`TeamCapacityModal.tsx`)
**Status:** ⏳ To be updated

Shows productivity metrics for individual team member.

**Next step**: Add color-coded capacity visualization

### 4. Personal Workload Dashboard (`PersonalWorkloadDashboard.tsx`)
**Status:** ⏳ To be updated

Shows workload trends over time.

**Next step**: Color-code trend lines based on capacity thresholds

---

## Default 7-Level System

The system ships with 7 pre-configured threshold levels:

| Level | Range | Color | Label | Emoji |
|-------|-------|-------|-------|-------|
| 1 | 0-45% | Green (#22c55e) | Well Under Capacity | 🟢 |
| 2 | 45-60% | Lime Green (#84cc16) | Under Capacity | 🟢 |
| 3 | 60-75% | Yellow (#eab308) | Approaching Capacity | 🟡 |
| 4 | 75-85% | Yellow-Orange (#f59e0b) | Near Capacity | 🟠 |
| 5 | 85-95% | Orange (#f97316) | At Capacity | 🟠 |
| 6 | 95-105% | Red-Orange (#fb923c) | Over Capacity | 🔴 |
| 7 | 105%+ | Red (#dc2626) | Severely Over Capacity | 🔴 |

**You can customize all of these!**

---

## How to Customize Thresholds

### Adjust Existing Threshold

1. Navigate to: **Admin → Admin Configurations → Capacity Thresholds**
2. Click: **Enter Draft Mode**
3. Edit the threshold:
   - Change label (e.g., "At Capacity" → "Fully Booked")
   - Adjust range (e.g., 85-95% → 80-90%)
   - Pick new color from palette or enter hex code
   - Change emoji
4. Click: **Save & Apply**
5. Refresh page to see changes across all views

### Add New Threshold (More Granularity)

**Example**: Split "Under Capacity" into two levels

1. Click: **Add Threshold**
2. Enter:
   - Label: "Slightly Under Capacity"
   - Min: 52%
   - Max: 60%
3. Click OK
4. Click: **Enter Draft Mode**
5. Adjust existing "Under Capacity" range from 45-60% to 45-52%
6. Assign color to new threshold
7. Click: **Save & Apply**

**Result**: Now have 8 levels instead of 7!

### Delete Threshold (Less Granularity)

**Example**: Remove "Well Under Capacity" level

1. Find "Well Under Capacity" row
2. Click delete button (🗑️)
3. Confirm deletion
4. **Important**: Adjust next threshold's min to 0% to avoid gaps
5. Enter draft mode and change "Under Capacity" from 45-60% to 0-60%
6. Save & Apply

---

## Validation Rules

The system enforces these rules:

1. **No Gaps**: Each threshold's max must equal the next threshold's min
   - ✅ Good: [0-45%, 45-60%, 60-75%]
   - ❌ Bad: [0-45%, 50-60%, 60-75%] (5% gap)

2. **No Overlaps**: Ranges must be continuous
   - ✅ Good: [0-45%, 45-60%]
   - ❌ Bad: [0-50%, 45-60%] (overlap)

3. **Start at 0%**: First threshold must start at 0%

4. **Min < Max**: Each threshold's min must be less than max
   - ✅ Good: min=60%, max=75%
   - ❌ Bad: min=75%, max=60%

5. **At Least One Active**: Can't delete last threshold

**The admin UI will show validation errors if you violate these rules.**

---

## Technical Details

### Database Schema

```sql
CREATE TABLE capacity_thresholds (
  id uuid PRIMARY KEY,
  label text NOT NULL,
  min_percentage integer NOT NULL,
  max_percentage integer NOT NULL,
  color text NOT NULL,
  color_name text,
  emoji text,
  display_order integer NOT NULL,
  is_active boolean DEFAULT true
);
```

### React Hook

```typescript
import { useCapacityThresholds } from '../lib/useCapacityThresholds';

function MyComponent() {
  const { thresholds, getColorForPct, getThresholdForPct } = useCapacityThresholds();

  const color = getColorForPct(85); // Returns '#f97316' (orange)
  const threshold = getThresholdForPct(85); // Returns full threshold object
}
```

### Caching

Thresholds are cached for **1 minute** (matching calculator config pattern):
- First load: Fetch from database
- Subsequent loads (within 1 min): Return cached data
- After save: Cache cleared, forces reload

This provides good performance while ensuring changes apply quickly.

### Fallback

If database is unavailable, system falls back to default 7-level configuration (hardcoded).

---

## Migration from Old System

### Old System (REMOVED)

Previously, capacity thresholds were stored as static values in `application_config`:
- `capacity_under_threshold: 60`
- `capacity_near_threshold: 75`
- `capacity_at_threshold: 85`

**Problems**:
1. Only 3 fixed levels (not granular)
2. No color assignment
3. No labels/emojis
4. Hardcoded in multiple components

### New System (CURRENT)

Dynamic, unlimited threshold levels in `capacity_thresholds` table.

**Benefits**:
1. Unlimited granularity (add as many levels as needed)
2. Full color customization per level
3. Labels and emojis for better UX
4. Single source of truth
5. Visual preview in admin UI
6. Draft mode for safe testing

---

## Removed Items

### Application Settings Section

The old capacity threshold fields have been **removed** from the Application Settings section:
- ~~Capacity Under Threshold (%)~~
- ~~Capacity Near Threshold (%)~~
- ~~Capacity At Threshold (%)~~

**Why**: These were duplicate/conflicting with the new dynamic system.

**Where to go**: Use the **Capacity Thresholds** tab instead (middle tab in Admin Configurations).

### Database Cleanup

Migration `20251031000005_cleanup_duplicate_capacity_configs.sql` removes old configs:

```sql
DELETE FROM application_config
WHERE key IN ('capacity_under_threshold', 'capacity_near_threshold', 'capacity_at_threshold');
```

### ApplicationSettings Component

Filters out any remaining capacity configs:

```typescript
const filteredData = (data || []).filter(
  config => !config.key.startsWith('capacity_')
);
```

---

## FAQ

### Q: Can I have more than 7 threshold levels?

**A:** Yes! Add as many as you want. The system supports unlimited levels.

### Q: Can I have fewer than 7 levels?

**A:** Yes! Delete levels you don't need. Minimum is 1 active threshold.

### Q: Do I need to restart the app after changing thresholds?

**A:** No, but **refresh the page** to see changes reflected in all views. Cache clears automatically on save.

### Q: What happens to existing capacity calculations?

**A:** Nothing breaks! The system just uses new colors/ranges. Historical data is unaffected.

### Q: Can I change colors for individual work types separately?

**A:** That's different - work type colors are in **Field Options** tab. Capacity thresholds apply to **percentage ranges** (0-100%), not work types.

### Q: Why are there 3 tabs now (Application Settings, Capacity Thresholds, Field Options)?

**A:** Different types of configuration:
- **Application Settings**: Banner title, view labels, org name
- **Capacity Thresholds**: Capacity percentage ranges and colors
- **Field Options**: Dropdown options for forms (work types, roles, etc.)

### Q: What if I mess up the ranges and create gaps?

**A:** The validation will catch it! You'll see an error message and won't be able to save until you fix it.

---

## Next Steps

### For Full Integration (Future Work)

Update these components to use dynamic thresholds:

1. ✅ **TeamCapacityCard** - DONE (uses `useCapacityThresholds()`)
2. ⏳ **BulkEffortEntry** - Add color-coded capacity header
3. ⏳ **TeamCapacityModal** - Add capacity visualization
4. ⏳ **PersonalWorkloadDashboard** - Color-code trend lines
5. ⏳ **WorkloadDashboard** - Update any capacity displays

**Estimated**: 2-3 hours to update remaining components

### Testing Checklist

- [ ] Add new threshold level in admin
- [ ] Verify no validation errors
- [ ] Save and refresh page
- [ ] Check TeamCapacityCard shows correct color
- [ ] Adjust threshold range
- [ ] Verify color changes apply
- [ ] Delete a threshold
- [ ] Verify remaining thresholds cover 0-100%+
- [ ] Test with edge cases (0%, 100%, 150%)

---

## Summary

**ONE PLACE** to manage capacity thresholds:
**Admin → Admin Configurations → Capacity Thresholds**

- ✅ Unlimited granularity
- ✅ Full color customization
- ✅ Visual preview
- ✅ Draft mode
- ✅ Validation
- ✅ Already integrated with TeamCapacityCard

No more duplicate/conflicting settings!
