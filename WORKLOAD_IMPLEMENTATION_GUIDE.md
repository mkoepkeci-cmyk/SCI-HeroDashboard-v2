# Workload Dashboard - Quick Implementation Guide

**Ready to Deploy:** Yes
**Estimated Time:** 30 minutes setup + future development

---

## 🚀 Quick Start (30 Minutes)

### Step 1: Run Database Migration (5 min)

Open your Supabase SQL Editor and run:

```bash
migrations/add-capacity-workload-fields.sql
```

This creates:
- 4 new columns in `team_members` table
- `work_type_hours` table (new)
- `capacity_history` table (new)
- Triggers for auto-calculation

**Verify:**
```sql
-- Check new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'team_members'
AND column_name IN ('active_hours_per_week', 'capacity_utilization');

-- Should return 2 rows
```

---

### Step 2: Install Dependencies (2 min)

```bash
npm install exceljs
```

---

### Step 3: Run Data Import (3 min)

```bash
npx tsx scripts/import-dashboard-capacity-data.ts
```

**Expected Output:**
```
🚀 Starting Dashboard Capacity Data Import
============================================================
📖 Reading Excel file...
✅ Found Dashboard sheet with 976 rows
✅ Parsed 16 team members from Dashboard

📝 Updating team_members capacity data...
  ✅ Ashley: 11.8h/wk, 29.4%, available
  ✅ Brooke: 25.3h/wk, 63.2%, near_capacity
  ...
✅ Updated 16 team members, 0 errors

📝 Populating work_type_hours data...
  ✅ Ashley: Processed work type hours
  ...
✅ Processed 144 work type records, 0 errors

📸 Creating capacity snapshot...
✅ Created 16 capacity snapshots, 0 errors

📊 Summary Statistics:
  Total Team Members: 16
  Total Active Hours: 217.9 hrs/week
  Average Utilization: 36.3%
  🔴 Over Capacity: 1
  🟡 Near Capacity: 1
  🟢 Available: 14

  Work Type Distribution:
    Epic Gold: 51 assignments, 81.5 hrs/wk
    System Initiative: 52 assignments, 64.6 hrs/wk
    ...
```

---

### Step 4: Verify in Supabase (5 min)

Check your data in Supabase dashboard:

**Team Members:**
```sql
SELECT
  name,
  active_hours_per_week,
  capacity_utilization,
  capacity_status
FROM team_members
ORDER BY capacity_utilization DESC;
```

**Expected:** Josh at top with ~111% utilization

**Work Type Hours:**
```sql
SELECT
  tm.name,
  wth.work_type,
  wth.count,
  wth.hours_per_week
FROM work_type_hours wth
JOIN team_members tm ON tm.id = wth.team_member_id
WHERE wth.hours_per_week > 0
ORDER BY wth.hours_per_week DESC
LIMIT 10;
```

**Expected:** Josh's Epic Gold at top with ~28.8 hrs/week

---

### Step 5: Review Design Documents (15 min)

Read through the design specifications:

1. **[documents/WORKLOAD_DASHBOARD_REDESIGN.md](documents/WORKLOAD_DASHBOARD_REDESIGN.md)**
   - Complete visual design with mockups
   - 6 major sections detailed
   - Component specifications

2. **[documents/WORKLOAD_REDESIGN_SUMMARY.md](documents/WORKLOAD_REDESIGN_SUMMARY.md)**
   - Implementation summary
   - Data flow diagrams
   - Success criteria

3. **[documents/EXCEL_DASHBOARD_ANALYSIS.md](documents/EXCEL_DASHBOARD_ANALYSIS.md)**
   - Source data analysis
   - Key insights and opportunities

---

## 📊 What You Now Have

### Database
✅ Capacity fields on team_members
✅ Work type hours tracked per person
✅ Capacity history for trending
✅ Auto-calculation triggers

### Data
✅ 16 team members with capacity metrics
✅ 144 work type hour records
✅ Initial capacity snapshot
✅ Real hours/week from Excel Dashboard

### Components
✅ CapacityGauge - Circular progress gauge
✅ HorizontalCapacityBar - Linear progress bar
✅ TeamCapacityOverview - Executive summary card

### Documentation
✅ Complete design specification
✅ Implementation guide
✅ Data analysis reports
✅ SQL migration scripts
✅ Import scripts with error handling

---

## 🎯 Next Steps (Future Development)

### Phase 1: Core Visualizations (4-6 hours)
- [ ] Create WorkloadHeatMap.tsx for work type distribution
- [ ] Build enhanced TeamCapacityMatrix component
- [ ] Create CapacityDistributionChart.tsx (donut chart)
- [ ] Add sortable/filterable table logic

### Phase 2: Workload View Integration (2-3 hours)
- [ ] Update WorkloadView() in App.tsx
- [ ] Integrate new components
- [ ] Add drill-down interactions
- [ ] Style and polish

### Phase 3: Intelligence Layer (3-4 hours)
- [ ] Create OpportunityAnalysis.tsx component
- [ ] Build rebalancing algorithm
- [ ] Add recommendation engine
- [ ] Implement "what-if" scenarios

### Phase 4: Polish & Testing (2-3 hours)
- [ ] Responsive design testing
- [ ] Cross-browser compatibility
- [ ] Performance optimization
- [ ] User acceptance testing

---

## 💡 Key Insights to Showcase

When building the new view, make these patterns obvious:

### 1. Capacity Imbalance
- **Josh:** 111% capacity (over by 4.5 hrs/wk)
- **Marty:** 98% capacity (near limit)
- **Most others:** <50% capacity

**Visual:** Capacity distribution donut chart

---

### 2. Work Concentration
- **Epic Gold:** Josh (28.8h), Van (17.6h), Marty (10.9h)
- **System Initiatives:** Marty (17.2h), Josh (15.8h), Trudy (9.9h)
- **Governance:** Marty (4.5h), Matt (1.8h)

**Visual:** Work type heat map

---

### 3. Available Capacity
- **Robin:** 36.5 hrs/week available (96% free)
- **Lisa:** 37.9 hrs/week available (95% free)
- **Kim:** 36.25 hrs/week available (91% free)

**Visual:** Available capacity ranking

---

### 4. Rebalancing Opportunities
- Josh could delegate 5-8 Epic Gold items to Van (has capacity)
- Josh could delegate 3-5 items to Matt (has capacity)
- Robin and Lisa available for new initiatives

**Visual:** Opportunity analysis cards with specific suggestions

---

## 🎨 Visual Design Principles

### Color Coding
Use capacity status colors consistently:
- 🔴 **Red (#EF4444)** - Over capacity (>100%)
- 🟡 **Amber (#F59E0B)** - Near capacity (80-100%)
- 🟢 **Green (#22C55E)** - Available (<80%)

### Layout Hierarchy
1. **Top:** Executive summary (team totals)
2. **Middle:** Visual analytics (charts, heat maps)
3. **Bottom:** Detailed table (sortable, filterable)
4. **Expandable:** Individual drill-down cards

### Interaction Patterns
- **Hover:** Show detailed tooltip
- **Click row:** Expand inline details
- **Click chart segment:** Filter table
- **Sort:** By any column
- **Export:** To PDF/Excel

---

## 📝 Code Integration Example

Here's how to use the new components in your WorkloadView:

```tsx
import { CapacityGauge, HorizontalCapacityBar, TeamCapacityOverview } from './components/CapacityGauge';

const WorkloadView = () => {
  // Fetch data from Supabase
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*, work_type_hours(*)');

  // Calculate team metrics
  const totalHours = teamMembers.reduce((sum, m) => sum + m.active_hours_per_week, 0);
  const overCapacity = teamMembers.filter(m => m.capacity_status === 'over_capacity');

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <TeamCapacityOverview
        totalActiveHours={totalHours}
        totalCapacity={teamMembers.length * 40}
        overCapacityCount={overCapacity.length}
        nearCapacityCount={nearCapacity.length}
        availableCount={available.length}
      />

      {/* Individual Gauges */}
      <div className="grid grid-cols-4 gap-4">
        {teamMembers.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-lg">
            <h3>{member.name}</h3>
            <CapacityGauge
              utilization={member.capacity_utilization}
              size="md"
            />
          </div>
        ))}
      </div>

      {/* Capacity Bars Table */}
      <table>
        {teamMembers.map(member => (
          <tr key={member.id}>
            <td>{member.name}</td>
            <td>
              <HorizontalCapacityBar
                utilization={member.capacity_utilization}
                label={`${member.active_hours_per_week}h/wk`}
              />
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### Import Script Fails
**Problem:** "File not found" error
**Solution:** Check Excel file path in script:
```typescript
const EXCEL_FILE = path.join(__dirname, '..', 'documents', 'SCI Workload Tracker - New System.xlsx');
```

### No Data Showing
**Problem:** Team members not matching
**Solution:** Check name matching in import script. Uses case-insensitive ILIKE.

### Capacity Shows 0%
**Problem:** active_hours_per_week is 0
**Solution:** Re-run import script. Check Excel file has data in "Active Hrs/Wk" column.

---

## 📚 Additional Resources

### Supabase Documentation
- [PostgreSQL Triggers](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### React/Recharts Documentation
- [Recharts Examples](https://recharts.org/en-US/examples)
- [React Hooks](https://react.dev/reference/react)

### Excel.js Documentation
- [Reading Files](https://github.com/exceljs/exceljs#reading-xlsx)
- [Cell Values](https://github.com/exceljs/exceljs#cells)

---

## ✅ Checklist

Before proceeding to development:

- [ ] Database migration run successfully
- [ ] Import script executed without errors
- [ ] Data verified in Supabase dashboard
- [ ] Design documents reviewed
- [ ] Components directory created
- [ ] TypeScript types updated in supabase.ts
- [ ] Team reviewed and approved design
- [ ] Ready to start component development

---

## 🎉 You're Ready!

You now have:
1. ✅ A complete design specification
2. ✅ Database schema with capacity tracking
3. ✅ Real data imported from Excel
4. ✅ Core visualization components
5. ✅ Clear roadmap for implementation

**Next:** Start building the remaining components and integrate into the WorkloadView!

---

**Questions?** Review the design documents or check the inline code comments.

**Need help?** All scripts include error handling and detailed console output.

**Want to modify?** Everything is documented and modular - easy to customize!
