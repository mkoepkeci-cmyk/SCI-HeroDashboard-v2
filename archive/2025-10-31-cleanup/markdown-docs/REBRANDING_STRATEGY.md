# Rebranding Strategy: SCI Dashboard → GovernIQ Enterprise

## Goal
Transform from healthcare-specific "System Clinical Informatics Dashboard" to general-purpose "GovernIQ Enterprise Management Dashboard"

---

## Terminology Mapping

### PRIMARY REBRANDING

| OLD (Healthcare-Specific) | NEW (Generic Enterprise) |
|---------------------------|--------------------------|
| System Clinical Informatics (SCI) | Staff / Team Members |
| SCI View | Staff View |
| Team View | Manager's View |
| SCI Capacity Definition Calculator | Staff Capacity Calculator |
| System CIs | Staff Members |
| SCIs | Staff |
| Clinical Sponsor | Project Sponsor |
| Service Line | Department / Business Unit |
| EHR Platform | System Platform |
| Governance Portal | Request Intake Portal |
| SCI Requests | Consultation Requests |

### CONFIGURATION LABELS

| Component | OLD Label | NEW Label |
|-----------|-----------|-----------|
| Calculator Settings | "Configure weights and thresholds for System Clinical Informatics capacity calculations" | "Configure weights and thresholds for staff capacity calculations" |
| Workload View Toggle | "SCI View" | "Staff View" |
| Workload View Toggle | "Team View" | "Manager's View" |
| Application Banner | "System Clinical Informatics" | "GovernIQ" |
| Organization Name | "CommonSpirit Health" | "Sample Healthcare" |

---

## Files to Update

### HIGH PRIORITY (User-Facing)

1. **WorkloadCalculatorSettings.tsx**
   - Header title
   - Description text
   - Help text

2. **App.tsx**
   - View toggle labels
   - Navigation labels
   - Tab names

3. **BulkEffortEntry.tsx**
   - Column headers
   - View title

4. **TeamCapacityView.tsx**
   - View title
   - Filter labels

5. **GovernancePortalView.tsx**
   - Portal name
   - Request labels

6. **GovernanceRequestDetail.tsx**
   - Assignment labels
   - Field labels

7. **GovernanceRequestForm.tsx**
   - Form labels
   - Field descriptions

8. **SCIRequestsCard.tsx**
   - Card title (rename file too)
   - Content labels

### MEDIUM PRIORITY (Configuration)

9. **application_config seeds** (Migration 20251031000002)
   - Already updated: banner_title → "GovernIQ"
   - Already updated: organization_name → "Sample Healthcare"
   - Need to update: view labels

10. **workload_calculator_config seeds** (Migration 20251026000001)
    - Description text

### LOW PRIORITY (Documentation)

11. **CLAUDE.md** - Update for future reference
12. **README.md** - Update project description

---

## Implementation Strategy

### Phase 1: Dynamic Configuration (DONE ✅)
- ✅ Application banner: "GovernIQ"
- ✅ Organization: "Sample Healthcare"
- ⚠️ View labels stored in DB but not yet applied in UI

### Phase 2: UI Component Updates (TODO)
- Update hardcoded "SCI" references in React components
- Wire up dynamic view labels from application_config
- Rename SCIRequestsCard → RequestsCard

### Phase 3: Calculator Configuration (TODO)
- Update WorkloadCalculatorSettings header/description
- Update help text to be generic

### Phase 4: Governance Portal (TODO)
- Rebrand "SCI Requests" → "Consultation Requests"
- Update all form labels

### Phase 5: Field Options (TODO)
- Consider renaming "service_line" → "department"
- Consider renaming "ehr_platform" → "system_platform"

---

## Why View Labels Aren't Working Yet

**Current State:**
- `application_config` table has these records:
  - `workload_staff_view_label` = "Staff View"
  - `workload_manager_view_label` = "Manager's View"

**Problem:**
- Components have HARDCODED strings like "SCI View" and "Team View"
- They're not loading from `application_config` table

**Solution:**
- Create `useApplicationConfig()` hook
- Load config values on app startup
- Replace hardcoded strings with config values

---

## Breaking Changes to Consider

### Option A: Minimal Disruption (RECOMMENDED)
- Keep database field names as-is
- Only update UI labels
- Maintain backward compatibility

### Option B: Full Rebrand
- Rename database fields (service_line → department)
- Requires data migration
- Higher risk

**Recommendation: Option A** - UI-only changes for now

---

## Next Steps

1. Create `useApplicationConfig()` hook
2. Update App.tsx to load config on mount
3. Replace all "SCI View" with dynamic `config.workload_staff_view_label`
4. Replace all "Team View" with dynamic `config.workload_manager_view_label`
5. Update WorkloadCalculatorSettings description
6. Rename SCIRequestsCard component
7. Update governance portal labels

