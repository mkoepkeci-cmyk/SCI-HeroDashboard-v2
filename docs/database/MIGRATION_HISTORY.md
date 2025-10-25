# Database Migration History

This document explains what each official migration in `/supabase/migrations/` does and why.

All migrations are managed by Supabase CLI and run in chronological order (by timestamp in filename).

## Migration Timeline

### 2025-01-14: Effort Tracking System

#### `20250114000000_create_effort_logs_table.sql`
**Purpose**: Add weekly time tracking functionality

**Changes:**
- Created `effort_logs` table for tracking hours per initiative
- Fields: team_member_id, initiative_id, week_start_date, hours_spent, effort_size, notes
- Added views: `weekly_effort_summary`, `initiative_effort_trends`
- Enabled RLS with policies for read/insert/update

**Why**: Enables "My Effort" tab for capacity management and workload visibility

---

### 2025-01-15: Initiative Management & Governance Portal

#### `20250115000000_update_initiatives_rls.sql`
**Purpose**: Enable CRUD operations on initiatives

**Changes:**
- Added INSERT policy for authenticated users to create initiatives
- Added UPDATE policy for authenticated users to edit initiatives
- Added DELETE policy for authenticated users to remove initiatives

**Why**: Required for initiative submission form and editing functionality

#### `20250115000002_create_governance_portal.sql`
**Purpose**: Create SCI request intake and workflow system

**Changes:**
- Created `governance_requests` table for SCI consultation requests
- Fields: request_name, requestor_name, request_description, business_justification, expected_outcomes, assigned_sci, status workflow
- Status values: Draft, Ready for Review, Needs Refinement, Approved, Converted to Initiative
- Links to initiatives when converted (converted_to_initiative, converted_initiative_id)
- Enabled RLS with full CRUD policies

**Why**: Enables "SCI Requests" tab for intake and governance workflow management

#### `20250115000003_update_governance_status_constraint.sql`
**Purpose**: Update governance request status values

**Changes:**
- Modified status constraint to include: Draft, Ready for Review, Needs Refinement, Approved, Converted to Initiative
- Allows workflow progression through governance process

**Why**: Supports proper governance request lifecycle

#### `20250115000004_add_governance_metrics_fields.sql`
**Purpose**: Add metrics tracking to governance requests

**Changes:**
- Added fields to governance_requests: expected_users, expected_revenue, expected_time_savings, expected_timeline
- Allows capturing estimated impact during request phase

**Why**: Enables impact assessment before initiative conversion

---

### 2025-01-16: Governance Request Enhancements

#### `20250116000000_add_governance_request_fields.sql`
**Purpose**: Enhance governance request form with additional context fields

**Changes:**
- Added fields: priority_level, affected_departments, technical_requirements, resource_needs, dependencies, success_criteria
- Supports comprehensive intake process

**Why**: Provides richer context for SCI assignment and prioritization

---

### 2025-10-09: Initial Clinical Informatics Schema

#### `20251009010942_create_clinical_informatics_schema.sql`
**Purpose**: Create core database schema for team and assignment tracking

**Changes:**
- Created `team_members` table: id, name, role, specialty, total_assignments, revenue_impact
- Created `assignments` table: assignment_name, work_type, phase, status, work_effort, team_member_id
- Created `work_type_summary` table: aggregate work type counts per team member
- Created `ehr_platform_summary` table: EHR platform assignments per team member
- Created `key_highlights` table: notable achievements per team member
- Created `team_metrics` table: overall team performance metrics
- Enabled RLS on all tables
- Created indexes for performance

**Why**: Foundation for team portfolio tracking and dashboard metrics

#### `20251009011146_update_rls_policies_for_anon_access.sql`
**Purpose**: Allow public read access for internal showcase

**Changes:**
- Updated RLS policies to allow anonymous (anon) read access
- Maintained authenticated-only write access

**Why**: This is an internal showcase tool, read access doesn't need authentication

---

### 2025-10-09: Initiative Submission System

#### `20251009030806_create_initiative_submission_tables.sql`
**Purpose**: Create comprehensive initiative tracking with metrics and impact data

**Changes:**
- Created `initiatives` table: Core initiative tracking with owner, name, type, status, dates, sponsors, collaborators, governance
- Created `initiative_metrics` table: Performance metrics with baseline/current/target values
- Created `initiative_financial_impact` table: Revenue, cost savings, calculation methodology
- Created `initiative_performance_data` table: Users deployed, adoption rates, outcomes
- Created `initiative_projections` table: Scaling scenarios and future projections
- Created `initiative_stories` table: Success stories (challenge, approach, outcome)
- Enabled RLS on all tables with read/write policies
- Created indexes on foreign keys and frequently queried fields

**Why**: Enables detailed initiative tracking with validated metrics and success stories

#### `20251009031520_add_team_member_link_to_initiatives.sql`
**Purpose**: Link initiatives to team members

**Changes:**
- Added `team_member_id` foreign key to initiatives table
- References team_members(id) with ON DELETE SET NULL

**Why**: Enables filtering initiatives by team member and portfolio views

#### `20251009033205_add_completion_tracking_to_initiatives.sql`
**Purpose**: Track initiative form completion status

**Changes:**
- Added `is_draft` boolean: Marks incomplete initiatives
- Added `section_last_updated` jsonb: Tracks when each form section was last saved
- Added `completion_percentage` decimal: Calculated completion score
- Added `completion_status` jsonb: Tracks which sections are complete
- Created function `calculate_initiative_completion()`: Auto-calculates completion based on filled fields
- Created trigger to update completion on every initiative update

**Why**: Provides visibility into which initiatives have complete data vs drafts

#### `20251009035222_fix_initiative_completion_function_v2.sql`
**Purpose**: Fix completion calculation logic

**Changes:**
- Updated `calculate_initiative_completion()` function with correct field checks
- Fixed section completion scoring
- Improved completion percentage calculation

**Why**: Ensures accurate completion tracking for data quality monitoring

---

## Migration Execution

### For New Environments

Run migrations in order using Supabase CLI:

```bash
supabase migration up
```

Or apply manually in Supabase SQL Editor:
1. Copy each migration file's contents
2. Execute in chronological order (sorted by filename)
3. Verify no errors

### For Existing Environments

Migrations have already been applied if:
- All tables exist in your Supabase project
- You can access the dashboard at http://localhost:5175

---

## Ad-Hoc Migrations (Archived)

Some schema changes were applied manually during development and are not in Supabase CLI format. These are documented in `/archive/scripts/migrations-adhoc/` and include:

- Adding capacity/workload tracking fields
- Adding role, ehrs_impacted, service_line columns to initiatives
- Data cleanup and deduplication
- Test data insertion

These were already applied to the production database and are preserved for historical reference only.
