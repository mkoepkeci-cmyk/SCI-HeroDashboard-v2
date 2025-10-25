# Database Schema Overview

## Architecture

The application uses **Supabase** (PostgreSQL) as its database with Row Level Security (RLS) enabled.

## Data Flow

```
Google Sheets (Source of Truth)
    ↓ (Auto-sync)
Supabase Tables
    ↓ (Supabase Client API)
React Dashboard Application
```

## Table Categories

### 1. Team & Assignment Tables (Synced from Google Sheets)

#### `team_members`
Core team member information
- Primary key: `id` (uuid)
- Fields: name, role, specialty, total_assignments, revenue_impact
- Used by: All views to filter and display team member data

#### `assignments`
Individual work assignments
- Links to: `team_members` (team_member_id)
- Fields: assignment_name, work_type, phase, status, work_effort, role_type
- Used by: Team portfolios, assignment tracking

#### `work_type_summary`
Aggregate counts of work types per team member
- Links to: `team_members` (team_member_id)
- Fields: work_type, count
- Used by: Dashboard overview, work distribution charts

#### `ehr_platform_summary`
EHR platform assignments per team member
- Links to: `team_members` (team_member_id)
- Fields: ehr_platform, count
- Used by: EHR coverage analysis

#### `key_highlights`
Notable achievements and key work items
- Links to: `team_members` (team_member_id)
- Fields: highlight, order_index
- Used by: Team member portfolio cards

#### `dashboard_metrics`
Pre-calculated team-level metrics
- Fields: metric_name, metric_value, metric_category, display_order
- Used by: Dashboard overview metrics

### 2. Initiative Tables (Synced from Google Sheets)

#### `initiatives`
Core initiative information and tracking
- Primary key: `id` (uuid)
- Links to: `team_members` (team_member_id)
- Key fields:
  - Basic: owner_name, initiative_name, type, status
  - Classification: role, ehrs_impacted, service_line
  - Timeline: start_date, end_date, timeframe_display, phase, work_effort
  - Collaboration: clinical_sponsor_name, clinical_sponsor_title, key_collaborators, governance_bodies
  - Meta: is_draft, is_active, completion_percentage, section_last_updated
  - Governance: governance_request_id (links to governance_requests)
- Used by: All initiative views and tracking

**Status Values:**
- Not Started
- In Progress
- On Hold
- Completed
- Cancelled

**Type Values:**
- System Initiative
- System Projects
- SCI Supported Tickets and Projects
- Governance
- Market Project
- Ticket
- Other

#### `initiative_metrics`
Performance metrics for initiatives
- Links to: `initiatives` (initiative_id)
- Fields: metric_name, metric_type, unit, baseline_value, current_value, target_value, improvement, measurement_method
- Used by: Initiative cards, metrics display

#### `initiative_financial_impact`
Revenue and cost tracking
- Links to: `initiatives` (initiative_id)
- Fields: actual_revenue, actual_timeframe, projected_annual, calculation_methodology, key_assumptions
- Used by: Financial impact displays, dashboard aggregations

#### `initiative_performance_data`
Operational performance metrics
- Links to: `initiatives` (initiative_id)
- Fields: users_deployed, total_potential_users, adoption_rate, primary_outcome, measurement_method
- Used by: Performance dashboards, adoption tracking

#### `initiative_projections`
Future scaling projections
- Links to: `initiatives` (initiative_id)
- Fields: scenario_description, projected_users, percent_of_organization, projected_time_savings, revenue_impact
- Used by: Projections views, ROI calculations

#### `initiative_stories`
Success stories and narratives
- Links to: `initiatives` (initiative_id)
- Fields: challenge, approach, outcome, collaboration_detail
- Used by: Success story displays, initiative cards

### 3. Governance Portal Tables (Synced from Google Sheets)

#### `governance_requests`
SCI consultation request intake and workflow
- Primary key: `id` (uuid)
- Key fields:
  - Intake: request_name, requestor_name, requestor_email, request_description
  - Context: business_justification, expected_outcomes, timeline_expectations
  - SCI Assignment: assigned_sci, assignment_notes
  - Workflow: status, submission_date, review_date, approval_date
  - Conversion: converted_to_initiative (boolean), converted_initiative_id
- Used by: SCI Requests tab, governance workflow

**Status Values:**
- Draft
- Ready for Review
- Needs Refinement
- Approved
- Converted to Initiative

### 4. Effort Tracking Tables (User-Generated, NOT in Google Sheets)

#### `effort_logs`
Weekly time tracking per initiative
- Primary key: `id` (uuid)
- Links to: `initiatives` (initiative_id), `team_members` (team_member_id)
- Fields: week_start_date, hours_spent, effort_size, notes
- Used by: My Effort tab, workload analytics, capacity management

**Effort Sizes:**
- XS = 1.5 hours
- S = 4 hours
- M = 8 hours
- L = 13 hours
- XL = 18 hours
- XXL = 25 hours

#### Views (Materialized or Regular)
- `weekly_effort_summary` - Aggregates effort by week and team member
- `initiative_effort_trends` - Tracks effort patterns over time

## Security (RLS Policies)

All tables have Row Level Security enabled with policies:
- **Read**: Public access (anon, authenticated) - This is an internal showcase tool
- **Insert/Update**: Authenticated users only
- **Delete**: Generally restricted or soft-delete only

## Relationships

```
team_members (1) ──→ (N) assignments
team_members (1) ──→ (N) work_type_summary
team_members (1) ──→ (N) ehr_platform_summary
team_members (1) ──→ (N) key_highlights
team_members (1) ──→ (N) initiatives
team_members (1) ──→ (N) effort_logs

initiatives (1) ──→ (N) initiative_metrics
initiatives (1) ──→ (1) initiative_financial_impact
initiatives (1) ──→ (1) initiative_performance_data
initiatives (1) ──→ (1) initiative_projections
initiatives (1) ──→ (1) initiative_stories
initiatives (1) ──→ (N) effort_logs
initiatives (1) ──← (0..1) governance_requests

governance_requests (1) ──→ (0..1) initiatives (when converted)
```

## Indexes

Performance indexes are created on:
- Foreign keys (team_member_id, initiative_id)
- Frequently queried fields (status, work_type, owner_name)
- Date fields (created_at, updated_at, week_start_date)

## Migrations

All schema changes are tracked in `/supabase/migrations/` with timestamped SQL files.

See `MIGRATION_HISTORY.md` for details on what each migration does.
