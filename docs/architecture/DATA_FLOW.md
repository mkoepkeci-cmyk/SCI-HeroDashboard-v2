# Data Flow Architecture

## Overview

The SCI Hero Dashboard is a React single-page application (SPA) that connects to Supabase (PostgreSQL) for data storage and retrieval.

## Data Sources

### Primary Data Source: Google Sheets → Supabase (Auto-synced)

```
Google Sheets (Source of Truth)
    ↓ (Auto-sync mechanism)
Supabase Tables (PostgreSQL)
    ↓ (Supabase JS Client)
React Application (Browser)
```

**Synced Tables** (Read from Supabase, updated from Google Sheets):
- `team_members`
- `assignments`
- `work_type_summary`
- `ehr_platform_summary`
- `key_highlights`
- `dashboard_metrics`
- `initiatives` (except effort logs)
- `initiative_metrics`
- `initiative_financial_impact`
- `initiative_performance_data`
- `initiative_projections`
- `initiative_stories`

### User-Generated Data (Created in App)

**Tables created and managed within the dashboard:**
- `effort_logs` - Weekly time tracking (NOT in Google Sheets)
- `governance_requests` - SCI request intake (NOT in Google Sheets)

---

## Application Architecture

### Technology Stack

```
Frontend:
  React 18 (UI framework)
  TypeScript (Type safety)
  Vite (Build tool, dev server, HMR)
  Tailwind CSS (Styling)
  Recharts (Data visualization)
  Lucide React (Icons)

Backend/Database:
  Supabase (PostgreSQL + API + Auth + RLS)

Build & Deploy:
  npm (Package management)
  Vite (Bundling & optimization)
```

### Component Hierarchy

```
App.tsx (Main Router & State Management)
├── Dashboard View
│   ├── Overview Mode (Team-level metrics)
│   └── Team Mode (Individual portfolios)
├── SCI Requests View
│   ├── GovernanceRequestForm (Intake form)
│   ├── GovernanceRequestsList (All requests)
│   └── GovernanceRequestDetail (Individual request)
├── Browse Initiatives View
│   └── InitiativesTableView (Categorized table)
│       └── InitiativeCard (Individual initiative display)
├── My Effort View
│   └── PersonalWorkloadDashboard
│       ├── BulkEffortEntry (Bulk time logging)
│       ├── EffortLogModal (Individual entry)
│       ├── ReassignModal (Initiative reassignment)
│       └── SCIRequestsCard (Governance requests widget)
└── Workload View
    └── PersonalWorkloadDashboard (Analytics mode)
```

---

## Data Flow Patterns

### 1. Initial Data Load (App.tsx)

When the app starts:

```typescript
useEffect(() => {
  fetchTeamData();
}, []);

async function fetchTeamData() {
  // 1. Fetch all base tables in parallel
  const [members, initiatives, metrics, financial, ...] = await Promise.all([
    supabase.from('team_members').select('*'),
    supabase.from('initiatives').select('*'),
    supabase.from('initiative_metrics').select('*'),
    supabase.from('initiative_financial_impact').select('*'),
    // ... more fetches
  ]);

  // 2. Client-side join of related data
  const initiativesWithDetails = initiatives.map(initiative => ({
    ...initiative,
    metrics: metrics.filter(m => m.initiative_id === initiative.id),
    financial_impact: financial.find(f => f.initiative_id === initiative.id),
    // ... attach all related data
  }));

  // 3. Attach initiatives to team members
  const membersWithDetails = members.map(member => ({
    ...member,
    initiatives: initiativesWithDetails.filter(i => i.team_member_id === member.id),
    // ... attach other related data
  }));

  // 4. Set state for consumption by child components
  setTeamMembers(membersWithDetails);
}
```

**Why client-side joins?**
- Supabase RLS policies are simpler with separate fetches
- Easier to cache and optimize individual table queries
- More flexible for different view requirements

### 2. Create/Update Operations

#### Example: Creating a New Initiative

```typescript
// 1. User fills out InitiativeSubmissionForm
// 2. Form submits data to Supabase

async function handleSubmit(formData) {
  // Insert main initiative record
  const { data: initiative } = await supabase
    .from('initiatives')
    .insert({
      owner_name: formData.ownerName,
      initiative_name: formData.initiativeName,
      status: formData.status,
      // ... more fields
    })
    .select()
    .single();

  // Insert related metrics (if any)
  if (metrics.length > 0) {
    await supabase
      .from('initiative_metrics')
      .insert(metrics.map(m => ({
        initiative_id: initiative.id,
        metric_name: m.metricName,
        // ... more fields
      })));
  }

  // Insert financial impact (if any)
  if (hasFinancialData) {
    await supabase
      .from('initiative_financial_impact')
      .insert({
        initiative_id: initiative.id,
        actual_revenue: formData.actualRevenue,
        // ... more fields
      });
  }

  // Refresh data in parent component
  onSuccess();
}
```

#### Example: Logging Effort

```typescript
// 1. User enters hours in BulkEffortEntry table
// 2. Clicks "Save Changes"

async function handleSaveEffort(entries) {
  for (const entry of entries) {
    // Upsert effort log (insert or update if exists)
    await supabase
      .from('effort_logs')
      .upsert({
        team_member_id: currentUserId,
        initiative_id: entry.initiative.id,
        week_start_date: selectedWeek,
        hours_spent: entry.hours,
        effort_size: entry.effortSize,
        notes: entry.note,
      }, {
        onConflict: 'team_member_id,initiative_id,week_start_date'
      });
  }

  // Reload effort logs
  loadEffortLogs();
}
```

### 3. Governance Request Workflow

```
1. Requestor fills out GovernanceRequestForm
   ↓
2. Request saved to governance_requests table (status: "Draft")
   ↓
3. Requestor submits (status: "Ready for Review")
   ↓
4. SCI Lead reviews, may change to "Needs Refinement"
   ↓
5. Once ready, SCI Lead approves (status: "Approved")
   ↓
6. SCI Lead clicks "Convert to Initiative"
   ↓
7. App creates initiative record with data from request
   ↓
8. Request marked as "Converted to Initiative" with link to new initiative
```

**Database Updates:**
```typescript
// 1. Create initiative from request
const initiative = await supabase
  .from('initiatives')
  .insert({
    initiative_name: request.request_name,
    owner_name: request.assigned_sci,
    status: 'Not Started',
    // ... map request fields to initiative
  })
  .select()
  .single();

// 2. Update governance request
await supabase
  .from('governance_requests')
  .update({
    status: 'Converted to Initiative',
    converted_to_initiative: true,
    converted_initiative_id: initiative.id,
  })
  .eq('id', request.id);
```

---

## State Management

### Global State (App.tsx)

- `teamMembers` - Array of team members with all related data
- `currentView` - Active tab (Dashboard, SCI Requests, Browse, My Effort, Workload)
- `selectedMember` - Currently selected team member for filtered views

### Local State (Component-level)

Each component manages its own:
- Form data
- Loading states
- Error states
- Modal visibility
- Table filters and search

**No global state library** (Redux, MobX, etc.) is used - React's built-in state and props are sufficient for this application's complexity.

---

## Performance Optimizations

### 1. Client-side Join and Filter

Instead of fetching data for each view:
- Fetch ALL data once on app load
- Filter and transform in memory for each view
- Only re-fetch after mutations (create/update/delete)

### 2. Conditional Fetching

Some components (BulkEffortEntry) fetch additional data on-demand:
- Ensures fresh data for misc assignments
- Fetches related tables and joins like App.tsx does

### 3. Lazy Loading

- Components use React's lazy loading where appropriate
- Large datasets are paginated or filtered

---

## Security (Row Level Security)

All tables have RLS enabled with policies:

**Read Access**: Public (anon + authenticated)
- This is an internal showcase tool
- Read policies allow: `TO anon, authenticated USING (true)`

**Write Access**: Authenticated only
- Insert/Update/Delete policies: `TO authenticated`
- Requires valid Supabase session

**In Practice**: The app uses the anonymous key, so:
- All reads work immediately
- Writes may be restricted depending on RLS policies

---

## Error Handling

### Pattern Used Throughout

```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) throw error;

  // Process data
} catch (err) {
  console.error('Error:', err);
  setError(err.message);
}
```

### User-facing Error Messages

- Form validation errors shown inline
- Database errors displayed in modal/toast
- Network errors trigger retry prompts

---

## Future Optimizations

Potential improvements for scale:

1. **React Query / SWR** - For caching and automatic refetching
2. **Virtualization** - For large tables (react-window)
3. **Pagination** - For initiative lists
4. **GraphQL** - More efficient data fetching with Supabase's PostgREST
5. **Service Worker** - Offline capability
