/*
  # Governance Portal - System-Level Request Intake & Tracking

  ## Overview
  Creates comprehensive database schema for system-level governance request intake,
  review workflow, and SCI assignment. Requests that are "Ready for Governance"
  get assigned to an SCI and converted to initiatives for prep work tracking.

  ## Key Workflow
  1. Submitter creates governance request (system-level only)
  2. System team reviews → "Ready for Governance"
  3. Assign SCI → Creates initiative (type: Governance, status: Planning)
  4. SCI tracks prep effort in initiative
  5. When approved → Initiative becomes Active (type changes to System Initiative)

  ## New Tables

  ### `governance_requests`
  Core request intake and tracking
  - `id` (uuid, primary key)
  - `request_id` (text, unique) - Auto-generated GOV-YYYY-XXX format
  - `title` (text, required) - Initiative title
  - `division_region` (text, required) - System/All CA/AZ-NV/etc.
  - `submitter_name` (text, required)
  - `submitter_email` (text, required)
  - `problem_statement` (text, required) - System-level problem description
  - `desired_outcomes` (text, required) - Expected system-wide outcomes
  - `system_clinical_leader` (text) - Sponsor name
  - `assigned_sci_id` (uuid) - References team_members
  - `assigned_sci_name` (text)
  - `patient_care_value` (text) - System-level patient impact
  - `compliance_regulatory_value` (text) - Compliance/regulatory benefits
  - `financial_impact` (numeric) - Dollar impact estimate
  - `target_timeline` (text) - Expected timeframe
  - `estimated_scope` (text) - Effort description
  - `benefit_score` (integer) - Optional scoring by reviewers
  - `effort_score` (integer)
  - `total_score` (integer)
  - `status` (text, required) - Workflow status (see below)
  - `linked_initiative_id` (uuid) - Links to created initiative (when converted)
  - `converted_at` (timestamptz) - When SCI was assigned and initiative created
  - `converted_by` (text) - Who assigned the SCI
  - `submitted_date` (timestamptz) - When submitted for review
  - `reviewed_date` (timestamptz) - When review completed
  - `approved_date` (timestamptz) - When governance approved
  - `completed_date` (timestamptz) - When work finished
  - `created_at`, `updated_at`, `last_updated_by`

  Status Options:
  - 'Draft' - Submitter working on intake
  - 'Submitted' - Submitted for system team review
  - 'Under Review' - System team reviewing
  - 'Refinement' - Sent back for more info
  - 'Ready for Governance' - Complete, ready for SCI assignment
  - 'In Progress' - SCI assigned and working (after conversion)
  - 'Completed' - Work finished
  - 'Declined' - Rejected (not system-level or not aligned)

  ### `governance_attachments`
  File uploads for requests
  - `id` (uuid, primary key)
  - `request_id` (uuid, foreign key) - Links to governance_requests
  - `file_name` (text) - Original filename
  - `file_url` (text) - Supabase Storage URL
  - `file_size` (integer) - Bytes
  - `uploaded_by` (text)
  - `uploaded_at` (timestamptz)

  ### `governance_links`
  Reference links (Google Docs, etc.)
  - `id` (uuid, primary key)
  - `request_id` (uuid, foreign key)
  - `link_title` (text) - Display text
  - `link_url` (text) - URL
  - `added_at` (timestamptz)

  ### `governance_comments`
  Collaboration comments
  - `id` (uuid, primary key)
  - `request_id` (uuid, foreign key)
  - `author_name` (text)
  - `comment_text` (text)
  - `created_at` (timestamptz)

  ## Updates to Existing Tables

  ### `initiatives`
  Add link back to governance request:
  - `governance_request_id` (uuid) - References governance_requests (nullable)

  ## Security
  - Enable Row Level Security on all tables
  - Allow public read/write for now (add auth later)
*/

-- ==============================================
-- Create governance_requests table
-- ==============================================
CREATE TABLE IF NOT EXISTS governance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE NOT NULL,

  -- Basic Information
  title TEXT NOT NULL,
  division_region TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  desired_outcomes TEXT NOT NULL,

  -- Leadership & Assignment
  system_clinical_leader TEXT,
  assigned_sci_id UUID REFERENCES team_members(id),
  assigned_sci_name TEXT,

  -- Value Proposition (system-level focus)
  patient_care_value TEXT,
  compliance_regulatory_value TEXT,
  financial_impact NUMERIC,
  target_timeline TEXT,
  estimated_scope TEXT,

  -- Scoring (optional - added by reviewers)
  benefit_score INTEGER,
  effort_score INTEGER,
  total_score INTEGER,

  -- Workflow & Status
  status TEXT NOT NULL DEFAULT 'Draft',

  -- Conversion tracking (when SCI assigned and initiative created)
  linked_initiative_id UUID,  -- Will add FK after initiatives table updated
  converted_at TIMESTAMPTZ,
  converted_by TEXT,

  -- Dates
  submitted_date TIMESTAMPTZ,
  reviewed_date TIMESTAMPTZ,
  approved_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_by TEXT,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN (
    'Draft', 'Submitted', 'Under Review', 'Refinement',
    'Ready for Governance', 'In Progress', 'Completed', 'Declined'
  ))
);

-- ==============================================
-- Create governance_attachments table
-- ==============================================
CREATE TABLE IF NOT EXISTS governance_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES governance_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Create governance_links table
-- ==============================================
CREATE TABLE IF NOT EXISTS governance_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES governance_requests(id) ON DELETE CASCADE,
  link_title TEXT NOT NULL,
  link_url TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Create governance_comments table
-- ==============================================
CREATE TABLE IF NOT EXISTS governance_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES governance_requests(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Update initiatives table
-- ==============================================
-- Add link back to governance request (optional field)
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS governance_request_id UUID;

-- Add foreign key constraint for governance_requests.linked_initiative_id
ALTER TABLE governance_requests
ADD CONSTRAINT fk_linked_initiative
FOREIGN KEY (linked_initiative_id)
REFERENCES initiatives(id) ON DELETE SET NULL;

-- Add foreign key for initiatives.governance_request_id
ALTER TABLE initiatives
ADD CONSTRAINT fk_governance_request
FOREIGN KEY (governance_request_id)
REFERENCES governance_requests(id) ON DELETE SET NULL;

-- ==============================================
-- Create indexes for performance
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_governance_requests_status
  ON governance_requests(status);

CREATE INDEX IF NOT EXISTS idx_governance_requests_submitter
  ON governance_requests(submitter_email);

CREATE INDEX IF NOT EXISTS idx_governance_requests_assigned_sci
  ON governance_requests(assigned_sci_id);

CREATE INDEX IF NOT EXISTS idx_governance_requests_linked_initiative
  ON governance_requests(linked_initiative_id);

CREATE INDEX IF NOT EXISTS idx_governance_attachments_request
  ON governance_attachments(request_id);

CREATE INDEX IF NOT EXISTS idx_governance_links_request
  ON governance_links(request_id);

CREATE INDEX IF NOT EXISTS idx_governance_comments_request
  ON governance_comments(request_id);

CREATE INDEX IF NOT EXISTS idx_initiatives_governance_request
  ON initiatives(governance_request_id);

-- ==============================================
-- Enable Row Level Security
-- ==============================================
ALTER TABLE governance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_comments ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- Create RLS Policies (public access for now)
-- ==============================================

-- Governance Requests
CREATE POLICY "Allow public read access to governance_requests"
  ON governance_requests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to governance_requests"
  ON governance_requests FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to governance_requests"
  ON governance_requests FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to governance_requests"
  ON governance_requests FOR DELETE
  TO public
  USING (true);

-- Governance Attachments
CREATE POLICY "Allow public read access to governance_attachments"
  ON governance_attachments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to governance_attachments"
  ON governance_attachments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete to governance_attachments"
  ON governance_attachments FOR DELETE
  TO public
  USING (true);

-- Governance Links
CREATE POLICY "Allow public read access to governance_links"
  ON governance_links FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to governance_links"
  ON governance_links FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete to governance_links"
  ON governance_links FOR DELETE
  TO public
  USING (true);

-- Governance Comments
CREATE POLICY "Allow public read access to governance_comments"
  ON governance_comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to governance_comments"
  ON governance_comments FOR INSERT
  TO public
  WITH CHECK (true);

-- ==============================================
-- Comments
-- ==============================================
COMMENT ON TABLE governance_requests IS
  'System-level governance request intake and tracking. Requests are reviewed, assigned to SCIs when Ready for Governance, and converted to initiatives for prep work tracking.';

COMMENT ON TABLE governance_attachments IS
  'File attachments for governance requests (stored in Supabase Storage).';

COMMENT ON TABLE governance_links IS
  'Reference links (Google Docs, websites, etc.) for governance requests.';

COMMENT ON TABLE governance_comments IS
  'Collaboration comments on governance requests between submitters and reviewers.';

COMMENT ON COLUMN governance_requests.linked_initiative_id IS
  'Links to initiative created when SCI is assigned (Ready for Governance → In Progress transition).';

COMMENT ON COLUMN governance_requests.converted_at IS
  'Timestamp when SCI was assigned and initiative was created for governance prep work.';

COMMENT ON COLUMN initiatives.governance_request_id IS
  'Links back to original governance request (if initiative was created from governance portal).';
