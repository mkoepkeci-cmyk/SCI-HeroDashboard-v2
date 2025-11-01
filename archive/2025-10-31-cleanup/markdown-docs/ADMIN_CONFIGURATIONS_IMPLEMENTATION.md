# Admin Configurations Implementation Summary

**Date:** October 31, 2025
**Status:** ✅ Code Complete - Ready for Database Migration

---

## Overview

A comprehensive admin configuration system has been implemented, allowing administrators to manage:
- Application-wide settings (banner title, view labels, capacity thresholds)
- Dropdown field options with multi-context color support
- All configuration managed through draft mode for safe testing

---

## ✅ Completed Implementation

### 1. Database Migrations (3 files)

**Location:** `/supabase/migrations/`

#### Migration 1: `20251031000000_create_field_options.sql`
- Creates `field_options` table
- Supports 7 field types: work_type, role, phase, work_effort, service_line, ehr_platform, status
- Multi-context color support: primary_color, chart_color, badge_color, background_color, text_color, hover_color
- Includes `affects_capacity_calc` flag for alerting admins
- Full RLS policies enabled

#### Migration 2: `20251031000001_seed_field_options.sql`
- Seeds 48 existing field options from hardcoded values
- Preserves exact key values for backward compatibility
- Includes CommonSpirit brand colors
- Work effort metadata includes hours mapping (XS=0.5, S=1.5, M=3.5, L=7.5, XL=15)

#### Migration 3: `20251031000002_create_application_config.sql`
- Creates `application_config` table (key-value store)
- Seeds 7 default configuration values:
  - **Branding:** banner_title, organization_name
  - **Labels:** workload_staff_view_label, workload_manager_view_label
  - **Capacity:** capacity_under_threshold (60%), capacity_near_threshold (75%), capacity_at_threshold (85%)
- Includes helper function: `get_config(config_key text)`

---

### 2. UI Components (2 new files)

#### `ApplicationSettings.tsx`
**Purpose:** Edit application-wide configuration values

**Features:**
- Grouped by category (Branding, Labels, Capacity)
- Real-time change tracking with unsaved changes alert
- Reset to defaults functionality
- Support for multiple value types (text, number, boolean, color, json)
- Visual feedback for modified fields (yellow highlight)
- Batch save with confirmation

**Location:** `/src/components/ApplicationSettings.tsx` (318 lines)

#### `FieldOptionsSettings.tsx`
**Purpose:** Manage dropdown field options with draft mode

**Features:**
- Section switcher: "Application Settings" ↔ "Field Options"
- 7 field type tabs (Work Types, Roles, Phases, etc.)
- Draft mode matching existing calculator pattern
- Inline editing with yellow highlighting for changed rows
- Color pickers for visual configuration
- Safety features:
  - Usage check before deletion (queries initiatives table)
  - Soft delete (mark inactive) if option in use
  - Capacity calculation alert for affected fields
- Add/edit/delete/reorder options
- Display order management

**Location:** `/src/components/FieldOptionsSettings.tsx` (687 lines)

---

### 3. Updated Components (2 files)

#### `AdminTabContainer.tsx`
**Changes:**
- Added 4th tab: "Admin Configurations" (after Managers tab)
- Imported `FieldOptionsSettings` component
- Added `Sliders` icon from lucide-react
- Updated `AdminSubView` type to include 'configurations'

**Location:** `/src/components/AdminTabContainer.tsx`

#### `App.tsx`
**Changes:**
- Renamed "System Intake" → "Request Intake" (main navigation button, line 1788)
- Renamed "From SCI Requests" → "From Request Intake" (Browse Initiatives filter, line 1160)

**Location:** `/src/App.tsx`

---

## 🎯 Features Summary

### Application Settings Panel

**Editable Configuration:**
1. **Banner Title** (default: "System Clinical Informatics")
   - Displays in application header
   - Text input field

2. **Organization Name** (default: "CommonSpirit Health")
   - Full organization name
   - Text input field

3. **Workload Staff View Label** (default: "Staff View")
   - Label for individual staff member workload view
   - Formerly "SCI View"

4. **Workload Manager View Label** (default: "Manager's View")
   - Label for manager team capacity view
   - Formerly "Team View"

5. **Capacity Thresholds** (defaults: 60%, 75%, 85%)
   - Under Capacity (green): < 60%
   - Near Capacity (amber): 60-74%
   - At Capacity (orange): 75-84%
   - Over Capacity (red): ≥ 85%

### Field Options Panel

**Manageable Field Types:**
1. **Work Types** (9 options) - Colors configured
   - Epic Gold, Governance, System Initiative, System Project, Epic Upgrades, General Support, Policy/Guidelines, Market Project, Ticket

2. **Roles** (4 options) - Affects capacity calculations
   - Owner, Co-Owner, Secondary, Support

3. **Phases** (11 options) - Affects capacity calculations
   - Discovery/Define, Design, Build, Validate/Test, Deploy, Did we Deliver, Post Go Live Support, In Progress, Maintenance, Steady State, N/A

4. **Work Effort** (5 options) - Colors configured, affects capacity calculations
   - XS (0.5h), S (1.5h), M (3.5h), L (7.5h), XL (15h)

5. **Service Lines** (12 options)
   - Ambulatory, Pharmacy, Nursing, Pharmacy & Oncology, Cardiology, Emergency Department, Inpatient, Perioperative, Laboratory, Radiology, Revenue Cycle, Other

6. **EHR Platforms** (5 options)
   - All, Epic, Cerner, Altera, Epic and Cerner

7. **Statuses** (5 options) - Colors configured
   - Not Started, In Progress, On Hold, Completed, Cancelled

**Color Management:**
- **Primary Color:** General UI contexts
- **Chart Color:** Pie charts, bar charts, visualizations
- **Badge Color:** Status badges and pills
- **Background Color:** Card backgrounds, highlights
- **Text Color:** Text when using background
- **Hover Color:** Interactive hover states

---

## 🔒 Safety Features

### Field Options Management

1. **Usage Validation**
   - Before deleting an option, system checks if it's used by any initiatives
   - Shows count of affected initiatives
   - Recommends soft delete (mark inactive) if in use

2. **Capacity Calculation Alerts**
   - Fields marked with `affects_capacity_calc=true` trigger warnings
   - Alert displays: "⚠️ These changes affect capacity calculations"
   - Prompts admin to review Calculator Settings tab

3. **Draft Mode Protection**
   - Changes held in-memory until explicitly saved
   - Confirmation dialog before switching tabs with unsaved changes
   - Yellow highlighting for modified rows
   - Impact preview showing number of changes

4. **Soft Delete**
   - Options can be marked inactive instead of deleted
   - Preserves data integrity for historical initiatives
   - Inactive options hidden from dropdowns but data preserved

---

## 📋 Installation Instructions

### Step 1: Run Database Migrations

Navigate to: **Supabase Dashboard → SQL Editor**

URL: https://fiyaolxiarzkihlbhtmz.supabase.co

**Run these 3 SQL files in order:**

1. **Create field_options table:**
   ```
   File: /supabase/migrations/20251031000000_create_field_options.sql
   ```
   - Creates table structure
   - Sets up RLS policies
   - Adds indexes and triggers

2. **Seed field_options data:**
   ```
   File: /supabase/migrations/20251031000001_seed_field_options.sql
   ```
   - Inserts 48 field options
   - Preserves existing values
   - Includes verification summary

3. **Create application_config table:**
   ```
   File: /supabase/migrations/20251031000002_create_application_config.sql
   ```
   - Creates config table
   - Seeds 7 default settings
   - Creates helper function `get_config(text)`
   - Includes verification summary

### Step 2: Verify Migration Success

After running migrations, you should see:

**Console Output:**
```
============================================
Field Options Seeded Successfully
============================================
Work Types: 9
Roles: 4
Phases: 11
Work Effort Sizes: 5
Service Lines: 12
EHR Platforms: 5
Statuses: 5
--------------------------------------------
Total Options: 48
============================================

============================================
Application Config Seeded Successfully
============================================
Branding Configs: 2
Label Configs: 2
Total Configs: 7
============================================
Banner Title: System Clinical Informatics
Staff View Label: Staff View
Manager View Label: Manager's View
============================================
```

### Step 3: Start Application

```bash
npm run dev
```

### Step 4: Access Admin Configurations

1. Navigate to: **Admin** tab (top navigation)
2. Click: **Admin Configurations** (4th sub-tab after Team Management, Managers, Calculator Settings)
3. You'll see two section buttons:
   - **Application Settings** (default view)
   - **Field Options**

---

## 🧪 Testing Checklist

### Application Settings
- [ ] Load Application Settings section (should show 7 configs)
- [ ] Edit banner title → Save → Verify unsaved changes alert appears
- [ ] Click "Save All Changes" → Verify success message
- [ ] Click reset button → Verify value returns to default
- [ ] Change capacity threshold → Save → Verify saved
- [ ] Discard changes → Verify alert and values revert

### Field Options - View Mode
- [ ] Switch to Field Options section
- [ ] View all 7 tabs (Work Types, Roles, Phases, etc.)
- [ ] Verify correct option counts per tab
- [ ] Verify colors display correctly for Work Types, Work Effort, Statuses
- [ ] Click "Add New Option" → Create test option → Verify saved

### Field Options - Draft Mode
- [ ] Click "Enter Draft Mode" → Verify yellow banner appears
- [ ] Edit a work type color → Verify row highlights yellow
- [ ] Edit display order → Verify impact preview updates
- [ ] Click "Reset Draft" → Verify changes cleared
- [ ] Make changes → Click "Save & Apply" → Verify confirmation
- [ ] Edit an option that affects capacity → Verify warning shows
- [ ] Click "Discard & Exit" → Verify mode switches back

### Field Options - Delete Safety
- [ ] Try to delete a work type that's in use (e.g., "Governance")
- [ ] Verify usage count shows in warning
- [ ] Choose "Mark as inactive" → Verify option becomes inactive
- [ ] Create a test option → Delete it immediately → Verify hard delete works

### Cross-Tab Navigation
- [ ] Make changes in Application Settings → Switch to Field Options → Verify warning
- [ ] Make changes in draft mode → Switch tabs → Verify confirmation required
- [ ] Save changes → Switch tabs → Verify no warning

---

## 🔮 Future Enhancements

### Phase 2: Dynamic Loading in Components (Not Yet Implemented)

Currently, dropdown options in forms are still **hardcoded**. The next phase would:

1. Create shared hook: `useFieldOptions(fieldType)`
2. Update form components to load options from database
3. Migrate color mappings to use database colors
4. Add runtime validation (replace TypeScript compile-time types)

**Components to Update:**
- `UnifiedWorkItemForm/Tab2Content.tsx` - Main form dropdowns
- `GovernanceRequestDetail.tsx` - SCI assignment dropdowns
- `ReassignModal.tsx` - Role dropdown
- `App.tsx` - Filtering dropdowns + color mappings
- `BulkEffortEntry.tsx` - Work type grouping logic
- Chart components for dynamic colors

**Estimated Effort:** 16-24 hours

### Additional Settings Ideas

- **Dashboard refresh interval** (currently hardcoded)
- **Default filters** (e.g., always show active initiatives on load)
- **Email notification settings**
- **Date format preferences** (MM/DD/YYYY vs DD/MM/YYYY)
- **Chart color themes** (predefined palettes)
- **Export file naming conventions**

---

## 📚 Technical Details

### Draft Mode Pattern

Follows the existing `WorkloadCalculatorSettings.tsx` pattern:

**Key Characteristics:**
1. **No database draft flag** - drafts exist only in React state
2. **In-memory Map** stores pending changes (id → value)
3. **Two-mode toggle:** 'view' | 'draft'
4. **Yellow UI indicators** for draft state
5. **Batch save** with confirmation
6. **Cache invalidation** after save

**State Management:**
```typescript
const [mode, setMode] = useState<ViewMode>('view');
const [draftChanges, setDraftChanges] = useState<Map<string, Partial<T>>>(new Map());
```

### Database Design Decisions

**Why key-value for application_config?**
- Flexible: Easy to add new configs without schema changes
- Simple: No complex relationships needed
- Extensible: `metadata` jsonb field for custom properties
- Type-safe: `value_type` enum ensures proper validation

**Why separate field_options table?**
- Different access patterns than calculator weights
- Richer metadata (colors, icons, descriptions)
- Different relationships (affects forms, not just calculations)
- Cleaner separation of concerns

### Color Strategy

**Multiple color fields support different UI contexts:**
- **primary_color**: General badges, pills, UI elements
- **chart_color**: Recharts pie/bar charts
- **badge_color**: Specific badge styling (may differ from primary)
- **background_color**: Card backgrounds, highlights
- **text_color**: Accessible text color when using backgrounds
- **hover_color**: Interactive state colors

This allows admins to fine-tune colors for accessibility and branding across all contexts.

---

## 🐛 Known Limitations

1. **Page Refresh Required**: Some settings (banner title, view labels) may require page refresh to update across all views
2. **No Undo History**: Once saved, changes can only be reverted by manually changing back or resetting to defaults
3. **Single Admin Lock**: No concurrent editing protection (last save wins)
4. **No Validation Preview**: Regex validation not yet implemented in UI
5. **No Audit Log UI**: Database tracks `updated_by`, but no UI to view history

---

## 📞 Support

**Questions or Issues?**
- Check CLAUDE.md for system overview
- Review migration files for database schema details
- Inspect component files for implementation specifics
- Test in development environment before production deployment

---

## ✅ Completion Status

**Code:** ✅ Complete
**Database Migrations:** ⏳ Ready to run
**Testing:** ⏳ Pending migration execution
**Documentation:** ✅ Complete

**Next Action:** Run the 3 database migrations in Supabase Dashboard SQL Editor.
