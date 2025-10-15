-- Update governance_requests status constraint to use new status names
-- Old: Draft, Submitted, Under Review, Refinement, Ready for Governance, In Progress, Completed, Declined
-- New: Draft, Ready for Review, Needs Refinement, Ready for Governance, Dismissed

-- Drop the old constraint
ALTER TABLE governance_requests DROP CONSTRAINT IF EXISTS valid_status;

-- Add the new constraint with updated status names
ALTER TABLE governance_requests ADD CONSTRAINT valid_status CHECK (status IN (
  'Draft',
  'Ready for Review',
  'Needs Refinement',
  'Ready for Governance',
  'Dismissed'
));
