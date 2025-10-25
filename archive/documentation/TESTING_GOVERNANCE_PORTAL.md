# 🧪 Testing the Governance Portal

## Prerequisites

✅ Database migration already run (you did this)
✅ Code on `feature/governance-portal` branch
✅ Dev server can start

---

## Step 1: Insert Test Data

**Run the test data SQL in Supabase:**

1. Open Supabase dashboard
2. Go to SQL Editor
3. Copy and paste contents of `test-governance-data.sql`
4. Click "Run"

This creates 4 test governance requests:
- **GOV-2025-001**: SDOH Screening (Ready for Governance - ready to assign SCI)
- **GOV-2025-002**: Sepsis Protocol (Under Review)
- **GOV-2025-003**: Oncology Medication (Submitted)
- **GOV-2025-004**: Maternal Health (Draft)

---

## Step 2: Start the App

```bash
npm run dev
```

Open http://localhost:5173 (or whatever port Vite shows)

---

## Step 3: Navigate to Governance Portal

Click the **"Governance"** button in the navigation bar (purple button).

You should see:
- Purple header: "System-Level Governance Intake Portal"
- 4 summary cards showing counts
- 4 quick filter buttons
- Search bar
- Table with 4 test requests

✅ **Verify**: All 4 requests appear in the table

---

## Step 4: Test Filtering & Search

### Quick Filters
- Click "Needs SCI Assignment" → Should show 1 request (GOV-2025-001)
- Click "In Prep" → Should show 0 requests (none converted yet)
- Click "Needs Review" → Should show 2 requests (GOV-002 and GOV-003)
- Click "All Requests" → Should show all 4

### Search
- Type "SDOH" in search box → Should show only GOV-2025-001
- Clear search → Should show all again

### Advanced Filters
- Click "Filters" button
- Select Status: "Ready for Governance"
- Should show only GOV-2025-001

✅ **Verify**: Filtering and search work correctly

---

## Step 5: View Request Detail

Click on **GOV-2025-001** (SDOH Screening) in the table.

You should see a modal with:
- Request ID and status badge at top
- Title: "SDOH Screening Expansion to Emergency Departments"
- Submitter: Dr. Sarah Johnson
- Status Management panel
- **Purple "Assign SCI for Governance Prep" section** ← This is the key feature!
- Problem statement
- Desired outcomes
- Three value cards (Patient Care, Compliance, Financial $500,000)
- Leadership & Timeline section
- Comments section (empty for now)

✅ **Verify**: All data displays correctly

---

## Step 6: THE BIG TEST - Assign SCI & Create Initiative

This is where the magic happens! 🎩✨

**In the purple "Assign SCI for Governance Prep" section:**

1. **Select an SCI** from the dropdown (e.g., "Marty")
2. **Select Work Effort**: Choose "M - Medium (8 hrs/week)"
3. **Click the purple "Assign SCI & Create Initiative" button**

**What should happen:**

1. Button shows "Creating Initiative..." with spinner
2. After ~1-2 seconds, you see a success alert: "Initiative created successfully for Marty!"
3. The modal automatically refreshes
4. **The purple "Assign SCI" section disappears**
5. **A new blue section appears**: "Initiative Created"
   - Shows: "An initiative was created on [today's date] for Marty to prepare the governance materials"
   - Shows initiative name: "SDOH Screening Expansion... - Governance Prep"
   - Shows a "View Initiative →" button

✅ **Verify**: Initiative creation succeeded and UI updated

---

## Step 7: Verify Initiative in Team View

1. **Close the governance modal** (click X or outside)
2. **Click "Team" button** in navigation
3. **Scroll to Marty's section**

You should see:
- Under "Governance" work type (new section)
- Initiative: "SDOH Screening Expansion to Emergency Departments - Governance Prep"
- Status: Planning
- Purple badge: "Governance Request" with document icon
- Work Effort: M

✅ **Verify**: Initiative appears in Team view under Governance section

---

## Step 8: Verify in My Effort View

1. **Click "My Effort" button** in navigation
2. **Select "Marty"** from the staff dropdown (if not already selected)
3. **Click "Log Effort" tab**

You should see in the effort table:
- Initiative: "SDOH Screening Expansion... - Governance Prep"
- Owner: Marty
- Type: Governance
- Hours: (empty - ready to fill in)
- You can start logging hours immediately!

✅ **Verify**: Initiative appears in effort tracking

---

## Step 9: TEST THE PRE-POPULATION - Edit the Initiative

This is the **COOLEST PART** - verifying that data was pre-populated!

**From Team view:**

1. Find the initiative you just created
2. **Click the initiative card to expand it**
3. **Look for an Edit button** (or find the initiative in "Add Data" view)
4. **Open the initiative in edit mode**

**You should see:**

### 🟣 Purple Banner at Top
- Text: "Governance Request Initiative"
- "Some fields have been pre-filled from the original submission"
- Link: "View Original Request →"

### ✅ Pre-Filled Fields (WITHOUT you typing anything!)
- **Initiative Name**: "SDOH Screening Expansion... - Governance Prep"
- **Owner**: Marty
- **Type**: Governance
- **Status**: Planning
- **Phase**: Governance Preparation
- **Work Effort**: M
- **Clinical Sponsor Name**: Dr. Sarah Johnson, SVP Clinical Excellence
- **Timeframe Display**: "Governance prep for Q1 2026..."

### Scroll to Story Section
- **Challenge** field: Pre-filled with the entire problem statement! 📝
  - "Currently, Social Determinants of Health (SDOH) screening is only implemented..."
- **Outcome** field: Pre-filled with desired outcomes! 📝
  - "100% screening coverage across all emergency departments..."

### Scroll to Financial Impact
- **Projected Annual**: $500,000 pre-filled! 💰

✅ **Verify**: All these fields are pre-populated WITHOUT manually entering them!

This proves the pre-population workflow works perfectly! 🎉

---

## Step 10: Add Data as SCI

Now Marty would add the missing details:

1. **Service Line**: Type "Emergency Department"
2. **EHRs Impacted**: Select "Epic"
3. **Story → Approach**: Type something like:
   - "Collaborated with ED clinical leaders to design streamlined screening workflow. Built Epic smart forms for rapid data capture. Established referral pathways to social services in each market."

4. **Add a Metric** (optional):
   - Metric Name: "ED Screening Completion Rate"
   - Type: Quality
   - Unit: Percentage
   - Baseline: 0
   - Target: 95

5. **Click "Update Initiative"**

✅ **Verify**: Initiative saves with both pre-populated AND manually-added data

---

## Step 11: Test Governance Approval Workflow

**Back in Governance Portal:**

1. Click "Governance" in navigation
2. Click the SDOH request (GOV-2025-001)
3. You should now see the **blue "Initiative Created"** section
4. **In Status Management**, change status to:
   - Currently: "In Progress"
   - Change to: "Completed" (this simulates governance approval)
5. **Click "Mark as Approved by Governance"** button (if it appears)

**What should happen:**
- Governance request status → "Completed"
- Linked initiative should update:
  - Status: Planning → Active
  - Type: Governance → System Initiative
  - Name: Remove "- Governance Prep" suffix
  - Phase: Governance Preparation → Implementation

✅ **Verify**: Approval updates both governance request and initiative

---

## Step 12: Test Comments

1. Open any governance request detail
2. Scroll to Comments section
3. Type a comment: "This looks great! Moving to Ready for Governance."
4. Click Send button (paper airplane icon)
5. Comment should appear immediately

✅ **Verify**: Comments post successfully

---

## Expected Results Summary

After testing, you should have:

✅ 4 test governance requests visible in portal
✅ 1 request converted to initiative (GOV-2025-001)
✅ 1 initiative created for Marty:
  - Name: "SDOH Screening Expansion... - Governance Prep"
  - Type: Governance → System Initiative (after approval)
  - Status: Planning → Active (after approval)
  - Pre-populated with problem statement, outcomes, financial impact
✅ Initiative visible in:
  - Team view (Governance section)
  - My Effort (can log hours)
  - Initiative form (with purple banner)
✅ All pre-populated fields filled in automatically
✅ Bi-directional links working (request ↔ initiative)
✅ Comments working
✅ Search/filter working
✅ Status workflow working

---

## 🐛 Troubleshooting

### Issue: No requests appear in portal
**Fix**: Run the test-governance-data.sql script in Supabase

### Issue: Can't assign SCI
**Fix**: Make sure team_members table has data (should already have Marty, etc.)

### Issue: "Assign SCI" button doesn't work
**Check**: Browser console for errors (F12 → Console tab)

### Issue: Initiative not appearing in Team view
**Fix**:
1. Make sure you selected an existing team member
2. Refresh the page
3. Check that initiative was created (look in Supabase initiatives table)

### Issue: Purple banner doesn't appear in initiative form
**Check**: Initiative should have `governance_request_id` field populated

---

## 🎯 Success Criteria

The governance portal integration is successful if:

1. ✅ You can view all 4 test requests
2. ✅ You can filter and search requests
3. ✅ You can assign an SCI to GOV-2025-001
4. ✅ Initiative is created automatically
5. ✅ Initiative appears in Team view under "Governance"
6. ✅ Initiative appears in My Effort for assigned SCI
7. ✅ Opening initiative shows purple banner
8. ✅ Challenge, Outcome, and Financial fields are pre-filled
9. ✅ You can add missing details (Service Line, Approach, etc.)
10. ✅ Approving governance request updates initiative to Active

---

## 📊 What to Check in Database

**After conversion, in Supabase:**

### governance_requests table
```sql
SELECT
  request_id,
  title,
  status,
  assigned_sci_name,
  linked_initiative_id,
  converted_at
FROM governance_requests
WHERE request_id = 'GOV-2025-001';
```

Should show:
- status: "In Progress"
- assigned_sci_name: "Marty"
- linked_initiative_id: [UUID of created initiative]
- converted_at: [timestamp]

### initiatives table
```sql
SELECT
  initiative_name,
  type,
  status,
  owner_name,
  work_effort,
  governance_request_id,
  clinical_sponsor_name
FROM initiatives
WHERE governance_request_id IS NOT NULL;
```

Should show the created initiative with:
- type: "Governance"
- status: "Planning"
- owner_name: "Marty"
- work_effort: "M"
- governance_request_id: [UUID of GOV-2025-001]
- clinical_sponsor_name: "Dr. Sarah Johnson, SVP Clinical Excellence"

### initiative_stories table
```sql
SELECT
  challenge,
  outcome
FROM initiative_stories
WHERE initiative_id IN (
  SELECT id FROM initiatives WHERE governance_request_id IS NOT NULL
);
```

Should show:
- challenge: [Pre-filled from problem_statement]
- outcome: [Pre-filled from desired_outcomes]

### initiative_financial_impact table
```sql
SELECT
  projected_annual
FROM initiative_financial_impact
WHERE initiative_id IN (
  SELECT id FROM initiatives WHERE governance_request_id IS NOT NULL
);
```

Should show:
- projected_annual: 500000

---

## 🎉 Celebrate!

If all tests pass, you've successfully built and integrated a comprehensive governance portal with automatic initiative creation and data pre-population!

The workflow seamlessly connects:
- Governance intake → SCI assignment → Initiative creation → Prep work tracking → Approval → Implementation

All with **minimal manual data entry** thanks to the pre-population architecture! 🚀
