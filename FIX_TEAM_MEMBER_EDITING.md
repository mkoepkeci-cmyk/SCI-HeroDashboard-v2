# Fix: Team Member Profile Editing - Service Lines Not Loading

**Issue**: When editing a staff profile, service line assignments were not loading and appeared blank, causing them to be cleared when saving.

## Root Causes

### 1. Missing Type Definition
The `TeamMember` interface in `src/lib/supabase.ts` was missing the `is_active` field.

**Fixed**: Added `is_active?: boolean;` to the TeamMember interface (line 30).

### 2. Insufficient Specialty Field Parsing
The `handleEdit` function in `TeamManagementPanel.tsx` only checked if `member.specialty` was an array, but didn't handle cases where PostgreSQL returns the `text[]` field as a JSON string.

**Fixed**: Enhanced the specialty parsing logic to handle multiple formats:
- Native array (preferred)
- JSON-stringified array
- Single string value
- Null/undefined

## Files Changed

### 1. `src/lib/supabase.ts`
```typescript
export interface TeamMember {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  manager_id?: string;
  role: string;
  specialty?: string[];
  is_active?: boolean;       // ← ADDED
  total_assignments: number;
  revenue_impact?: string;
  created_at: string;
  updated_at: string;
}
```

### 2. `src/components/TeamManagementPanel.tsx`
Enhanced `handleEdit` function (lines 40-77) to:
- Log incoming data for debugging
- Parse specialty field from multiple possible formats
- Handle JSON strings, arrays, and single values
- Ensure empty array when specialty is null/undefined

## What This Fixes

✅ Service lines now load correctly when editing a team member
✅ Service lines are preserved when saving edits
✅ No more accidental unassignment of service lines
✅ Consistent data handling regardless of database return format
✅ Better debugging with console logs

## Testing

1. Edit an existing team member with service lines assigned
2. Verify service line checkboxes are checked in the edit form
3. Make changes (e.g., change name)
4. Save
5. Verify service lines are still assigned

## Technical Details

**Database Schema**: `team_members.specialty` is `text[]` (PostgreSQL array)

**Supabase Behavior**: The `text[]` field can be returned as:
- Native JavaScript array: `["Ambulatory", "Nursing"]`
- JSON string: `"[\"Ambulatory\",\"Nursing\"]"`

The enhanced parsing handles both cases automatically.
