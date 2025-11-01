-- =====================================================
-- SCI Hero Dashboard - Clear Real Data Script
-- =====================================================
--
-- IMPORTANT: BACKUP YOUR DATABASE BEFORE RUNNING THIS!
--
-- This script deletes all real data from the database to prepare
-- for loading demo data. It preserves the schema and configuration
-- tables (workload_calculator_config).
--
-- Tables cleared:
--   - initiatives and all related tables (metrics, financial, performance, projections, stories)
--   - initiative_team_members (junction table)
--   - effort_logs
--   - governance_requests
--   - team_members
--   - managers
--   - work_type_summary
--   - ehr_platform_summary
--   - key_highlights
--   - dashboard_metrics
--   - team_metrics
--
-- Tables preserved:
--   - workload_calculator_config (capacity calculation weights)
--
-- =====================================================

BEGIN;

-- Disable triggers temporarily to speed up deletions
SET session_replication_role = replica;

-- =====================================================
-- Delete Related Initiative Data First (Foreign Keys)
-- =====================================================

DELETE FROM initiative_stories;
DELETE FROM initiative_projections;
DELETE FROM initiative_performance_data;
DELETE FROM initiative_financial_impact;
DELETE FROM initiative_metrics;
DELETE FROM initiative_team_members;

-- =====================================================
-- Delete Core Tables
-- =====================================================

DELETE FROM effort_logs;
DELETE FROM initiatives;
DELETE FROM governance_requests;

-- =====================================================
-- Delete Summary/Aggregate Tables
-- =====================================================

DELETE FROM work_type_summary;
DELETE FROM ehr_platform_summary;
DELETE FROM key_highlights;
DELETE FROM dashboard_metrics;
DELETE FROM team_metrics;

-- =====================================================
-- Delete Team Structure
-- =====================================================

DELETE FROM team_members;
DELETE FROM managers;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Run these queries to verify data was cleared:

SELECT 'initiatives' as table_name, COUNT(*) as remaining_rows FROM initiatives
UNION ALL
SELECT 'initiative_stories', COUNT(*) FROM initiative_stories
UNION ALL
SELECT 'initiative_metrics', COUNT(*) FROM initiative_metrics
UNION ALL
SELECT 'initiative_financial_impact', COUNT(*) FROM initiative_financial_impact
UNION ALL
SELECT 'initiative_performance_data', COUNT(*) FROM initiative_performance_data
UNION ALL
SELECT 'initiative_projections', COUNT(*) FROM initiative_projections
UNION ALL
SELECT 'initiative_team_members', COUNT(*) FROM initiative_team_members
UNION ALL
SELECT 'effort_logs', COUNT(*) FROM effort_logs
UNION ALL
SELECT 'governance_requests', COUNT(*) FROM governance_requests
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'managers', COUNT(*) FROM managers
UNION ALL
SELECT 'work_type_summary', COUNT(*) FROM work_type_summary
UNION ALL
SELECT 'ehr_platform_summary', COUNT(*) FROM ehr_platform_summary
UNION ALL
SELECT 'key_highlights', COUNT(*) FROM key_highlights
UNION ALL
SELECT 'dashboard_metrics', COUNT(*) FROM dashboard_metrics
UNION ALL
SELECT 'team_metrics', COUNT(*) FROM team_metrics
UNION ALL
SELECT 'workload_calculator_config (SHOULD NOT BE 0)', COUNT(*) FROM workload_calculator_config;

-- =====================================================
-- Expected Results: All counts should be 0 EXCEPT workload_calculator_config (should be 33)
-- =====================================================
