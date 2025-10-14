# Effort Tracking Feature

## Overview

The Effort Tracking feature allows team members to dynamically log and visualize their time spent on initiatives, track capacity, and identify workload trends over time. This transforms the dashboard from a static assignment tracker into a living workload management system.

## Key Features

### 1. **Weekly Effort Logging**
- Log hours spent per initiative per week
- Choose from preset effort sizes (XS, S, M, L, XL, XXL) or enter custom hours
- Add contextual notes about what you worked on
- One log per initiative per team member per week

### 2. **Personal Workload Dashboard**
- **My Effort** view showing your complete workload picture
- Current week capacity status with color-coded alerts
- 8-week trend visualization
- Effort breakdown by work type
- Top initiatives consuming your time

### 3. **Initiative-Level Tracking**
- Sparkline visualizations showing effort trends over time
- Hover for detailed weekly breakdown
- Track total time invested in each initiative
- See effort patterns (increasing, decreasing, stable)

### 4. **Capacity Management**
- Automatic capacity status calculation:
  - 🟢 **Under Capacity**: <30 hrs/week
  - 🟢 **Normal**: 30-39 hrs/week
  - 🟡 **Near Capacity**: 40-44 hrs/week
  - 🟠 **Over Capacity**: 45-49 hrs/week
  - 🔴 **Critical**: 50+ hrs/week
- In-app alerts when approaching or exceeding capacity
- Visual progress bars and color indicators

## Database Schema

### `effort_logs` Table

```sql
CREATE TABLE effort_logs (
  id UUID PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES initiatives(id),
  team_member_id UUID NOT NULL REFERENCES team_members(id),
  week_start_date DATE NOT NULL,  -- Always Monday
  hours_spent DECIMAL(5,2) NOT NULL,
  effort_size TEXT NOT NULL,       -- XS, S, M, L, XL, XXL
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(initiative_id, team_member_id, week_start_date)
);
```

### Supporting Views

- **`weekly_effort_summary`**: Aggregates effort by team member and week
- **`initiative_effort_trends`**: Calculates trends and patterns per initiative

## Effort Size Mappings

| Size | Label | Hours | Use Case |
|------|-------|-------|----------|
| XS | Extra Small | 1.5 hrs | Quick meetings, email reviews |
| S | Small | 4 hrs | Half-day commitments |
| M | Medium | 8 hrs | Standard full-day work |
| L | Large | 13 hrs | 1.5 days of focus |
| XL | Extra Large | 18 hrs | 2+ days major effort |
| XXL | Double XL | 25+ hrs | Sprint-level intensive work |

## Components

### Core Components

1. **`EffortLogModal`** (`src/components/EffortLogModal.tsx`)
   - Modal for logging/editing effort
   - Week selector
   - Effort size buttons
   - Custom hours input
   - Note field

2. **`EffortSparkline`** (`src/components/EffortSparkline.tsx`)
   - Mini timeline chart showing effort history
   - Hover tooltips with weekly details
   - Trend indicators
   - Total hours summary

3. **`PersonalWorkloadDashboard`** (`src/components/PersonalWorkloadDashboard.tsx`)
   - Full-page workload management view
   - Week selector
   - Capacity overview cards
   - 8-week bar chart
   - Work type breakdown
   - Top initiatives list
   - Capacity alerts

### Updated Components

4. **`InitiativeCard`**
   - Added "Log Effort" button for active initiatives
   - Displays effort sparkline when logs exist
   - Shows total time invested

5. **`App.tsx`**
   - Added "My Effort" navigation button
   - Integrated PersonalWorkloadDashboard view
   - Sets current user (Marty for demo)

## Utilities

### `effortUtils.ts` (`src/lib/effortUtils.ts`)

Helper functions for effort tracking:
- `getWeekStartDate()` - Get Monday of current/given week
- `getEffortSizeFromHours()` - Convert hours to effort size
- `getCapacityStatus()` - Calculate capacity level
- `formatWeekRange()` - Format date ranges
- `calculateTrend()` - Determine if effort is increasing/decreasing
- Capacity color/emoji/label helpers

## User Workflow

### Logging Effort

1. Navigate to an active initiative
2. Expand the initiative card
3. Click "Log Effort" button
4. Select the week
5. Choose effort size or enter custom hours
6. Add optional note
7. Click "Log Effort" or "Update Effort"

### Viewing Personal Workload

1. Click "My Effort" in main navigation
2. Select week to view (defaults to current)
3. Review capacity status and total hours
4. See effort breakdown by work type
5. Identify top initiatives
6. View 8-week trend

### Interpreting Trends

**Sparklines on Initiative Cards:**
- Line going up 📈: Increasing effort
- Line going down 📉: Decreasing effort
- Flat line →: Stable effort
- Hover for exact weekly values

**Capacity Status:**
- Green: Healthy workload
- Yellow: Monitor closely
- Orange/Red: Action needed

## Setup Instructions

### 1. Database Migration

Run the SQL migration:
```bash
psql -h your-host -U your-user -d your-db -f sql/create_effort_logs_table.sql
```

Or in Supabase dashboard:
- Go to SQL Editor
- Paste contents of `sql/create_effort_logs_table.sql`
- Run

### 2. No Code Changes Required

All components are already integrated. Just need the database table.

### 3. Test with Sample Data

You can manually insert test data:
```sql
INSERT INTO effort_logs (initiative_id, team_member_id, week_start_date, hours_spent, effort_size, note)
VALUES (
  'your-initiative-id',
  'your-team-member-id',
  '2025-01-13',  -- Monday
  15,
  'L',
  'Sprint planning and design work'
);
```

## Best Practices

### For Individual Contributors

1. **Log weekly**: Update effort logs every Friday or Monday
2. **Be honest**: Actual hours, not estimates
3. **Add context**: Use notes to explain spikes or changes
4. **Monitor capacity**: Pay attention to red/orange warnings
5. **Update as things change**: Governance work can grow from S to M over time

### For Managers

1. **Review trends**: Look for sustained over-capacity team members
2. **Identify patterns**: Which work types consume most effort?
3. **Rebalance**: Use data to inform workload distribution
4. **Celebrate efficiency**: Recognize when completed work took less than expected
5. **Plan realistically**: Use historical data for future resource planning

### For Leadership

1. **Aggregate analysis**: Total team effort per initiative type
2. **ROI calculation**: Compare effort hours to revenue impact
3. **Capacity planning**: Identify when team needs support
4. **Sprint analysis**: Track effort during major initiatives
5. **Trend reporting**: Present 8-week trends in team meetings

## Future Enhancements

### Planned

- [ ] Bulk entry interface (log all initiatives at once)
- [ ] "Copy last week" quick action
- [ ] Export weekly summaries
- [ ] Team-level aggregation views for managers
- [ ] Historical effort comparison (this quarter vs last)
- [ ] Effort vs. impact correlation analysis

### Potential

- [ ] Mobile-optimized entry interface
- [ ] Browser notifications for logging reminders
- [ ] Slack integration for quick logging
- [ ] Predictive capacity alerts
- [ ] Effort forecasting based on initiative phase
- [ ] Time-to-completion estimates

## Troubleshooting

### "No effort logged yet" showing incorrectly

**Cause**: effort_logs not being fetched with initiatives

**Fix**: Ensure initiative queries include:
```javascript
const { data: effortLogs } = await supabase
  .from('effort_logs')
  .select('*')
  .eq('initiative_id', initiativeId)
  .order('week_start_date', { ascending: false });
```

### Week selector showing wrong dates

**Cause**: Timezone issues with date calculations

**Fix**: Ensure `getWeekStartDate()` uses local timezone consistently

### Capacity status not updating

**Cause**: Need to refresh data after logging effort

**Fix**: Call `onEffortUpdate()` callback to trigger parent refresh

### Sparkline not rendering

**Cause**: Need at least 1 effort log

**Fix**: Log effort for at least one week to see visualization

## Architecture Notes

### Data Flow

```
User clicks "Log Effort"
  ↓
EffortLogModal opens
  ↓
User selects week, size, enters hours
  ↓
Save to Supabase effort_logs table
  ↓
Trigger onEffortUpdate callback
  ↓
Parent refetches initiative with effort_logs
  ↓
EffortSparkline renders with updated data
```

### State Management

- **App-level**: currentUser, allInitiatives
- **PersonalWorkloadDashboard**: effortLogs for current user
- **InitiativeCard**: showEffortModal state
- **EffortLogModal**: form state (hours, size, note)

### Performance Considerations

- Effort logs are fetched per-initiative, not globally
- PersonalWorkloadDashboard fetches only last 8 weeks
- Sparklines use memoization for calculations
- Database views pre-calculate aggregations

## Data Integrity

### Constraints

- One log per initiative per team member per week (UNIQUE constraint)
- Hours must be 0-168 (max hours in a week)
- Week start must be a Monday
- Effort size must be valid (XS, S, M, L, XL, XXL)

### Validation

- Client-side validation in modal
- Database constraints as backup
- Automatic week normalization to Monday

## Privacy & Security

- Row-level security enabled on effort_logs table
- Currently allows all operations (adjust for production)
- Team members can only see their own effort in "My Effort" view
- Managers can see team aggregates in "Workload" view (if implemented)

## Success Metrics

Track these to measure feature adoption:

1. **Usage Rate**: % of team logging effort weekly
2. **Coverage**: % of active initiatives with effort logs
3. **Capacity Health**: % of team members in green/yellow status
4. **Data Quality**: Average notes per log entry
5. **Feature Satisfaction**: User feedback scores

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in components
3. Check Supabase logs for database errors
4. Review browser console for client errors

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Author**: System Clinical Informatics Team
