-- Add "In Governance" status to governance_requests table
-- Migration: Add new status option for items that have entered governance review

-- Drop the existing check constraint
ALTER TABLE governance_requests
DROP CONSTRAINT IF EXISTS valid_status;

-- Add the updated check constraint with "In Governance" status
ALTER TABLE governance_requests
ADD CONSTRAINT valid_status
CHECK (status IN ('Draft', 'Ready for Review', 'Needs Refinement', 'Ready for Governance', 'In Governance', 'Dismissed'));

-- Add comment explaining the new status
COMMENT ON CONSTRAINT valid_status ON governance_requests IS
'Valid status values: Draft, Ready for Review, Needs Refinement, Ready for Governance, In Governance, Dismissed.
"In Governance" indicates the request has entered the governance review process and is no longer in readiness review.';
