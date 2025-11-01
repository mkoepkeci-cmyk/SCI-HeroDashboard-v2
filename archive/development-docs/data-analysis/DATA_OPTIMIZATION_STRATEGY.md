# Dashboard Data Optimization Strategy
## Maximizing Data Visibility & Implementing Weighted Workload System

**Created:** October 13, 2025
**Status:** Strategy & Recommendations

---

## Executive Summary

Based on analysis of the Excel Workload Tracker v3 and current database state, this document outlines a comprehensive strategy to optimize the SCI Hero Dashboard with intelligent data management, weighted workload calculations, and maximized data visibility.

### Key Findings:

1. **Excel v3 has sophisticated weighted workload system** - not yet in database
2. **Current database likely has inactive initiatives counted as active** - skewing workload metrics
3. **New calculated fields needed** - Role Multiplier, Phase Weight, Active Hours/Week
4. **Opportunity for intelligent dashboard views** - showing right data at right time

---

## Part 1: Current State Analysis

### What's in Excel v3 (NEW & POWERFUL):

```
FORMULA: Active Hrs/Week = Base Hrs × Role Weight × Type Weight × Phase Weight × Active Status

COMPONENTS:
├── Base Hours (from Work Effort size)
│   ├── XS: 0.5 hrs/week
│   ├── S: 1.5 hrs/week
│   ├── M: 3.5 hrs/week
│   ├── L: 7.5 hrs/week
│   └── XL: 15 hrs/week
│
├── Role Multiplier
│   ├── Owner/Co-Owner: 1.0
│   ├── Secondary: 0.5
│   └── Support: varies
│
├── Work Type Weight
│   ├── System Initiative/Epic Gold/System Project: 1.0
│   ├── Governance: 0.7
│   └── Policy/Guidelines: 0.5
│
├── Phase Weight (Project Lifecycle)
│   ├── Discovery/Define: 0.3 (planning)
│   ├── Design: 1.0 (active design)
│   ├── Deploy: 1.0 (implementation)
│   ├── Did we Deliver: 0.25 (post-launch)
│   └── N/A: 1.0
│
└── Active Status
    ├── Active (Yes): multiply by 1
    └── Inactive (No): multiply by 0 (excluded from workload)
```

### Example Calculations from Excel:

**Example 1: Ashley - Xsolis System Project**
- Base: 1.5 hrs (S = small)
- Role: 0.5 (Secondary)
- Type: 1.0 (System Initiative)
- Phase: 1.0 (Design)
- Active: Yes
- **Result: 1.5 × 0.5 × 1.0 × 1.0 = 0.75 hrs/week**

**Example 2: Josh - C5 Titrations**
- Base: 15 hrs (XL = extra large)
- Role: 1.0 (Co-Owner)
- Type: 1.0 (System Initiative)
- Phase: 0.25 (Did we Deliver - post-launch monitoring)
- Active: Yes
- **Result: 15 × 1.0 × 1.0 × 0.25 = 3.75 hrs/week**

**Example 3: Completed Work**
- Any size assignment
- Active: No
- **Result: 0 hrs/week (not counted in current workload)**

### What's in Current Database:

**Good:**
- ✅ Basic initiative tracking
- ✅ `role` field exists
- ✅ `ehrs_impacted` field exists
- ✅ `service_line` field exists
- ✅ `status` field exists (Planning/Active/Scaling/Completed/On Hold)

**Missing/Problematic:**
- ❌ No `phase` field (Discovery/Design/Deploy/Did we Deliver)
- ❌ No `work_effort` field (XS/S/M/L/XL)
- ❌ No calculated weighted workload fields
- ❌ Initiatives with status "Completed/On Hold" likely still counting as active
- ❌ No "Active" boolean flag
- ❌ No role_multiplier, phase_weight, work_type_weight calculated fields

---

## Part 2: Data Quality Issues (Likely Present)

### Issue #1: Inactive Initiatives Counted as Active

**Problem:** Initiatives marked "Completed", "On Hold", or "Cancelled" are likely still showing in active workload counts.

**Impact:**
- Inflated workload metrics
- Inaccurate capacity planning
- Team members appear over-capacity when they're not
- Historical data polluting current state views

**Solution:** Add `is_active` boolean calculated from status + phase

### Issue #2: No Weighted Workload Calculation

**Problem:** All assignments count equally regardless of:
- Ownership level (Primary vs Support)
- Project phase (Planning vs Deployment)
- Work type (Major initiative vs Governance meeting)

**Current:**
- Marty has 19 assignments = 19 "units"
- Josh has 47 assignments = 47 "units"

**Reality with weights:**
- Marty: ~25-30 actual hours/week of active work
- Josh: ~35-40 actual hours/week of active work

**Solution:** Implement weighted calculation system from Excel v3

### Issue #3: Missing Project Lifecycle Context

**Problem:** A major system initiative in "Design" phase (high intensity) looks the same as one in "Did we Deliver" (monitoring only).

**Impact:** Can't accurately predict when capacity will free up or when support needs are highest.

**Solution:** Add `phase` field with weights

---

## Part 3: Proposed Database Schema Enhancements

### New Fields for `initiatives` Table:

```sql
-- Project lifecycle and effort
phase TEXT,                    -- Discovery/Define, Design, Build, Validate/Test, Deploy, Did we Deliver, N/A
work_effort TEXT,              -- XS, S, M, L, XL

-- Calculated weighted workload fields
base_hours_per_week NUMERIC,  -- Calculated from work_effort (0.5, 1.5, 3.5, 7.5, 15)
role_multiplier NUMERIC,       -- Calculated from role (1.0, 0.5, etc.)
work_type_weight NUMERIC,      -- Calculated from type (1.0, 0.7, 0.5)
phase_weight NUMERIC,          -- Calculated from phase (0.3, 1.0, 0.25, etc.)
active_hours_per_week NUMERIC,-- Final calculated: base × role × type × phase
is_active BOOLEAN,             -- Derived from status (Active/Scaling = true, others = false)

-- Data quality tracking
missing_data_fields TEXT[],   -- Array of fields that are incomplete
completeness_score NUMERIC    -- Percentage of fields completed (0-100)
```

### Calculation Rules:

```typescript
// Base hours from work effort
const BASE_HOURS = {
  'XS': 0.5,
  'S': 1.5,
  'M': 3.5,
  'L': 7.5,
  'XL': 15,
  'Unspecified': 2  // default if missing
};

// Role multiplier
const ROLE_MULTIPLIER = {
  'Primary': 1.0,
  'Owner': 1.0,
  'Co-Owner': 1.0,
  'Secondary': 0.5,
  'Support': 0.3
};

// Work type weight
const WORK_TYPE_WEIGHT = {
  'System Initiative': 1.0,
  'Epic Gold': 1.0,
  'System Project': 1.0,
  'Project': 1.0,
  'General Support': 1.0,
  'Governance': 0.7,
  'Policy': 0.5,
  'Policy/ Guideline': 0.5
};

// Phase weight
const PHASE_WEIGHT = {
  'Discovery/Define': 0.3,   // Planning phase - less intensive
  'Design': 1.0,              // Active design work
  'Build': 1.0,               // Implementation
  'Validate/Test': 1.0,       // Testing phase
  'Deploy': 1.0,              // Go-live activities
  'Did we Deliver': 0.25,     // Post-launch monitoring
  'Post Go Live Support': 0.5,
  'Maintenance': 0.4,
  'Steady State': 0.3,
  'N/A': 1.0                  // No specific phase (governance, support)
};

// Active status
const IS_ACTIVE = (status: string) => {
  return ['Planning', 'Active', 'Scaling'].includes(status);
};

// Final calculation
active_hours_per_week = base_hours_per_week
  × role_multiplier
  × work_type_weight
  × phase_weight
  × (is_active ? 1 : 0)
```

---

## Part 4: Enhanced Dashboard Views

### View Strategy: "Show the Right Data at the Right Time"

#### 1. **Overview Dashboard** (Current State Focus)

**Show ONLY Active Initiatives:**
- Status = 'Active' or 'Scaling' or 'Planning'
- is_active = true
- active_hours_per_week > 0

**Key Metrics:**
```
┌─────────────────────────────────────────────┐
│  ACTIVE WORKLOAD                            │
│  • 127 Active Assignments                   │
│  • 523 Total Active Hours/Week              │
│  • 67% Average Team Capacity                │
│  • 3 SCIs Over Capacity ⚠️                  │
└─────────────────────────────────────────────┘
```

**Benefits:**
- Real-time capacity view
- Accurate workload distribution
- Alerts for over-capacity team members
- Clean, focused metrics

#### 2. **Team Member View** (Individual Portfolio)

**Show ALL initiatives with smart filtering:**

```
Marty's Portfolio
├── 📊 Current Workload: 28.5 hrs/week (71% capacity)
│
├── 🟢 ACTIVE (4 initiatives - 28.5 hrs/week)
│   ├── Ambulatory Support [XL - Owner - Deploy] - 15 hrs/week
│   ├── SDOH System Initiative [M - Owner - Design] - 3.5 hrs/week
│   ├── Notable Support [S - Owner - Did we Deliver] - 0.375 hrs/week
│   └── Notable Governance [S - Owner - N/A] - 1.05 hrs/week
│
├── 🔵 IN PLANNING (2 initiatives - future capacity)
│   ├── Health Equity Dashboard [M - Co-Owner - Discovery] - 1.05 hrs/week
│   └── COTF Optimization [S - Secondary - Discovery] - 0.225 hrs/week
│
├── ✅ COMPLETED (3 initiatives - archived)
│   ├── SOGI System Rollout [Completed 08/2025]
│   ├── Referral Optimization [Completed 06/2025]
│   └── HM Integration [Completed 04/2025]
│
└── ⏸️ ON HOLD (1 initiative)
    └── API Migration Testing [On Hold - awaiting vendor]
```

**Weighted Hours Breakdown:**
```
Current Active Hours by Phase:
├── Deploy (high intensity): 15 hrs
├── Design (active work): 3.5 hrs
├── Did we Deliver (monitoring): 0.375 hrs
└── N/A (ongoing support): 1.05 hrs
───────────────────────────────────────
Total: 28.925 hrs/week
```

#### 3. **Initiatives List View** (Smart Segmentation)

**Tab Navigation:**
```
[Active] [Planning] [Completed] [All]
  127      23        45        195
```

**Active Tab** - Sort by workload impact:
```
Initiative                      Owner    Hrs/Wk   Phase      Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C5 Titrations                   Josh     15.0     Deploy     Active  🔴
Epic Gold Therapies             Matt     7.5      Design     Active  🟡
Ambulatory Support              Marty    15.0     Deploy     Active  🔴
Centralized CMU Telemetry       Brooke   1.5      Design     Active  🟢
...
```

**Color Coding:**
- 🔴 High intensity (10+ hrs/week)
- 🟡 Medium intensity (5-10 hrs/week)
- �� Low intensity (<5 hrs/week)

#### 4. **Workload View** (Capacity Planning)

**Enhanced with Weighted Calculations:**

```
TEAM CAPACITY DASHBOARD

⚠️ CAPACITY ALERTS (3)
├── Josh: 42.5 hrs/week (106% capacity) - 47 assignments
├── Van: 38.2 hrs/week (96% capacity) - 31 assignments
└── Kim: 37.8 hrs/week (95% capacity) - 28 assignments

✅ AVAILABLE FOR NEW WORK (5)
├── Melissa: 22.5 hrs/week (56% capacity)
├── Robin: 24.8 hrs/week (62% capacity)
└── ...

WEIGHTED WORKLOAD DISTRIBUTION

Name      Active  Base Hrs  Weighted Hrs  Capacity  Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Josh        47     65.0      42.5         106%      ⚠️ Over
Van         31     52.5      38.2          96%      ⚠️ At Capacity
Marty       19     38.5      28.9          72%      ✅ Good
...

FUTURE CAPACITY (Next 3 Months)
Initiatives moving from Design → Did we Deliver: 8
Expected freed capacity: ~47 hrs/week across team
```

#### 5. **Archive View** (Historical Data)

**Separate View for Completed/Cancelled:**

```
COMPLETED INITIATIVES (Show Impact)
├── Filter by: [Date] [Team Member] [Service Line] [Impact]
│
├── Q3 2025 Wins (12 initiatives)
│   ├── SOGI System Rollout - $2.4M annual impact
│   ├── Pharmacy Standardization - 450 hrs saved/month
│   └── ...
│
└── Total Historical Impact
    ├── $18.7M in revenue
    ├── 2,340 hours saved monthly
    └── 67 facilities impacted
```

---

## Part 5: Data Migration Strategy

### Step 1: Add New Fields to Database

```sql
-- Add new columns to initiatives table
ALTER TABLE initiatives
ADD COLUMN phase TEXT,
ADD COLUMN work_effort TEXT,
ADD COLUMN base_hours_per_week NUMERIC DEFAULT 0,
ADD COLUMN role_multiplier NUMERIC DEFAULT 1,
ADD COLUMN work_type_weight NUMERIC DEFAULT 1,
ADD COLUMN phase_weight NUMERIC DEFAULT 1,
ADD COLUMN active_hours_per_week NUMERIC DEFAULT 0,
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN missing_data_fields TEXT[],
ADD COLUMN completeness_score NUMERIC DEFAULT 0;

-- Create indexes for performance
CREATE INDEX idx_initiatives_is_active ON initiatives(is_active);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_phase ON initiatives(phase);
CREATE INDEX idx_initiatives_active_hours ON initiatives(active_hours_per_week DESC);
```

### Step 2: Backfill Existing Data

**From Excel v3 to Database:**

```typescript
// For each team member's Excel tab:
//   1. Read all assignments
//   2. Match to existing initiatives by name
//   3. Update with: phase, work_effort, role
//   4. Calculate weighted fields
//   5. Set is_active based on status

// Priority order:
// 1. Marty (already has 7 initiatives - update them)
// 2. Josh (47 assignments - add 5-7 key initiatives)
// 3. Van, Dawn, Lisa (high assignment counts)
// 4. Remaining team members
```

### Step 3: Create Database Functions

```sql
-- Function to calculate is_active
CREATE OR REPLACE FUNCTION calculate_is_active(status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN status IN ('Planning', 'Active', 'Scaling');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get base hours
CREATE OR REPLACE FUNCTION get_base_hours(work_effort TEXT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN CASE work_effort
    WHEN 'XS' THEN 0.5
    WHEN 'S' THEN 1.5
    WHEN 'M' THEN 3.5
    WHEN 'L' THEN 7.5
    WHEN 'XL' THEN 15
    ELSE 2  -- default for unspecified
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate active hours
CREATE OR REPLACE FUNCTION calculate_active_hours(
  base_hours NUMERIC,
  role_mult NUMERIC,
  type_weight NUMERIC,
  phase_wt NUMERIC,
  active BOOLEAN
)
RETURNS NUMERIC AS $$
BEGIN
  IF NOT active THEN
    RETURN 0;
  END IF;
  RETURN base_hours * role_mult * type_weight * phase_wt;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate weighted fields on insert/update
CREATE OR REPLACE FUNCTION update_initiative_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate is_active
  NEW.is_active := calculate_is_active(NEW.status);

  -- Calculate base hours
  NEW.base_hours_per_week := get_base_hours(NEW.work_effort);

  -- Calculate active hours
  NEW.active_hours_per_week := calculate_active_hours(
    NEW.base_hours_per_week,
    NEW.role_multiplier,
    NEW.work_type_weight,
    NEW.phase_weight,
    NEW.is_active
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initiative_calculations
  BEFORE INSERT OR UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_initiative_calculations();
```

### Step 4: Data Quality Report

**Create tracking view:**

```sql
CREATE VIEW initiative_data_quality AS
SELECT
  i.id,
  i.initiative_name,
  i.owner_name,
  i.team_member_id,
  i.status,
  i.is_active,
  -- Field completeness checks
  CASE WHEN i.phase IS NULL THEN 'phase' ELSE NULL END as missing_phase,
  CASE WHEN i.work_effort IS NULL THEN 'work_effort' ELSE NULL END as missing_effort,
  CASE WHEN i.role IS NULL THEN 'role' ELSE NULL END as missing_role,
  CASE WHEN i.ehrs_impacted IS NULL THEN 'ehrs_impacted' ELSE NULL END as missing_ehr,
  CASE WHEN i.service_line IS NULL THEN 'service_line' ELSE NULL END as missing_service_line,
  -- Completeness score
  (
    (CASE WHEN i.phase IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN i.work_effort IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN i.role IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN i.ehrs_impacted IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN i.service_line IS NOT NULL THEN 1 ELSE 0 END)
  ) * 20 as completeness_percentage
FROM initiatives i;
```

---

## Part 6: UI/UX Enhancements

### Enhancement 1: Status Badges with Intelligence

**Current:** Simple status text
**Proposed:** Contextual badges with workload info

```jsx
<StatusBadge>
  <StatusDot color={getStatusColor(status)} />
  <StatusText>{status}</StatusText>
  {isActive && <HoursIndicator>{activeHours} hrs/wk</HoursIndicator>}
  {phase && <PhaseTag>{phase}</PhaseTag>}
</StatusBadge>

// Examples:
[●  Active | 15 hrs/wk | Deploy ]
[●  Planning | 1.5 hrs/wk | Discovery ]
[●  Completed | 08/2025 ]
```

### Enhancement 2: Smart Filtering

**Add filter bar to every list view:**

```
Filters: [Status ▼] [Phase ▼] [Workload ▼] [Service Line ▼] [EHR ▼]

Quick Filters:
[ My Active Work ] [ Over 5 hrs/week ] [ In Deploy Phase ] [ Completed This Quarter ]
```

### Enhancement 3: Workload Visualizations

**Add capacity gauges:**

```jsx
<CapacityGauge>
  <CircularProgress value={capacityPercent} />
  <WorkloadBreakdown>
    <Phase name="Deploy" hours={15} color="red" />
    <Phase name="Design" hours={8.5} color="orange" />
    <Phase name="Monitor" hours={2.25} color="green" />
  </WorkloadBreakdown>
</CapacityGauge>
```

### Enhancement 4: Timeline View

**Show project lifecycle:**

```
Initiative Timeline (Next 6 Months)

Oct 2025    Nov 2025    Dec 2025    Jan 2026
   |           |           |           |
Discovery──▶Design═══▶Deploy──▶Monitor
   [2 hrs]    [8 hrs]   [8 hrs]  [2 hrs]

Current Phase: Design (Peak Intensity)
Expected Completion: Dec 2025
Capacity Impact: Will free 8 hrs/week in Jan 2026
```

### Enhancement 5: Data Quality Indicators

**Show completeness on cards:**

```jsx
<InitiativeCard>
  <Header>
    <Title>{initiative.name}</Title>
    <CompletenessIndicator score={initiative.completeness_score}>
      {score}% Complete
    </CompletenessIndicator>
  </Header>

  {missingFields.length > 0 && (
    <DataQualityWarning>
      Missing: {missingFields.join(', ')}
      <QuickEditButton />
    </DataQualityWarning>
  )}
</InitiativeCard>
```

---

## Part 7: Implementation Roadmap

### Phase 1: Database Schema (Week 1)
- [ ] Add new fields to initiatives table
- [ ] Create calculation functions
- [ ] Create triggers for auto-calculation
- [ ] Create data quality views
- [ ] Test with sample data

### Phase 2: Data Migration (Week 2)
- [ ] Create scripts to backfill phase/work_effort from Excel
- [ ] Update Marty's 7 initiatives with weighted data
- [ ] Add 5-7 initiatives each for Josh, Van, Dawn, Lisa
- [ ] Verify calculations are correct
- [ ] Run data quality report

### Phase 3: UI Updates - Active/Inactive Filtering (Week 3)
- [ ] Update Overview to show only active initiatives
- [ ] Add is_active filter to all queries
- [ ] Update Team view with active/completed sections
- [ ] Add Archive view for completed initiatives
- [ ] Test filtering logic

### Phase 4: Weighted Workload Display (Week 4)
- [ ] Add active_hours_per_week to all initiative displays
- [ ] Update Workload view with weighted calculations
- [ ] Add capacity gauges with weighted hours
- [ ] Add phase-based color coding
- [ ] Create workload timeline view

### Phase 5: Enhanced Filtering & Search (Week 5)
- [ ] Add filter bar component
- [ ] Implement multi-filter logic
- [ ] Add quick filter presets
- [ ] Add search functionality
- [ ] Add sorting by weighted hours

### Phase 6: Data Quality Tools (Week 6)
- [ ] Add completeness indicators to cards
- [ ] Create data quality dashboard
- [ ] Add quick-edit for missing fields
- [ ] Create bulk update tools
- [ ] Add validation warnings

### Phase 7: Remaining Team Members (Weeks 7-10)
- [ ] Populate initiatives for remaining 10 SCIs
- [ ] Quality review of all data
- [ ] Generate impact reports
- [ ] User acceptance testing
- [ ] Documentation updates

---

## Part 8: Success Metrics

### Data Quality Metrics:
- **Target:** 95% of active initiatives have all required fields
- **Target:** 100% of initiatives have weighted workload calculated
- **Target:** Zero inactive initiatives showing in active views

### User Experience Metrics:
- **Target:** Users can find any initiative in < 10 seconds
- **Target:** Workload capacity decisions made with confidence
- **Target:** 100% of team member portfolios accurate

### Business Impact Metrics:
- **Target:** Accurate capacity planning for new assignments
- **Target:** Fair workload distribution across team
- **Target:** Clear visibility into project lifecycle phases
- **Target:** Historical impact data preserved and accessible

---

## Part 9: Quick Wins (Do These First)

### Quick Win #1: Add is_active Filter (1 hour)
```typescript
// In App.tsx, update all initiative queries:
const { data: initiatives } = await supabase
  .from('initiatives')
  .select('*')
  .eq('is_active', true)  // ADD THIS LINE
  .order('created_at', { ascending: false });
```

### Quick Win #2: Add Status-Based Tabs (2 hours)
```jsx
<Tabs>
  <Tab label="Active" count={activeCount} />
  <Tab label="Planning" count={planningCount} />
  <Tab label="Completed" count={completedCount} />
</Tabs>
```

### Quick Win #3: Add Phase Field to Form (1 hour)
```jsx
<Select label="Phase" name="phase">
  <option value="Discovery/Define">Discovery/Define</option>
  <option value="Design">Design</option>
  <option value="Deploy">Deploy</option>
  <option value="Did we Deliver">Did we Deliver</option>
  <option value="N/A">N/A</option>
</Select>
```

### Quick Win #4: Show Workload on Team Cards (1 hour)
```jsx
<TeamMemberCard>
  <Name>{member.name}</Name>
  <ActiveHours>
    {calculateTotalActiveHours(member.initiatives)} hrs/week
  </ActiveHours>
  <CapacityBar value={capacityPercent} />
</TeamMemberCard>
```

---

## Part 10: Questions to Answer Before Starting

1. **Should we archive or soft-delete completed initiatives?**
   - Recommendation: Keep all, but filter by is_active

2. **What's the threshold for "Over Capacity"?**
   - Recommendation: 40 hrs/week = 100% capacity

3. **Should governance meetings count in workload?**
   - Recommendation: Yes, but weighted at 0.7

4. **How often should phase weights be updated?**
   - Recommendation: When phase changes (tracked by team member)

5. **Should we show weighted or unweighted hours to users?**
   - Recommendation: Show both with toggle

---

## Conclusion

The Excel v3 weighted workload system is sophisticated and accurate. Implementing it in the dashboard will provide:

1. **Accurate capacity planning** - Know who's truly over capacity
2. **Fair workload distribution** - Account for project phases and roles
3. **Better decision making** - Assign work based on real capacity
4. **Historical context** - See completed work without cluttering active views
5. **Data quality** - Track completeness and missing information

**Recommended Next Steps:**
1. Review this document with stakeholders
2. Start with Quick Wins (4 hours total)
3. Begin Phase 1 (database schema)
4. Iterate with user feedback

**Total Estimated Effort:** 6-8 weeks for full implementation
**Quick Wins Available:** 4-5 hours for immediate improvements
