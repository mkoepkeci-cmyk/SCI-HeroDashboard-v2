-- Migration: Add Missing Assignment Columns from Excel
-- Date: 2025-10-13
-- Purpose: Add all columns from Excel staff tabs that are currently missing

ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS expander_over_15_hrs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ehrs_impacted TEXT,
ADD COLUMN IF NOT EXISTS projected_go_live_date DATE,
ADD COLUMN IF NOT EXISTS sponsor TEXT,
ADD COLUMN IF NOT EXISTS service_line TEXT,
ADD COLUMN IF NOT EXISTS assignment_date DATE,
ADD COLUMN IF NOT EXISTS comments_details TEXT;

-- Add comments for documentation
COMMENT ON COLUMN assignments.short_description IS 'Short description of the assignment from Excel (Column C)';
COMMENT ON COLUMN assignments.expander_over_15_hrs IS 'Indicates if assignment expands to >15 hrs/week (Column F)';
COMMENT ON COLUMN assignments.ehrs_impacted IS 'EHR systems impacted (Column H): e.g., "Cerner", "Epic", "Cerner, Epic"';
COMMENT ON COLUMN assignments.projected_go_live_date IS 'Projected go-live date for the assignment (Column K)';
COMMENT ON COLUMN assignments.sponsor IS 'Clinical or business sponsor name (Column L)';
COMMENT ON COLUMN assignments.service_line IS 'Service line (Column M): e.g., "Pharmacy", "Oncology", "Ambulatory"';
COMMENT ON COLUMN assignments.assignment_date IS 'Date the assignment was created/assigned (Column N)';
COMMENT ON COLUMN assignments.comments_details IS 'Additional comments and details from Excel (Column O)';

-- Verification
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments'
  AND column_name IN (
    'short_description',
    'ehrs_impacted',
    'projected_go_live_date',
    'sponsor',
    'service_line',
    'assignment_date',
    'comments_details'
  )
ORDER BY column_name;
