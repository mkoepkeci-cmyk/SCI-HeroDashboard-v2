# Quick Start: Apply Security Fixes

**File**: `supabase/migrations/20251027000003_fix_view_security_definer.sql`

## What This Fixes

```
❌ BEFORE: 15+ Security Warnings
   - Views with SECURITY DEFINER
   - Tables without RLS
   - Functions with mutable search_path

✅ AFTER: All Security Issues Resolved
   - Views use SECURITY INVOKER
   - All tables have RLS enabled
   - Functions locked to public schema
```

## How to Apply (2 Minutes)

### Step 1: Open Supabase Dashboard
Go to your Supabase project → **SQL Editor**

### Step 2: Run the Migration
1. Click **+ New Query**
2. Copy the entire contents of:
   ```
   supabase/migrations/20251027000003_fix_view_security_definer.sql
   ```
3. Paste into the SQL editor
4. Click **Run** ▶️

### Step 3: Verify Success
Check that you see:
```
Success. No rows returned
```

All security warnings should now be resolved in Supabase Dashboard!

## What Gets Fixed

### 🔧 2 Views
- `weekly_effort_summary` → SECURITY INVOKER
- `initiative_effort_trends` → SECURITY INVOKER

### 🔒 4 Tables
- `work_type_hours` → RLS enabled
- `capacity_history` → RLS enabled
- `dashboard_metrics` → RLS enabled (if exists)
- `initiative_team_members` → RLS enabled (if exists)

### 🛡️ 8 Functions
- `update_is_active` → search_path locked
- `calculate_capacity_utilization` → search_path locked
- `update_work_type_hours_timestamp` → search_path locked
- `update_dashboard_metrics_timestamp` → search_path locked
- `update_effort_logs_updated_at` → search_path locked
- `update_initiative_completion` → search_path locked
- `update_parent_initiative_completion` → search_path locked
- `calculate_initiative_completion` → search_path locked

## Safe to Run Multiple Times

This migration is **idempotent** - you can run it as many times as needed without causing errors.

## Need Help?

See [SECURITY_FIX_SUMMARY.md](./SECURITY_FIX_SUMMARY.md) for detailed documentation.
