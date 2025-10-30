-- Detailed breakdown of each SCI's migration status

SELECT
  COALESCE(a.team_member_name, i.owner_name) as team_member,
  COALESCE(a.assignments_count, 0) as assignments_count,
  COALESCE(i.initiatives_count, 0) as initiatives_count,
  COALESCE(i.initiatives_count, 0) - COALESCE(a.assignments_count, 0) as difference
FROM (
  SELECT team_member_name, COUNT(*) as assignments_count
  FROM assignments
  GROUP BY team_member_name
) a
FULL OUTER JOIN (
  SELECT owner_name, COUNT(*) as initiatives_count
  FROM initiatives
  WHERE status != 'Deleted'
  GROUP BY owner_name
) i ON a.team_member_name = i.owner_name
ORDER BY difference ASC, team_member;
