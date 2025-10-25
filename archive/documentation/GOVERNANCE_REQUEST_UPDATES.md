# Governance Request Form Updates

## Summary

Updated the governance request portal to include comprehensive intake fields for system-level requests and renamed "Governance" to "SCI Consultant Request" throughout the application.

## Date

October 15, 2025

---

## Changes Made

### 1. Database Schema Updates

**Migration**: `20250116000000_add_governance_request_fields.sql`

Added the following fields to the `governance_requests` table:

#### Category of Impact (Checkboxes)
- `impact_commonspirit_board_goal` (BOOLEAN)
- `impact_commonspirit_2026_5for25` (BOOLEAN)
- `impact_system_policy` (BOOLEAN)
- `impact_patient_safety` (BOOLEAN)
- `impact_regulatory_compliance` (BOOLEAN)
- `impact_financial` (BOOLEAN)
- `impact_other` (TEXT) - Free text for "Other:" option

#### Supporting Information
- `supporting_information` (TEXT) - Regulatory, policy, practice guidelines, etc.

#### Groups Impacted (Checkboxes)
- `groups_nurses` (BOOLEAN)
- `groups_physicians_apps` (BOOLEAN)
- `groups_therapies` (BOOLEAN)
- `groups_lab` (BOOLEAN)
- `groups_pharmacy` (BOOLEAN)
- `groups_radiology` (BOOLEAN)
- `groups_administration` (BOOLEAN)
- `groups_other` (TEXT) - Free text for "Other:" option

#### Regional Impact
- `regions_impacted` (TEXT) - All regions or specific list

#### Required Date
- `required_date` (DATE) - Required date for problem resolution
- `required_date_reason` (TEXT) - Reason (regulation effective, policy effective, etc.)

#### Additional Comments
- `additional_comments` (TEXT) - Any additional information

### 2. TypeScript Type Updates

**File**: `src/lib/supabase.ts`

Updated the `GovernanceRequest` interface to include all new fields with proper types.

### 3. Form Component Updates

**File**: `src/components/GovernanceRequestForm.tsx`

#### New Form Sections Added:

1. **Category of Impact Section**
   - Checkboxes for each impact category
   - "Other" text field for custom categories
   - Supporting information textarea
   - Note: "Check all that apply. These should be demonstrable if checked."

2. **Groups Impacted by Problem Section**
   - Checkboxes for each group
   - "Other" text field for custom groups
   - Note: "Please ensure that each group is aware and supports the request."

3. **Regional Impact & Timeline Section**
   - Regions impacted text field
   - Required date field (date picker)
   - Required date reason text field

4. **Additional Comments Section**
   - Large textarea for any additional information

#### Form State Management:
- Added all new fields to form state
- Updated `handleChange` to support both string and boolean values
- Updated both `handleSaveDraft` and `handleSubmitForReview` to save all new fields

### 4. Naming Convention Changes

Updated from "Governance" to "SCI Consultant Request" in:

1. **InitiativeSubmissionForm.tsx**
   - Changed type dropdown option from "Governance" to "SCI Consultant Request"
   - Updated indicator text for initiatives created from requests

2. **GovernanceRequestForm.tsx**
   - Updated modal title: "System-Level SCI Consultant Request"
   - Updated form header: "New System-Level SCI Consultant Request" / "Edit SCI Consultant Request"
   - Updated success messages to say "SCI consultant request" instead of "Governance request"

---

## Form Field Details

### Category of Impact

**Purpose**: Identify demonstrable impact categories for the request

**Fields**:
- CommonSpirit Board Goal
- CommonSpirit 2026 or 5 for '25
- System Policy
- Patient Safety
- Regulatory Compliance
- Financial
- Other: [free text]

**Supporting Information**: Textarea for regulatory, policy, practice guidelines, etc.

### Groups Impacted by Problem

**Purpose**: Ensure stakeholder awareness and support

**Fields**:
- Nurses
- Physicians/APPs
- Therapies
- Lab
- Pharmacy
- Radiology
- Administration
- Other: [free text]

### Regional Impact & Timeline

**Purpose**: Define scope and urgency

**Fields**:
- Regions impacted (e.g., "All regions (South, Mountain, Northwest, California, Central)")
- Required date for problem resolution (date picker)
- Reason for required date (e.g., "CMS regulation effective date", "Joint Commission requirement")

### Additional Comments

**Purpose**: Capture any additional context not covered by other fields

**Field**: Large textarea for freeform text

---

## User Experience Flow

1. User opens "New SCI Consultant Request" form
2. Confirms system-level scope (unchanged)
3. Fills out basic information (unchanged)
4. Fills out problem statement and outcomes (unchanged)
5. Fills out value proposition (unchanged)
6. **NEW**: Adds impact metrics (structured data)
7. **NEW**: Fills out revenue & financial impact
8. **NEW**: Selects category of impact checkboxes and adds supporting information
9. **NEW**: Selects groups impacted checkboxes
10. **NEW**: Specifies regional impact and required dates
11. **NEW**: Adds any additional comments
12. Saves as draft or submits for review

---

## Testing Checklist

- [x] Database migration applied successfully
- [x] TypeScript types updated and compiling
- [x] Form displays all new fields correctly
- [x] Checkboxes work and save properly
- [x] Text fields save and load correctly
- [x] Date picker works for required date
- [x] Form state management handles all fields
- [x] Draft save includes all new fields
- [x] Submit for review includes all new fields
- [x] Edit mode loads all fields correctly
- [x] Naming updated throughout application

---

## Files Modified

1. `supabase/migrations/20250116000000_add_governance_request_fields.sql` - **NEW**
2. `src/lib/supabase.ts` - Updated GovernanceRequest interface
3. `src/components/GovernanceRequestForm.tsx` - Added new form sections and updated naming
4. `src/components/InitiativeSubmissionForm.tsx` - Updated type dropdown and naming

---

## Next Steps

### Optional Enhancements:

1. **Validation**: Add validation to ensure at least one impact category is selected
2. **Conditional Fields**: Show/hide fields based on selections (e.g., require supporting info if "Regulatory Compliance" is checked)
3. **Help Text**: Add tooltips or help icons to explain each field
4. **Display in Detail View**: Update GovernanceRequestDetail component to display all new fields
5. **Export/Print**: Include new fields in any export or print functionality

---

## Questions for User

1. Should any of these fields be **required** instead of optional?
2. Should we add validation requiring supporting information when certain impact categories are checked?
3. Do you want to display these fields in the request detail view?
4. Should we update any reporting or analytics to include these new fields?

---

## Completion Status

✅ All database fields added
✅ All TypeScript types updated
✅ All form fields implemented and functional
✅ All naming conventions updated
✅ Migration applied to database
✅ Form saves and loads all fields correctly

**Status**: Complete and ready for testing
