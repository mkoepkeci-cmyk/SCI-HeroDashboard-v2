# Database Migration: Add EHRs Impacted and Service Line Fields

## SQL Commands to Run in Supabase

Open your Supabase SQL Editor and run these commands:

```sql
-- Add ehrs_impacted column to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS ehrs_impacted TEXT;

-- Add service_line column to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS service_line TEXT;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'initiatives'
AND column_name IN ('role', 'ehrs_impacted', 'service_line')
ORDER BY column_name;
```

## Expected Result

After running the SQL, you should see:

| column_name     | data_type |
|----------------|-----------|
| ehrs_impacted  | text      |
| role           | text      |
| service_line   | text      |

## What These Fields Store

### EHRs Impacted
Dropdown field with options:
- All
- Epic
- Cerner
- Altera
- Epic and Cerner

### Service Line
Free text field for values like:
- Ambulatory
- Pharmacy & Oncology
- Nursing
- Acute Institute & Cardiology
- Care Coordination
- Lab
- Imaging
- Other

## After Migration

Once you've run the SQL commands:

1. **Run the completed initiatives script:**
   ```bash
   npx tsx add-completed-initiatives.ts
   ```

   This will add 2 completed projects for Marty:
   - HRS Integration - Remote Patient Monitoring (Cerner Implementation)
   - Zoom Integration FHIR Migration

2. **Refresh the app** at http://localhost:5175

3. **Test the new fields:**
   - Go to Add Data
   - You should see "EHRs Impacted" and "Service Line" fields in Basic Information
   - Create or edit an initiative to test

## Total Initiatives for Marty After Migration

Marty will have **7 initiatives** organized by category:

### Project (4)
- ✅ HRS Integration - Remote Patient Monitoring (Cerner) - **Completed**
- ✅ Zoom Integration FHIR Migration - **Completed**
- 🔵 HRS Integration - Remote Patient Monitoring (Epic) - Active

### System Initiative (3)
- ✅ Abridge AI Pilot - **Completed**
- 🔵 Notable Health - RPM to API Migration - Active
- 🔵 Clinical Informatics Enterprise Website - Active

### General Support (1)
- 🔵 SDOH Standardization - Active

## Updating Existing Initiatives

If you want to add EHR and Service Line data to existing initiatives, you can update them via the form or run SQL:

```sql
-- Update Abridge
UPDATE initiatives
SET ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Abridge AI Pilot - Clinical Documentation Efficiency Analysis';

-- Update Notable
UPDATE initiatives
SET ehrs_impacted = 'Cerner',
    service_line = 'Ambulatory'
WHERE initiative_name = 'Notable Health - RPM to API Migration';

-- Update SDOH
UPDATE initiatives
SET ehrs_impacted = 'All',
    service_line = 'Ambulatory'
WHERE initiative_name LIKE 'Social Determinants of Health%';

-- Update CI Website
UPDATE initiatives
SET ehrs_impacted = 'All',
    service_line = 'Other'
WHERE initiative_name = 'Clinical Informatics Enterprise Website';

-- Update HRS Epic
UPDATE initiatives
SET ehrs_impacted = 'Epic',
    service_line = 'Ambulatory'
WHERE initiative_name = 'HRS Integration - Remote Patient Monitoring'
AND status = 'Active';
```

## Rollback (if needed)

If you need to remove these columns:

```sql
ALTER TABLE initiatives DROP COLUMN IF EXISTS ehrs_impacted;
ALTER TABLE initiatives DROP COLUMN IF EXISTS service_line;
ALTER TABLE initiatives DROP COLUMN IF EXISTS role;
```

Then revert the code changes.
