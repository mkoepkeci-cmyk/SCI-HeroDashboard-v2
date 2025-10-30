# Strategic Database Analysis & Recommendations
**SCI Hero Dashboard - Vision Alignment & Structure Optimization**

**Date:** October 29, 2025
**Author:** Strategic Analysis for Production Deployment
**Scope:** Complete evaluation of database structure against organizational vision

---

## Executive Summary

After thorough analysis of your vision, current codebase, and the existing audit document, I have **good news and challenging news**.

**Good News:** Your current database structure is actually **much better than the audit suggests**. The system is well-designed for your vision.

**Challenging News:** To fully realize your vision of "one continuous thing" from intake → governance → initiative → metrics → completion, we need **strategic consolidation**, but it's more nuanced than simply merging tables.

**Key Finding:** The audit document was **partially incorrect**. What it labeled as "redundant tables" are actually:
1. **Temporary migration artifacts** (will be removed after Google Sheets sync ends)
2. **Properly normalized one-to-many relationships** (required for relational databases)
3. **Separate workflows by design** (governance intake ≠ full initiative tracking)

However, **you are right** that there's an opportunity to streamline the "three separate things" into "one continuous thing."

---

## Your Vision (Restated for Clarity)

### The Complete Lifecycle
```
1. REQUEST comes in (problem, value, desired outcome)
   ↓
2. SCI LEADER evaluates readiness + assigns SCI
   ↓
3. SCI partners with leader to refine the request
   ↓
4. REQUEST becomes GOVERNANCE TICKET (approved to proceed)
   ↓
5. SCI tracks INITIATIVE through design → build → deploy → deliver
   ↓
6. METRICS tracked: baseline → current → target
   ↓
7. SUCCESS STORY documented (challenge → approach → outcome)
   ↓
8. HERO DASHBOARD displays: impact, team productivity, bragging rights
```

### Key Requirements
- **Single comprehensive table** for full lifecycle tracking
- **Separate tracking** for:
  - EHR Governance Tickets (the main workflow above)
  - General Support (ongoing work, no governance ticket)
  - Epic Gold work (groups, consultations)
  - Market Projects (may lead to governance tickets)
- **Effort tracking** against ALL work (governance tickets, support, Epic Gold, etc.)
- **Capacity management** showing workload balance across all work types
- **Manager dashboard** for workload rebalancing
- **Hero dashboard** showing total team impact

### Critical Constraint
- **Do not wreck existing functionality:**
  - Effort tracking and capacity calculation
  - Manager workload views
  - Team productivity reporting
  - Google Sheets migration (until complete)

---

## Current State Analysis

### What We Have (19 Tables)

#### Core People & Teams (5 tables)
1. `team_members` - 16 SCIs ✅
2. `managers` - 2 managers ✅
3. `assignments` - Legacy (sync from Google Sheets) ⚠️
4. `work_type_summary` - Aggregate (sync from Google Sheets) ⚠️
5. `ehr_platform_summary` - Aggregate (sync from Google Sheets) ⚠️

#### Initiative System (6 tables)
6. `initiatives` - 409 initiatives ✅ PRIMARY TABLE
7. `initiative_metrics` - 6 rows (1.4% of initiatives)
8. `initiative_financial_impact` - 3 rows (0.7%)
9. `initiative_performance_data` - 3 rows (0.7%)
10. `initiative_projections` - 2 rows (0.5%)
11. `initiative_stories` - 354 rows (83%)

#### Governance Portal (4 tables)
12. `governance_requests` - 3 requests (intake workflow)
13. `governance_attachments`
14. `governance_links`
15. `governance_comments`

#### Effort & Capacity (3 tables)
16. `effort_logs` - 55 rows (weekly time tracking) ✅ CRITICAL
17. `workload_calculator_config` - 33 rows (capacity formula weights) ✅ CRITICAL
18. `dashboard_metrics` - Pre-calculated metrics (sync from Google Sheets) ⚠️

#### Supporting (1 table)
19. `key_highlights` - Team member highlights

### The "Three Separate Things" Problem

You're absolutely right that this feels disjointed:

**Thing 1:** `governance_requests` table
- **Form:** GovernanceRequestForm.tsx (intake)
- **Purpose:** Simple business case (problem, value, outcome)
- **Status:** Draft → Ready for Review

**Thing 2:** `governance_requests` table (same table, later workflow)
- **Form:** GovernanceRequestDetail.tsx (SCI assignment)
- **Purpose:** SCI assignment + readiness evaluation
- **Status:** Ready for Review → Ready for Governance

**Thing 3:** `initiatives` table (separate table!)
- **Form:** InitiativeSubmissionForm.tsx (full initiative)
- **Purpose:** Complete initiative tracking with 7 sections
- **Status:** Not Started → In Progress → Completed

**The Disconnect:**
- User fills out intake (governance_requests)
- Phase 1 auto-creates minimal initiative
- Phase 2 auto-populates initiative from request
- User must then use DIFFERENT FORM (InitiativeSubmissionForm) to add metrics, financials, stories

**Your Vision:** This should be ONE CONTINUOUS FORM/TABLE that evolves from intake → full initiative

---

## The Real Problem (Not What the Audit Said)

### What the Audit Got WRONG

The audit claimed these are redundant:
- ❌ `work_type_summary` - Actually an aggregate for Google Sheets sync (temporary)
- ❌ `dashboard_metrics` - Actually pre-calculated for Google Sheets sync (temporary)
- ❌ `assignments` - Actually legacy data from original Excel (temporary)

**Truth:** These will be removed AFTER Google Sheets migration completes. They're not redundant, they're **temporary**.

The audit claimed initiative subtables should be merged:
- ❌ `initiative_metrics` should be JSON in initiatives table
- ❌ `initiative_financial_impact` should be JSON in initiatives table

**Truth:** These are **properly normalized one-to-many relationships**. You can have MULTIPLE metrics per initiative, MULTIPLE projections, etc. Can't flatten to single row.

### What the Audit Got RIGHT (Partially)

The audit identified that `governance_requests` and `initiatives` feel like separate workflows.

**BUT** the audit recommended keeping them separate. **YOU are right** - they should be unified.

---

## Proposed Solution: The Unified Lifecycle Table

### Concept: One Table, Multiple Stages

Instead of `governance_requests` (intake) → `initiatives` (full tracking), we have:

**One table:** `work_items` (or keep name `initiatives` for backwards compatibility)

**Stages tracked by status:**
```
Intake Stage:
- Draft
- Ready for Review (SCI assignment happens here)

Governance Stage:
- Ready for Governance (Phase 2 populates details)
- Governance Approved
- Governance Rejected

Execution Stage:
- Not Started
- In Progress
- On Hold

Completion Stage:
- Completed
- Cancelled
```

### Work Type Categorization (Your Vision)

**Category 1: EHR Governance Tickets** (Main workflow)
- `type` = "Governance Ticket" or "System Initiative"
- Full lifecycle: Intake → Governance → Execution → Completion
- Requires: Governance approval before execution
- Effort tracked: Yes
- Metrics tracked: Yes
- Success story: Yes

**Category 2: General Support** (Ongoing work)
- `type` = "General Support"
- No governance approval needed
- Start immediately at "In Progress"
- Effort tracked: Yes
- Metrics tracked: No (consultative work)
- Success story: Optional

**Category 3: Epic Gold** (Groups, consultations)
- `type` = "Epic Gold"
- No governance approval needed
- May start/stop multiple times
- Effort tracked: Yes
- Metrics tracked: Optional
- Success story: Optional

**Category 4: Market Projects** (May lead to governance)
- `type` = "Market Project"
- May convert to Governance Ticket later
- Effort tracked: Yes
- Metrics tracked: Yes
- Success story: Yes

### Schema Design: Unified Work Items Table

```sql
CREATE TABLE work_items (
  -- Identity
  id UUID PRIMARY KEY,
  item_id TEXT UNIQUE,  -- GOV-2025-001, INIT-2025-042, SUPP-2025-010
  title TEXT NOT NULL,

  -- Type & Category
  work_type TEXT NOT NULL,
    -- Governance Ticket, General Support, Epic Gold, Market Project,
    -- System Initiative, System Project, Policy/Guidelines, Ticket
  work_category TEXT NOT NULL,
    -- governance_workflow (requires approval)
    -- ongoing_support (no approval)
    -- consultation (no approval)
    -- project (may require approval)

  -- Ownership
  owner_id UUID REFERENCES team_members(id),
  owner_name TEXT,
  assigned_sci_id UUID REFERENCES team_members(id),
  assigned_sci_name TEXT,

  -- Status & Stage
  lifecycle_stage TEXT NOT NULL,
    -- intake, governance, execution, completion
  status TEXT NOT NULL,
    -- Draft, Ready for Review, Ready for Governance, Governance Approved,
    -- Not Started, In Progress, On Hold, Completed, Cancelled

  -- Intake Information (filled at intake)
  requestor_name TEXT,
  requestor_email TEXT,
  division_region TEXT,
  problem_statement TEXT,
  desired_outcomes TEXT,
  system_clinical_leader TEXT,

  -- Business Case (filled at intake)
  patient_care_value TEXT,
  compliance_regulatory_value TEXT,
  financial_impact TEXT,
  estimated_scope TEXT,
  target_timeline TEXT,

  -- Impact Assessment (filled at review)
  impact_types TEXT[],  -- ['board_goal', '2026_5for25', 'system_policy', ...]
  affected_groups TEXT[],  -- ['nurses', 'physicians', 'pharmacy', ...]

  -- Governance Details (filled when ready for governance)
  voting_bodies TEXT[],
  voting_statement TEXT,
  impacted_ehr_areas TEXT[],
  proposed_solution TEXT,

  -- Assignment & Scoring (filled at assignment)
  benefit_score INTEGER,
  effort_score INTEGER,
  total_score INTEGER,
  priority_rank INTEGER,

  -- Classification (filled during execution)
  role TEXT,  -- Owner, Co-Owner, Secondary, Support
  work_effort TEXT,  -- XS, S, M, L, XL, XXL
  phase TEXT,  -- Discovery, Design, Build, Test, Deploy, etc.
  ehrs_impacted TEXT,
  service_line TEXT,

  -- Timeline
  start_date DATE,
  end_date DATE,
  timeframe_display TEXT,

  -- Collaboration
  clinical_sponsor_name TEXT,
  clinical_sponsor_title TEXT,
  key_collaborators TEXT[],
  governance_bodies_involved TEXT[],

  -- Capacity Planning
  direct_hours_per_week NUMERIC,  -- Override for Governance work

  -- Workflow Dates
  submitted_date TIMESTAMP,
  reviewed_date TIMESTAMP,
  governance_approved_date TIMESTAMP,
  started_date TIMESTAMP,
  completed_date TIMESTAMP,

  -- Meta
  is_active BOOLEAN DEFAULT true,
  is_draft BOOLEAN DEFAULT true,
  completion_percentage INTEGER DEFAULT 0,
  completion_status JSONB,
  section_last_updated JSONB,
  last_updated_by TEXT,

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Related Tables (Keep Separate - Proper Normalization)

**One-to-Many Relationships (can't flatten):**
```sql
-- Multiple metrics per work item
work_item_metrics (
  id, work_item_id, metric_name, baseline, current, target, ...
)

-- Multiple financial impacts per work item
work_item_financial_impact (
  id, work_item_id, actual_revenue, projected_annual, methodology, ...
)

-- Multiple performance data points per work item
work_item_performance_data (
  id, work_item_id, users_deployed, adoption_rate, outcomes, ...
)

-- Multiple scaling projections per work item
work_item_projections (
  id, work_item_id, scenario, projected_users, roi, ...
)

-- Multiple success stories per work item
work_item_stories (
  id, work_item_id, challenge, approach, outcome, collaboration, ...
)

-- Multiple attachments per work item
work_item_attachments (
  id, work_item_id, file_name, file_url, uploaded_by, ...
)

-- Multiple links per work item
work_item_links (
  id, work_item_id, link_type, url, description, ...
)

-- Multiple comments per work item
work_item_comments (
  id, work_item_id, comment_text, author_id, created_at, ...
)
```

**Effort Tracking (keep unchanged):**
```sql
-- CRITICAL: Do not modify - capacity calculation depends on this
effort_logs (
  id, work_item_id, team_member_id, week_start_date,
  hours_spent, effort_size, note, created_at, updated_at
)
```

**Capacity Configuration (keep unchanged):**
```sql
-- CRITICAL: Do not modify - capacity formula depends on this
workload_calculator_config (
  id, config_type, key, value, label, display_order, is_active
)
```

---

## The Unified Form Experience

### One Progressive Form, Multiple Stages

**Stage 1: Intake (Simple)**
```
Form: Unified Work Item Form (Intake Mode)
Visible Fields:
- Work Type selector (Governance Ticket, General Support, Epic Gold, Market Project)
- Title
- Requestor info
- Problem statement
- Desired outcomes
- Business case (value, impact, scope, timeline)

Auto-set:
- lifecycle_stage = "intake"
- status = "Draft"
- is_draft = true

Action: Submit for Review
  → status = "Ready for Review"
```

**Stage 2: Assignment & Review**
```
Form: Unified Work Item Form (Review Mode)
Additional Fields Visible:
- SCI assignment dropdown
- Impact types (checkboxes)
- Affected groups (checkboxes)
- Benefit/effort scoring
- Priority ranking

Actions:
- Assign SCI
  → assigned_sci_id populated
  → NOW appears in assigned SCI's "My Effort" table
  → Can start logging hours immediately

- Mark Ready for Governance (if governance workflow)
  → lifecycle_stage = "governance"
  → status = "Ready for Governance"
  → Triggers auto-population of governance details
```

**Stage 3: Governance Preparation** (Only for Governance Tickets)
```
Form: Unified Work Item Form (Governance Mode)
Additional Fields Visible:
- Voting bodies
- Voting statement
- Impacted EHR areas
- Proposed solution

Action: Submit to Governance
  → status = "Submitted to Governance"
  → Awaiting external governance approval
```

**Stage 4: Execution** (All Work Types)
```
Form: Unified Work Item Form (Execution Mode)
Additional Fields Visible:
- Classification (role, work effort, phase)
- EHRs impacted
- Service line
- Timeline dates
- Sponsor & collaborators
- Direct hours (if Governance type)

Metrics Section:
- Add metrics (baseline → target)
- Track current values
- Calculate improvement %

Financial Section:
- Actual revenue
- Projected revenue
- Methodology
- Assumptions

Performance Section:
- Users deployed
- Adoption rate
- Outcomes

Projections Section:
- Scaling scenarios
- ROI calculations

Success Story Section:
- Challenge
- Approach
- Outcome
- Collaboration details

Actions:
- Start work → status = "In Progress"
- Pause → status = "On Hold"
- Complete → status = "Completed", lifecycle_stage = "completion"
```

### Key Benefits of Unified Approach

1. **One Continuous Flow**
   - User never leaves the same form/table
   - Fields progressively reveal based on stage
   - No confusing "convert to initiative" button

2. **Single Source of Truth**
   - All data in one `work_items` table
   - No sync between governance_requests and initiatives
   - No Phase 1/Phase 2 conversion logic

3. **Immediate Effort Tracking**
   - As soon as SCI assigned, item appears in My Effort
   - No waiting for Phase 1 to create initiative
   - All work types tracked consistently

4. **Flexible Work Types**
   - Governance Tickets follow full workflow
   - General Support starts immediately at In Progress
   - Epic Gold can start/stop as needed
   - Market Projects can convert to Governance if needed

5. **Simplified Codebase**
   - One form component with stage-based field visibility
   - One table for all work items
   - No conversion/population functions

---

## Migration Strategy

### Phase 1: Create Unified Structure (No Breaking Changes)

**Step 1.1: Create new `work_items` table**
- Copy schema from `initiatives` + add governance fields
- Add `work_category` and `lifecycle_stage` fields
- Keep all related tables (metrics, financial, etc.) pointing to `work_items`

**Step 1.2: Migrate existing data**
- Copy all 409 `initiatives` → `work_items`
  - Set lifecycle_stage = "execution" (already in progress)
  - Set work_category based on type
  - Map status to new status values
- Copy all 3 `governance_requests` → `work_items`
  - Set lifecycle_stage = "intake" or "governance" based on status
  - Set work_category = "governance_workflow"
  - Preserve request_id as item_id (GOV-2025-001)

**Step 1.3: Update foreign keys**
- `effort_logs.initiative_id` → `effort_logs.work_item_id`
- `initiative_metrics.initiative_id` → `work_item_metrics.work_item_id`
- And so on for all related tables

**Step 1.4: Keep old tables temporarily**
- Rename `initiatives` → `initiatives_backup`
- Rename `governance_requests` → `governance_requests_backup`
- Keep for 30 days as safety net

### Phase 2: Update Frontend Components

**Step 2.1: Create UnifiedWorkItemForm.tsx**
- Replace GovernanceRequestForm.tsx + InitiativeSubmissionForm.tsx
- Stage-based field visibility logic
- Progressive disclosure based on lifecycle_stage

**Step 2.2: Update My Effort (BulkEffortEntry.tsx)**
- Query from `work_items` instead of `initiatives`
- Group by work_category (Governance, Support, Epic Gold, etc.)
- No other changes needed (effort_logs table unchanged)

**Step 2.3: Update Browse Initiatives**
- Rename to "Browse Work Items" or "Browse Initiatives"
- Filter by work_category
- Add lifecycle_stage badges
- Show all work types (not just initiatives)

**Step 2.4: Update Dashboard Views**
- Query from `work_items` instead of `initiatives`
- Group by work_category for charts
- No changes to capacity calculation (still uses effort_logs)

**Step 2.5: Remove Governance Portal as separate section**
- Integrate into unified form
- Keep intake view in Dashboard (filter work_items by lifecycle_stage = "intake")

### Phase 3: Capacity Calculation Updates

**Step 3.1: Update workloadCalculator.ts**
- Change query from `initiatives` → `work_items`
- Add work_category handling:
  - Governance Tickets: Use direct_hours_per_week (bypass formula)
  - General Support: Use formula with type weight
  - Epic Gold: Use formula with type weight
  - Market Projects: Use formula with type weight
- No changes to formula itself (weights still from workload_calculator_config)

**Step 3.2: Update capacity displays**
- BulkEffortEntry.tsx header: No changes (uses workloadCalculator)
- TeamCapacityView.tsx: No changes (uses workloadCalculator)
- TeamCapacityModal.tsx: Update work type distribution to show work_category

### Phase 4: Remove Legacy Tables (After Google Sheets Migration)

**Step 4.1: Stop Google Sheets sync**
- Confirm all data migrated
- Disable sync script

**Step 4.2: Remove aggregate tables**
- Drop `assignments`
- Drop `work_type_summary`
- Drop `dashboard_metrics`
- Drop `ehr_platform_summary`
- Replace with dynamic queries from `work_items`

**Step 4.3: Remove backup tables**
- Drop `initiatives_backup` (after 30 days)
- Drop `governance_requests_backup` (after 30 days)

---

## Effort Estimate

### Phase 1: Create Unified Structure
- Create work_items table: 2 hours
- Migrate data (409 + 3 rows): 4 hours
- Update foreign keys: 2 hours
- Test data integrity: 2 hours
**Subtotal: 10 hours**

### Phase 2: Update Frontend
- Create UnifiedWorkItemForm.tsx: 16 hours (complex, replaces 2 forms)
- Update BulkEffortEntry.tsx: 4 hours
- Update Browse Initiatives: 4 hours
- Update Dashboard views: 6 hours
- Remove Governance Portal section: 2 hours
**Subtotal: 32 hours**

### Phase 3: Capacity Updates
- Update workloadCalculator.ts: 4 hours
- Update capacity displays: 4 hours
- Test capacity calculations: 4 hours
**Subtotal: 12 hours**

### Phase 4: Remove Legacy (After Migration)
- Stop Google Sheets sync: 1 hour
- Remove aggregate tables: 2 hours
- Test all views: 4 hours
- Remove backup tables: 1 hour
**Subtotal: 8 hours**

**Total Effort: 62 hours (~8 days)**

---

## Risks & Mitigation

### High Risk: Breaking Capacity Calculation

**Risk:** Capacity formula depends on specific table structure
**Mitigation:**
- Keep `effort_logs` table unchanged (no rename, no schema change)
- Keep `workload_calculator_config` unchanged
- Update only the query source (initiatives → work_items)
- Test capacity calculation after each code change
- Validate against Excel Workload Tracker

**Test Plan:**
- Run capacity calculation for all 16 team members
- Compare planned hours before/after migration
- Compare actual hours before/after migration
- Ensure variance matches

### Medium Risk: Data Migration Errors

**Risk:** Losing data during table consolidation
**Mitigation:**
- Keep backup tables for 30 days
- Run data integrity checks after migration
- Verify row counts (409 + 3 = 412 work_items)
- Test foreign key relationships (effort_logs, metrics, etc.)

**Validation Queries:**
```sql
-- Before migration
SELECT COUNT(*) FROM initiatives;  -- Should be 409
SELECT COUNT(*) FROM governance_requests;  -- Should be 3

-- After migration
SELECT COUNT(*) FROM work_items;  -- Should be 412
SELECT COUNT(*) FROM work_items WHERE lifecycle_stage = 'execution';  -- 409
SELECT COUNT(*) FROM work_items WHERE lifecycle_stage = 'intake';  -- 3

-- Foreign key integrity
SELECT COUNT(*) FROM effort_logs WHERE work_item_id NOT IN (SELECT id FROM work_items);  -- Should be 0
```

### Medium Risk: Google Sheets Sync Conflict

**Risk:** Sync overwrites work_items table changes
**Mitigation:**
- Complete Phase 1-3 BEFORE disabling sync
- During migration, accept that Google Sheets will still sync to old `initiatives` table
- Keep sync pointing at `initiatives_backup` temporarily
- Once frontend updated, disable sync completely

**Timeline:**
- Week 1-2: Create work_items table, keep sync running to initiatives_backup
- Week 3: Update frontend to use work_items
- Week 4: Test thoroughly
- Week 5: Disable Google Sheets sync
- Week 6: Remove backup tables

### Low Risk: User Confusion

**Risk:** Users confused by unified form
**Mitigation:**
- Add stage indicators (progress bar showing Intake → Review → Governance → Execution)
- Show/hide fields based on lifecycle_stage
- Add tooltips explaining when fields are required
- Provide training before rollout

---

## Alternative: Keep Separate Tables, Improve UX

If the unified table approach feels too risky, we can achieve your vision with **minimal changes**:

### Alternative A: Keep Tables, Unify Form

**Keep:**
- `governance_requests` table for intake stage
- `initiatives` table for execution stage

**Change:**
- Create ONE form component that handles both tables
- Form switches between tables based on lifecycle_stage
- User experience: Feels like one continuous form
- Backend: Still two tables, but hidden from user

**Pros:**
- Less risky (no data migration)
- Existing capacity calculation unchanged
- Google Sheets sync unchanged

**Cons:**
- Still have table duplication
- Still need Phase 1/Phase 2 conversion logic
- Code complexity (one form, two data sources)

### Alternative B: Keep Everything, Add Unified View

**Keep:**
- All existing tables unchanged
- All existing forms unchanged

**Add:**
- Unified "My Work" view that queries both governance_requests and initiatives
- Shows all work items in one list
- Click to open appropriate form (governance or initiative)

**Pros:**
- Zero risk (no breaking changes)
- Quick to implement (4-8 hours)
- Google Sheets sync unchanged

**Cons:**
- Doesn't solve the "three separate things" problem
- Still feels disjointed to users
- Doesn't achieve your vision

---

## My Recommendation

### Primary Recommendation: Unified Table Approach

**Why:**
1. Aligns perfectly with your vision ("one continuous thing")
2. Eliminates confusion between governance_requests and initiatives
3. Simplifies codebase (one form, one table, no conversion logic)
4. Enables flexible work type tracking (Governance, Support, Epic Gold, Market)
5. Makes capacity calculation cleaner (all work types in one place)
6. Better for long-term maintainability

**When:**
- Start AFTER Google Sheets migration completes
- Do NOT attempt during active sync phase
- Timeline: 8-10 days of focused development

**Confidence Level:** High
- Capacity calculation will not break (effort_logs unchanged)
- Data migration is straightforward (no complex transformations)
- Frontend changes are extensive but isolated (one form at a time)

### Fallback: Alternative A (Unified Form, Separate Tables)

**If you need to launch sooner:**
- Keep tables as-is
- Create unified form component
- Hide table separation from users
- Revisit full consolidation post-launch

**Timeline:** 3-4 days of development

---

## Questions for You

Before proceeding, I need clarification on a few points:

### Question 1: Google Sheets Migration Status
**Context:** You mentioned "I'm actually OK with removing the seeded data and fixing the structure first, then re-seeding."

**Question:** Are you ready to:
- Disable Google Sheets sync immediately?
- Lose the 409 seeded initiatives temporarily?
- Re-seed after structure is fixed?

**If YES:** We can proceed with unified table approach immediately.
**If NO:** We should wait until migration complete, or use Alternative A.

### Question 2: Work Type Categories
**Context:** You mentioned: "Governance, General Support, Epic Gold as separate from governance tickets."

**Question:** Should these have different forms, or same form with different field requirements?

**Example:**
- Governance Ticket: Requires business case, governance approval, metrics
- General Support: Requires only description, no approval, no metrics
- Epic Gold: Requires description, optional metrics

**Your preference:**
- Same form, fields conditionally required based on work type? OR
- Separate forms for each work type?

### Question 3: Capacity Calculation for Non-Governance Work
**Context:** Currently, capacity formula uses role/type/phase weights.

**Question:** Should General Support and Epic Gold use:
- Same formula as Governance? OR
- Simpler calculation (just direct hours)? OR
- Different type weights?

### Question 4: Manager Approval Requirement
**Context:** Current workflow: Requestor submits → SCI Leader assigns SCI.

**Question:** Should there be manager approval before SCI assignment?
- Example: Request comes in → SCI Lead evaluates → Manager approves workload assignment → SCI assigned

**If YES:** Adds approval step, but prevents overloading SCIs.
**If NO:** SCI Lead has full authority to assign.

### Question 5: Conversion from General Support → Governance Ticket
**Context:** You mentioned General Support work might "turn into a governance ticket."

**Question:** Should we support status transitions like:
- General Support item → "Escalate to Governance" button → Converts to Governance Ticket workflow?

**If YES:** Adds conversion logic (but cleaner than current Phase 1/2).
**If NO:** Create new governance ticket separately, link back to support item.

---

## Next Steps

### If You Approve Unified Table Approach:

1. **Clarify questions above** (your answers will guide implementation details)

2. **Disable Google Sheets sync** (or confirm timeline for disabling)

3. **I will create:**
   - Detailed migration SQL scripts
   - New unified form component design
   - Updated capacity calculation code
   - Test plan for validation

4. **We proceed in phases:**
   - Phase 1: Database structure (can be done now, doesn't break existing app)
   - Phase 2: Frontend updates (breaks old forms, must be complete before deployment)
   - Phase 3: Capacity updates (test heavily)
   - Phase 4: Cleanup legacy tables

5. **Timeline:** 8-10 days of focused development + 2-3 days testing

### If You Choose Alternative A (Unified Form, Separate Tables):

1. **Clarify questions above**

2. **I will create:**
   - Unified form component (handles both tables)
   - Stage-based field visibility logic
   - Updated capacity calculation (query both tables)

3. **Timeline:** 3-4 days of development + 1 day testing

4. **Future:** Can revisit full table consolidation post-launch

---

## Conclusion

Your instinct is **100% correct**: The current "three separate things" approach is confusing and can be streamlined. The audit document was partially wrong in its analysis, but you've identified the real issue.

The unified table approach aligns perfectly with your vision of "one continuous pipeline from intake to completion." It's a bigger lift than the alternatives, but it's the right long-term solution for a professional application lifecycle management tool.

I'm confident we can execute this without breaking effort tracking, capacity calculation, or manager workload views. The key is:
1. Careful planning (this document)
2. Phased implementation (database first, then frontend)
3. Extensive testing (capacity calculation validation)
4. Safety nets (backup tables, validation queries)

**Your call:** Unified table (8-10 days) or unified form with separate tables (3-4 days)?

I'm ready to proceed with either approach once you clarify the questions above.

---

**Document Prepared By:** Claude Code (Strategic Analysis)
**Date:** October 29, 2025
**Status:** Awaiting your decision and clarification on questions above
