import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;              // Keep for backward compatibility
  first_name?: string;       // NEW: First name (populated from name)
  last_name?: string;        // NEW: Last name (optional)
  manager_id?: string;       // NEW: Reference to manager
  role: string;
  specialty?: string[];      // CHANGED: Now array for multi-select
  is_active?: boolean;       // NEW: Whether team member is active
  total_assignments: number;
  revenue_impact?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkTypeSummary {
  id: string;
  team_member_id: string;
  work_type: string;
  count: number;
  created_at: string;
}

export interface EHRPlatformSummary {
  id: string;
  team_member_id: string;
  ehr_platform: string;
  count: number;
  created_at: string;
}

export interface KeyHighlight {
  id: string;
  team_member_id: string;
  highlight: string;
  order_index: number;
  created_at: string;
}

export interface TeamMetric {
  id: string;
  metric_name: string;
  metric_value: string;
  metric_category?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompletionStatus {
  basic: boolean;
  governance: boolean;
  metrics: boolean;
  financial: boolean;
  performance: boolean;
  projections: boolean;
  story: boolean;
}

export interface JournalEntry {
  timestamp: string;
  author: string;
  author_id?: string;
  entry: string;
}

export interface Initiative {
  id: string;
  owner_name: string;
  initiative_name: string;
  type: string;
  status: string;
  phase?: string;
  work_effort?: string;
  role?: string;
  ehrs_impacted?: string;
  service_line?: string;
  start_date?: string;
  end_date?: string;
  timeframe_display?: string;
  clinical_sponsor_name?: string;
  clinical_sponsor_title?: string;
  key_collaborators?: string[];
  governance_bodies?: string[];
  team_member_id?: string;
  governance_request_id?: string;  // Link back to governance request (if created from portal)
  request_id?: string;  // Governance request ID (GOV-YYYY-XXX) for display
  problem_statement?: string;  // enterprise-level problem from intake form
  desired_outcomes?: string;  // Expected outcomes from intake form
  governance_metadata?: Record<string, any>;  // Governance-specific data (JSONB)
  proposed_solution?: string;  // Solution for governance review (Tab 3)
  voting_statement?: string;  // Voting statement for governance committee (Tab 3)
  decision?: string;  // Governance decision: Approved, Denied, Sent Back, Dismissed (Tab 3)
  journal_log?: JournalEntry[];  // Timestamped journal entries (Tab 3)
  direct_hours_per_week?: number; // For Governance work type: actual hours per week (bypasses formula)

  // Value propositions (from governance request form)
  patient_care_value?: string;  // How initiative improves patient care across system
  compliance_regulatory_value?: string;  // System-wide regulatory requirements/compliance benefits
  estimated_scope?: string;  // Resources, timeline, complexity at system scale

  // Basic information (from governance request form)
  division_region?: string;  // Division/region submitting the request
  submitter_name?: string;  // Person who submitted the governance request
  submitter_email?: string;  // Submitter's email address

  // Impact categories (strategic alignment flags)
  impact_commonspirit_board_goal?: boolean;  // Aligns with CommonSpirit Board goals
  impact_commonspirit_2026_5for25?: boolean;  // Supports CommonSpirit 2026 or 5 for 25 strategy
  impact_system_policy?: boolean;  // Affects system-wide policy
  impact_patient_safety?: boolean;  // Impacts patient safety
  impact_regulatory_compliance?: boolean;  // Regulatory/compliance requirement
  impact_financial?: boolean;  // Has financial impact
  impact_other?: string;  // Other impact category description

  // Supporting information
  supporting_information?: string;  // Regulatory, policy, or practice guidelines

  // Groups impacted (stakeholder tracking)
  groups_nurses?: boolean;  // Nurses affected by this initiative
  groups_physicians_apps?: boolean;  // Physicians/APPs affected
  groups_therapies?: boolean;  // Therapy services affected
  groups_lab?: boolean;  // Laboratory services affected
  groups_pharmacy?: boolean;  // Pharmacy services affected
  groups_radiology?: boolean;  // Radiology services affected
  groups_administration?: boolean;  // Administration affected
  groups_other?: string;  // Other groups affected (description)

  // Regional impact
  regions_impacted?: string;  // Which regions are affected
  required_date?: string;  // Required completion date (for regulations/mandates)
  required_date_reason?: string;  // Reason for required date (e.g., CMS effective date)

  // Additional context
  additional_comments?: string;  // Any additional information for evaluation

  is_draft: boolean;
  is_active?: boolean;
  completion_status: CompletionStatus;
  completion_percentage: number;
  last_updated_by?: string;
  section_last_updated?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface InitiativeMetric {
  id: string;
  initiative_id: string;
  metric_name: string;
  metric_type: string;
  unit: string;
  baseline_value?: number;
  baseline_date?: string;
  current_value?: number;
  measurement_date?: string;
  target_value?: number;
  improvement?: string;
  measurement_method?: string;
  display_order: number;
  created_at: string;
}

export interface InitiativeFinancialImpact {
  id: string;
  initiative_id: string;
  actual_revenue?: number;
  actual_timeframe?: string;
  measurement_start_date?: string;
  measurement_end_date?: string;
  projected_annual?: number;
  projection_basis?: string;
  calculation_methodology?: string;
  key_assumptions?: string[];
  created_at: string;
  updated_at: string;
}

export interface InitiativePerformanceData {
  id: string;
  initiative_id: string;
  users_deployed?: number;
  total_potential_users?: number;
  adoption_rate?: number;
  primary_outcome?: string;
  measurement_method?: string;
  sample_size?: string;
  measurement_period?: string;
  annual_impact_calculated?: string;
  calculation_formula?: string;
  created_at: string;
  updated_at: string;
}

export interface InitiativeProjection {
  id: string;
  initiative_id: string;
  scenario_description?: string;
  projected_users?: number;
  percent_of_organization?: number;
  projected_time_savings?: string;
  projected_dollar_value?: string;
  revenue_impact?: string;
  calculation_method?: string;
  assumptions?: string[];
  sensitivity_notes?: string;
  additional_benefits?: string;
  created_at: string;
  updated_at: string;
}

export interface InitiativeStory {
  id: string;
  initiative_id: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  collaboration_detail?: string;
  created_at: string;
  updated_at: string;
}

// Effort Tracking Types
// Updated to match workload_calculator_config (2025-10-26)
export type EffortSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface EffortSizeMapping {
  size: EffortSize;
  label: string;
  hours: number;
  color: string;
}

export const EFFORT_SIZES: EffortSizeMapping[] = [
  { size: 'XS', label: 'Extra Small', hours: 0.5, color: '#10b981' },  // Less than 1 hr/wk
  { size: 'S', label: 'Small', hours: 1.5, color: '#3b82f6' },          // 1-2 hrs/wk
  { size: 'M', label: 'Medium', hours: 3.5, color: '#f59e0b' },         // 2-5 hrs/wk
  { size: 'L', label: 'Large', hours: 7.5, color: '#f97316' },          // 5-10 hrs/wk
  { size: 'XL', label: 'Extra Large', hours: 15, color: '#ef4444' },    // More than 10 hrs/wk
];

export interface EffortLog {
  id: string;
  initiative_id: string;
  team_member_id: string;
  week_start_date: string; // ISO date string for Monday of the week
  hours_spent: number;
  effort_size: EffortSize;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface EffortSummary {
  week_start_date: string;
  total_hours: number;
  initiative_count: number;
  effort_by_work_type: Record<string, number>;
  capacity_status: 'under' | 'normal' | 'near' | 'over' | 'critical';
}

export interface InitiativeEffortTrend {
  initiative_id: string;
  initiative_name: string;
  work_type: string;
  recent_hours: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trend_percentage?: number;
  weeks_logged: number;
  total_hours: number;
}

export interface InitiativeTeamMember {
  id: string;
  initiative_id: string;
  team_member_id: string;
  team_member_name?: string;  // Joined from team_members table
  role: 'Owner' | 'Co-Owner' | 'Secondary' | 'Support';
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface InitiativeWithDetails extends Initiative {
  metrics: InitiativeMetric[];
  financial_impact?: InitiativeFinancialImpact;
  performance_data?: InitiativePerformanceData;
  projections?: InitiativeProjection;
  story?: InitiativeStory;
  effort_logs?: EffortLog[];
  effort_trend?: InitiativeEffortTrend;
  team_members?: InitiativeTeamMember[];  // All assigned team members (any role)
}

// ============================================================================
// Constants for Admin Management
// ============================================================================

// Specialty options (service lines) - alphabetically ordered
export const SPECIALTIES = [
  'Acute Institute & Cardiology',
  'Ambulatory',
  'Ancillary',
  'Care Coordination',
  'Emergency Department',
  'Inpatient',
  'Laboratory',
  'Nursing',
  'OB/NICU',
  'Perioperative',
  'Pharmacy & Oncology',
  'Radiology',
  'Revenue Cycle',
  'Surgery, Anesthesia, Transplant',
  'Other',
] as const;

// ============================================================================
// Helper Functions for Display Names
// ============================================================================

/**
 * Get full display name for team member
 * Prefers first_name + last_name if available, falls back to name
 */
export function getTeamMemberDisplayName(member: TeamMember): string {
  if (member.first_name && member.last_name) {
    return `${member.first_name} ${member.last_name}`;
  }
  if (member.first_name) {
    return member.first_name;
  }
  return member.name;
}

/**
 * Get short display name (first name + last initial)
 * Used for compact displays like capacity cards
 */
export function getTeamMemberShortName(member: TeamMember): string {
  if (member.first_name && member.last_name) {
    return `${member.first_name} ${member.last_name.charAt(0)}.`;
  }
  return member.first_name || member.name;
}

/**
 * Get manager's full name
 */
export function getManagerDisplayName(manager: Manager): string {
  return `${manager.first_name} ${manager.last_name}`;
}

// Dashboard Metrics - Pre-calculated from Excel Dashboard tab (columns A-Y)
// This is the source of truth for workload/capacity data
export interface DashboardMetrics {
  team_member_id: string;
  // Summary Metrics (Columns A-G)
  total_assignments: number;
  active_assignments: number;
  active_hours_per_week: number;
  available_hours: number;
  capacity_utilization: number; // decimal (e.g., 0.2964 = 29.64%)
  capacity_status: string; // e.g., "⚠️ 2 Need Baseline Info, 4 Other Incomplete - 🟢 Under"
  // Work Type Breakdown (Columns H-Y)
  epic_gold_count: number;
  epic_gold_hours: number;
  governance_count: number;
  governance_hours: number;
  system_initiative_count: number;
  system_initiative_hours: number;
  system_projects_count: number;
  system_projects_hours: number;
  epic_upgrades_count: number;
  epic_upgrades_hours: number;
  general_support_count: number;
  general_support_hours: number;
  policy_count: number;
  policy_hours: number;
  market_count: number;
  market_hours: number;
  ticket_count: number;
  ticket_hours: number;
  // Metadata
  last_updated: string;
}

export interface TeamMemberWithDashboard extends TeamMember {
  dashboard_metrics?: DashboardMetrics;
}

// Governance Portal Types
export type GovernanceStatus =
  | 'Draft'
  | 'Ready for Review'
  | 'Needs Refinement'
  | 'Ready for Governance'
  | 'In Governance'
  | 'Dismissed';

export interface GovernanceRequest {
  id: string;
  request_id: string;  // Auto-generated GOV-YYYY-XXX

  // Basic Information
  title: string;
  division_region: string;
  submitter_name: string;
  submitter_email: string;
  problem_statement: string;
  desired_outcomes: string;

  // Leadership & Assignment
  sponsor_name?: string;  // Executive sponsor full name
  sponsor_title?: string;  // Executive sponsor title/role
  assigned_sci_id?: string;
  assigned_sci_name?: string;
  assigned_role?: string;
  work_effort?: string;
  work_type?: string;
  work_phase?: string;

  // Value Proposition
  patient_care_value?: string;
  compliance_regulatory_value?: string;
  financial_impact?: number; // Legacy field - kept for backward compatibility
  target_timeline?: string;
  estimated_scope?: string;

  // Impact Metrics (structured data)
  impact_metrics?: {
    metric_name: string;
    metric_type: string;
    unit: string;
    baseline_value?: number;
    baseline_date?: string;
    current_value?: number;
    measurement_date?: string;
    target_value?: number;
    improvement?: string;
    measurement_method?: string;
  }[];

  // Financial Impact Details
  projected_annual_revenue?: number;
  projection_basis?: string;
  calculation_methodology?: string;
  key_assumptions?: string[];

  // Impact Categories (checkboxes - must be demonstrable)
  impact_commonspirit_board_goal?: boolean;
  impact_commonspirit_2026_5for25?: boolean;
  impact_system_policy?: boolean;
  impact_patient_safety?: boolean;
  impact_regulatory_compliance?: boolean;
  impact_financial?: boolean;
  impact_other?: string;  // Free text for "Other:"

  // Supporting Information
  supporting_information?: string;  // Regulatory, policy, practice guidelines, etc.

  // Groups Impacted (checkboxes)
  groups_nurses?: boolean;
  groups_physicians_apps?: boolean;
  groups_therapies?: boolean;
  groups_lab?: boolean;
  groups_pharmacy?: boolean;
  groups_radiology?: boolean;
  groups_administration?: boolean;
  groups_other?: string;  // Free text for "Other:"

  // Regional Impact
  regions_impacted?: string;  // All regions or specific list

  // Required Date
  required_date?: string;  // Date string
  required_date_reason?: string;  // Regulation effective, policy effective, etc.

  // Additional Comments
  additional_comments?: string;

  // Scoring (optional)
  benefit_score?: number;
  effort_score?: number;
  total_score?: number;

  // Workflow
  status: GovernanceStatus;

  // Conversion tracking
  linked_initiative_id?: string;
  converted_at?: string;
  converted_by?: string;

  // Dates
  submitted_date?: string;
  reviewed_date?: string;
  approved_date?: string;
  completed_date?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  last_updated_by?: string;
}

export interface GovernanceAttachment {
  id: string;
  request_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface GovernanceLink {
  id: string;
  request_id: string;
  link_title: string;
  link_url: string;
  added_at: string;
}

export interface GovernanceComment {
  id: string;
  request_id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

export interface GovernanceRequestWithDetails extends GovernanceRequest {
  attachments: GovernanceAttachment[];
  links: GovernanceLink[];
  comments: GovernanceComment[];
  linked_initiative?: Initiative;
}

export interface FieldLabel {
  id: string;
  field_key: string;
  label_text: string;
  description?: string;
  field_category: 'sponsor' | 'impact_category' | 'groups_impacted' | 'general';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Database schema type for TypeScript support
export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: TeamMember;
      };
      assignments: {
        Row: Assignment;
      };
      dashboard_metrics: {
        Row: DashboardMetrics;
      };
      governance_requests: {
        Row: GovernanceRequest;
      };
      governance_attachments: {
        Row: GovernanceAttachment;
      };
      governance_links: {
        Row: GovernanceLink;
      };
      governance_comments: {
        Row: GovernanceComment;
      };
    };
  };
};
