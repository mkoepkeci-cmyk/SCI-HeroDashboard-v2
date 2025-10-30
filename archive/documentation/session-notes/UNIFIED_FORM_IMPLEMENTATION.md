# UnifiedWorkItemForm Implementation Guide

**Status:** Ready to implement in next session
**Estimated Time:** 3-4 hours
**File:** `src/components/UnifiedWorkItemForm.tsx`

---

## Component Overview

### Purpose
Single form that combines GovernanceRequestForm (Tab 1) + InitiativeSubmissionForm (Tabs 2-4) into one 4-tab interface.

### Props Interface
```typescript
interface UnifiedWorkItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingInitiative?: InitiativeWithDetails;  // For editing existing initiatives
  linkedGovernanceRequest?: GovernanceRequest;  // For creating from governance request
}
```

### Data Loading Strategy
```typescript
// When editing existing initiative
if (editingInitiative) {
  // Load from initiatives table + related tables
  // Tab 1: Empty (governance fields) - backfill later
  // Tab 2-4: Pre-populated from existing data
}

// When creating from governance request
if (linkedGovernanceRequest) {
  // Load from governance_requests table
  // Tab 1: Pre-populated from governance request
  // Tab 2-4: Empty - fill as work begins
}

// When creating brand new
else {
  // All tabs empty
}
```

---

## Tab 1: Request Details (from GovernanceRequestForm)

### Fields - ALL OPTIONAL (No asterisks)

#### Basic Information
- `title` (text) - Initiative Title
- `division_region` (dropdown) - Division/Region options from DIVISION_REGIONS
- `submitter_name` (text) - Submitter Name
- `submitter_email` (email) - Submitter Email
- `system_clinical_leader` (text) - System Clinical Leader/Sponsor

#### System-Level Need
- `problem_statement` (textarea, 6 rows) - Problem Statement
- `desired_outcomes` (textarea, 5 rows) - Desired Outcomes

#### Value Proposition
- `patient_care_value` (textarea, 3 rows) - Patient Care Value
- `compliance_regulatory_value` (textarea, 3 rows) - Compliance/Regulatory Value
- `target_timeline` (text) - Target Timeline (e.g., "Q1 2026")
- `estimated_scope` (textarea, 3 rows) - Estimated Scope

#### Impact Metrics (Dynamic Array)
```typescript
interface Metric {
  metricName: string;
  metricType: string;  // Quality, Efficiency, Adoption, Financial, etc.
  unit: string;  // Percentage, Minutes, Count, Dollars, etc.
  baselineValue: string;
  baselineDate: string;
  currentValue: string;
  measurementDate: string;
  targetValue: string;
  improvement: string;
  measurementMethod: string;
}
```
- Array of metrics with Add/Remove buttons
- Each metric has 10 fields

#### Revenue & Financial Impact
- `projected_annual_revenue` (number) - Projected Annual Revenue
- `projection_basis` (text) - Projection Basis
- `calculation_methodology` (textarea, 3 rows) - Calculation Methodology
- `key_assumptions` (textarea, 3 rows) - Key Assumptions (one per line)

#### Category of Impact (Checkboxes)
- `impact_commonspirit_board_goal` (checkbox)
- `impact_commonspirit_2026_5for25` (checkbox)
- `impact_system_policy` (checkbox)
- `impact_patient_safety` (checkbox)
- `impact_regulatory_compliance` (checkbox)
- `impact_financial` (checkbox)
- `impact_other` (text) - Other (specify)
- `supporting_information` (textarea, 4 rows)

#### Groups Impacted (Checkboxes)
- `groups_nurses` (checkbox)
- `groups_physicians_apps` (checkbox)
- `groups_therapies` (checkbox)
- `groups_lab` (checkbox)
- `groups_pharmacy` (checkbox)
- `groups_radiology` (checkbox)
- `groups_administration` (checkbox)
- `groups_other` (text) - Other (specify)

#### Regional Impact & Timeline
- `regions_impacted` (text) - Regions Impacted
- `required_date` (date) - Required Date
- `required_date_reason` (text) - Required Date Reason

#### Additional Comments
- `additional_comments` (textarea, 5 rows)

### Data Mapping
**From governance_requests → formData:**
```typescript
const formData = {
  // Direct mappings
  title: linkedGovernanceRequest?.title || editingInitiative?.initiative_name || '',
  division_region: linkedGovernanceRequest?.division_region || editingInitiative?.governance_metadata?.division_region || '',
  problem_statement: linkedGovernanceRequest?.problem_statement || editingInitiative?.problem_statement || '',
  desired_outcomes: linkedGovernanceRequest?.desired_outcomes || editingInitiative?.desired_outcomes || '',
  // ... etc

  // From governance_metadata JSONB
  impact_commonspirit_board_goal: editingInitiative?.governance_metadata?.impact_categories?.board_goal || false,
  // ... etc
};
```

---

## Tab 2: Work Scope & Assignments (from InitiativeSubmissionForm Sections 1-2)

### Basic Information (Section 1)

#### Team Member Assignments (Dynamic Array)
```typescript
interface TeamMemberAssignment {
  id: string;
  name: string;
  role: 'Owner' | 'Co-Owner' | 'Secondary' | 'Support';
}
```
- Primary owner (dropdown - required)
- Additional team members with role selection
- Add/Remove buttons

#### Initiative Details
- `initiative_name` (text) - **REQUIRED**
- `type` (dropdown) - **REQUIRED** - Epic Gold, Governance, System Initiative, System Project, etc.
- `status` (dropdown) - **REQUIRED** - Not Started, In Progress, On Hold, Completed, Cancelled
- `phase` (dropdown) - Discovery/Define, Design, Build, Validate/Test, Deploy, etc.
- `work_effort` (dropdown) - XS, S, M, L, XL (NO XXL)
- `ehrs_impacted` (dropdown) - All, Epic, Cerner, Altera, Epic and Cerner
- `service_line` (dropdown) - Ambulatory, Pharmacy, Nursing, etc.

#### Timeline
- `start_date` (date)
- `end_date` (date)
- `timeframe_display` (text) - Custom display (e.g., "FY25-Q1 to Q3")

### Governance & Collaboration (Section 2)
- `clinical_sponsor_name` (text)
- `clinical_sponsor_title` (text)
- `governance_bodies` (textarea) - Comma-separated
- `key_collaborators` (textarea) - Comma-separated

### Special Field: direct_hours_per_week
- Only show if `type === 'Governance'`
- Number input
- Overrides capacity formula

---

## Tab 3: Proposed Solution & EHR Impact (NEW)

### Fields

#### Proposed Solution
- `proposed_solution` (textarea, 6 rows) - Proposed Solution

#### EHR Areas Impacted
- `ehr_areas_impacted` (textarea or multi-select) - EHR Areas/Modules Impacted
- Store as string array

#### Voting Statement
- `voting_statement` (textarea, 4 rows) - Voting Statement for Governance Committee

#### Journal Log (NEW FEATURE)

**Display:**
```
Journal Log
[Reverse chronological list of entries]

Oct 29, 2025 2:30 PM - Marty Haro
Met with clinical sponsor, agreed on Phase 1 timeline

Oct 28, 2025 10:15 AM - Marty Haro
Submitted to governance committee for review

[Text input for new entry]
[Add Entry button]
```

**Structure:**
```typescript
interface JournalEntry {
  timestamp: string;  // ISO 8601
  author: string;     // User's name
  author_id?: string; // User's ID
  entry: string;      // Entry text
}
```

**Implementation:**
```typescript
const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(
  editingInitiative?.journal_log || []
);
const [newJournalEntry, setNewJournalEntry] = useState('');

const addJournalEntry = () => {
  if (newJournalEntry.trim()) {
    const entry: JournalEntry = {
      timestamp: new Date().toISOString(),
      author: currentUser.name,  // Get from context/props
      author_id: currentUser.id,
      entry: newJournalEntry.trim()
    };
    setJournalEntries([entry, ...journalEntries]);  // Prepend (newest first)
    setNewJournalEntry('');
  }
};
```

**Rendering:**
```tsx
<div className="space-y-4">
  {/* Journal entries list */}
  <div className="space-y-3 max-h-96 overflow-y-auto">
    {journalEntries.map((entry, index) => (
      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-500 mb-1">
          {formatDateTime(entry.timestamp)} - {entry.author}
        </div>
        <div className="text-sm text-gray-900">
          {entry.entry}
        </div>
      </div>
    ))}
  </div>

  {/* Add new entry */}
  <div className="space-y-2">
    <textarea
      value={newJournalEntry}
      onChange={(e) => setNewJournalEntry(e.target.value)}
      placeholder="Add a journal entry (meetings, decisions, updates)..."
      className="w-full border border-gray-300 rounded-lg p-3"
      rows={3}
    />
    <button
      onClick={addJournalEntry}
      disabled={!newJournalEntry.trim()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      <Plus className="w-4 h-4 inline mr-2" />
      Add Entry
    </button>
  </div>
</div>
```

---

## Tab 4: Outcomes & Results (from InitiativeSubmissionForm Sections 3-7)

### Section 3: Impact Metrics (from related table)
- Same structure as Tab 1 metrics
- But these are loaded from `initiative_metrics` table
- Add/Edit/Delete metrics
- Save to `initiative_metrics` table

### Section 4: Revenue & Financial Impact (from related table)

**Projected Revenue (Blue Box)**
- `projected_annual` (number)
- `projection_basis` (text)

**Realized Revenue (Green Box)**
- `actual_revenue` (number)
- `actual_timeframe` (text)
- `measurement_start_date` (date)
- `measurement_end_date` (date)

**Methodology**
- `calculation_methodology` (textarea)
- `key_assumptions` (textarea, one per line)

**Data Source:** `initiative_financial_impact` table

### Section 5: Actual Performance Data (from related table)

- `users_deployed` (number)
- `total_potential_users` (number)
- `adoption_rate` (calculated: users_deployed / total_potential_users * 100)
- `primary_outcome` (textarea)
- `performance_measurement_method` (text)
- `sample_size` (text)
- `measurement_period` (text)
- `annual_impact_calculated` (text)
- `calculation_formula` (text)

**Data Source:** `initiative_performance_data` table

### Section 6: Projection Model (If Scaling) (from related table)

- `projection_scenario` (text)
- `projected_users` (number)
- `percent_of_organization` (number)
- `projected_dollar_value` (text)
- `projected_time_savings` (text)
- `revenue_impact` (text)
- `projection_calculation_method` (textarea)
- `projection_assumptions` (textarea)
- `sensitivity_notes` (text)
- `additional_benefits` (textarea)

**Data Source:** `initiative_projections` table

### Section 7: Impact Story (from related table)

- `challenge` (textarea)
- `approach` (textarea)
- `outcome` (textarea)
- `collaboration_detail` (textarea)

**Data Source:** `initiative_stories` table

---

## Save Logic

### Determine Which Tables to Update

```typescript
const handleSave = async () => {
  const updates: Promise<any>[] = [];

  // 1. Save main initiative record
  const initiativeData = {
    // Tab 1 fields (governance)
    problem_statement: formData.problem_statement || null,
    desired_outcomes: formData.desired_outcomes || null,
    governance_metadata: {
      division_region: formData.division_region,
      submitter: {
        name: formData.submitter_name,
        email: formData.submitter_email
      },
      impact_categories: {
        board_goal: formData.impact_commonspirit_board_goal,
        // ... etc
      },
      groups_impacted: {
        nurses: formData.groups_nurses,
        // ... etc
      },
      // ... all other Tab 1 fields
    },

    // Tab 2 fields
    initiative_name: formData.initiative_name,
    type: formData.type,
    status: formData.status,
    phase: formData.phase,
    work_effort: formData.work_effort,
    // ... etc

    // Tab 3 fields
    proposed_solution: formData.proposed_solution || null,
    voting_statement: formData.voting_statement || null,
    ehr_areas_impacted: formData.ehr_areas_impacted || [],
    journal_log: journalEntries,

    // Metadata
    updated_at: new Date().toISOString(),
    last_updated_by: currentUser.name
  };

  if (editingInitiative) {
    // UPDATE existing
    updates.push(
      supabase
        .from('initiatives')
        .update(initiativeData)
        .eq('id', editingInitiative.id)
    );
  } else {
    // INSERT new
    updates.push(
      supabase
        .from('initiatives')
        .insert(initiativeData)
    );
  }

  // 2. Save Tab 4 related tables (if data exists)
  if (metrics.length > 0) {
    // Delete existing metrics, insert new ones
    updates.push(
      supabase.from('initiative_metrics').delete().eq('initiative_id', initiativeId),
      supabase.from('initiative_metrics').insert(metrics.map(m => ({
        initiative_id: initiativeId,
        ...m
      })))
    );
  }

  // Similar for financial_impact, performance_data, projections, stories

  // 3. Execute all updates
  await Promise.all(updates);

  onSuccess();
};
```

---

## Validation Logic

### Tab 1: No validation (all optional)

### Tab 2: Required fields
```typescript
const validateTab2 = () => {
  const errors: Record<string, string> = {};

  if (!formData.initiative_name?.trim()) {
    errors.initiative_name = 'Initiative name is required';
  }

  if (!formData.type) {
    errors.type = 'Work type is required';
  }

  if (!formData.status) {
    errors.status = 'Status is required';
  }

  return errors;
};
```

### Tab 3: No validation (all optional)

### Tab 4: No validation (all optional)

---

## UI Structure

```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
    {/* Header */}
    <div className="border-b border-gray-200 p-6">
      <h2 className="text-2xl font-bold">
        {editingInitiative ? 'Edit Initiative' : 'New Initiative'}
      </h2>
    </div>

    {/* Tab Navigation */}
    <div className="border-b border-gray-200 px-6">
      <div className="flex space-x-4">
        <button
          className={`py-3 px-4 ${activeTab === 'tab1' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tab1')}
        >
          Request Details
        </button>
        <button
          className={`py-3 px-4 ${activeTab === 'tab2' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tab2')}
        >
          Work Scope & Assignments
        </button>
        <button
          className={`py-3 px-4 ${activeTab === 'tab3' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tab3')}
        >
          Proposed Solution
        </button>
        <button
          className={`py-3 px-4 ${activeTab === 'tab4' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tab4')}
        >
          Outcomes & Results
        </button>
      </div>
    </div>

    {/* Tab Content */}
    <div className="flex-1 overflow-y-auto p-6">
      {activeTab === 'tab1' && <Tab1Content />}
      {activeTab === 'tab2' && <Tab2Content />}
      {activeTab === 'tab3' && <Tab3Content />}
      {activeTab === 'tab4' && <Tab4Content />}
    </div>

    {/* Footer Actions */}
    <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Initiative'}
      </button>
    </div>
  </div>
</div>
```

---

## Key Implementation Notes

### 1. Copy Field Components from Existing Forms
- Don't recreate from scratch
- Copy dropdown JSX from InitiativeSubmissionForm.tsx
- Copy textarea JSX from GovernanceRequestForm.tsx
- Maintain exact styling

### 2. Metrics Array Handling
- Tab 1 metrics go to `governance_metadata.impact_metrics` (JSONB)
- Tab 4 metrics go to `initiative_metrics` table (separate rows)
- Different structures, don't confuse them

### 3. Governance Metadata Storage
- Store ALL Tab 1 data in `governance_metadata` JSONB field
- Plus individual fields: `problem_statement`, `desired_outcomes`
- Dual storage for key fields (searchability)

### 4. Journal Log Auto-Author
- Need current user context
- Pass as prop or use context/hook
- Auto-populate `author` and `author_id`

### 5. Related Tables (Tab 4)
- Load separately (not in main initiative query)
- Use LEFT JOINs or separate queries
- Handle null gracefully (no data yet)

---

## Next Session Checklist

1. ✅ Copy imports from both existing forms
2. ✅ Create component skeleton with props interface
3. ✅ Set up state for all form fields
4. ✅ Create tab navigation UI
5. ✅ Implement Tab 1 (copy from GovernanceRequestForm, remove asterisks)
6. ✅ Implement Tab 2 (copy from InitiativeSubmissionForm sections 1-2)
7. ✅ Implement Tab 3 (new - proposed solution + journal log)
8. ✅ Implement Tab 4 (copy from InitiativeSubmissionForm sections 3-7)
9. ✅ Implement data loading logic (editingInitiative vs linkedGovernanceRequest)
10. ✅ Implement save logic (update initiatives + related tables)
11. ✅ Test with existing initiative (Tab 1 empty, Tab 2-4 populated)
12. ✅ Test with new initiative (all tabs empty)
13. ✅ Test journal log feature
14. ✅ Wire up to BulkEffortEntry edit button
15. ✅ Wire up to Add Initiative buttons
16. ✅ Deprecate InitiativeSubmissionForm

---

## File to Reference

**Source Forms:**
- `src/components/GovernanceRequestForm.tsx` - Tab 1 source
- `src/components/InitiativeSubmissionForm.tsx` - Tabs 2-4 source

**Create:**
- `src/components/UnifiedWorkItemForm.tsx` - New unified form

**Update:**
- `src/components/BulkEffortEntry.tsx` - Wire up edit button
- `src/App.tsx` (or PersonalWorkloadDashboard.tsx) - Update imports

**Database Migrations Already Applied:**
- `20251029000000_unified_form_support.sql` - Tab 1 fields
- `20251029000001_add_tab3_fields.sql` - Tab 3 fields (APPLY THIS NEXT)

---

**Ready for implementation in next session!**
