-- Check the actual schema of dashboard_metrics table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dashboard_metrics'
ORDER BY ordinal_position;
