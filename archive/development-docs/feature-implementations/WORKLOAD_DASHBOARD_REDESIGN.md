# Workload Dashboard Redesign

**Date:** October 13, 2025
**Purpose:** Re-envision the Workload tab with rich capacity metrics, visualizations, and opportunity analysis based on Excel Dashboard data

---

## 🎯 Design Goals

1. **Clear Visibility** - At-a-glance understanding of team capacity and workload distribution
2. **Actionable Insights** - Identify opportunities for work rebalancing and resource allocation
3. **Data-Driven** - Use actual hours/week data from Excel Dashboard instead of just assignment counts
4. **Visual Impact** - Charts, gauges, and color-coding to make patterns immediately obvious
5. **Drill-Down Capability** - Navigate from team-wide to individual detail views

---

## 📊 Current State Analysis

### What Exists Now (Good Foundation)
✅ Basic workload table with XS/S/M/L/XL breakdown
✅ Capacity status indicators (Available/At Capacity/Over Capacity)
✅ Alert system for over-capacity team members
✅ Team effort distribution bar chart
✅ Effort size reference guide

### What's Missing (Opportunities)
❌ No actual hours/week data from Excel Dashboard
❌ No capacity utilization percentage visualizations
❌ No work type distribution per person
❌ No comparison/benchmarking between team members
❌ No opportunity analysis (who can take more work)
❌ No historical trends or capacity forecasting
❌ Limited visual impact - mostly tables

---

## 🎨 New Workload Dashboard Design

### Section 1: Executive Summary Banner
**Purpose:** High-level team capacity snapshot

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Team Capacity Overview                                       │
│                                                                  │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│ │   218   │  │  36.3%  │  │    1    │  │   13    │            │
│ │ hrs/week│  │  Avg    │  │🔴 Over  │  │🟢 Avail │            │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│                                                                  │
│ Capacity Gauge: ████████░░░░░░░░░░ 36% utilized                │
└─────────────────────────────────────────────────────────────────┘
```

**Metrics:**
- Total active hours/week (sum across team)
- Average capacity utilization (%)
- Count of over-capacity, near-capacity, available
- Team capacity gauge/progress bar

**Visual:** Horizontal capacity bar showing utilized vs. available capacity

---

### Section 2: Capacity Alerts & Opportunities
**Purpose:** Immediate action items - who needs help, who can help

**Layout:** Two-column design

```
┌──────────────────────────┬──────────────────────────┐
│ 🔴 Capacity Alerts (2)   │ 🟢 Available Capacity   │
│                          │         (13)             │
│ Josh - 111.2% (44.5h)   │ Robin - 3.7% (1.5h)     │
│ Marty - 97.7% (39.1h)   │ Lisa - 5.3% (2.1h)      │
│                          │ Kim - 9.4% (3.8h)       │
│ [Rebalance Button]       │ ... 10 more available   │
└──────────────────────────┴──────────────────────────┘
```

**Features:**
- **Left side:** Red/yellow alerts with hours/week and percentage
- **Right side:** Green available capacity with potential hours/week they could take on
- **Action button:** "Suggest Rebalancing" that shows optimization opportunities

---

###Section 3: Team Capacity Matrix (Enhanced Table)
**Purpose:** Detailed comparison across all team members

**Columns:**
1. **SCI Name** (with avatar)
2. **Total Assignments** (count)
3. **Active Hours/Week** (actual from Excel)
4. **Capacity %** (visual bar + number)
5. **Work Type Mix** (mini pie chart or stacked bar)
6. **Top Work Types** (icons: Epic Gold 🟣, System Init 🔵, etc.)
7. **Status** (emoji + label)
8. **Trend** (↗️ ↘️ →)

**Enhancements:**
- Sortable by any column
- Color-coded rows (red/yellow/green background tint)
- Hover shows detailed breakdown
- Click row to expand inline detail view

**Visual Example:**
```
Name       Asgn  Hours/Wk  Capacity          Work Mix    Top Types        Status
Josh       95    44.5      ███████████ 111%  [pie]       🟣EG(22) 🔵SI(4) 🔴 Over
Marty      44    39.1      ██████████░  98%  [pie]       🟣EG(14) 🟣GV(11) 🟡 Near
Van        31    18.6      █████░░░░░░  47%  [pie]       🟣EG(5)           🟢 Avail
...
```

---

### Section 4: Visual Analytics Grid (2x2)

#### 4A: Capacity Distribution Donut Chart
**Purpose:** Show team capacity balance

```
        Over (1)
       🔴 6.7%

  🟡 Near (1)        🟢 Available (13)
     6.7%                86.6%
```

**Insights:**
- Shows most of team is under-utilized
- Identifies capacity imbalance
- Click segment to filter team members

---

#### 4B: Hours/Week Distribution Histogram
**Purpose:** Show how workload is distributed

```
Count
  8│        ██
  6│    ██  ██
  4│    ██  ██  ██
  2│██  ██  ██  ██  ██
  0└──────────────────────
    0-10 10-20 20-30 30-40 40+
         Hours per Week
```

**Insights:**
- Identifies clustering patterns
- Shows outliers
- Helps with work distribution planning

---

#### 4C: Work Type Heat Map
**Purpose:** Show which work types consume most capacity

```
Work Type          Josh Marty Van  Jason Dawn ...
Epic Gold          ████ ███  ███  ██    █
System Initiative  ███  ████ ░    ███   █
Governance         ░    ███  ░    ░     ░
General Support    █    ██   ███  █     ███
```

**Color Intensity:** Darker = more hours/week
**Insights:**
- Who specializes in what
- Work type distribution patterns
- Bottlenecks in specific categories

---

#### 4D: Top Contributors by Work Type
**Purpose:** Recognize expertise and leaders

```
🟣 Epic Gold Leaders      🔵 System Initiative Leaders
1. Josh    28.8 hrs/wk    1. Marty   17.2 hrs/wk
2. Van     17.6 hrs/wk    2. Josh    15.8 hrs/wk
3. Marty   10.9 hrs/wk    3. Trudy    9.9 hrs/wk
```

**Insights:**
- Identifies subject matter experts
- Shows workload concentration
- Useful for mentoring/training planning

---

### Section 5: Individual Drill-Down Cards
**Purpose:** Detailed view of any team member's capacity

**Triggered by:** Clicking on a row in the capacity matrix

```
┌────────────────────────────────────────────────────┐
│ 📊 Josh's Workload Analysis                       │
├────────────────────────────────────────────────────┤
│ Capacity: 44.5 hrs/week (111% of 40hr baseline)   │
│ Status: 🔴 Over Capacity by 4.5 hours             │
│                                                     │
│ Work Type Breakdown (hours/week):                  │
│ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ Epic Gold (28.8h, 22 asgn)  │
│ ▰▰▰▰▰▰▰▰▰▰▰ System Initiative (15.8h, 4 asgn)     │
│                                                     │
│ Assignment Size Distribution:                       │
│ XS: 12 │ S: 8 │ M: 10 │ L: 8 │ XL: 6             │
│                                                     │
│ 💡 Recommendations:                                 │
│ • Delegate 2-3 M-sized assignments to free 6-10h  │
│ • Consider transitioning 1 XL to co-owner model   │
│ • Robin has 36hrs available capacity               │
│                                                     │
│ [View Detailed Assignments] [Suggest Rebalancing]  │
└────────────────────────────────────────────────────┘
```

---

### Section 6: Opportunity Analysis
**Purpose:** Intelligent recommendations for work distribution

```
┌────────────────────────────────────────────────────┐
│ 💡 Capacity Optimization Opportunities             │
├────────────────────────────────────────────────────┤
│                                                     │
│ 🎯 Rebalancing Opportunities:                      │
│                                                     │
│ 1. Epic Gold Overload                              │
│    Josh has 22 Epic Gold assignments (28.8h)       │
│    → Could delegate 5-8 to Van (17.6h available)  │
│    → Could delegate 3-5 to Matt (22h available)   │
│                                                     │
│ 2. Under-Utilized Resources                        │
│    Robin: 38.5 hrs/week available (3.7% utilized)  │
│    Lisa: 37.9 hrs/week available (5.3% utilized)   │
│    → Both available for new initiatives            │
│                                                     │
│ 3. Knowledge Transfer Opportunities                │
│    Josh is sole expert on 22 Epic Gold items       │
│    → Risk if unavailable                           │
│    → Recommend co-owner model with Matt or Van     │
│                                                     │
│ [Generate Rebalancing Plan]                        │
└────────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette & Visual Design

### Capacity Status Colors
- **🔴 Over Capacity (>100%):** `#EF4444` (red)
- **🟡 Near Capacity (80-100%):** `#F59E0B` (amber)
- **🟢 Available (<80%):** `#22C55E` (green)

### Work Type Colors (from existing design)
- **Epic Gold:** `#9B2F6A` (magenta)
- **System Initiative:** `#00A1E0` (blue)
- **Governance:** `#6F47D0` (purple)
- **General Support:** `#F58025` (orange)
- **Policy:** `#6F47D0` (purple)
- **Project:** `#9C5C9D` (purple)

### Chart Styles
- **Donut charts:** 3D effect with shadow for depth
- **Bar charts:** Rounded corners, gradient fills
- **Heat maps:** Smooth color transitions
- **Progress bars:** Animated fill on page load

---

## 📐 Data Model Requirements

### New Database Fields Needed

**team_members table additions:**
```sql
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS active_hours_per_week DECIMAL(5,2);
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS available_hours DECIMAL(5,2) DEFAULT 40.0;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS capacity_utilization DECIMAL(5,4);
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS capacity_status TEXT;
```

**New table: work_type_hours**
```sql
CREATE TABLE work_type_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID REFERENCES team_members(id),
  work_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  hours_per_week DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New table: capacity_history** (for trending)
```sql
CREATE TABLE capacity_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID REFERENCES team_members(id),
  snapshot_date DATE NOT NULL,
  active_hours DECIMAL(5,2),
  capacity_utilization DECIMAL(5,4),
  total_assignments INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Technical Implementation Plan

### Phase 1: Data Population (Week 1)
1. Create import script to read Excel Dashboard data
2. Populate `active_hours_per_week` from Dashboard column "Active Hrs/Wk"
3. Populate `capacity_utilization` from Dashboard column "Capacity Utilization"
4. Calculate `capacity_status` based on utilization %
5. Populate `work_type_hours` from Dashboard columns (EpicGold_Hours, etc.)

### Phase 2: Core Components (Week 1-2)
1. **CapacityGauge.tsx** - Circular/horizontal capacity gauge component
2. **WorkloadHeatMap.tsx** - Heat map for work type distribution
3. **CapacityDistributionChart.tsx** - Donut chart for capacity balance
4. **OpportunityAnalysis.tsx** - Intelligence recommendations component
5. **TeamCapacityMatrix.tsx** - Enhanced sortable table with inline expansion

### Phase 3: Views & Integration (Week 2)
1. Update `WorkloadView()` in App.tsx with new design
2. Integrate new components into view
3. Add filtering and sorting logic
4. Implement drill-down interactions
5. Add export to PDF/Excel functionality

### Phase 4: Intelligence & Recommendations (Week 3)
1. Implement rebalancing algorithm
2. Build knowledge concentration detection
3. Create opportunity scoring system
4. Add "What-if" scenario planning
5. Implement capacity trend analysis

---

## 📊 Metrics & KPIs to Display

### Team-Level Metrics
- Total active hours/week across team
- Average capacity utilization (%)
- Standard deviation of workload (balance measure)
- Over/Near/Available capacity counts
- Work type distribution (hours and counts)

### Individual Metrics
- Active hours/week
- Capacity utilization %
- Assignment count by size (XS/S/M/L/XL)
- Hours by work type
- Top 3 work type specializations
- Capacity trend (last 30/60/90 days)

### Opportunity Metrics
- Total available capacity (hours/week)
- Concentration risk score (for key people)
- Rebalancing potential (hours that could shift)
- Under-utilization index

---

## 🎯 Success Criteria

### Must-Have (MVP)
✅ Display actual hours/week data from Excel Dashboard
✅ Visual capacity status for all team members
✅ Clear identification of over/under capacity situations
✅ Work type distribution per person
✅ Sortable, filterable team capacity table

### Should-Have (V1.1)
✅ Capacity heat map visualization
✅ Opportunity analysis and recommendations
✅ Drill-down to individual detail views
✅ Rebalancing suggestions

### Nice-to-Have (V2.0)
✅ Historical capacity trending
✅ Predictive capacity forecasting
✅ "What-if" scenario planning
✅ Automated rebalancing proposals
✅ Export to reports/presentations

---

## 🚀 Next Steps

### Immediate Actions
1. ✅ **COMPLETED:** Document design vision
2. **Create database schema migration** for new fields
3. **Build Excel Dashboard import script** to populate capacity data
4. **Create core visualization components** (gauges, charts, heat maps)
5. **Implement new WorkloadView** with enhanced design
6. **Test with real data** and iterate

### Timeline
- **Week 1:** Data model + Import script + Core components
- **Week 2:** View integration + Drill-downs + Polish
- **Week 3:** Intelligence + Recommendations + Testing

---

## 📎 References

- **Data Source:** `documents/SCI Workload Tracker - New System.xlsx` - Dashboard tab
- **Current Implementation:** `src/App.tsx` - WorkloadView() function (lines 663-889)
- **Utilities:** `src/lib/workloadUtils.ts` - Capacity calculations
- **Excel Analysis:** `documents/EXCEL_DASHBOARD_ANALYSIS.md`

---

## 💬 Design Notes

### Why This Approach?
1. **Data-Driven:** Uses actual hours/week from Excel, not estimates
2. **Visual First:** Charts and colors make patterns obvious
3. **Actionable:** Not just reporting, but recommending actions
4. **Scalable:** Design works for 16 or 60 team members
5. **Role-Based:** Useful for both individual SCIs and leadership

### Key Insights to Surface
- **Capacity Imbalance:** Most team under-utilized while 1-2 are overloaded
- **Work Concentration:** Josh has 95 assignments (way more than anyone)
- **Specialization Patterns:** Who does what type of work
- **Opportunity Zones:** 13 people with significant available capacity
- **Risk Areas:** Single points of failure (Josh with Epic Gold)

### User Stories
1. **As a Team Lead:** I want to see who is overloaded so I can redistribute work
2. **As an SCI:** I want to see my capacity vs. peers to understand if I'm balanced
3. **As a Director:** I want to identify under-utilized resources for new initiatives
4. **As a Project Manager:** I want to find who has capacity to take on new work
5. **As an Individual:** I want to see my workload trends over time

---

**End of Design Document**
