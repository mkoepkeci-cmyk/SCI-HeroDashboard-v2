# Adding Role Field to Initiatives

## Database Migration Required

To complete the addition of the "Role" field to the Add Data form, you need to add a column to the `initiatives` table in Supabase.

### Step 1: Open Supabase SQL Editor

1. Go to https://fiyaolxiarzkihlbhtmz.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run This SQL Command

```sql
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS role TEXT;
```

### Step 3: Verify the Change

After running the SQL command, you can verify it worked by running:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'initiatives'
AND column_name = 'role';
```

You should see:
- column_name: `role`
- data_type: `text`

## What This Does

This adds a new optional text column called `role` to the `initiatives` table that will store one of these values:
- Primary
- Co-Owner
- Secondary
- Support

## Code Changes Already Made

The following files have been updated:

### 1. Form UI (`src/components/InitiativeSubmissionForm.tsx`)
- Added `role` field to formData state
- Added Role dropdown after Team Member in the Basic Information section
- Added role to the database submission data

### 2. TypeScript Interface (`src/lib/supabase.ts`)
- Added `role?: string` to the Initiative interface

### 3. Form Layout
The Role field appears in the form as:

```
┌─────────────────┬─────────────────┐
│ Team Member     │ Role            │
│ [dropdown]      │ [dropdown]      │
├─────────────────┴─────────────────┤
│ Owner *                           │
│ [text input]                      │
└───────────────────────────────────┘
```

Role options:
- Select role (optional)
- Primary
- Co-Owner
- Secondary
- Support

## After Migration

Once you've run the SQL command in Supabase:

1. The form will automatically work with the new field
2. You can select a role when creating new initiatives
3. Existing initiatives will have null/empty role values
4. The role field is optional (not required)

## Testing

After adding the column:

1. Refresh the app at http://localhost:5175
2. Click "Add Data"
3. You should see the new "Role" dropdown after "Team Member"
4. Create a test initiative with a role selected
5. Verify it saves correctly

## Updating Existing Initiatives

If you want to add roles to Marty's existing initiatives, you can run SQL updates like:

```sql
-- Update specific initiatives
UPDATE initiatives
SET role = 'Primary'
WHERE initiative_name = 'HRS Integration - Remote Patient Monitoring';

UPDATE initiatives
SET role = 'Primary'
WHERE initiative_name = 'Notable Health - RPM to API Migration';

-- Or update all of Marty's initiatives at once
UPDATE initiatives
SET role = 'Primary'
WHERE owner_name = 'Marty';
```

## Rollback (if needed)

If you need to remove the column:

```sql
ALTER TABLE initiatives DROP COLUMN IF EXISTS role;
```

Then you'd need to revert the code changes.
