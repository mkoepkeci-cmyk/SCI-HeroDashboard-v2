# Data Population Analysis & Plan
## System Clinical Informatics Dashboard

**Date:** October 9, 2025
**Prepared by:** Claude (AI Analysis)

---

## Executive Summary

### Current State
- **Database has 1 initiative** (Abridge - Marty's project)
- **Database has 63 work type summary records** (aggregate counts by work type)
- **CSV files contain ~500+ individual assignments** across 16 team members
- **Josh shows 47 total assignments** in database but CSV has ~95 rows of detailed assignment data
- **The discrepancy:** Work type summaries are aggregated counts, NOT detailed initiatives

### The Problem
The current system conflates two different data types:
1. **Work Type Summaries** - Aggregated counts (e.g., "Josh has 38 Epic Gold assignments")
2. **Detailed Initiatives** - Rich, trackable projects with metrics, financials, stories (e.g., "Abridge AI Pilot")

### The Goal
Transform individual assignments from CSV files into detailed initiatives WITHOUT duplicating the aggregate counts that already exist.

---

## Database Structure Analysis

### Current Tables

#### 1. `team_members` Table
- 16 team members
- Each has a `total_assignments` count
- Example: Josh = 47, Marty = 19

#### 2. `work_type_summary` Table
- 63 records total
- Breaks down assignments by work type per team member
- Example for Josh:
  - Epic Gold: 38
  - System Initiative: 4
  - Project: 5
  - **Total: 47**

#### 3. `initiatives` Table (Currently only 1 record)
- Detailed project tracking
- Linked to team members via `team_member_id`
- Example: Abridge AI Pilot for Marty

#### 4. Related Initiative Tables
- `initiative_metrics` - Performance KPIs
- `initiative_financial_impact` - Revenue/cost data
- `initiative_performance_data` - Adoption metrics
- `initiative_projections` - Future scaling plans
- `initiative_stories` - Challenge/Approach/Outcome narratives

---

## CSV Data Analysis

### Marty's CSV (58 lines)
**Structure:**
- Header row
- ~30 actual assignment rows
- Categories: General Support, System Initiative, Epic Gold, Governance, Projects

**Key Assignments that could become Initiatives:**
1. **Abridge (AI Ambient Listening)** ✅ Already in database as full initiative
2. **HRS Integration - Remote Patient Monitoring** - Project in Discovery phase
3. **Notable Ongoing Initiatives** - System Initiative supporting API migration
4. **SDOH Standard for Amb/ED/HOD** - General Support optimization request
5. **Advanced Care Planning** - General Support in Discovery
6. **Clinical Informatics Website** - System Initiative in Discovery

**Current Database Representation:**
- Marty has 19 in `work_type_summary` (aggregated counts)
- Marty has 1 in `initiatives` (Abridge with full details)

### Josh's CSV (96 lines)
**Structure:**
- Header row
- ~50+ actual assignment rows
- Heavy focus on Epic Gold, Pharmacy, System Initiatives

**Key Assignments that could become Initiatives:**
1. **C5 Titrations of Medications Workgroup** - System Initiative, go-live 6/3/25
2. **Alaris Pumps Standardization Project** - Project, weekly meetings
3. **Standardizing Charging for All Hospitals for Medications** - Epic Gold, XL effort
4. **Heparin Drip - Calculator Standardization** - Epic Gold in Design phase
5. **Epic Upgrade Nova Note reviews** - Epic Upgrades (multiple modules)

**Current Database Representation:**
- Josh has 47 in `work_type_summary` (aggregated counts)
- Josh has 0 in `initiatives` (no detailed initiatives yet)

---

## Key Insights

### The "95 Items" Reference
When you mentioned "95 items for Josh," this likely refers to:
- CSV file has ~95 rows (including headers, section dividers)
- Database shows 47 as the total assignment count
- The difference: CSV has detailed line items; database has aggregated counts

### The Abridge Model
The Abridge initiative for Marty is the **gold standard** format:
- Full narrative (Challenge, Approach, Outcome)
- Multiple metrics with baseline/current/target values
- Financial impact with methodology and assumptions
- Performance data with adoption rates
- Projections for scaling
- Linked to team member and governance bodies

---

## Recommendations & Data Population Plan

### Phase 1: Categorize CSV Assignments
**Action:** Review all CSV assignments and categorize them:

1. **Governance/Committee Work** (NOT initiatives)
   - Regular meetings (e.g., "SCrPT Oncology," "National CQM Workgroup")
   - These should remain as work_type_summary counts only
   - Don't create initiatives for routine governance participation

2. **Epic Gold CAT Groups** (NOT initiatives)
   - Standard facilitation work (e.g., "Epic Gold Amb CAT - Dermatology")
   - These are ongoing responsibilities, not trackable initiatives
   - Keep as work_type_summary counts

3. **Major Projects** (SHOULD BE initiatives)
   - Defined start/end dates
   - Measurable outcomes
   - Significant impact
   - Examples:
     - Abridge AI Pilot ✅
     - C5 Titrations of Medications
     - Alaris Pumps Standardization
     - HRS Integration - Remote Patient Monitoring

4. **System Initiatives** (SHOULD BE initiatives)
   - System-wide impact
   - Multi-market scope
   - Governance oversight
   - Examples:
     - Notable API Migration
     - Clinical Informatics Website
     - SDOH Standardization

5. **Optimization Requests** (CONDITIONAL)
   - Only create initiatives if:
     - Complex, multi-phase work
     - Measurable impact
     - System-wide deployment
   - Otherwise keep as work_type_summary

### Phase 2: Data Mapping Strategy

#### Option A: Conservative Approach (RECOMMENDED)
**Keep aggregate counts intact, add 3-5 flagship initiatives per team member**

For each team member:
1. Identify 3-5 most impactful assignments from CSV
2. Create full initiatives with:
   - Basic info (name, type, status, dates, sponsor)
   - Key metrics (if available)
   - Financial impact (if measurable)
   - Story/narrative
3. Keep work_type_summary counts unchanged
4. Result: Josh would still show "47 assignments" but now has 3-5 detailed initiatives

**Benefits:**
- No duplication
- Highlights major work
- Preserves existing counts
- Follows Abridge model

**Example for Josh:**
- `total_assignments`: 47 (unchanged)
- `work_type_summary`: Epic Gold = 38, System Initiative = 4, Project = 5 (unchanged)
- `initiatives`: 5 new detailed records:
  1. C5 Titrations of Medications Workgroup
  2. Alaris Pumps Standardization Project
  3. Standardizing Medication Charging System-Wide
  4. Heparin Drip Calculator Standardization
  5. Epic Upgrade Nova Note Review (Willow Inpatient)

#### Option B: Comprehensive Approach
**Create initiatives for ALL major work, update counts to reflect breakdown**

For each team member:
1. Create initiatives for all projects, system initiatives, and significant Epic Gold work
2. Update work_type_summary to only include routine/governance work
3. Recalculate total_assignments as initiatives + routine work
4. Result: Josh might have 20 initiatives + 27 routine assignments = 47 total

**Benefits:**
- Complete visibility
- Every major assignment tracked
- Better portfolio representation

**Risks:**
- Time-intensive data entry
- Requires detailed information for every initiative
- May overwhelm the dashboard

---

## Detailed Mapping Guide

### Form Field → CSV Column Mapping

| Form Field | CSV Column | Notes |
|------------|------------|-------|
| Team Member | SCI | Auto-link by name |
| Owner Name | SCI | Same as team member |
| Initiative Name | Assignment | May need cleanup/formatting |
| Type | Work Type | Direct map |
| Status | Status | Direct map |
| Start Date | Assignment Date | If available |
| End Date | Projected Go-Live Date | If available |
| Clinical Sponsor Name | Sponsor | Parse name |
| Clinical Sponsor Title | N/A | May need research |
| Key Collaborators | Short Description | Parse if mentioned |
| Governance Bodies | N/A | Infer from context |

### Fields Requiring Research/Inference

These fields are NOT in CSV and would need to be:
- Added from other sources
- Inferred from context
- Left blank initially

**Financial Impact Fields:**
- Actual Revenue
- Projected Annual
- Calculation Methodology
- Key Assumptions

**Performance Data:**
- Users Deployed
- Total Potential Users
- Primary Outcome
- Measurement Method

**Metrics:**
- Baseline/Current/Target values
- Improvement percentages
- Measurement dates

**Story:**
- Challenge
- Approach
- Outcome
- Collaboration Detail

---

## Recommended Action Plan

### Step 1: Identify Priority Initiatives (Week 1)
For each SCI team member, review their CSV and identify:
- 3-5 highest-impact assignments
- Focus on Projects and System Initiatives first
- Look for assignments with measurable outcomes

**Selection Criteria:**
- ✅ Has defined go-live date
- ✅ Has measurable impact (time savings, revenue, users)
- ✅ Multi-market or system-wide scope
- ✅ Has clinical sponsor/governance oversight
- ✅ Represents significant work effort (M, L, XL)

### Step 2: Gather Additional Data (Week 2)
For each priority initiative:
- Interview SCI owner to get metrics
- Research financial impact
- Document current status/outcomes
- Collect success stories

**Data Collection Template:**
```
Initiative: [Name]
Owner: [SCI Name]
Type: [Project/System Initiative/Epic Gold]

Metrics:
- What are you measuring?
- Baseline → Current → Target

Financial Impact:
- Any revenue generated or cost savings?
- How calculated?

Performance:
- How many users/sites deployed?
- Adoption rate?

Story:
- What problem did you solve?
- How did you approach it?
- What were the results?
```

### Step 3: Populate Database (Week 3-4)
Use the Initiative Submission Form to:
1. Create detailed initiatives for priority assignments
2. Start with Projects (easiest to track)
3. Move to System Initiatives
4. Selectively add Epic Gold work that has measurable impact

**Quality over Quantity:**
- Better to have 50 well-documented initiatives
- Than 500 half-empty records
- Follow the Abridge model for completeness

### Step 4: Validate & Refine (Week 5)
- Review all initiatives for completeness
- Ensure no duplication of work_type_summary counts
- Verify total_assignments still accurate
- Get SCI team feedback

---

## CSV Analysis by Team Member

### High-Priority Team Members (Most Assignments)

#### Josh (47 assignments)
**Recommended Initiatives to Create: 5-7**
1. C5 Titrations of Medications Workgroup (System Initiative, measurable outcome)
2. Alaris Pumps Standardization Project (Project, system-wide impact)
3. Standardizing Medication Charging (Epic Gold, XL effort)
4. Heparin Drip Calculator Standardization (Epic Gold, design phase)
5. Epic Upgrade Nova Note Review - Willow Inpatient (Epic Upgrades)

**Keep as Work Type Summary:**
- All SCrPT governance meetings (8 assignments)
- Epic Gold CAT participation (minimal effort)
- Regional support meetings

#### Van (31 assignments)
**Needs CSV review to identify top initiatives**

#### Dawn (30 assignments)
**Needs CSV review to identify top initiatives**

#### Lisa (27 assignments)
**Needs CSV review to identify top initiatives**

---

## Technical Implementation Notes

### Database Constraints
- `initiatives.team_member_id` is optional (can be NULL)
- `owner_name` is required (text field)
- This allows initiatives to exist without linking to team_members table
- However, linking is preferred for portfolio view

### Avoiding Count Duplication

**Current System:**
```
team_members.total_assignments = SUM of all work (initiatives + routine)
work_type_summary = Breakdown by type
initiatives = Detailed tracking of major work
```

**To avoid duplication:**
1. Don't modify `total_assignments` when adding initiatives
2. Don't modify `work_type_summary` counts
3. Initiatives are a "drill-down" into the summary counts
4. Think of it as: 47 total → 5 detailed initiatives + 42 routine work

**Example for Josh:**
- Before: 47 total (all in work_type_summary)
- After: 47 total (5 in initiatives table + 42 still counted in work_type_summary)
- Display: "47 total assignments, including 5 major initiatives"

---

## Dashboard Display Implications

### Current Team View
Shows each team member with:
- Total assignments count
- Work type pie chart
- EHR platform breakdown
- Key highlights
- **Initiatives section** (only shows if initiatives exist)

### After Population
Each team member would show:
- Same total assignments count
- Same work type distribution
- **Enhanced initiatives section** with detailed cards
- Each initiative card shows:
  - Completion percentage
  - Financial impact
  - Key metrics
  - Timeline

### Initiatives View
- Would populate with 50-100 detailed initiatives
- Filter/search by team member, type, status
- Sort by impact, completion, etc.

---

## Questions to Resolve

1. **Scope Decision:** Conservative (3-5 per person) or Comprehensive (all major work)?
2. **Data Depth:** Full details (Abridge-level) or basic info to start?
3. **Historical vs Current:** Include completed work or only active/recent?
4. **Governance Work:** Should any governance participation become initiatives?
5. **Epic Gold CATs:** Track as individual initiatives or keep aggregated?

---

## Next Steps

1. **Review this analysis** and decide on scope (Option A or B)
2. **Select pilot team member** (suggest Josh - most assignments, clear projects)
3. **Create 3-5 pilot initiatives** following Abridge model
4. **Review and refine** the process
5. **Scale to remaining team members**

---

## Appendix: CSV Column Definitions

From the CSV files, here are the available data fields:

- **SCI** - Team member name
- **Assignment** - Assignment/initiative name
- **Short Description** - Details about the work
- **Role** - Primary/Secondary/Support/Co-owner
- **Work Effort** - XS/S/M/L/XL (hours per week)
- **Work Type** - Epic Gold/System Initiative/Project/Governance/General Support
- **EHR/s Impacted** - Epic/Cerner/Altera/All
- **Status** - In Progress/Complete/On Hold
- **Phase** - Discovery/Design/Build/Did We Deliver
- **Projected Go-Live Date** - Target date
- **Sponsor** - Clinical sponsor/leader
- **Service Line** - Clinical area
- **Assignment Date** - Start date
- **Comments/Details** - Additional context

---

## Conclusion

The key to successful data population is:
1. **Don't duplicate counts** - Work type summaries stay as-is
2. **Focus on impact** - Create initiatives for measurable, significant work
3. **Follow the model** - Use Abridge as the template
4. **Quality over quantity** - Better to have fewer well-documented initiatives

The goal is to showcase the team's major accomplishments while maintaining accurate assignment counts. The current "47 assignments for Josh" should remain 47, but now 5-7 of those would have rich, detailed tracking in the initiatives table.
