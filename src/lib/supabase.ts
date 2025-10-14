import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  total_assignments: number;
  revenue_impact?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  assignment_name: string;
  work_type: string;
  phase?: string;
  status: string;
  work_effort?: string;
  team_member_id: string;
  team_member_name: string;
  role_type?: string;
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
export type EffortSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface EffortSizeMapping {
  size: EffortSize;
  label: string;
  hours: number;
  color: string;
}

export const EFFORT_SIZES: EffortSizeMapping[] = [
  { size: 'XS', label: 'Extra Small', hours: 1.5, color: '#10b981' },
  { size: 'S', label: 'Small', hours: 4, color: '#3b82f6' },
  { size: 'M', label: 'Medium', hours: 8, color: '#f59e0b' },
  { size: 'L', label: 'Large', hours: 13, color: '#f97316' },
  { size: 'XL', label: 'Extra Large', hours: 18, color: '#ef4444' },
  { size: 'XXL', label: 'Double XL', hours: 25, color: '#dc2626' },
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

export interface InitiativeWithDetails extends Initiative {
  metrics: InitiativeMetric[];
  financial_impact?: InitiativeFinancialImpact;
  performance_data?: InitiativePerformanceData;
  projections?: InitiativeProjection;
  story?: InitiativeStory;
  effort_logs?: EffortLog[];
  effort_trend?: InitiativeEffortTrend;
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
  assignments: Assignment[];
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
    };
  };
};
