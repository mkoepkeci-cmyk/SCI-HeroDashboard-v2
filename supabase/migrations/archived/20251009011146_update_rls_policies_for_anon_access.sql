/*
  # Update RLS Policies for Anonymous Access

  ## Changes
  Updates Row Level Security policies to allow anonymous (anon) users to insert and update data.
  This is appropriate for an internal showcase tool where data entry doesn't require authentication.

  ## Security Note
  - This allows public read/write access for the showcase application
  - Suitable for internal tools where authentication isn't required
  - Data is not sensitive and is meant for display purposes
*/

-- Drop existing insert/update policies for authenticated users only
DROP POLICY IF EXISTS "Allow authenticated users to insert team_members" ON team_members;
DROP POLICY IF EXISTS "Allow authenticated users to update team_members" ON team_members;
DROP POLICY IF EXISTS "Allow authenticated users to insert assignments" ON assignments;
DROP POLICY IF EXISTS "Allow authenticated users to update assignments" ON assignments;
DROP POLICY IF EXISTS "Allow authenticated users to insert work_type_summary" ON work_type_summary;
DROP POLICY IF EXISTS "Allow authenticated users to insert ehr_platform_summary" ON ehr_platform_summary;
DROP POLICY IF EXISTS "Allow authenticated users to insert key_highlights" ON key_highlights;
DROP POLICY IF EXISTS "Allow authenticated users to insert team_metrics" ON team_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to update team_metrics" ON team_metrics;

-- Create new policies that allow anon and authenticated users to insert/update
CREATE POLICY "Allow public insert to team_members"
  ON team_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to team_members"
  ON team_members FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert to assignments"
  ON assignments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to assignments"
  ON assignments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert to work_type_summary"
  ON work_type_summary FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert to ehr_platform_summary"
  ON ehr_platform_summary FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert to key_highlights"
  ON key_highlights FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert to team_metrics"
  ON team_metrics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to team_metrics"
  ON team_metrics FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
