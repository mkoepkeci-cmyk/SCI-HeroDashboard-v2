# GovernIQ Enterprise Management Platform

A React-based dashboard application for tracking and visualizing organizational initiatives, team portfolios, and performance metrics.

---

## ⚖️ Independent Development Statement

**This software framework and associated database schema were developed independently by Marty Koepke using personal equipment, accounts, and resources outside of employment hours. No company systems, credentials, or proprietary data were used in the development of this framework.**

- **Developer**: Marty Koepke
- **Development Period**: 2025
- **Date of Statement**: October 31, 2025, 3:00 PM PST
- **Framework Status**: Demo-Ready v1.0 (Populated with Sample Data)

**Legal Notice**: This framework represents original work product created independently. All intellectual property rights are retained by the developer. No employer resources, systems, or proprietary information were utilized in its creation.

---

## Current Status (October 31, 2025)

**Demo Ready - Sample Data Loaded for Demonstration Purposes**

⚠️ **IMPORTANT: This instance contains demo data generated on October 31, 2025. Production data has been backed up and replaced with realistic sample data for demo purposes.**

### Completed Features
- ✅ Dashboard with Overview and Team portfolio views
- ✅ Team Requests (Governance Portal) - Intake and workflow management with Phase 1/2 auto-triggers
- ✅ Browse Initiatives - Categorized, searchable initiative library
- ✅ My Effort - Weekly time tracking with bulk entry
- ✅ Workload Analytics - Capacity management and trends
- ✅ Complete metrics tracking with validated data
- ✅ Initiative management with full CRUD operations
- ✅ Status standardization across all views
- ✅ Real-time data refresh across all views (Dashboard, Workload, Governance)
- ✅ Clickable revenue cards with initiative drilldown
- ✅ Dynamic Key Highlights with live calculated metrics
- ✅ Unified form for creating/editing all initiative types
- ✅ **Assignment-to-Initiatives Migration Complete** (October 30, 2025) - 57 items migrated, 98.3% success
- ✅ **Legacy Assignments Table Removed** (October 30, 2025) - Single source of truth established
- ✅ **Admin Configuration System** (October 31, 2025) - Dynamic branding, field options, capacity settings
- ✅ **Configurable Team Roles** (October 31, 2025) - Enterprise Team, Market Team, Department Team
- ✅ **Dynamic Brand Color System** (October 31, 2025) - Customizable primary color throughout UI
- ✅ **Consolidated Field Options** (October 31, 2025) - Groups Impacted & Impact Categories integrated
- ✅ **Navigation Reorganization** (October 31, 2025) - Reordered tabs, renamed Workload to Workforce

### Data Status (Demo Data - October 31, 2025)
- **80 sample initiatives** (5 per team member) with realistic business names
- **16 sample team members** (Ashley Daily, Brooke Snow, Dawn Jacobson, Jason Mihos, Josh Greenwood, Kim Willis, Lisa Townsend, Marisa Raddick, Marty Koepke, Matt Stuart, Melissa Plummer, Robin Delorenzo, Sherry Brennaman, Trudy Finch, Van Nguyen, Yvette Kirk)
- **2 sample managers** (Carrie Rodriguez, Tiffany Shields-Tettamanti)
- **8 governance requests** (GOV-2025-100 through GOV-2025-107)
- **No pre-populated stories, metrics, or effort logs** (clean starting state for customization)

**Production Data:** Backed up in Supabase before demo data load. See `/scripts/DEMO_DATA_INSTRUCTIONS.md` for restoration steps.

---

## Data Architecture

### Database as Single Source of Truth

**The dashboard is FULLY FUNCTIONAL for creating, editing, and deleting data** using Supabase PostgreSQL as the single source of truth.

**Current Data Flow:**

```
Supabase Database (PostgreSQL)
    ↓ (Supabase Client API)
React Dashboard App (Full CRUD capabilities)
```

**Core Tables:**
- `team_members` - Team member profiles and manager assignments
- `managers` - Manager hierarchy
- `initiatives` - **Single source of truth** for all workload tracking
- `effort_logs` - Weekly time tracking (user-generated)
- `governance_requests` - Team consultation requests (user-generated)
- `application_config` - Dynamic branding, labels, and primary brand color
- `field_options` - Configurable dropdown options (10 field types: work types, roles, statuses, phases, team roles, groups impacted, impact categories, etc.)
- `capacity_thresholds` - Color-coded capacity thresholds
- `workload_calculator_config` - Capacity calculation weights

**Note**: Optional external data sync capabilities can be configured if needed, but the dashboard operates independently.

---

## 🎭 Demo Data (October 31, 2025)

### Current State: Demo Data Loaded

**Purpose**: This instance contains realistic sample data for demo and presentation purposes.

**Current Demo Data (simple-demo-data.sql):**
- 16 team members with realistic names
- 2 managers (Sarah Mitchell, David Thompson)
- 80 initiatives (5 per team member, distributed by work type)
- Basic initiative data with problem statements and outcomes
- Minimal metrics and financial data (realistic sparse coverage)
- 8 governance requests (GOV-2025-100 through GOV-2025-107)
- No service line data (post-migration 10 cleanup)

**Data Generation Tool:**
- **Script**: `/scripts/generate-simple-demo-data.ts` (22KB)
- **Output**: `/scripts/simple-demo-data.sql` (90KB)
- **Technology**: TypeScript with `@faker-js/faker` library
- **Customizable**: Adjust team count, initiatives per member, work type distribution

**Note**: The current demo data reflects the organizationally-neutral GovernIQ framework with generic terminology and configurable field options.

### Loading Demo Data

**Quick Start - Load Demo Data:**

1. **Backup production data** (IMPORTANT!)
   - Open Supabase Dashboard → Database → Backups
   - Note the latest backup timestamp

2. **Clear existing data**
   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `/scripts/clear-real-data.sql`
   - Paste and run in SQL Editor
   - Wait for "Data cleared successfully" message

3. **Load demo data**
   - In Supabase SQL Editor (same location)
   - Copy contents of `/scripts/simple-demo-data.sql` (90KB file)
   - Paste and run in SQL Editor
   - Wait for "Demo data loaded" confirmation
   - Expected: 16 team members, 80 initiatives, 2 managers

4. **Validate**
   - Refresh your dashboard at http://localhost:5175
   - Check Dashboard tab → Should show 16 team members
   - Check Browse Initiatives → Should show ~80 initiatives
   - Check Workload → Both Staff View and Manager's View should populate

**Current Demo Data:** `/scripts/simple-demo-data.sql` (Generated October 31, 2025)
- 16 team members (with realistic names)
- 2 managers (Sarah Mitchell, David Thompson)
- 80 initiatives (5 per team member)
- Basic metrics and stories
- No service line data (needs customization post-migration 10)

### Restoring Production Data

**After Demo (Restore Real Data):**

1. Supabase Dashboard → Database → Backups
2. Select the backup you noted before loading demo data
3. Click "Restore" and confirm
4. Wait for restoration to complete (2-5 minutes)
5. Refresh dashboard - your real data will be back

### Regenerating Demo Data

**To create fresh demo data with current neutral terminology:**

```bash
# Edit the generator to adjust counts/distribution
npx tsx scripts/generate-simple-demo-data.ts > scripts/simple-demo-data.sql
```

**Customization options** in `/scripts/generate-simple-demo-data.ts`:
- Line ~50: Adjust number of initiatives per team member (currently 5)
- Line ~80: Adjust work type distribution
- Line ~120: Adjust status distribution (In Progress, Completed, etc.)
- Line ~15: Adjust manager names and details

**After regeneration:**
1. New SQL file created at `/scripts/simple-demo-data.sql`
2. Follow "Loading Demo Data" steps above to load it

### Demo Data Characteristics

**Realistic:**
- Business initiative names (Process Improvement, System Implementation, etc.)
- Valid department/service lines
- Proper work type distribution matching real-world patterns

**Relational Integrity:**
- All foreign keys valid (no orphaned records)
- Bidirectional links preserved (governance ↔ initiatives)
- Sparse population matches real data (not all initiatives have all related data)

**Privacy:**
- No real names, emails, or proprietary data
- Sample manager names
- Generic problem statements and outcomes
- Random but realistic business scenario names

---

## ⚡ Capacity Calculation System (CRITICAL - DO NOT MODIFY)

**Status**: ✅ COMPLETED - Working in Production (October 27, 2025)

**Locations**:
1. **Workload → Staff View** - Individual effort tracking with capacity header
2. **Workload → Manager's View** - Manager dashboard with capacity cards

**Purpose**: Real-time capacity management showing planned vs actual workload for individuals and teams

---

### CRITICAL RULES (DO NOT VIOLATE):

1. **ONE FORMULA FOR CAPACITY** - Same calculation in both Staff View and Manager's View
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

**Color Coding** (Configurable via Admin → Capacity Thresholds):
- 🟢 Well Under Capacity: 0-45% (#22c55e Green)
- 🟢 Under Capacity: 45-60% (#84cc16 Lime Green)
- 🟡 Approaching Capacity: 60-75% (#eab308 Yellow)
- 🟠 Near Capacity: 75-85% (#f59e0b Yellow-Orange)
- 🔴 At Capacity: 85-95% (#dc2626 Red)
- 🟣 Over Capacity: 95-105% (#c026d3 Red-Purple)
- 🟣 Severely Over Capacity: 105-200% (#9333ea Purple)

---

### 1. Workload → Staff View (BulkEffortEntry.tsx)

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

### 2. Workload → Manager's View (TeamCapacityView.tsx)

**Manager Filter Buttons**:
- **All Teams** (16 team members)
- **Manager 1** (their direct reports)
- **Manager 2** (their direct reports)

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
6. **Department/Service Line Coverage** (Bar, Top 8) - Department distribution

**Missing Data Alert**:
- Only shows if initiatives missing capacity fields (role, work_effort, type, phase)
- Does NOT check for metrics/baseline data (not needed for capacity)

**Team Metrics Section** (bottom):
- Total Initiatives (filtered by manager)
- Revenue Impact (sum of projected_annual)
- Avg Capacity (average of plannedPct across filtered team)

---

### Dashboard → Team View (App.tsx)

**Different from Workload Manager's View!**
- NO manager filters (removed Oct 27, 2025)
- Shows all 16 team members in simple card grid
- Click card to see team member detail modal
- Used for general team portfolio overview, not capacity management

---

## Navigation

**Main Navigation Tabs** (Top Bar, left to right):
1. **Request Intake** - Governance portal for new team requests
2. **Workforce** - Capacity management (Staff View, Manager's View, Admin)
3. **Dashboard** - Portfolio overview (Overview mode, Team mode)
4. **AI Insights** - Strategic decision support chat

**Note**: Tab order and labels were reorganized October 31, 2025 for improved workflow.

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
- EHR platform assignments (if applicable)
- Key highlights per team member
- Categorized initiative lists by work type

**Categories:**
- System Initiatives (blue)
- System Projects (purple)
- Supported Tickets and Projects (orange)
- Governance (purple)
- Other (gray)

### 2. Team Requests (Governance Portal)

**Purpose**: Intake and workflow management for new team consultation requests with automatic initiative creation

**Status**: ✅ PRODUCTION - Phase 1/Phase 2 Workflow Active

**Enhanced Workflow with Automatic Initiative Creation:**
```
1. Requestor submits consultation request
   ↓ (status: Draft)
2. Requestor finalizes submission
   ↓ (status: Ready for Review)
3. Team Lead assigns staff member
   ↓ 🔄 PHASE 1 AUTO-RUNS: Creates minimal initiative for effort tracking
   ↓ Initiative created with request_id link (GOV-YYYY-XXX)
4. Staff member updates to Ready for Governance
   ↓ 🔄 PHASE 2 AUTO-RUNS: Populates full initiative details
   ↓ Initiative becomes fully searchable with metrics, financials, stories
5. Optional: Convert to standalone initiative
   ↓ (status: Converted to Initiative)
```

**Phase 1: Minimal Initiative Creation**
- **Trigger**: Status = "Ready for Review" + Staff member assigned
- **Function**: `createInitiativeForAssignedRequest()` in governanceConversion.ts
- **Creates**:
  - Initiative record linked to governance request
  - Fields: request_id (GOV-YYYY-XXX), owner, type, status=Not Started
  - Purpose: Enables immediate effort tracking in My Effort table
  - Links: governance_request.linked_initiative_id ↔ initiative.governance_request_id

**Phase 2: Full Initiative Population**
- **Trigger**: Status = "Ready for Governance"
- **Function**: `populateInitiativeDetails()` in governanceConversion.ts
- **Populates**:
  - Problem statement, desired outcomes, collaborators
  - Financial projections (projected_annual_revenue, methodology)
  - Initiative metrics (baseline, target values)
  - Success story template (challenge, approach, outcome)
  - Status changed to "In Progress"
  - Purpose: Makes initiative fully searchable and reportable

**Request ID Format**: GOV-YYYY-XXX (e.g., GOV-2025-001, GOV-2025-002)
- Auto-generated sequentially per year
- Displayed under initiative name in My Effort table
- Used for routing and linking

**Features:**
- Comprehensive intake form (requestor info, business justification, expected outcomes)
- Staff assignment workflow with Phase 1 auto-trigger
- Impact estimation (users, revenue, time savings, timeline)
- Automatic initiative creation for effort tracking
- Full initiative population for governance readiness
- Bidirectional linking between requests and initiatives
- One-click conversion to standalone initiative (optional)

**✅ Validation Status (October 30, 2025):**
- **Complete end-to-end data flow validated** with live test cases
- **Phase 1 trigger confirmed** - Minimal initiative created when staff assigned
- **Phase 2 trigger confirmed** - Full details populated when status = "Ready for Governance"
- **Financial records** - Automatically created by Phase 2
- **Initiative stories** - Problem/outcomes transferred successfully
- **Bidirectional linking** - governance_requests ↔ initiatives verified intact
- **Capacity calculations** - Updating correctly with new governance initiatives
- **All dashboard views** - Synchronized (Browse, Dashboard, Team View, Staff View)

**Components:**
- `GovernancePortalView.tsx` - Main portal interface
- `GovernanceRequestForm.tsx` - Comprehensive intake form (51KB)
- `GovernanceRequestDetail.tsx` - Detail modal with Phase 1/2 triggers (39KB)
- `SCIRequestsCard.tsx` - Shows assigned requests in Staff View (rename pending to TeamRequestsCard)
- `governanceConversion.ts` - Phase 1/2 workflow logic (748 lines)

### 3. Browse Initiatives

**Purpose**: Searchable, filterable library of all initiatives

**Features:**
- **5 categories**: System Initiatives, System Projects, Supported Tickets/Projects, Governance, Other
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
- Table view showing all active/planning initiatives grouped by work type
- Inline editing: hours, effort size (XS-XXL), notes
- **Skip checkbox**: Mark "no work this week" (saves 0 hours with note)
- **"+ Add Initiative" button**: Opens InitiativeSubmissionForm to add new initiative
- **Add Misc. Assignment**: Create ad-hoc General Support tasks on-the-fly
- **Copy Last Week**: Auto-fill effort from previous week
- **Reassign button**: Transfer initiative ownership to another team member
- **Delete button**: Remove initiative (soft delete, status → "Deleted")
- **Batch save**: Save all modified entries at once

**Work Type Display Order** (BulkEffortEntry.tsx line 446):
1. Governance
2. Policy/Guidelines
3. System Project
4. Market Project
5. System Initiative
6. Ticket
7. General Support
8. Epic Gold
9. Epic Upgrades
10. Uncategorized

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

### 6. Admin Configuration System

**Purpose**: Dynamic customization without code changes

**Location**: Workforce tab → Admin sub-tab → System Configuration

**Two Main Sections:**

#### A. Application Settings
- **Banner Title**: Main header title (default: "GovernIQ")
- **Organization Name**: Organization identifier (default: "Sample Healthcare")
- **Primary Brand Color**: Main color for buttons, headers, navigation tabs (default: "#9B2F6A")
  - Dynamically updates entire UI when changed
  - Generates lighter/darker variants automatically
  - Applied via CSS variables throughout the app
- **Workload Staff View Label**: Individual view label (default: "Staff View")
- **Workload Manager View Label**: Manager view label (default: "Manager's View")

#### B. Field Options
Manage dropdown options for 10 field types with contextual help:
- **Work Types**: System Initiative, Project, Governance, etc.
- **Roles**: Owner, Co-Owner, Secondary, Support
- **Phases**: Discovery, Design, Build, Test, Deploy, etc.
- **Work Effort**: XS, S, M, L, XL
- **Service Lines**: Ambulatory, Pharmacy, Nursing, etc.
- **EHR Platforms**: Epic, Cerner, etc.
- **Statuses**: Not Started, In Progress, Completed, etc.
- **Team Roles**: Enterprise Team, Market Team, Department Team
- **Groups Impacted**: Nurses, Physicians/APPs, Lab, Pharmacy, etc. (7 options)
- **Impact Categories**: Board Goal, Strategic Plan, Patient Safety, etc. (6 options)

Each field option has:
- Key (internal identifier)
- Label (displayed to users)
- Description
- Display order
- Primary color (for work types, statuses, work effort)
- Active/inactive status
- **Contextual help card** showing where the field is used in the app

#### C. Capacity Thresholds
Configure color-coded capacity ranges:
- **Under Capacity**: < 60% (Green)
- **Near Capacity**: 60-74% (Amber)
- **At Capacity**: 75-84% (Orange)
- **Over Capacity**: 85-99% (Red)
- **Severely Over Capacity**: ≥ 100% (Purple)

**Workload Calculator Settings**:
- Role weights (Owner, Co-Owner, Secondary, Support)
- Type weights (System Initiative, Project, Governance, etc.)
- Phase weights (Discovery, Design, Build, Test, etc.)
- Work effort base hours (XS=0.5, S=1.5, M=3.5, L=7.5, XL=15)

---

## Status Field Standardization

**Consistent across all views:**

- **Not Started** - Initiative planned but work hasn't begun
- **In Progress** - Active work happening
- **On Hold** - Temporarily paused
- **Completed** - Work finished successfully
- **Cancelled** - Initiative discontinued

**Applied to:**
- Dashboard filtering (Active tab shows: Not Started, In Progress, On Hold, Active, Planning, Scaling)
- Browse Initiatives filtering
- Effort tracking (shows: Not Started, In Progress, On Hold, Active, Planning, Scaling)
- Initiative cards and badges

**Note on "On Hold" Status:**
- Initiatives marked "On Hold" remain visible in all effort tracking views (Staff View, Manager's View)
- This allows teams to see paused work and manage capacity accordingly
- "On Hold" initiatives are grouped with active work, not with completed initiatives
- Use "On Hold" for temporary pauses; use "Cancelled" to permanently discontinue work

---

## Initiative Form Fields & Options

**Form Location**: InitiativeSubmissionForm.tsx

### Work Type Options
**Purpose**: Categorizes initiatives for workload tracking and reporting

**Available Values** (configurable in Admin → Field Options):
- Epic Gold
- Governance
- System Initiative
- System Project
- Epic Upgrades
- General Support
- Policy/Guidelines
- Market Project
- Ticket

### Phase Options
**Purpose**: Tracks project lifecycle stage for capacity planning

**Available Values** (configurable in Admin → Field Options):
- Discovery/Define
- Design
- Build
- Validate/Test
- Deploy
- Did we Deliver
- Post Go Live Support
- In Progress
- Maintenance
- Steady State
- N/A

### Work Effort (Estimated Weekly Hours)
**Purpose**: Initial capacity estimate for planning

**Available Values**:
- XS - Less than 1 hr/wk
- S - 1-2 hrs/wk
- M - 2-5 hrs/wk (default)
- L - 5-10 hrs/wk
- XL - More than 10 hrs/wk

**Mapped to Hours** (for capacity calculation - workloadCalculator.ts):
- XS = 0.5 hours
- S = 1.5 hours
- M = 3.5 hours
- L = 7.5 hours
- XL = 15 hours

### EHRs Impacted
**Purpose**: Tracks which electronic health record systems are affected (if applicable)

**Available Values**:
- All
- Epic
- Cerner
- Altera
- Epic and Cerner

### Service Line / Department Options
**Purpose**: Identifies organizational area or department

**Available Values** (configurable in Admin → Field Options):
- Ambulatory
- Pharmacy
- Nursing
- Cardiology
- Emergency Department
- Inpatient
- Perioperative
- Laboratory
- Radiology
- Revenue Cycle
- Other

### Role Options (Team Member Assignment)
**Purpose**: Defines team member's involvement level

**Available Values**:
- Owner - Primary responsible party
- Co-Owner - Shared primary responsibility
- Secondary - Supporting role
- Support - Minor involvement

### Team Role Options (Team Member Profile)
**Purpose**: Categorizes team members by organizational scope

**Available Values** (configurable in Admin → Field Options → Team Roles):
- Enterprise Team - Enterprise-level team member supporting organization-wide initiatives
- Market Team - Market-level team member supporting regional or market-specific initiatives
- Department Team - Department-level team member supporting divisional or department initiatives

---

## Tech Stack

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type safety and IntelliSense
- **Vite** - Build tool with HMR (Hot Module Replacement)
- **Tailwind CSS** - Utility-first styling with Apple system font stack (-apple-system, SF Pro Display/Text)
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
│   ├── components/                  # React components (28 files)
│   │   ├── AdminTabContainer.tsx            # Admin panel container
│   │   ├── ApplicationSettings.tsx          # Branding & labels config
│   │   ├── BulkEffortEntry.tsx              # Bulk effort logging table
│   │   ├── CapacityGauge.tsx                # Visual capacity indicator
│   │   ├── CapacityThresholdsSettings.tsx   # Capacity threshold config
│   │   ├── CompletionIndicator.tsx          # Progress indicators
│   │   ├── EffortLogModal.tsx               # Individual effort entry
│   │   ├── EffortSparkline.tsx              # Effort trend visualization
│   │   ├── FieldOptionsSettings.tsx         # Field options management
│   │   ├── GovernancePortalView.tsx         # Governance portal main view
│   │   ├── GovernanceRequestDetail.tsx      # Request detail with Phase 1/2
│   │   ├── GovernanceRequestForm.tsx        # Comprehensive intake form (51KB)
│   │   ├── InitiativeCard.tsx               # Initiative display card
│   │   ├── InitiativeModal.tsx              # Initiative detail modal
│   │   ├── InitiativeSubmissionForm.tsx     # Create/edit initiatives
│   │   ├── InitiativesTableView.tsx         # Categorized initiative table
│   │   ├── InitiativesView.tsx              # Browse initiatives view
│   │   ├── InsightsChat.tsx                 # AI-powered insights chat
│   │   ├── LandingPage.tsx                  # Application landing page
│   │   ├── LoadBalanceModal.tsx             # AI workload redistribution
│   │   ├── ManagersPanel.tsx                # Manager dashboard panel
│   │   ├── PersonalWorkloadDashboard.tsx    # Effort tracking dashboard
│   │   ├── ReassignModal.tsx                # Initiative reassignment
│   │   ├── SCIRequestsCard.tsx              # Assigned requests widget
│   │   ├── StaffDetailModal.tsx             # Team member detail view
│   │   ├── TeamCapacityCard.tsx             # Capacity card (200px)
│   │   ├── TeamCapacityModal.tsx            # 6-metric productivity modal
│   │   ├── TeamCapacityView.tsx             # Manager capacity dashboard
│   │   ├── TeamManagementPanel.tsx          # Team administration
│   │   ├── WorkloadCalculatorSettings.tsx   # Capacity weight configuration
│   │   └── WorkloadDashboard.tsx            # Workload analytics view
│   ├── lib/                                 # Utilities and helpers (8 files)
│   │   ├── completionUtils.ts               # Completion calculations
│   │   ├── effortUtils.ts                   # Effort tracking utilities
│   │   ├── governanceConversion.ts          # Phase 1/2 workflow + conversion
│   │   ├── governanceUtils.ts               # Governance helpers & validation
│   │   ├── supabase.ts                      # Supabase client + type definitions
│   │   ├── useApplicationConfig.ts          # Application config hook
│   │   ├── useFieldOptions.ts               # Field options hook
│   │   ├── workloadCalculator.ts            # Capacity calculation engine
│   │   └── workloadUtils.ts                 # Workload helper functions
│
├── supabase/
│   └── migrations/                 # Database schema migrations (14 files)
│
├── scripts/                        # Data generation and utilities
│   ├── generate-demo-data.ts      # Demo data generator
│   ├── demo-data.sql              # Generated demo data (10,674 lines)
│   ├── clear-real-data.sql        # Production data clearing script
│   └── DEMO_DATA_INSTRUCTIONS.md  # Demo data documentation
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

#### Team & Configuration Tables
- `team_members` - Team member profiles, manager assignments, service line specialties
- `managers` - Manager profiles and organizational structure
- `application_config` - Dynamic branding and labels (banner title, org name, view labels)
- `field_options` - Configurable dropdown options (8 field types: work_type, role, phase, work_effort, service_line, ehr_platform, status, team_role)
- `capacity_thresholds` - Color-coded capacity ranges
- `workload_calculator_config` - Capacity formula multiplier weights

#### Initiatives (415+ active rows as of October 31, 2025)
- `initiatives` - Core initiative tracking (single source of truth)
  - **Basic**: owner_name, initiative_name, type, status, team_member_id
  - **Classification**: role, ehrs_impacted, service_line
  - **Timeline**: start_date, end_date, phase, work_effort, timeframe_display
  - **Collaboration**: clinical_sponsor_name, clinical_sponsor_title, key_collaborators, governance_bodies
  - **Governance Links**: governance_request_id (UUID), request_id (GOV-YYYY-XXX)
  - **Meta**: is_draft, is_active, completion_percentage, completion_status, section_last_updated, desired_outcomes, direct_hours_per_week
- `initiative_metrics` - Performance metrics - baseline, current, target values with improvement %
- `initiative_financial_impact` - Revenue, cost savings, calculation methodology
- `initiative_performance_data` - Users deployed, adoption rates, outcomes
- `initiative_projections` - Scaling scenarios and ROI calculations
- `initiative_stories` - Success stories (challenge, approach, outcome, collaboration)

#### Governance Portal (User-Generated)
- `governance_requests` - Team consultation intake with Phase 1/2 workflow
  - **Requestor**: submitter_name, submitter_email, division_region
  - **Request**: title, problem_statement, desired_outcomes, system_leader
  - **Impact**: patient_care_value, compliance_regulatory_value, financial_impact
  - **Affected Groups**: groups_physicians_apps, groups_nurses, groups_pharmacy, groups_lab, groups_radiology, groups_therapies, groups_administration, groups_other
  - **Impacts**: impact_patient_safety, impact_regulatory_compliance, impact_financial, impact_metrics, impact_system_policy, impact_board_goal, impact_strategic_plan, impact_other
  - **Governance**: voting_bodies, voting_statement, impacted_ehr_areas, proposed_solution
  - **Staff Assignment**: assigned_sci_id, assigned_sci_name, assigned_role, work_effort, work_type
  - **Initiative Link**: linked_initiative_id (created by Phase 1)
  - **Scoring**: benefit_score, effort_score, total_score, priority_rank
  - **Status Workflow**: status, submitted_date, reviewed_date, approved_date, completed_date, converted_at, converted_by
  - **Unique ID**: request_id (GOV-YYYY-XXX format, auto-generated)

#### Effort Tracking (User-Generated)
- `effort_logs` - Weekly time tracking per initiative
  - **Fields**: team_member_id, initiative_id, week_start_date, hours_spent, effort_size, note
  - **Timestamps**: created_at, updated_at
  - **Purpose**: Tracks actual time spent for capacity management

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
1. Team Requests → Select approved request
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

### Configuring Application Settings

1. Navigate to Admin tab → Admin Configurations
2. **Application Settings**: Edit banner title, organization name, view labels
3. **Field Options**: Manage dropdown options for 8 field types
4. **Capacity Thresholds**: Configure color-coded capacity ranges
5. All changes take effect immediately (1-minute cache)

---

## Color Scheme (Default - Customizable)

- **Primary**: `#9B2F6A` (Magenta)
- **System Initiatives**: `#00A1E0` (Blue)
- **Governance**: `#6F47D0` (Purple)
- **Projects**: `#9C5C9D` (Purple)
- **General Support**: `#F58025` (Orange)
- **Text**: `#565658` (Dark Gray)

**Note**: Colors are configurable through Admin → Field Options for each field type.

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
- **Configuration Hooks**: useApplicationConfig.ts, useFieldOptions.ts
- **Routing**: All in App.tsx (no react-router, just conditional rendering)

---

## Deployment

### Production Build

```bash
npm run build
```

Output in `/dist/` folder ready for static hosting.

### Database Migrations

All migrations are in `/supabase/migrations/` (14 timestamped SQL files).

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
2. Team member filter - May be filtered to specific staff member
3. Type filter - Initiative may be in different category
4. Search term - May be filtering results

### Issue: Edit Form Not Populating

**Root Cause**: Data not being fetched with full relations

**Solution**: Ensure initiatives are fetched WITH related data:
```typescript
const initiatives = await fetchInitiativesWithDetails(); // Includes metrics, financial, etc.
```

BulkEffortEntry.tsx fetches all related tables.

### Issue: Effort Logs Not Saving

**Check:**
1. Week selected (can't log for future weeks)
2. Hours entered or effort size selected
3. Initiative is Active/Planning status
4. Browser console for Supabase errors

### Issue: Admin Configuration Not Updating

**Check:**
1. Changes saved (click "Save Changes" button)
2. Wait 1 minute for cache to expire OR refresh page
3. Browser console for Supabase errors
4. Verify RLS policies allow writes

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

`/archive/` contains development artifacts and historical migrations. **Total: 187+ archived files organized in 13 subdirectories.**

#### Demo Preparation Archive (October 31, 2025)

**57 files moved** to clean up repository for demo. See `/archive/2025-demo-prep-README.md` for complete inventory.

**Structure:**
- `/archive/2025-10-30-work-session/` - Oct 30 work notes and audit scripts
- `/archive/adhoc-migrations/rls-fixes/` - RLS debugging/fix scripts
- `/archive/adhoc-migrations/data-cleanup/` - Data quality cleanup scripts
- `/archive/source-data/excel-files/` - Legacy Excel source files
- `/archive/source-data/csv-exports/` - Individual team member CSV exports
- `/archive/development-docs/migration-planning/` - Migration planning docs
- `/archive/development-docs/data-analysis/` - Data quality analysis
- `/archive/development-docs/feature-implementations/` - Feature implementation notes
- `/archive/development-docs/screenshots/` - Development screenshots
- `/archive/test-artifacts/` - HTML test pages and diagnostics

#### Assignment Migration Archive (October 30, 2025)

**Complete migration documentation** for assignments → initiatives migration:
- `/archive/migrations/2025-10-30-assignment-migration/` - Complete migration documentation
  - 31 SQL scripts organized in 6 folders
  - Comprehensive README documenting 57-item migration (98.3% success rate)

---

## Framework Metadata

**Framework Name**: GovernIQ Enterprise Management Platform
**Version**: v1.0 (Demo Ready)
**Developer**: Marty Koepke
**Development Period**: 2025
**Last Updated**: October 31, 2025, 3:00 PM PST
**License**: All rights reserved by developer
**Development Context**: Independent personal project using personal resources

---

## Legal Notice

This software framework represents original intellectual property created independently by Marty Koepke. The framework, including all source code, database schemas, and associated documentation, was developed using personal equipment, personal cloud accounts, and personal resources during non-employment hours. No employer systems, credentials, proprietary information, or company resources were utilized in the creation of this framework.

### Organizational Neutrality

**This framework is intentionally designed to be organizationally neutral and adaptable to any business context.** The architecture, data models, and functionality are purposefully generic and configurable:

- **No hardcoded business logic** - All field options, statuses, and workflows are database-driven
- **Industry agnostic** - Suitable for healthcare, technology, manufacturing, consulting, or any organizational structure
- **Customizable terminology** - All labels, categories, and branding configurable through Admin UI
- **Flexible data models** - Initiative tracking, capacity management, and governance workflows adapt to any domain
- **No proprietary dependencies** - Uses open-source technologies and standard patterns

The framework demonstrates technical capabilities in work management, capacity planning, and organizational governance that transcend any specific industry or employer.

All rights reserved. Contact the developer for licensing inquiries.

---

**End of Documentation**
