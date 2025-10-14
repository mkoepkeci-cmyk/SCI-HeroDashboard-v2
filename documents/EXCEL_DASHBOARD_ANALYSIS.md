# SCI Workload Tracker - Excel Dashboard Analysis

**Document:** SCI Workload Tracker - New System.xlsx
**Date Reviewed:** October 13, 2025
**Last Modified:** October 13, 2025 at 5:14 PM

---

## 📊 Executive Summary

The new Excel workload tracker contains **comprehensive capacity and workload data** for all 16 SCI team members, with built-in dashboards tracking hours, capacity utilization, and work type distribution.

### Key Metrics (Team-Wide)
- **Total Assignments:** 407 (active) out of 422 total
- **Total Active Hours/Week:** 217.94 hours
- **Average Capacity Utilization:** 36.3%
- **Team Members:** 16 active (plus 2 new: Tiffany, Carrie with no data yet)

### Capacity Status
- **🔴 Over Capacity (>100%):** 1 person - **Josh (111.2%)**
- **🟡 Near Capacity (80-100%):** 1 person - **Marty (97.7%)**
- **🟢 Under Capacity (<80%):** 13 people

---

## 📑 Excel File Structure

### Sheets Overview
1. **How Workload is Calculated** - Methodology and weighting formulas
2. **Workload** - Summary capacity data (mirrors Dashboard)
3. **Dashboard** - Main analytics view with work type breakdowns
4. **Individual Sheets (18):** Ashley, Brooke, Dawn, Jason, Josh, Kim, Lisa, Marisa, Marty, Matt, Melissa, Robin, Sherry, Trudy, Van, Yvette, Tiffany, Carrie
5. **Instructions** - Usage guidance
6. **TEMPLATE - Staff Tracker** - Template for new staff

---

## 🎯 Dashboard Tab - Complete Data

### Column Structure (25 columns)
| Column | Field | Description |
|--------|-------|-------------|
| 1 | Name | Team member name |
| 2 | Total | Total assignments (all statuses) |
| 3 | Active Assignments | Currently active assignments |
| 4 | Active Hrs/Wk | Weekly hours for active work |
| 5 | Available Hours | Weekly capacity (typically 40) |
| 6 | Capacity Utilization | Percentage of capacity used |
| 7 | Capacity | Status indicator with warnings |
| 8-9 | EpicGold_Count/Hours | Epic Gold CAT work |
| 10-11 | Governance_Count/Hours | Governance meetings |
| 12-13 | SysInit_Count/Hours | System Initiatives |
| 14-15 | SysProj_Count/Hours | System Projects |
| 16-17 | EpicUpg_Count/Hours | Epic Upgrades |
| 18-19 | GenSup_Count/Hours | General Support |
| 20-21 | Policy_Count/Hours | Policy/Guidelines |
| 22-23 | Market_Count/Hours | Market-level projects |
| 24-25 | Ticket_Count/Hours | Ticket work |

### Team Member Summary

| Name | Total | Active | Hrs/Wk | Capacity | Status |
|------|-------|--------|--------|----------|--------|
| **Josh** | 95 | 44 | 44.50 | 111.2% | 🔴 **OVER CAPACITY** |
| **Marty** | 44 | 37 | 39.09 | 97.7% | 🟡 **NEAR CAPACITY** |
| Van | 31 | 12 | 18.62 | 46.5% | 🟢 Under |
| Lisa | 27 | 18 | 2.14 | 5.3% | ⚠️ 16 Incomplete |
| Trudy | 25 | 13 | 10.16 | 25.4% | ⚠️ 10 Incomplete |
| Jason | 23 | 20 | 16.02 | 40.0% | 🟢 Under |
| Matt | 23 | 16 | 14.00 | 35.0% | ⚠️ 12 Need Baseline |
| Sherry | 23 | 17 | 4.86 | 12.2% | ⚠️ 7 Incomplete |
| Dawn | 22 | 20 | 11.86 | 29.6% | ⚠️ 2 Need Baseline |
| Robin | 21 | 17 | 1.48 | 3.7% | ⚠️ 7 Incomplete |
| Yvette | 20 | 18 | 9.72 | 24.3% | ⚠️ 14 Incomplete |
| Ashley | 16 | 11 | 11.76 | 29.4% | ⚠️ 4 Incomplete |
| Brooke | 14 | 11 | 25.27 | 63.2% | 🟡 Near (5 Incomplete) |
| Kim | 13 | 11 | 3.75 | 9.4% | ⚠️ 10 Incomplete |
| Melissa | 10 | 10 | 4.71 | 11.8% | 🟢 Under |

---

## 📊 Work Type Distribution (by Hours/Week)

### Epic Gold Leaders
1. **Josh:** 22 assignments, 28.8 hrs/wk
2. **Van:** 5 assignments, 17.6 hrs/wk
3. **Marty:** 14 assignments, 10.9 hrs/wk
4. **Jason:** 2 assignments, 9.2 hrs/wk
5. **Matt:** 4 assignments, 8.7 hrs/wk

### System Initiatives Leaders
1. **Marty:** 3 assignments, 17.2 hrs/wk
2. **Josh:** 4 assignments, 15.8 hrs/wk
3. **Trudy:** 8 assignments, 9.9 hrs/wk
4. **Jason:** 12 assignments, 5.7 hrs/wk
5. **Yvette:** 5 assignments, 5.1 hrs/wk

### Governance Leaders
1. **Marty:** 11 assignments, 4.5 hrs/wk
2. **Matt:** 5 assignments, 1.8 hrs/wk
3. All others: 0 assignments

### General Support Leaders
- Ashley: 6 assignments
- Sherry: 13 assignments
- Lisa: 13 assignments
- Van: 11 assignments

---

## 🔍 Individual Sheet Structure

Each team member has their own sheet with detailed assignment data:

### Columns (26-29 columns per sheet)
1. **SCI** - Team member name
2. **Assignment** - Initiative/project name
3. **Short Description** - Details, links to shared folders, design docs
4. **Role** - Owner/Co-Owner/Secondary/Support
5. **Work Effort** - Size estimate (XS/S/M/L/XL with hour ranges)
6. **Expander >15 hrs** - Flag for large efforts
7. **Work Type** - System Initiative/Project/Epic Gold/Governance/Policy/General Support
8. **EHR/s Impacted** - All/Epic/Cerner/Altera/Epic and Cerner
9. **Status** - In Progress/Complete/On Hold
10. **Phase** - Discovery/Define, Design, Did we Deliver, N/A
11. **System Projected Go-Live Date** - Target date
12. **Sponsor** - Clinical sponsor name

### Work Effort Definitions
- **XS** - Less than 1 hr/wk (0.5 hrs base)
- **S** - 1-2 hrs/wk (1.5 hrs base)
- **M** - 2-5 hrs/wk (3.5 hrs base)
- **L** - 5-10 hrs/wk (7.5 hrs base)
- **XL** - More than 10 hrs/wk (15.0 hrs base)

---

## 🎯 Data Quality Issues Identified

### Incomplete Data Warnings
The Dashboard shows several team members with incomplete assignment data:

1. **Josh:** 22 assignments need baseline info, 40 other incomplete
2. **Lisa:** 16 incomplete assignments
3. **Yvette:** 14 incomplete assignments
4. **Matt:** 12 assignments need baseline info
5. **Kim:** 10 incomplete assignments
6. **Trudy:** 10 incomplete assignments
7. **Robin:** 7 incomplete assignments
8. **Sherry:** 7 incomplete assignments
9. **Brooke:** 5 incomplete assignments
10. **Dawn:** 2 need baseline info, 4 other incomplete
11. **Ashley:** 4 incomplete assignments
12. **Van:** 1 incomplete assignment

### Missing Data Fields
Many assignments are missing:
- Work Effort size estimates
- Go-live dates
- Sponsor information
- Complete descriptions

---

## 💡 Key Insights

### 1. Capacity Imbalance
- **Josh is significantly over capacity** at 111.2% (44.5 hrs/wk on 40 hr capacity)
- **Marty is near capacity** at 97.7% (39.09 hrs/wk)
- Most team members are **significantly under-utilized** (< 50% capacity)
- **Average utilization is only 36.3%** - suggests either:
  - Incomplete work effort data
  - Conservative estimates
  - Room for additional work

### 2. Work Type Distribution
- **Epic Gold** and **System Initiatives** are tied at 83 assignments each
- **General Support** is 79 assignments
- Most work is concentrated in a few people (Josh, Marty, Van, Jason)

### 3. Assignment Counts
- **Josh has 95 assignments** - more than double anyone else
  - This is likely due to Epic Gold CAT participation (many small items)
  - 22 are Epic Gold (28.8 hrs/wk)
- **Marty has 44 assignments** - second highest
  - More balanced across work types
  - Heavy on Epic Gold (14), Governance (11), System Initiatives (3)

### 4. Data Completeness
- **Approximately 150+ incomplete assignments** need data entry
- Many assignments lack work effort estimates (showing as 0 hours)
- This explains the low capacity utilization numbers

---

## 🚀 Recommendations for Dashboard Population

### 1. Use Dashboard Data for work_type_summary
The Dashboard tab has **accurate, calculated work type counts and hours** that should directly populate the `work_type_summary` table:

```sql
-- Example for Josh
INSERT INTO work_type_summary (team_member_id, work_type, count)
VALUES
  (josh_id, 'Epic Gold', 22),
  (josh_id, 'System Initiative', 4),
  -- etc.
```

### 2. Use Individual Sheets for initiatives
Select **5-10 highest-impact assignments** per person to become detailed initiatives:
- Focus on XL and L size assignments
- Prioritize completed work with measurable outcomes
- Choose system-wide initiatives over routine support

### 3. Priority Order for Population
Based on assignment counts and data completeness:

**High Priority (Start Here):**
1. **Josh** (95 assignments) - Epic Gold and pharmacy focus
2. **Marty** (44 assignments) - Already partially complete
3. **Van** (31 assignments) - Epic Gold focus
4. **Lisa** (27 assignments)
5. **Jason** (23 assignments)

**Medium Priority:**
6. Trudy (25 assignments)
7. Matt (23 assignments)
8. Sherry (23 assignments)
9. Dawn (22 assignments)

**Lower Priority (fewer assignments):**
10-16. Ashley, Brooke, Robin, Yvette, Kim, Melissa, Marisa

### 4. Selection Criteria for Initiatives
From each person's sheet, create initiatives for:

✅ **Do Create:**
- XL and L sized assignments
- Completed projects with outcomes
- System-wide initiatives (multi-market)
- Projects with go-live dates
- Work with clinical sponsors and governance

❌ **Don't Create:**
- Routine governance meeting attendance
- Epic Gold CAT facilitation (unless major deliverable)
- General support consultations
- XS and S sized support work

### 5. Data Mapping Strategy

**From Dashboard → team_members table:**
- total_assignments (Column 2)
- Use for capacity/workload metrics

**From Dashboard → work_type_summary table:**
- Epic Gold count/hours (Columns 8-9)
- Governance count/hours (Columns 10-11)
- System Initiative count/hours (Columns 12-13)
- System Project count/hours (Columns 14-15)
- etc.

**From Individual Sheets → initiatives table:**
- Assignment → initiative_name
- Work Type → type
- Status → status
- Role → role (NEW FIELD)
- EHR/s Impacted → ehrs_impacted (NEW FIELD)
- Sponsor → clinical_sponsor_name
- Go-Live Date → end_date
- Short Description → use for story content

---

## 📝 Next Steps

1. **✅ COMPLETED:** Analyzed Excel file structure and data
2. **Create import script** to read Dashboard data into work_type_summary
3. **Create initiative selection script** per team member
4. **Populate database** starting with Josh (highest priority)
5. **Update team_member totals** to match Dashboard
6. **Validate data** against Dashboard calculations

---

## 📎 Related Files

- **Source:** `documents/SCI Workload Tracker - New System.xlsx`
- **Analysis Scripts:**
  - `analyze_assignments.py` - Assignment counts by team member
  - `dashboard_detailed.py` - Dashboard tab analysis
  - `workload_sheet.py` - Workload sheet analysis
  - `review_dashboard_tab.py` - Initial review script

---

## 🏁 Conclusion

This Excel file is the **single source of truth** for SCI workload data. It contains:
- ✅ Accurate assignment counts
- ✅ Calculated work effort hours
- ✅ Work type distribution
- ✅ Capacity utilization metrics
- ✅ Detailed assignment descriptions

**All future data population should use this file as the primary source.**

The old CSV files are outdated and should be considered superseded by this comprehensive tracker.
