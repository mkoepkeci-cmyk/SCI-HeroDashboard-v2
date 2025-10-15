-- Update RLS policies for initiatives table to allow status updates (for soft delete)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to initiatives" ON initiatives;
DROP POLICY IF EXISTS "Allow public insert access to initiatives" ON initiatives;
DROP POLICY IF EXISTS "Allow public update access to initiatives" ON initiatives;
DROP POLICY IF EXISTS "Allow public delete access to initiatives" ON initiatives;

-- Enable RLS on initiatives table
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read initiatives
CREATE POLICY "Allow public read access to initiatives"
ON initiatives
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert initiatives (for misc assignments)
CREATE POLICY "Allow public insert access to initiatives"
ON initiatives
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update initiatives (for reassignment and soft delete)
CREATE POLICY "Allow public update access to initiatives"
ON initiatives
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to delete initiatives (for hard delete if needed)
CREATE POLICY "Allow public delete access to initiatives"
ON initiatives
FOR DELETE
TO public
USING (true);

-- Also update effort_logs table RLS for completeness
DROP POLICY IF EXISTS "Allow public read access to effort_logs" ON effort_logs;
DROP POLICY IF EXISTS "Allow public insert access to effort_logs" ON effort_logs;
DROP POLICY IF EXISTS "Allow public update access to effort_logs" ON effort_logs;
DROP POLICY IF EXISTS "Allow public delete access to effort_logs" ON effort_logs;

ALTER TABLE effort_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to effort_logs"
ON effort_logs
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert access to effort_logs"
ON effort_logs
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update access to effort_logs"
ON effort_logs
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete access to effort_logs"
ON effort_logs
FOR DELETE
TO public
USING (true);

-- Comment explaining the approach
COMMENT ON TABLE initiatives IS 'RLS policies allow public access for now. In production, implement proper authentication and user-based policies.';
