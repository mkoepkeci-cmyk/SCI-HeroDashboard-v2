/*
  # Add Effort Size and Additional Hours to Effort Logs

  ## Changes
  - Add effort_size column to effort_logs (moved from initiatives table)
  - Add additional_hours column for user adjustments
  - hours_spent will be calculated as: formula_hours + additional_hours

  ## Workflow
  1. User selects effort_size in My Effort table (XS, S, M, L, XL)
  2. Formula calculates base hours from initiative attributes
  3. User can add additional_hours if needed
  4. Total hours_spent = formula + additional
*/

-- Add new columns to effort_logs
ALTER TABLE effort_logs
ADD COLUMN IF NOT EXISTS effort_size text,
ADD COLUMN IF NOT EXISTS additional_hours decimal DEFAULT 0;

-- Add comments
COMMENT ON COLUMN effort_logs.effort_size IS
'Effort size selected by user (XS, S, M, L, XL) - used for formula calculation';

COMMENT ON COLUMN effort_logs.additional_hours IS
'Additional hours beyond formula estimate - allows user adjustments';

COMMENT ON COLUMN effort_logs.hours_spent IS
'Total hours: formula_hours (from effort_size + initiative attributes) + additional_hours';

-- Update existing rows to have 0 additional_hours
UPDATE effort_logs
SET additional_hours = 0
WHERE additional_hours IS NULL;
