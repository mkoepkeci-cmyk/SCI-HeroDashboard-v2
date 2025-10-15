/**
 * Governance Portal Utilities
 *
 * Helper functions for the governance request intake and tracking portal.
 * Includes status management, filtering, formatting, and ID generation.
 */

import { GovernanceStatus, GovernanceRequest } from './supabase';

// ==============================================
// Division/Region Options
// ==============================================
export const DIVISION_REGIONS = [
  'System Request',
] as const;

// ==============================================
// Status Colors & Badges
// ==============================================
export interface StatusConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon?: string;
}

export const STATUS_CONFIG: Record<GovernanceStatus, StatusConfig> = {
  'Draft': {
    color: '#6B7280',
    bgColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    label: 'Draft',
    icon: '📝'
  },
  'Ready for Review': {
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    label: 'Ready for Review',
    icon: '📤'
  },
  'Needs Refinement': {
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5',
    label: 'Needs Refinement',
    icon: '🔧'
  },
  'Ready for Governance': {
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    label: 'Ready for Governance',
    icon: '✅'
  },
  'Dismissed': {
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    label: 'Dismissed',
    icon: '✗'
  }
};

export function getStatusConfig(status: GovernanceStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

// ==============================================
// Status Transition Validation
// ==============================================
export const VALID_STATUS_TRANSITIONS: Record<GovernanceStatus, GovernanceStatus[]> = {
  'Draft': ['Ready for Review', 'Dismissed'],
  'Ready for Review': ['Needs Refinement', 'Ready for Governance', 'Dismissed'],
  'Needs Refinement': ['Ready for Review', 'Dismissed'],
  'Ready for Governance': ['Dismissed'],
  'Dismissed': []  // Terminal state
};

export function canTransitionTo(fromStatus: GovernanceStatus, toStatus: GovernanceStatus): boolean {
  return VALID_STATUS_TRANSITIONS[fromStatus].includes(toStatus);
}

export function getAvailableStatuses(currentStatus: GovernanceStatus): GovernanceStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus];
}

// ==============================================
// Request ID Generation
// ==============================================
export function generateRequestId(year: number, sequence: number): string {
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `GOV-${year}-${paddedSequence}`;
}

export async function getNextRequestId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  // In a real implementation, this would query the database for the highest
  // sequence number for the current year. For now, return a placeholder.
  // The actual implementation should be done server-side or in the component
  // that has access to supabase.
  return `GOV-${currentYear}-001`;
}

// ==============================================
// Filtering & Sorting
// ==============================================
export interface RequestFilters {
  search?: string;
  status?: GovernanceStatus;
  division?: string;
  assignedSci?: string;
  submitter?: string;
}

export function filterRequests(
  requests: GovernanceRequest[],
  filters: RequestFilters
): GovernanceRequest[] {
  return requests.filter(request => {
    // Search filter (title, request_id, submitter)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        request.title.toLowerCase().includes(searchLower) ||
        request.request_id.toLowerCase().includes(searchLower) ||
        request.submitter_name.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && request.status !== filters.status) {
      return false;
    }

    // Division filter
    if (filters.division && request.division_region !== filters.division) {
      return false;
    }

    // Assigned SCI filter
    if (filters.assignedSci && request.assigned_sci_name !== filters.assignedSci) {
      return false;
    }

    // Submitter filter
    if (filters.submitter && request.submitter_email !== filters.submitter) {
      return false;
    }

    return true;
  });
}

export type SortField = 'created_at' | 'updated_at' | 'title' | 'status' | 'submitter_name';
export type SortDirection = 'asc' | 'desc';

export function sortRequests(
  requests: GovernanceRequest[],
  field: SortField,
  direction: SortDirection = 'desc'
): GovernanceRequest[] {
  const sorted = [...requests].sort((a, b) => {
    let aVal: any = a[field];
    let bVal: any = b[field];

    // Handle dates
    if (field === 'created_at' || field === 'updated_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

// ==============================================
// Quick Filters
// ==============================================
export function getReadyForAssignment(requests: GovernanceRequest[]): GovernanceRequest[] {
  return requests.filter(r =>
    r.status === 'Ready for Governance' && !r.linked_initiative_id
  );
}

export function getInPrep(requests: GovernanceRequest[]): GovernanceRequest[] {
  return requests.filter(r =>
    r.status === 'Ready for Governance' && r.linked_initiative_id
  );
}

export function getApproved(requests: GovernanceRequest[]): GovernanceRequest[] {
  return requests.filter(r => r.status === 'Ready for Governance');
}

export function getNeedsReview(requests: GovernanceRequest[]): GovernanceRequest[] {
  return requests.filter(r => r.status === 'Ready for Review');
}

export function getMyRequests(requests: GovernanceRequest[], userEmail: string): GovernanceRequest[] {
  return requests.filter(r => r.submitter_email === userEmail);
}

// ==============================================
// Formatting Helpers
// ==============================================
export function formatCurrency(amount: number | undefined): string {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// ==============================================
// Validation
// ==============================================
export interface ValidationErrors {
  [key: string]: string;
}

export function validateGovernanceRequest(
  data: Partial<GovernanceRequest>,
  isSubmitting: boolean = false
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Required fields for all requests
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Initiative title is required';
  }

  if (!data.division_region) {
    errors.division_region = 'Division/Region is required';
  }

  if (!data.submitter_name || data.submitter_name.trim().length === 0) {
    errors.submitter_name = 'Submitter name is required';
  }

  if (!data.submitter_email || data.submitter_email.trim().length === 0) {
    errors.submitter_email = 'Submitter email is required';
  } else if (!isValidEmail(data.submitter_email)) {
    errors.submitter_email = 'Please enter a valid email address';
  }

  // Additional required fields when submitting (not just saving draft)
  if (isSubmitting) {
    if (!data.problem_statement || data.problem_statement.trim().length === 0) {
      errors.problem_statement = 'Problem statement is required to submit';
    } else if (data.problem_statement.trim().length < 50) {
      errors.problem_statement = 'Problem statement should be at least 50 characters to clearly describe the system-level need';
    }

    if (!data.desired_outcomes || data.desired_outcomes.trim().length === 0) {
      errors.desired_outcomes = 'Desired outcomes are required to submit';
    }
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ==============================================
// Pipeline Metrics
// ==============================================
export interface PipelineMetrics {
  total: number;
  byStatus: Record<GovernanceStatus, number>;
  readyForAssignment: number;
  inPrep: number;
  approved: number;
  needsReview: number;
}

export function calculatePipelineMetrics(requests: GovernanceRequest[]): PipelineMetrics {
  const byStatus: Record<GovernanceStatus, number> = {
    'Draft': 0,
    'Ready for Review': 0,
    'Needs Refinement': 0,
    'Ready for Governance': 0,
    'Dismissed': 0
  };

  requests.forEach(r => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  });

  return {
    total: requests.length,
    byStatus,
    readyForAssignment: getReadyForAssignment(requests).length,
    inPrep: getInPrep(requests).length,
    approved: getApproved(requests).length,
    needsReview: getNeedsReview(requests).length
  };
}
