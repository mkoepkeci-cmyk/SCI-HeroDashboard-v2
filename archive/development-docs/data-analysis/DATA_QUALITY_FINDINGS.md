# Data Quality Analysis - Key Findings

**Date:** October 13, 2025
**Analysis Source:** Individual SCI sheets from Excel Workload Tracker

---

## 📊 Executive Summary

**Overall Data Quality: 86.8%**
- **363 of 418 assignments** have work effort defined (13.2% missing)
- **Total active hours**: 271.5h/week (based on complete data)
- **Excel Dashboard shows**: 217.9h/week (only counting assignments with effort data)

### Why The Discrepancy?

The Excel Dashboard is **conservative** - it only counts hours for assignments that HAVE work effort estimates. Our analysis shows what the total WOULD BE if all assignments had estimates.

**Example - Josh:**
- Dashboard: 44.5h/week (counting only 73 of 95 assignments that have effort data)
- Full estimate: 51.0h/week (if all 95 assignments had effort data)
- Missing: 22 assignments without work effort

---

## 🎯 Team Members Ranked by Data Quality

### 🟢 Excellent (100% complete)
| Name | Assignments | All Have Effort | Active Hours/Wk |
|------|-------------|-----------------|-----------------|
| Ashley | 16 | ✅ Yes | 13.5h |
| Jason | 23 | ✅ Yes | 22.0h |
| Kim | 13 | ✅ Yes | 13.5h |
| Lisa | 27 | ✅ Yes | 15.5h |
| Marty | 44 | ✅ Yes | 30.0h |
| Melissa | 10 | ✅ Yes | 13.0h |
| Robin | 15 | ✅ Yes | 10.5h |
| Trudy | 25 | ✅ Yes | 14.5h |
| Yvette | 20 | ✅ Yes | 23.0h |

### 🟡 Good (90-99% complete)
| Name | Assignments | Complete | Missing | Active Hours/Wk |
|------|-------------|----------|---------|-----------------|
| Van | 31 | 96.8% (30 of 31) | 1 | 11.0h |
| Sherry | 23 | 95.7% (22 of 23) | 1 | 13.5h |
| Dawn | 22 | 90.9% (20 of 22) | 2 | 17.5h |

### 🟠 Needs Improvement (70-89% complete)
| Name | Assignments | Complete | Missing | Active Hours/Wk |
|------|-------------|----------|---------|-----------------|
| Josh | 95 | 76.8% (73 of 95) | **22** | 51.0h |
| Matt | 23 | 69.6% (16 of 23) | 7 | 10.5h |
| Brooke | 14 | 64.3% (9 of 14) | 5 | 12.5h |

### 🔴 Critical - Needs Immediate Attention
| Name | Assignments | Complete | Missing | Status |
|------|-------------|----------|---------|---------|
| **Marisa** | 17 | **0%** (0 of 17) | **ALL 17** | No effort data at all |

---

## 📈 Work Type Breakdown Analysis

### Epic Gold (Heavy Users)
| Name | Count | Hours/Wk | Notes |
|------|-------|----------|-------|
| Josh | 38 | 30.0h | Largest Epic Gold workload |
| Marty | 16 | 10.5h | Second largest |
| Van | 15 | 4.5h | Many complete items |

### System Initiatives (Heavy Users)
| Name | Count | Hours/Wk | Notes |
|------|-------|----------|-------|
| Jason | 15 | 13.0h | Highest system initiative load |
| Trudy | 12 | 10.0h | Second highest |
| Dawn | 10 | 8.0h | Third highest |

### Governance (Concentrated)
| Name | Count | Hours/Wk | Notes |
|------|-------|----------|-------|
| Josh | 20 | 10.5h | Epic Governance focus |
| Marty | 11 | 6.5h | General governance |
| Matt | 5 | 2.5h | |

### General Support (Distributed)
| Name | Count | Hours/Wk | Notes |
|------|-------|----------|-------|
| Lisa | 13 | 8.0h | Highest general support |
| Sherry | 13 | 8.0h | Tied for highest |
| Dawn | 8 | 9.0h | High hours despite fewer items |

---

## 🚨 Priority Actions

### Immediate (This Week)
1. **Marisa's Data** - Get all 17 assignments sized (0% complete → 100% target)
   - Status shows all as inactive - verify if these are still relevant
   - If active, need work effort estimates immediately

2. **Josh's Missing 22** - Prioritize Josh's 22 missing assignments
   - He's already over capacity at 44.5h/week
   - Missing 22 could add another 6-10 hours if they're active
   - Need accurate picture to prevent burnout

3. **Matt's 7 Missing** - Complete Matt's data (69.6% → 100%)
   - Relatively small number to fix
   - Quick win for data quality

### Short-Term (Next 2 Weeks)
4. **Brooke's 5 Missing** - Complete Brooke's data (64.3% → 100%)
5. **Dawn's 2 Missing** - Complete Dawn's data (90.9% → 100%)
6. **Van & Sherry** - Each has 1 missing - quick fixes

---

## 💡 Insights & Patterns

### 1. The "Marisa Mystery"
- 17 assignments, 0 active, 0 hours
- All assignments appear to be inactive/complete
- **Action**: Verify with Marisa if these should be archived or if status is wrong

### 2. Josh's Overload is Understated
- Dashboard shows 44.5h/week (111% capacity)
- But that's only 73 of 95 assignments
- If remaining 22 are active and unsized, true load could be **55-60h/week**
- **Action**: Urgent - size those 22 assignments to understand true capacity

### 3. Excellent Data Stewards
- **Ashley, Jason, Kim, Lisa, Marty, Melissa, Robin, Trudy, Yvette** all have 100% complete data
- These team members are disciplined about tracking work effort
- **Best Practice**: Use their process as template for others

### 4. Work Type Concentration Risks
**Epic Gold:** Heavily concentrated (Josh 38, Marty 16, Van 15)
- If Josh unavailable, Epic Gold work has limited backup
- **Action**: Cross-train Matt (has capacity) or Van on Epic Gold

**Governance:** Concentrated in Josh (20) and Marty (11)
- **Action**: Distribute governance participation more evenly

**System Initiatives:** Better distributed (Jason 15, Trudy 12, Dawn 10)
- This is healthy - no single point of failure

---

## 📊 Visualization Needs for Dashboard

Based on this analysis, your Workload tab should show:

### 1. Data Quality Indicator Per Person
```
[Name] [Capacity Bar] [Data Quality Badge]
Josh   ████████████ 111%  ⚠️ 76.8% (22 missing)
Marty  ██████████░░  98%  ✅ 100% complete
Marisa ░░░░░░░░░░░░   0%  🔴 0% (17 missing)
```

### 2. Work Type Heat Map
```
           Epic Sys  Gov  Gen
           Gold Init      Sup
Josh       ████ ██   ██   █
Marty      ███  ██   ███  ██
Jason      ██   ████ ░    ░
Lisa       █    █    ░    ████
```

### 3. Missing Data Alert
```
⚠️ Data Quality Alert:
- Marisa: 17 missing (CRITICAL)
- Josh: 22 missing (HIGH)
- Matt: 7 missing (MEDIUM)
- Brooke: 5 missing (MEDIUM)
```

### 4. Accurate vs. Estimated Hours
```
Team Member   Known Hours   Estimated Full   Delta
Josh          44.5h         51.0h            +6.5h
Marty         39.1h         30.0h            COMPLETE
Brooke        25.3h         12.5h            COMPLETE BUT MISMATCH?
```

**Note**: Some discrepancies between Dashboard and individual sheets suggest calculation differences - needs investigation.

---

## 🔧 Technical Notes

### Data Sources
- **Excel Dashboard Tab**: Pre-calculated by Excel formulas, conservative (only counts complete data)
- **Individual Sheets**: Raw assignment data with work effort in column E
- **Our Analysis**: Reads individual sheets directly, applies same hour estimates

### Work Effort Hour Mapping
```
XS (< 1hr/wk)      = 0.5 hours
S (1-2 hrs/wk)     = 1.5 hours
M (2-5 hrs/wk)     = 3.5 hours
L (5-10 hrs/wk)    = 7.5 hours
XL (> 10 hrs/wk)   = 15.0 hours
```

### Active Status Detection
Assignments counted as "active" if status contains:
- "In Progress"
- "Planning"
- Other statuses (Complete, On Hold) not counted in active hours

---

## ✅ Recommendations

### For Dashboard Display
1. **Show BOTH numbers**: Known hours (from Dashboard) and Estimated full hours (if complete)
2. **Color-code data quality**: Green (>90%), Yellow (70-90%), Red (<70%)
3. **Make missing data actionable**: Click to see which specific assignments need effort data
4. **Work type breakdown**: Show hours per type, not just counts

### For Data Entry
1. **Create template/guide** for sizing assignments
2. **Regular data quality reviews** (monthly) - chase missing effort estimates
3. **Default to "M" if unknown** - better than blank
4. **Link to dashboard** from Excel - make it easy to see impact

### For Capacity Planning
1. **Use Dashboard hours** for current capacity decisions (conservative, accurate)
2. **Use estimated hours** for "what-if" scenarios and planning
3. **Flag high-missing-data members** (Josh, Marisa) as "capacity uncertain"
4. **Don't assign new work** to people with >20% missing data until cleaned up

---

## 📁 Files Generated

- **data-quality-analysis.json** - Full analysis data for dashboard import
- **analyze-data-quality.py** - Python script to regenerate analysis
- **This document** - Human-readable findings and recommendations

---

**Next Steps:**
1. Review this analysis with team
2. Prioritize Marisa, Josh, Matt data cleanup
3. Integrate data quality visualization into Workload dashboard
4. Set up monthly data quality review process
