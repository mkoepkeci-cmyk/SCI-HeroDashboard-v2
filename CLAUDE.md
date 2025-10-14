# System Clinical Informatics Dashboard

A React-based dashboard application for tracking and visualizing the impact of CommonSpirit Health's System Clinical Informatics team initiatives, assignments, and performance metrics.

## Data Architecture

**All data comes from Supabase tables, synced from Google Sheets:**

```
Google Sheets (Source of Truth)
    ↓ (Auto-sync)
Supabase Tables
    ↓ (API)
React Dashboard App
```

### Data Sources

1. **Google Sheets → Supabase** (Auto-synced):
   - `team_members` - Team member information
   - `assignments` - Individual work assignments
   - `initiatives` - Initiative details and metadata
   - `dashboard_metrics` - Pre-calculated workload metrics
   - All other initiative-related tables

2. **User-Generated Data** (Created in app):
   - `effort_logs` - Weekly time tracking (NOT in Google Sheets)

**IMPORTANT**: The dashboard reads from Supabase tables, NOT from CSV/Excel files. Any CSV references in docs are legacy and should be ignored.

---

## Project Overview

This application provides comprehensive visibility into team member portfolios, work distributions, and the financial/operational impact of clinical informatics initiatives across the health system.

### Key Features

- **Team Overview Dashboard**: High-level metrics showing team size, active assignments, revenue impact, and efficiency gains
- **Team Member Portfolios**: Individual views showing work type distribution, EHR platform assignments, and key highlights
- **Initiative Tracking**: Detailed tracking of major initiatives with financial impact, performance data, projections, and success stories
- **Data Management**: Forms for creating and editing initiatives with metrics, financial data, and performance information
- **Effort Tracking**: Weekly time logging for capacity management and workload visibility

---

## 🚀 DATA POPULATION INSTRUCTIONS

### Current Status

**Marty's data has been completed as a pilot:**
- 7 total initiatives populated (3 completed, 4 active)
- Initiatives categorized by work type
- All new fields (Role, EHRs Impacted, Service Line) implemented
- Process documented and tested

### Remaining SCI Team Members

**CSV files in `documents/` folder for 15 additional team members:**
- Ashley, Brooke, Dawn, Jason, Josh, Kim, Lisa, Marisa, Matt, Melissa, Robin, Sherry, Trudy, Van, Yvette

### Data Population Strategy

**DO NOT duplicate work_type_summary counts!**

The current system has two data types:
1. **work_type_summary** - Aggregate counts (e.g., "Josh has 47 assignments")
2. **initiatives** - Detailed project tracking with metrics, financials, stories

**Key Principle:** When adding initiatives, DO NOT increase the total_assignments count. Initiatives are a "drill-down" into existing assignments.

### Step-by-Step Process for Each SCI

#### 1. Review CSV File
For each team member (e.g., Josh):
- Read `documents/SCI Assignments Tracker - [Name].csv`
- Identify 3-7 highest-impact assignments that should become detailed initiatives

#### 2. Selection Criteria for Initiatives

**Create initiatives for:**
- ✅ Projects with defined go-live dates
- ✅ System-wide initiatives (multi-market impact)
- ✅ Work with measurable outcomes (revenue, time savings, users)
- ✅ Assignments with clinical sponsor/governance oversight
- ✅ Significant work effort (M, L, XL size)
- ✅ Completed work worth showcasing

**DO NOT create initiatives for:**
- ❌ Routine governance meeting attendance
- ❌ Epic Gold CAT facilitation (unless major deliverable)
- ❌ Standard support/consulting work
- ❌ Minor optimization requests
- ❌ Weekly/monthly recurring meetings

#### 3. Data Mapping from CSV to Form

| CSV Column | Form Field | Notes |
|------------|------------|-------|
| SCI | Team Member | Select from dropdown |
| SCI | Owner | Same as team member name |
| Assignment | Initiative Name | Clean up formatting |
| Work Type | Type | Direct map |
| Status | Status | Direct map |
| Role | Role | Primary/Co-Owner/Secondary/Support |
| EHR/s Impacted | EHRs Impacted | All/Epic/Cerner/Altera |
| Service Line | Service Line | Ambulatory, Pharmacy, etc. |
| Projected Go-Live Date | End Date | If available |
| Assignment Date | Start Date | If available |
| Sponsor | Clinical Sponsor Name | Parse name |
| Short Description | Story - Challenge | Use for context |
| Comments/Details | Story - Approach/Outcome | Rich context here |

#### 4. Fields That Require Additional Research

These fields are NOT in CSV - leave blank or research:
- Clinical Sponsor Title
- Governance Bodies (may be in comments)
- Key Collaborators (may be in description)
- Financial Impact (all fields)
- Metrics (baseline/current/target values)
- Performance Data (users deployed, adoption rate)
- Projections (scaling scenarios)

#### 5. Example Workflow for Josh

Josh has 47 total assignments. Recommended 5-7 initiatives:

**High Priority (Create These):**
1. C5 Titrations of Medications Workgroup (System Initiative, go-live 6/3/25)
2. Alaris Pumps Standardization Project (Project, weekly meetings)
3. Standardizing Medication Charging (Epic Gold, XL effort, system-wide)
4. Heparin Drip Calculator Standardization (Epic Gold, design phase)
5. Epic Upgrade Nova Note Review - Willow Inpatient (Epic Upgrades, completed)

**Keep as work_type_summary (Don't Create):**
- All 8 SCrPT governance meetings
- Epic Gold CAT participation
- Regional support meetings

**Result:** Josh still shows 47 total assignments, but now has 5-7 detailed initiatives

#### 6. Creating Initiatives

**Option A: Use the UI** (Recommended for refinement)
1. Go to http://localhost:5175
2. Click "Add Data"
3. Fill out form for each initiative
4. Use only data from CSV (don't invent)
5. Leave unknown fields blank

**Option B: Create Scripts** (Recommended for bulk)
1. Use `populate-marty-initiatives.ts` as template
2. Create similar script for each team member
3. Map CSV data to initiative fields
4. Run script: `npx tsx populate-[name]-initiatives.ts`

### Team Member Priority Order

**Start with team members who have:**
1. Highest assignment counts (more visible impact)
2. Clear project work (easier to identify initiatives)
3. Completed work to showcase

**Suggested Order:**
1. ✅ Marty (COMPLETED - 19 assignments → 7 initiatives)
2. Josh (47 assignments - pharmacy/Epic Gold focus)
3. Van (31 assignments)
4. Dawn (30 assignments)
5. Lisa (27 assignments)
6. Trudy (25 assignments)
7. Sherry (23 assignments)
8. Continue with remaining team members...

### Quality Over Quantity

**Better to have:**
- 50-100 well-documented initiatives
- Complete information from CSV
- Clear impact stories

**Than:**
- 500 half-empty initiative records
- Missing critical data
- Duplicated work_type_summary counts

### Example Scripts Directory

Reference these for guidance:
- `populate-marty-initiatives.ts` - Marty's active initiatives
- `add-completed-initiatives.ts` - Marty's completed initiatives

### Data Integrity Checks

After populating each team member:

**Verify:**
1. ✅ total_assignments count UNCHANGED
2. ✅ work_type_summary counts UNCHANGED
3. ✅ 3-7 new initiatives created
4. ✅ Initiatives show in Team view, categorized by work type
5. ✅ All data comes from CSV (no invented information)

### Documentation References

See `documents/` folder:
- **DATA_POPULATION_ANALYSIS.md** - Comprehensive analysis and strategy
- **MARTY_INITIATIVES_PLAN.md** - Example of selection process
- **ACTION_CHECKLIST.md** - Step-by-step actions
- **COMPLETED_CHANGES_SUMMARY.md** - Overview of all changes

---

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Backend/Database**: Supabase
- **Icons**: Lucide React

## Project Structure

```
src/
├── App.tsx                              # Main application component with routing and views
├── main.tsx                             # Application entry point
├── index.css                           # Global styles
├── components/
│   ├── CompletionIndicator.tsx         # Visual indicator for completion percentages
│   ├── InitiativeCard.tsx              # Initiative display card with metrics
│   ├── InitiativeSubmissionForm.tsx    # Form for creating/editing initiatives
│   └── InitiativesView.tsx             # List view of all initiatives
└── lib/
    ├── supabase.ts                     # Supabase client and type definitions
    └── completionUtils.ts              # Utilities for completion calculations
```

## Database Schema

The application uses Supabase with the following main tables:

### Core Tables (Synced from Google Sheets)
- `team_members`: Core team member information
- `assignments`: Individual work assignments per team member
- `dashboard_metrics`: Pre-calculated workload and capacity metrics
- `work_type_summary`: Work type distribution per team member (AGGREGATE COUNTS - DO NOT DUPLICATE)
- `ehr_platform_summary`: EHR platform assignments
- `key_highlights`: Key achievements and highlights

### Initiative Tables (Synced from Google Sheets)
- `initiatives`: Main initiative records with new fields:
  - `role` (TEXT) - Primary/Co-Owner/Secondary/Support
  - `ehrs_impacted` (TEXT) - All/Epic/Cerner/Altera
  - `service_line` (TEXT) - Ambulatory, Pharmacy, Nursing, etc.
- `initiative_metrics`: Performance metrics for initiatives
- `initiative_financial_impact`: Financial data and revenue impact
- `initiative_performance_data`: Operational performance metrics
- `initiative_projections`: Future projections and goals
- `initiative_stories`: Success stories and testimonials

### Effort Tracking Tables (User-Generated)
- `effort_logs`: Weekly time tracking per initiative
  - One log per initiative per team member per week
  - Tracks hours_spent, effort_size (XS-XXL), and notes
  - NOT synced from Google Sheets - created by users in the app
- Views: `weekly_effort_summary`, `initiative_effort_trends`

## Development

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account with configured project

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Key Metrics Tracked

### Team Metrics
- Total assignments per team member
- Work type distribution (Epic Gold, System Initiatives, Governance, Projects, etc.)
- EHR platform coverage (Epic, Cerner, etc.)
- Revenue impact

### Initiative Metrics
- Financial impact (revenue generated, cost savings)
- Operational efficiency (time savings, workdays saved)
- Patient impact (encounters, screenings, visits)
- Regional performance data
- Future projections

## Color Scheme

The application uses CommonSpirit Health brand colors:
- Primary: `#9B2F6A` (Magenta)
- System Initiatives: `#00A1E0` (Blue)
- Governance: `#6F47D0` (Purple)
- Projects: `#9C5C9D` (Purple)
- General Support: `#F58025` (Orange)
- Text: `#565658` (Dark Gray)

## Key Components

### App.tsx
Main application component managing:
- View routing (Overview, Team, Initiatives, Add Data)
- Data fetching from Supabase
- State management for team members and initiatives
- Navigation and layout
- **NEW**: Team view with categorized initiatives by work type

### InitiativeCard.tsx
Displays initiative details with:
- Completion indicators
- Financial impact metrics
- Performance data
- Timeline information
- Edit functionality

### InitiativeSubmissionForm.tsx
Multi-step form for managing initiatives:
- Basic information (name, owner, type, status, role, EHRs, service line)
- Governance & collaboration
- Metrics and KPIs
- Financial impact data
- Performance metrics
- Future projections
- Success stories

## Form Fields Reference

### Basic Information Section
- Team Member (dropdown - optional)
- Role (dropdown - optional): Primary/Co-Owner/Secondary/Support
- Owner (text - required)
- Initiative Name (text - required)
- Type (dropdown - required): System Initiative/Project/Epic Gold/Governance/General Support/Policy
- Status (dropdown - required): Planning/Active/Scaling/Completed/On Hold
- EHRs Impacted (dropdown - optional): All/Epic/Cerner/Altera/Epic and Cerner
- Service Line (text - optional): e.g., Ambulatory, Pharmacy, Nursing
- Start Date (date - optional)
- End Date (date - optional)
- Timeframe Display (text - optional)

### All Other Sections
See `InitiativeSubmissionForm.tsx` for complete field list

## Notes

- The application is designed for internal use by CommonSpirit Health's System Clinical Informatics team
- All financial and operational data is retrieved from Supabase in real-time
- The dashboard supports both aggregate and individual team member views
- **CRITICAL**: Do not duplicate work_type_summary counts when adding initiatives - initiatives are drill-downs, not new assignments
- Supabase credentials are stored in `.env` file (not committed to repository)
- CSV source files in `documents/` folder contain raw assignment data for all team members
- Use Marty's completed work as reference model for quality and approach
