# Archived Database Migrations

This folder contains historical database migration files that have already been applied to the production database. These files are kept for reference and audit purposes.

## Archived Date: November 6, 2025

### Files Archived (20 files)

**October 9, 2025 - Initial Schema Setup:**
- `20251009010942_create_clinical_informatics_schema.sql` - Initial database schema
- `20251009011146_update_rls_policies_for_anon_access.sql` - RLS policies
- `20251009030806_create_initiative_submission_tables.sql` - Initiative tables
- `20251009031520_add_team_member_link_to_initiatives.sql` - Team member FK (⚠️ Had CASCADE delete, later fixed)
- `20251009033205_add_completion_tracking_to_initiatives.sql` - Completion tracking
- `20251009035222_fix_initiative_completion_function_v2.sql` - Completion function fix

**October 26, 2025 - Workload Calculator:**
- `20251026000000_create_workload_calculator_config.sql` - Calculator config table
- `20251026000001_seed_calculator_config.sql` - Seed data
- `20251026000002_add_direct_hours_to_initiatives.sql` - Direct hours field

**October 27, 2025 - Team Structure:**
- `20251027000000_add_managers_and_team_structure.sql` - Managers table
- `20251027000001_set_all_roles_to_system_ci.sql` - Role updates
- `20251027000002_add_is_active_to_team_members.sql` - Active flag
- `20251027000003_fix_view_security_definer.sql` - View security

**October 29, 2025 - Unified Form Support:**
- `20251029000000_unified_form_support.sql` - Unified form fields
- `20251029000001_add_tab3_fields.sql` - Tab 3 fields
- `20251029000004_fix_trigger_recursion.sql` - Trigger fix

**October 30, 2025 - Assignment Migration:**
- `20251030000001_drop_assignments_table.sql` - Removed legacy assignments (moved to archived in main folder)
- `20251030000002_fix_governance_views_security_definer.sql` - Governance views (moved to archived in main folder)
- `20251030000003_add_in_governance_status.sql` - In Governance status (moved to archived in main folder)
- `20251030000004_create_initiative_team_members.sql` - Junction table (moved to archived in main folder)

## Active Migrations (Remain in parent folder)

The following migrations remain active as reference for recent schema changes:

**January 2025 - Foundation:**
- `20250114000000_create_effort_logs_table.sql`
- `20250115000000_update_initiatives_rls.sql`
- `20250115000002_create_governance_portal.sql`
- `20250115000003_update_governance_status_constraint.sql`
- `20250115000004_add_governance_metrics_fields.sql`
- `20250116000000_add_governance_request_fields.sql`
- `20250130000001_add_governance_fields_to_initiatives.sql`

**October 30, 2025:**
- `20251030000001_drop_assignments_table.sql`
- `20251030000002_fix_governance_views_security_definer.sql`
- `20251030000003_add_in_governance_status.sql`
- `20251030000004_create_initiative_team_members.sql`

**November 2025 - Recent Updates:**
- `20251104000000_update_calculator_weights_v2.sql`
- `20251104000001_add_effort_size_to_effort_logs.sql`
- `20251106000000_add_governance_work_fields.sql` - Fixed governance request fields
- `20251106000001_add_ehr_areas_impacted.sql` - Added EHR areas field

## Important Notes

⚠️ **DO NOT delete these files** - They are kept for:
- Historical reference
- Audit trail
- Understanding schema evolution
- Rollback scenarios (if needed)

✅ **All migrations in this folder have been successfully applied to production**

---

For current active migrations, see the parent `supabase/migrations/` folder.
