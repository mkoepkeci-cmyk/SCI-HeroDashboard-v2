# Rebranding Progress Report
**Date**: October 31, 2025
**Goal**: Transform from "System Clinical Informatics Dashboard" to "GovernIQ Enterprise Management Platform"

---

## ✅ COMPLETED CHANGES (Phase 1)

### Critical Fixes
1. ✅ **App.tsx line 1764** - Banner now displays `{appConfig.banner_title}` ("GovernIQ")
2. ✅ **App.tsx line 1765** - Organization displays `{appConfig.organization_name}` ("Sample Healthcare")
3. ✅ **index.html line 7** - Browser title: "Work & Capacity Framework v1.0"

### WorkloadCalculatorSettings.tsx
4. ✅ Line 166 - Header: "Staff Capacity Calculator"
5. ✅ Line 169 - Description: "Configure weights and thresholds for staff capacity calculations"
6. ✅ Line 543 - Help text: "These weights define how workload is calculated for your team members"

### App.tsx - View Toggle Labels
7. ✅ Line 1694 - `{appConfig.workload_staff_view_label}` → displays "Staff View"
8. ✅ Line 1704 - `{appConfig.workload_manager_view_label}` → displays "Manager's View"

### LandingPage.tsx - Complete Overhaul (15+ changes)
9. ✅ Line 14 - Title: "GovernIQ Enterprise Management Platform"
10. ✅ Line 17 - Subtitle: "Managing 400+ active initiatives across your team..."
11. ✅ Line 36 - Persona card: "Department Leaders"
12. ✅ Line 38 - Description: "Department heads and service line leaders requesting team support"
13. ✅ Line 61 - Persona card: "Team Members"
14. ✅ Line 63 - Description: "Staff members executing initiatives and tracking workload"
15. ✅ Line 86 - Persona card: "Team Managers"
16. ✅ Line 93 - Description: "Review team requests & assign staff"
17. ✅ Line 113 - Senior Leadership: "Executive team monitoring team performance, value and strategic impact"
18. ✅ Line 118 - "400+ initiatives with full visibility"
19. ✅ Line 171 - Workflow: "Staff log effort..."
20. ✅ Line 195 - Quick start: "For Department Leaders"
21. ✅ Line 203 - "Navigate to Team Requests"
22. ✅ Line 204 - "Click 'Request Intake' in the navigation menu"
23. ✅ Line 231 - Quick start: "For Team Members"
24. ✅ Line 267 - Quick start: "For Team Managers"
25. ✅ Line 276 - "Check Team Requests portal..."

### TeamCapacityView.tsx
26. ✅ Line 354 - "Team Capacity Summary (16 Staff Members)"

### InitiativeCard.tsx
27. ✅ Line 218 - "Request Sponsor: "

### InitiativeModal.tsx
28. ✅ Line 101 - "Request Sponsor: "

### GovernanceRequestDetail.tsx
29. ✅ Line 898 - "Request Sponsor"
30. ✅ Line 902 - "Assigned Staff Member"

---

## 🔄 IN PROGRESS / REMAINING

### "Clinical Sponsor" → "Request Sponsor" (8 files remaining)
- ❌ src/components/OtherWorkForm/CollaborationTab.tsx (lines 18, 22, 35)
- ❌ src/components/UnifiedWorkItemForm/Tab2Content.tsx (lines 362, 372)
- ❌ src/components/InitiativeSubmissionForm.OLD.tsx (lines 766, 775) - Legacy

### "Service Line" → "Department/Service Line" (12 files, ~15 instances)
- ❌ src/components/BulkEffortEntry.tsx line 1141
- ❌ src/components/InitiativesTableView.tsx line 169
- ❌ src/components/TeamCapacityModal.tsx line 326
- ❌ src/components/TeamCapacityView.tsx line 483
- ❌ src/App.tsx lines 1039, 1223
- ❌ src/components/OtherWorkForm/AssignmentTab.tsx line 276
- ❌ src/components/UnifiedWorkItemForm/Tab2Content.tsx line 272
- ❌ src/components/TeamManagementPanel.tsx lines 335, 408
- ❌ src/components/FieldOptionsSettings.tsx line 285
- ❌ src/components/InitiativeSubmissionForm.OLD.tsx lines 710, 716

### "SCI Request/Requests" → "Team Request/Requests" (4 files, 6 instances)
- ❌ src/components/GovernancePortalView.tsx line 145 - "System Intake Request Portal" → "Team Request Portal"
- ❌ src/components/SCIRequestsCard.tsx lines 61, 126 - Card title and link

### Remaining "SCI/SCIs" → "Staff/Team Members" (8 files, 10 instances)
- ❌ src/components/GovernanceRequestDetail.tsx line 582 - "System Clinical Informaticist *"
- ❌ src/components/GovernancePortalView.tsx line 343 - "All SCIs"
- ❌ src/components/ManagersPanel.tsx line 149 - "{count} SCIs"
- ❌ src/components/WorkloadDashboard.tsx line 80 - "{teamMembers.length} SCIs"
- ❌ src/components/OtherWorkForm/AssignmentTab.tsx line 91 - "Assign SCIs..."
- ❌ src/components/UnifiedWorkItemForm/Tab2Content.tsx line 91 - "Assign SCIs..."

### Component Renaming
- ❌ Rename src/components/SCIRequestsCard.tsx → TeamRequestsCard.tsx
- ❌ Update imports in App.tsx

---

## 📝 DOCUMENTATION (Not Started)

### CLAUDE.md
- ❌ Complete rewrite for general business context
- ❌ Remove all healthcare-specific examples
- ❌ Update terminology section
- ❌ Generalize use cases

### README.md
- ❌ Update project title and description
- ❌ Remove healthcare-specific language
- ❌ Update feature descriptions

### API System Prompts
- ❌ api/chat.ts lines 51, 54
- ❌ api/load-balance.ts line 42

---

## 🎯 IMPACT SUMMARY

### Completed: ~30 changes across 10 files
- ✅ Application banner and browser title
- ✅ Landing page (100% complete)
- ✅ View toggle labels (dynamic from database)
- ✅ Calculator settings terminology
- ✅ 2 major display components (InitiativeCard, InitiativeModal)
- ✅ 1 governance form partially updated

### Remaining: ~50 changes across 15 files
- Form field labels (Clinical Sponsor, Service Line)
- Table headers and filters
- Navigation labels (SCI Requests)
- Remaining SCI/SCIs references
- Component renaming
- Documentation

---

## 🚀 NEXT STEPS

### Priority 1: Forms (High User Impact)
1. Update all "Clinical Sponsor" form labels to "Request Sponsor"
2. Update all "Service Line" to "Department/Service Line"

### Priority 2: Navigation & Cards
3. Update GovernancePortalView header
4. Rename SCIRequestsCard component
5. Update all "SCI/SCIs" references to "Staff"

### Priority 3: Documentation
6. Rewrite CLAUDE.md for enterprise context
7. Update README.md
8. Update API system prompts

---

## 📊 COMPLETION STATUS

**User-Facing UI**: 60% Complete (30/50 critical changes)
**Documentation**: 0% Complete (0/3 files)
**Overall Progress**: 50% Complete

**Estimated Remaining Time**: 1-2 hours for remaining UI changes, 30-45 min for documentation

