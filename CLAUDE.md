# System Clinical Informatics Dashboard

A React-based dashboard application for tracking and visualizing the impact of CommonSpirit Health's System Clinical Informatics team initiatives, assignments, and performance metrics.

---

## Current Status (October 2025)

**Production Ready - 409 Active Initiatives Across 16 Team Members**

### Completed Features
- ✅ Dashboard with Overview and Team portfolio views
- ✅ SCI Requests (Governance Portal) - Intake and workflow management
- ✅ Browse Initiatives - Categorized, searchable initiative library
- ✅ My Effort - Weekly time tracking with bulk entry
- ✅ Workload Analytics - Capacity management and trends
- ✅ Complete metrics tracking with validated data
- ✅ Initiative management with full CRUD operations
- ✅ Status standardization across all views

### Data Status
- **409 initiatives** populated and active
- **16 team members** with complete portfolios
- **Validated metrics** from PDF documentation
- **Active effort tracking** for capacity management

---

## Data Architecture

### ⚠️ Current Migration Phase: Temporary Google Sheets Sync

**The dashboard is FULLY FUNCTIONAL for creating, editing, and deleting data.** However, during this initial migration phase, a **temporary one-way sync** from Google Sheets to Supabase is active to allow users to clean up existing initiative data in the familiar spreadsheet environment.

**Current Data Flow (TEMPORARY):**

```
Google Sheets (Temporary Staging Area)
    ↓ (One-way sync via Apps Script - TEMPORARY)
Supabase Database (PostgreSQL)
    ↓ (Supabase Client API)
React Dashboard App (Full CRUD capabilities)
```

**⚠️ Important Sync Behavior:**
- **One-way sync**: Google Sheets → Supabase (changes in Google Sheets overwrite dashboard changes)
- **Sync source**: Only items currently visible in `/documents/SCI Workload Tracker - New System.xlsx` are synced
- **Dashboard edits ARE allowed**: You can create/edit/delete initiatives in the dashboard
- **Potential overwrites**: If the sync runs after you edit in the dashboard, your changes may be overwritten by Google Sheets data
- **Recommendation during migration**: For authoritative changes, edit in Google Sheets OR coordinate with team to avoid conflicts

**Tables Currently Synced from Google Sheets:**
- `team_members`, `assignments`, `work_type_summary`
- `ehr_platform_summary`, `key_highlights`, `dashboard_metrics`
- `initiatives` and all related tables (metrics, financial_impact, performance_data, projections, stories)
- **Note**: Only rows/records visible in the SCI Workload Tracker Excel document are synced

**Tables Created ONLY in Dashboard (NOT synced):**
- `effort_logs` - Weekly time tracking
- `governance_requests` - SCI consultation requests

**Future State (After Migration Complete):**
```
Supabase Database (Single Source of Truth)
    ↓ (Supabase Client API)
React Dashboard App (Primary Interface)
```

Once users complete their data cleanup, the Google Sheets sync will be **permanently disabled** and the dashboard will become the sole interface for all data management. No target date set yet.

**IMPORTANT**: Dashboard reads from Supabase, NOT from CSV/Excel files. CSV references are legacy.

---

## ⚡ Capacity Calculation System (CRITICAL - DO NOT MODIFY)

**Status**: ✅ COMPLETED - Working in Production (October 27, 2025)

**Locations**:
1. **Workload → SCI View** - Individual effort tracking with capacity header
2. **Workload → Team View** - Manager dashboard with capacity cards

**Purpose**: Real-time capacity management showing planned vs actual workload for individuals and teams

---

### CRITICAL RULES (DO NOT VIOLATE):

1. **ONE FORMULA FOR CAPACITY** - Same calculation in both SCI View and Team View
2. **NO WEEK FILTERING FOR CAPACITY** - Always use most recent saved data by `updated_at`
3. **ACTIVE INITIATIVES ONLY** - Filter to: Active, In Progress, Not Started, Planning, Scaling
4. **REAL DATA ONLY** - No placeholder charts, no fake trends, no static arrays

---

### Capacity Formula (CANONICAL - DO NOT CHANGE):

**Planned Hours Per Week**:
```
For each active initiative with complete data:
  plannedHours += baseHours × roleWeight × typeWeight × phaseWeight

Where:
  - baseHours = work_effort mapping (XS=0.5, S=1.5, M=3.5, L=7.5, XL=15)
  - Weights from workload_calculator_config table
  - Complete data = has role, work_effort, type, and phase (Governance doesn't need phase)
```

**Actual Hours**:
```
actualHours = SUM(hours_spent) from effort_logs
  WHERE team_member_id = X
    AND initiative_id IN (active_initiative_ids)
  ORDER BY updated_at DESC
  -- Get most recent saved entry per initiative, NO week filtering
```

**Planned %**: `(plannedHours / 40) × 100`
**Actual %**: `(actualHours / 40) × 100`
**Variance**: `actualHours - plannedHours`

**Color Coding**:
- 🟢 Green (Under): < 60%
- 🟡 Amber (Near): 60-74%
- 🟠 Orange (At): 75-84%
- 🔴 Red (Over): ≥ 85%

---

### 1. Workload → SCI View (BulkEffortEntry.tsx)

**Header Shows**:
- Planned: 31.5 hrs/wk (79%)
- Actual: 39.0 hrs (98%)
- Variance: +7.5 hrs over estimate

**Footer Shows** (live, unsaved):
- Total Hours (unsaved): Updates as you type

**Data Flow**:
1. On page load, query effort_logs for most recent saved hours per active initiative
2. Calculate planned hours from active initiatives with complete data
3. Display in header
4. As user types, footer updates with unsaved total
5. On "Save All", write to effort_logs with updated_at = NOW()
6. Page reloads, header updates with new saved values

---

### 2. Workload → Team View (TeamCapacityView.tsx)

**Manager Filter Buttons**:
- **All Teams** (16 SCIs)
- **Carrie Rodriguez** (her direct reports)
- **Tiffany Shields-Tettamanti** (her direct reports)

**TeamCapacityCard** (200px wide):
- Avatar with color = planned capacity color
- Initiative count badge (top right)
- Planned: 31.5h (79%) - inline
- Actual: 39.0h (98%) - inline
- Variance: +7.5h

**TeamCapacityModal** (opens on card click):
Shows 6 productivity metrics in 2x3 grid:

**Row 1**:
1. **Work Type Distribution** (Pie) - System Initiative, Project, Governance, etc.
2. **Work Effort Distribution** (Bar) - XS, S, M, L, XL, XXL counts
3. **Phase Distribution** (Bar) - Discovery, Design, Build, Test, Deliver, Steady State

**Row 2**:
4. **Role Breakdown** (Donut) - Owner, Primary, Co-Owner, Secondary, Support
5. **Status Health** (Stat cards) - Count by status (Not Started, In Progress, On Hold, etc.)
6. **Service Line Coverage** (Bar, Top 8) - Service line distribution

**Missing Data Alert**:
- Only shows if initiatives missing capacity fields (role, work_effort, type, phase)
- Does NOT check for metrics/baseline data (not needed for capacity)

**Team Metrics Section** (bottom):
- Total Initiatives (filtered by manager)
- Revenue Impact (sum of projected_annual)
- Avg Capacity (average of plannedPct across filtered team)

---

### Dashboard → Team View (App.tsx)

**Different from Workload Team View!**
- NO manager filters (removed Oct 27, 2025)
- Shows all 16 SCIs in simple card grid
- Click card to see team member detail modal
- Used for general team portfolio overview, not capacity management

---

## Application Features

### 1. Dashboard

**Two Views:**

#### Overview Mode
- Team-level metrics: 409 initiatives, $276M+ revenue impact
- Active assignments breakdown
- Revenue and efficiency gains
- Top performing initiatives

#### Team Mode
- Individual team member portfolios
- Work type distribution (pie chart)
- EHR platform assignments
- Key highlights per team member
- Categorized initiative lists by work type

**Categories:**
- System Initiatives (blue)
- System Projects (purple)
- SCI Supported Tickets and Projects (orange)
- Governance (purple)
- Other (gray)

### 2. SCI Requests (Governance Portal)

**Purpose**: Intake and workflow management for new SCI consultation requests

**Workflow:**
```
1. Requestor submits consultation request
   ↓ (status: Draft)
2. Requestor finalizes submission
   ↓ (status: Ready for Review)
3. SCI Lead reviews
   ↓ (status: Needs Refinement OR Approved)
4. If approved, convert to initiative
   ↓ (status: Converted to Initiative)
```

**Features:**
- Comprehensive intake form (requestor info, business justification, expected outcomes)
- SCI assignment workflow
- Impact estimation (users, revenue, time savings, timeline)
- One-click conversion to formal initiative
- Tracks conversion link between request and initiative

### 3. Browse Initiatives

**Purpose**: Searchable, filterable library of all initiatives

**Features:**
- **5 categories**: System Initiatives, System Projects, SCI Supported Tickets/Projects, Governance, Other
- **Search** by initiative name, owner, sponsor
- **Filter tabs**: All, Active, Completed
- **Collapsible categories** with count badges
- **Initiative cards** with full details (metrics, financial impact, success stories)

**Initiative Card Sections:**
- Basic info (owner, status, type, dates)
- Metrics (baseline → current → target with improvement %)
- Financial impact (actual revenue, projections, methodology)
- Performance data (users deployed, adoption rate, outcomes)
- Scaling projections (scenarios, ROI calculations)
- Success stories (challenge, approach, outcome)

### 4. My Effort (Time Tracking)

**Purpose**: Weekly effort logging for capacity management

**Features:**

#### Bulk Effort Entry Table
- Table view showing all active/planning initiatives
- Inline editing: hours, effort size (XS-XXL), notes
- **Skip checkbox**: Mark "no work this week" (saves 0 hours with note)
- **Add Misc. Assignment**: Create ad-hoc General Support tasks on-the-fly
- **Copy Last Week**: Auto-fill effort from previous week
- **Reassign button**: Transfer initiative ownership to another SCI
- **Delete button**: Remove initiative (soft delete, status → "Deleted")
- **Batch save**: Save all modified entries at once

#### Effort Sizes
- XS = 1.5 hours
- S = 4 hours
- M = 8 hours (default)
- L = 13 hours
- XL = 18 hours
- XXL = 25 hours

#### Weekly Summary
- Total hours logged
- Hours by effort size
- Hours by work type
- Effort sparklines (trending)

### 5. Workload Analytics

**Purpose**: Capacity utilization and workload trends

**Features:**
- Individual workload trends (past 12 weeks)
- Capacity utilization percentage
- Effort distribution by size
- Hours by work type
- Team member selector for filtering

---

## Status Field Standardization

**Consistent across all views:**

- **Not Started** - Initiative planned but work hasn't begun
- **In Progress** - Active work happening
- **On Hold** - Temporarily paused
- **Completed** - Work finished successfully
- **Cancelled** - Initiative discontinued

**Applied to:**
- Dashboard filtering (Active tab shows: Not Started, In Progress)
- Browse Initiatives filtering
- Effort tracking (only shows active statuses)
- Initiative cards and badges

---

## Tech Stack

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type safety and IntelliSense
- **Vite** - Build tool with HMR (Hot Module Replacement)
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization (charts, sparklines)
- **Lucide React** - Icon library

### Backend/Database
- **Supabase** - PostgreSQL database
- **Supabase Client** - Real-time API and authentication
- **Row Level Security (RLS)** - Table-level access control

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **npm** - Package management

---

## Project Structure

```
/
├── src/                              # Application source code
│   ├── App.tsx                      # Main app with routing and data fetching
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Global styles
│   ├── components/                  # React components
│   │   ├── BulkEffortEntry.tsx     # Bulk effort logging table
│   │   ├── CompletionIndicator.tsx # Progress indicators
│   │   ├── EffortLogModal.tsx      # Individual effort entry
│   │   ├── EffortSparkline.tsx     # Effort trend visualization
│   │   ├── GovernanceRequestDetail.tsx     # SCI request detail view
│   │   ├── GovernanceRequestForm.tsx       # SCI request intake form
│   │   ├── GovernanceRequestsList.tsx      # All SCI requests
│   │   ├── InitiativeCard.tsx              # Initiative display card
│   │   ├── InitiativeSubmissionForm.tsx    # Create/edit initiatives
│   │   ├── InitiativesTableView.tsx        # Categorized initiative table
│   │   ├── InitiativesView.tsx             # Browse initiatives view
│   │   ├── PersonalWorkloadDashboard.tsx   # Effort tracking dashboard
│   │   ├── ReassignModal.tsx               # Initiative reassignment
│   │   └── SCIRequestsCard.tsx             # Governance requests widget
│   ├── lib/                         # Utilities and helpers
│   │   ├── supabase.ts             # Supabase client setup
│   │   ├── completionUtils.ts      # Completion calculations
│   │   ├── effortUtils.ts          # Effort tracking utilities
│   │   └── governanceConversion.ts # Convert requests to initiatives
│   └── audit-page.tsx              # Data audit and stats page
│
├── supabase/
│   └── migrations/                 # Database schema migrations (12 files)
│
├── documents/                      # Business documentation
│   ├── SCI_HERO_DASHBOARD_BUSINESS_CASE.md
│   ├── SCI Value metrics.pdf
│   └── SCI Workload Tracker - New System (3).xlsx
│
├── docs/                          # Technical documentation
│   ├── database/                  # Database docs
│   ├── architecture/              # Architecture docs
│   └── deployment/                # Setup and deployment guides
│
├── archive/                       # Historical development artifacts
│   ├── scripts/                  # Archived development scripts
│   └── documentation/            # Historical implementation notes
│
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── README.md                     # Project overview
└── CLAUDE.md                     # This file - developer guide
```

---

## Database Schema

### Core Tables

#### Team & Assignments (Synced from Google Sheets)
- `team_members` - Team member profiles
- `assignments` - Individual work assignments
- `work_type_summary` - **Aggregate counts** (DO NOT duplicate when adding initiatives!)
- `ehr_platform_summary` - EHR coverage
- `key_highlights` - Notable achievements
- `dashboard_metrics` - Pre-calculated team metrics

#### Initiatives (Synced from Google Sheets)
- `initiatives` - Core initiative tracking
  - Basic: owner_name, initiative_name, type, status
  - Classification: **role**, **ehrs_impacted**, **service_line** (new fields)
  - Timeline: start_date, end_date, phase, work_effort
  - Collaboration: clinical_sponsor, key_collaborators, governance_bodies
  - Meta: is_draft, completion_percentage, section_last_updated
- `initiative_metrics` - Performance metrics (baseline, current, target)
- `initiative_financial_impact` - Revenue, cost savings, calculations
- `initiative_performance_data` - Users, adoption, outcomes
- `initiative_projections` - Scaling scenarios and ROI
- `initiative_stories` - Success stories (challenge, approach, outcome)

#### Governance Portal (User-Generated)
- `governance_requests` - SCI consultation intake
  - Requestor info, business justification, expected outcomes
  - SCI assignment and review workflow
  - Status progression (Draft → Ready for Review → Approved → Converted)
  - Conversion tracking (links to created initiative)

#### Effort Tracking (User-Generated)
- `effort_logs` - Weekly time tracking per initiative
  - One log per initiative per team member per week
  - Fields: hours_spent, effort_size, notes
  - Used for capacity management

See `/docs/database/SCHEMA_OVERVIEW.md` for complete schema documentation.

---

## Key Workflows

### Creating a New Initiative

**Via Form:**
1. Dashboard → Browse Initiatives → "Add Initiative" button
2. Fill out multi-step form:
   - Basic Information (owner, name, type, status, role, EHRs, service line)
   - Governance & Collaboration
   - Metrics & KPIs
   - Financial Impact
   - Performance Data
   - Future Projections
   - Success Stories
3. Save as draft OR publish
4. Initiative appears in Browse Initiatives and Team views

**Via Governance Request Conversion:**
1. SCI Requests → Select approved request
2. Click "Convert to Initiative"
3. App creates initiative with request data pre-filled
4. Request marked as "Converted" with link to new initiative

### Logging Weekly Effort

1. My Effort → Select week
2. Table shows all active/planning initiatives
3. For each initiative:
   - Enter hours OR select effort size
   - Add notes if needed
   - OR check "Skip" for no work
4. Click "Save Changes" (batch save)
5. Data flows to effort_logs table
6. Workload analytics updated automatically

### Reassigning an Initiative

1. My Effort → Find initiative in table
2. Click purple reassign icon (👥) next to owner name
3. Modal opens:
   - Select new owner from dropdown
   - Select role (Owner/Co-Owner/Secondary/Support)
4. Click "Reassign"
5. Initiative moves to new owner's list
6. Work type counts recalculate for both users

### Deleting an Initiative

1. My Effort → Find initiative in table
2. Click X button
3. Confirm deletion dialog
4. Initiative status changed to "Deleted" (soft delete)
5. Initiative removed from all active views
6. **⚠️ During Migration Phase**: If the initiative still exists in Google Sheets, it may be re-synced on the next sync run. For permanent deletion during migration, also remove the initiative from Google Sheets. Once the sync is disabled, dashboard deletions will be permanent.

---

## Color Scheme (CommonSpirit Brand)

- **Primary**: `#9B2F6A` (Magenta)
- **System Initiatives**: `#00A1E0` (Blue)
- **Governance**: `#6F47D0` (Purple)
- **Projects**: `#9C5C9D` (Purple)
- **General Support**: `#F58025` (Orange)
- **Text**: `#565658` (Dark Gray)

---

## Development

### Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Create `.env` file with Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start dev server: `npm run dev`
5. Open http://localhost:5173

See `/docs/deployment/SETUP.md` for detailed setup instructions.

### Available Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # TypeScript type checking
```

### Key Development Files

- **State Management**: App.tsx (main data fetching and state)
- **Supabase Client**: src/lib/supabase.ts
- **Type Definitions**: Defined in supabase.ts (InitiativeWithDetails, TeamMemberWithDetails)
- **Routing**: All in App.tsx (no react-router, just conditional rendering)

---

## Deployment

### Production Build

```bash
npm run build
```

Output in `/dist/` folder ready for static hosting.

### Database Migrations

All migrations are in `/supabase/migrations/` (12 timestamped SQL files).

**To apply to new environment:**
```bash
supabase migration up
```

Or run manually in Supabase SQL Editor in chronological order.

See `/docs/database/MIGRATION_HISTORY.md` for details on each migration.

---

## Data Management Best Practices

### Adding New Initiatives

**DO:**
- ✅ Use the initiative submission form in the UI
- ✅ Fill out as many sections as possible (aim for >85% completion)
- ✅ Add metrics with baseline, current, and target values
- ✅ Document financial impact with calculation methodology
- ✅ Include success stories when available

**DON'T:**
- ❌ Duplicate work_type_summary counts (initiatives are drill-downs, not new assignments)
- ❌ Create initiatives for routine meetings or governance attendance
- ❌ Leave initiatives as drafts long-term (complete or delete)

### Status Transitions

**Standard Flow:**
```
Not Started → In Progress → Completed
```

**Valid Transitions:**
- Not Started → In Progress
- Not Started → On Hold
- In Progress → On Hold
- In Progress → Completed
- In Progress → Cancelled
- On Hold → In Progress
- On Hold → Cancelled

---

## Troubleshooting

### Issue: Initiatives Not Showing

**Check:**
1. Status filter - Only "Active" statuses show by default
2. Team member filter - May be filtered to specific SCI
3. Type filter - Initiative may be in different category
4. Search term - May be filtering results

### Issue: Edit Form Not Populating

**Root Cause**: Data not being fetched with full relations

**Solution**: Ensure initiatives are fetched WITH related data:
```typescript
const initiatives = await fetchInitiativesWithDetails(); // Includes metrics, financial, etc.
```

BulkEffortEntry.tsx now fetches all related tables (fixed in recent update).

### Issue: Effort Logs Not Saving

**Check:**
1. Week selected (can't log for future weeks)
2. Hours entered or effort size selected
3. Initiative is Active/Planning status
4. Browser console for Supabase errors

---

## Architecture Documentation

For deeper technical understanding:

- **Data Flow**: `/docs/architecture/DATA_FLOW.md`
- **Database Schema**: `/docs/database/SCHEMA_OVERVIEW.md`
- **Migration History**: `/docs/database/MIGRATION_HISTORY.md`
- **Setup Guide**: `/docs/deployment/SETUP.md`

---

## Historical Context

### Archive Folder

`/archive/` contains development artifacts:
- 30 TypeScript scripts (data population, validation, audit)
- 12 ad-hoc SQL migrations (manually applied during development)
- 30 markdown files (implementation notes, progress tracking)

These are preserved for audit purposes but are not needed for operation.

See `/archive/README.md` for complete inventory.

---

## Notes

- Application designed for internal use by CommonSpirit Health's System Clinical Informatics team
- All financial and operational data retrieved from Supabase in real-time
- Dashboard supports both aggregate (Overview) and individual (Team) views
- Supabase credentials stored in `.env` (not committed to repository)
- **Status standardization** completed: all views use Not Started/In Progress/On Hold/Completed/Cancelled
- **CRITICAL**: Do not duplicate work_type_summary counts - initiatives are drill-downs, not new assignments
