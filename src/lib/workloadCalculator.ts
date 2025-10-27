/**
 * Workload Calculator - Dynamic Capacity Calculation Engine
 *
 * Calculates team member capacity based on:
 * 1. Initiative attributes (role, type, phase, size) from initiatives table
 * 2. Actual hours logged from effort_logs table (My Effort tab)
 * 3. Configurable weights from workload_calculator_config table
 *
 * Formula: Active Hours = Base Hours × Role Weight × Type Weight × Phase Weight
 * Special Case: Governance uses direct_hours_per_week (no formula weights)
 *
 * Hybrid Calculation:
 * - IF user has logged effort for an initiative this week → use ACTUAL hours
 * - ELSE → use ESTIMATED hours (from formula or direct)
 */

import { supabase, InitiativeWithDetails, EffortLog } from './supabase';
import { getWeekStartDate } from './effortUtils';

// ============================================================================
// Configuration Types
// ============================================================================

export interface WorkloadCalculatorConfig {
  effortSizes: Record<string, number>;      // 'XS' → 0.5, 'S' → 1.5, etc.
  roleWeights: Record<string, number>;      // 'Owner' → 1.0, 'Secondary' → 0.5
  workTypeWeights: Record<string, number>;  // 'System Initiative' → 1.0, 'Policy' → 0.5
  phaseWeights: Record<string, number>;     // 'Design' → 1.0, 'Discovery' → 0.3
  capacityThresholds: {
    under: number;   // 0.60 (< 60%)
    near: number;    // 0.75 (60-74%)
    at: number;      // 0.85 (75-84%)
    over: number;    // 0.85 (>= 85%)
  };
}

export type CapacityStatus = 'under' | 'near' | 'at' | 'over';

export interface DataQualityWarnings {
  missingRole: number;
  missingSize: number;
  missingWorkType: number;
  missingPhase: number;
  needsBaseline: number;  // Missing role AND size AND work type
}

export interface AssignmentCapacity {
  initiative: InitiativeWithDetails;
  estimatedHours: number;
  actualHours?: number;
  source: 'logged' | 'estimated';
  calculationMethod: 'formula' | 'direct' | 'missing_data';
  formulaBreakdown?: {
    baseHours: number;
    roleWeight: number;
    typeWeight: number;
    phaseWeight: number;
  };
}

export interface CapacityBreakdown {
  totalHours: number;
  capacityUtilization: number;
  capacityStatus: CapacityStatus;
  loggedCount: number;
  estimatedCount: number;
  loggedHours: number;
  estimatedHours: number;
  assignments: AssignmentCapacity[];
  dataQualityWarnings: DataQualityWarnings;
}

// ============================================================================
// Configuration Loading
// ============================================================================

/**
 * Load calculator configuration from database
 * Caches in memory for performance (can add Redis/etc. later)
 */
let cachedConfig: WorkloadCalculatorConfig | null = null;
let configLoadedAt: number = 0;
const CONFIG_CACHE_TTL = 60000; // 1 minute

export async function loadCalculatorConfig(): Promise<WorkloadCalculatorConfig> {
  // Return cached config if still valid
  const now = Date.now();
  if (cachedConfig && (now - configLoadedAt) < CONFIG_CACHE_TTL) {
    return cachedConfig;
  }

  // Fetch all config from database
  const { data, error } = await supabase
    .from('workload_calculator_config')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error loading calculator config:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No calculator configuration found. Run database migrations to seed config.');
  }

  // Transform flat array into structured object
  const config: WorkloadCalculatorConfig = {
    effortSizes: {},
    roleWeights: {},
    workTypeWeights: {},
    phaseWeights: {},
    capacityThresholds: {
      under: 0.60,
      near: 0.75,
      at: 0.85,
      over: 0.85,
    },
  };

  for (const row of data) {
    const value = parseFloat(row.value?.toString() || '0');

    switch (row.config_type) {
      case 'effort_size':
        config.effortSizes[row.key] = value;
        break;
      case 'role_weight':
        config.roleWeights[row.key] = value;
        break;
      case 'work_type_weight':
        config.workTypeWeights[row.key] = value;
        break;
      case 'phase_weight':
        config.phaseWeights[row.key] = value;
        break;
      case 'capacity_threshold':
        if (row.key === 'under') config.capacityThresholds.under = value;
        else if (row.key === 'near') config.capacityThresholds.near = value;
        else if (row.key === 'at') config.capacityThresholds.at = value;
        else if (row.key === 'over') config.capacityThresholds.over = value;
        break;
    }
  }

  // Cache the config
  cachedConfig = config;
  configLoadedAt = now;

  return config;
}

/**
 * Clear configuration cache (call after updating config in database)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
  configLoadedAt = 0;
}

// ============================================================================
// Estimated Hours Calculation
// ============================================================================

/**
 * Calculate ESTIMATED hours for an initiative based on formula or direct hours
 * This is the "planned" capacity before actual effort is logged
 */
export function calculateEstimatedHours(
  initiative: InitiativeWithDetails,
  config: WorkloadCalculatorConfig
): { hours: number; method: 'formula' | 'direct' | 'missing_data'; breakdown?: any } {
  // Check if initiative is active
  const activeStatuses = ['Active', 'In Progress', 'Not Started', 'Planning', 'Scaling'];
  const isActive = activeStatuses.includes(initiative.status || '');

  if (!isActive) {
    return { hours: 0, method: 'missing_data' };
  }

  // GOVERNANCE SPECIAL CASE: Use direct hours (no formula)
  if (initiative.type === 'Governance') {
    const directHours = initiative.direct_hours_per_week || 0;
    return {
      hours: directHours,
      method: 'direct',
    };
  }

  // Check for missing baseline data
  if (!initiative.role || !initiative.work_effort || !initiative.type) {
    // Can't calculate without baseline data
    return { hours: 0, method: 'missing_data' };
  }

  // FORMULA-BASED CALCULATION for all other work types
  const baseHours = config.effortSizes[initiative.work_effort] || 0;
  const roleWeight = config.roleWeights[initiative.role] || 1;
  const typeWeight = config.workTypeWeights[initiative.type] || 1;
  const phaseWeight = config.phaseWeights[initiative.phase || 'N/A'] || 1;

  const calculatedHours = baseHours * roleWeight * typeWeight * phaseWeight;

  return {
    hours: calculatedHours,
    method: 'formula',
    breakdown: {
      baseHours,
      roleWeight,
      typeWeight,
      phaseWeight,
      formula: `${baseHours} × ${roleWeight} × ${typeWeight} × ${phaseWeight} = ${calculatedHours.toFixed(2)}`,
    },
  };
}

// ============================================================================
// Data Quality Assessment
// ============================================================================

/**
 * Check initiative for missing data that prevents capacity calculation
 */
export function detectMissingData(initiative: InitiativeWithDetails): {
  status: 'complete' | 'missing_baseline' | 'missing_role' | 'missing_size' | 'missing_type' | 'missing_phase';
  message: string;
  canCalculate: boolean;
} {
  // Governance can use EITHER direct hours OR formula
  // If direct hours are set, use them (preferred for ongoing governance work)
  if (initiative.type === 'Governance' && initiative.direct_hours_per_week) {
    return {
      status: 'complete',
      message: '✓ Complete (Direct Hours)',
      canCalculate: true,
    };
  }
  // If no direct_hours for Governance, fall through to use formula calculation

  // Check for baseline data (role + size + type)
  const hasRole = !!initiative.role;
  const hasSize = !!initiative.work_effort;
  const hasType = !!initiative.type;

  if (!hasRole && !hasSize && !hasType) {
    return {
      status: 'missing_baseline',
      message: 'Needs Baseline Information',
      canCalculate: false,
    };
  }

  // Check individual fields
  if (!hasRole) {
    return {
      status: 'missing_role',
      message: '⚠️ Missing Role',
      canCalculate: false,
    };
  }

  if (!hasSize) {
    return {
      status: 'missing_size',
      message: '⚠️ Missing Size',
      canCalculate: false,
    };
  }

  if (!hasType) {
    return {
      status: 'missing_type',
      message: '⚠️ Missing Work Type',
      canCalculate: false,
    };
  }

  // Phase not required for Governance (ongoing work, not a project)
  if (!initiative.phase && initiative.type !== 'Governance') {
    return {
      status: 'missing_phase',
      message: '⚠️ Missing Phase',
      canCalculate: false,
    };
  }

  return {
    status: 'complete',
    message: '✓ Complete',
    canCalculate: true,
  };
}

// ============================================================================
// Capacity Calculation (Hybrid: Actual + Estimated)
// ============================================================================

/**
 * Calculate member capacity for a specific week
 * Uses ACTUAL hours where logged, ESTIMATED hours otherwise
 *
 * @param teamMemberId - UUID of team member
 * @param weekStartDate - ISO date string for Monday of week (YYYY-MM-DD)
 * @param config - Calculator configuration (optional, will load if not provided)
 */
export async function calculateMemberCapacity(
  teamMemberId: string,
  weekStartDate: string,
  config?: WorkloadCalculatorConfig
): Promise<CapacityBreakdown> {
  // Load config if not provided
  const calcConfig = config || await loadCalculatorConfig();

  // Fetch all initiatives for this team member
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('*')
    .or(`team_member_id.eq.${teamMemberId},owner_name.eq.(SELECT name FROM team_members WHERE id = '${teamMemberId}')`);

  if (initError) {
    console.error('Error fetching initiatives:', initError);
    throw initError;
  }

  // Filter to active initiatives only
  const activeStatuses = ['Active', 'In Progress', 'Not Started', 'Planning', 'Scaling'];
  const activeInitiatives = (initiatives || []).filter(i => activeStatuses.includes(i.status || ''));

  // Fetch effort logs for this week
  const { data: effortLogs, error: logError } = await supabase
    .from('effort_logs')
    .select('*')
    .eq('team_member_id', teamMemberId)
    .eq('week_start_date', weekStartDate);

  if (logError) {
    console.error('Error fetching effort logs:', logError);
    throw logError;
  }

  // Initialize breakdown
  const breakdown: CapacityBreakdown = {
    totalHours: 0,
    capacityUtilization: 0,
    capacityStatus: 'under',
    loggedCount: 0,
    estimatedCount: 0,
    loggedHours: 0,
    estimatedHours: 0,
    assignments: [],
    dataQualityWarnings: {
      missingRole: 0,
      missingSize: 0,
      missingWorkType: 0,
      missingPhase: 0,
      needsBaseline: 0,
    },
  };

  // Calculate effective hours for each initiative
  for (const initiative of activeInitiatives) {
    // Calculate estimated hours
    const estimated = calculateEstimatedHours(initiative as InitiativeWithDetails, calcConfig);

    // Check for actual logged hours this week
    const effortLog = (effortLogs || []).find(log => log.initiative_id === initiative.id);

    if (effortLog) {
      // User logged actual hours → use actual
      breakdown.assignments.push({
        initiative: initiative as InitiativeWithDetails,
        estimatedHours: estimated.hours,
        actualHours: effortLog.hours_spent,
        source: 'logged',
        calculationMethod: estimated.method,
        formulaBreakdown: estimated.breakdown,
      });

      breakdown.loggedHours += effortLog.hours_spent;
      breakdown.totalHours += effortLog.hours_spent;
      breakdown.loggedCount++;
    } else {
      // No effort logged → use estimated
      breakdown.assignments.push({
        initiative: initiative as InitiativeWithDetails,
        estimatedHours: estimated.hours,
        source: 'estimated',
        calculationMethod: estimated.method,
        formulaBreakdown: estimated.breakdown,
      });

      breakdown.estimatedHours += estimated.hours;
      breakdown.totalHours += estimated.hours;
      breakdown.estimatedCount++;
    }

    // Track data quality warnings
    const dataCheck = detectMissingData(initiative as InitiativeWithDetails);
    if (dataCheck.status === 'missing_baseline') {
      breakdown.dataQualityWarnings.needsBaseline++;
    } else if (dataCheck.status === 'missing_role') {
      breakdown.dataQualityWarnings.missingRole++;
    } else if (dataCheck.status === 'missing_size') {
      breakdown.dataQualityWarnings.missingSize++;
    } else if (dataCheck.status === 'missing_type') {
      breakdown.dataQualityWarnings.missingWorkType++;
    } else if (dataCheck.status === 'missing_phase') {
      breakdown.dataQualityWarnings.missingPhase++;
    }
  }

  // Calculate capacity utilization and status
  breakdown.capacityUtilization = breakdown.totalHours / 40;
  breakdown.capacityStatus = determineCapacityStatus(breakdown.capacityUtilization, calcConfig);

  return breakdown;
}

/**
 * Determine capacity status based on utilization percentage
 */
export function determineCapacityStatus(
  utilization: number,
  config: WorkloadCalculatorConfig
): CapacityStatus {
  if (utilization >= config.capacityThresholds.over) {
    return 'over';  // >= 85%
  } else if (utilization >= config.capacityThresholds.at) {
    return 'at';    // 75-84%
  } else if (utilization >= config.capacityThresholds.near) {
    return 'near';  // 60-74%
  } else {
    return 'under'; // < 60%
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get capacity status emoji
 */
export function getCapacityStatusEmoji(status: CapacityStatus): string {
  switch (status) {
    case 'over': return '🔴';
    case 'at': return '🟠';
    case 'near': return '🟡';
    case 'under': return '🟢';
  }
}

/**
 * Get capacity status label
 */
export function getCapacityStatusLabel(status: CapacityStatus): string {
  switch (status) {
    case 'over': return 'Over Capacity';
    case 'at': return 'At Capacity';
    case 'near': return 'Near Capacity';
    case 'under': return 'Under Capacity';
  }
}

/**
 * Get capacity status color
 */
export function getCapacityStatusColor(status: CapacityStatus): string {
  switch (status) {
    case 'over': return '#dc2626';  // red-600
    case 'at': return '#f97316';    // orange-500
    case 'near': return '#f59e0b';  // amber-500
    case 'under': return '#10b981'; // emerald-500
  }
}

/**
 * Format capacity status with warnings
 */
export function formatCapacityStatus(
  breakdown: CapacityBreakdown
): string {
  const emoji = getCapacityStatusEmoji(breakdown.capacityStatus);
  const label = getCapacityStatusLabel(breakdown.capacityStatus);

  const warnings = [];
  if (breakdown.dataQualityWarnings.needsBaseline > 0) {
    warnings.push(`${breakdown.dataQualityWarnings.needsBaseline} Need Baseline Info`);
  }

  const otherIncomplete =
    breakdown.dataQualityWarnings.missingRole +
    breakdown.dataQualityWarnings.missingSize +
    breakdown.dataQualityWarnings.missingWorkType +
    breakdown.dataQualityWarnings.missingPhase;

  if (otherIncomplete > 0) {
    warnings.push(`${otherIncomplete} Other Incomplete`);
  }

  if (warnings.length > 0) {
    return `⚠️ ${warnings.join(', ')} - ${emoji} ${label}`;
  }

  return `${emoji} ${label}`;
}

// ============================================================================
// Dashboard Metrics Recalculation
// ============================================================================

/**
 * Get comprehensive workload data for a team member
 * This is the SINGLE SOURCE OF TRUTH for all capacity calculations
 *
 * @param teamMemberId - UUID of team member (optional if teamMemberName provided)
 * @param teamMemberName - Name of team member (optional if teamMemberId provided)
 * @returns Complete workload data including initiatives, capacity, and data quality
 */
export async function getTeamMemberWorkloadData(
  teamMemberId: string | null,
  teamMemberName: string | null,
  weekStartDate?: string // Optional: specific week to get actual hours for (defaults to current week)
): Promise<{
  activeInitiatives: InitiativeWithDetails[];
  totalActive: number;
  incompleteCount: number;
  incompleteInitiatives: InitiativeWithDetails[];
  completeCount: number;
  estimatedHours: number; // Planned capacity (weighted formula)
  actualHours: number; // Actual hours logged for the week
  capacityUtilization: number;
  capacityStatus: CapacityStatus;
  dataQualityWarnings: DataQualityWarnings;
}> {
  // Fetch initiatives from database
  let query = supabase.from('initiatives').select('*');

  if (teamMemberName) {
    query = query.eq('owner_name', teamMemberName);
  } else if (teamMemberId) {
    query = query.eq('team_member_id', teamMemberId);
  } else {
    throw new Error('Either teamMemberId or teamMemberName must be provided');
  }

  const { data: allInitiatives, error } = await query;
  if (error) throw error;

  // Filter to active statuses only
  const activeStatuses = ['Active', 'Planning', 'Scaling', 'Not Started', 'In Progress'];
  const activeInitiatives = (allInitiatives || []).filter(i => activeStatuses.includes(i.status || ''));

  // Load calculator config
  const config = await loadCalculatorConfig();

  // Separate complete vs incomplete and calculate capacity
  const completeInitiatives: InitiativeWithDetails[] = [];
  const incompleteInitiatives: InitiativeWithDetails[] = [];
  let estimatedHours = 0;

  const dataQualityWarnings: DataQualityWarnings = {
    missingRole: 0,
    missingSize: 0,
    missingWorkType: 0,
    missingPhase: 0,
    needsBaseline: 0,
  };

  for (const init of activeInitiatives) {
    // Check if has required fields
    const hasRole = init.role && init.role !== 'Unknown';
    const hasEffort = init.work_effort && init.work_effort !== 'Unknown';
    const hasType = init.type && init.type !== 'Unknown';
    const hasPhase = init.phase && init.phase !== 'Unknown';
    const isGovernance = init.type === 'Governance';

    // Count missing data
    if (!hasRole) dataQualityWarnings.missingRole++;
    if (!hasEffort) dataQualityWarnings.missingSize++;
    if (!hasType) dataQualityWarnings.missingWorkType++;
    if (!hasPhase && !isGovernance) dataQualityWarnings.missingPhase++;

    // Check if has all baseline data needed for calculation
    // Governance doesn't require phase
    if (!hasRole || !hasEffort || !hasType || (!hasPhase && !isGovernance)) {
      // Check if missing ALL baseline fields
      if (!hasRole && !hasEffort && !hasType) {
        dataQualityWarnings.needsBaseline++;
      }
      console.log(`[workloadCalculator] SKIPPING ${init.initiative_name}: role=${init.role}, effort=${init.work_effort}, type=${init.type}, phase=${init.phase}`);
      incompleteInitiatives.push(init as InitiativeWithDetails);
      continue;
    }

    // Calculate hours using formula
    const calculated = calculateEstimatedHours(init as InitiativeWithDetails, config);
    console.log(`[workloadCalculator] COUNTING ${init.initiative_name}: ${calculated.hours.toFixed(2)} hrs`);
    estimatedHours += calculated.hours;
    completeInitiatives.push(init as InitiativeWithDetails);
  }

  console.log(`[workloadCalculator] TOTAL for ${teamMemberName}: ${estimatedHours.toFixed(2)} hrs from ${completeInitiatives.length} initiatives (skipped ${incompleteInitiatives.length})`);


  const capacityUtilization = estimatedHours / 40;
  const capacityStatus = determineCapacityStatus(capacityUtilization, config);

  // Fetch actual hours from effort_logs for the specified week
  let actualHours = 0;
  if (teamMemberId) {
    // Determine which week to query (default to current week)
    const targetWeek = weekStartDate || getWeekStartDate();

    const { data: effortLogs, error: effortError } = await supabase
      .from('effort_logs')
      .select('hours_spent')
      .eq('team_member_id', teamMemberId)
      .eq('week_start_date', targetWeek);

    if (effortError) {
      console.error('Error fetching effort logs:', effortError);
    } else {
      actualHours = (effortLogs || []).reduce((sum, log) => sum + (log.hours_spent || 0), 0);
    }
  }

  return {
    activeInitiatives: activeInitiatives as InitiativeWithDetails[],
    totalActive: activeInitiatives.length,
    incompleteCount: incompleteInitiatives.length,
    incompleteInitiatives,
    completeCount: completeInitiatives.length,
    estimatedHours,
    actualHours,
    capacityUtilization,
    capacityStatus,
    dataQualityWarnings,
  };
}

/**
 * Recalculate and update dashboard_metrics for a team member
 * Call this after reassigning initiatives to keep workload data in sync
 *
 * @param teamMemberId - UUID of team member to recalculate
 * @param weekStartDate - Optional week to calculate for (defaults to current week Monday)
 */
export async function recalculateDashboardMetrics(
  teamMemberId: string,
  weekStartDate?: string
): Promise<void> {
  // Get current week Monday if not specified
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Get last Monday
  const monday = new Date(now);
  monday.setDate(monday.getDate() + diff);
  const defaultWeek = monday.toISOString().split('T')[0];

  const week = weekStartDate || defaultWeek;

  try {
    // Load config
    const config = await loadCalculatorConfig();

    // Fetch all initiatives for this team member
    const { data: initiatives, error: initError } = await supabase
      .from('initiatives')
      .select('*')
      .eq('team_member_id', teamMemberId);

    if (initError) throw initError;

    // Filter to active initiatives only
    const activeStatuses = ['Active', 'In Progress', 'Not Started', 'Planning', 'Scaling'];
    const activeInitiatives = (initiatives || []).filter(i => activeStatuses.includes(i.status || ''));

    // Calculate total assignments
    const totalAssignments = initiatives?.length || 0;
    const activeAssignments = activeInitiatives.length;

    // Calculate workload breakdown by work type
    const workTypeData: { [key: string]: { count: number; hours: number } } = {};
    let totalActiveHours = 0;

    for (const initiative of activeInitiatives) {
      const estimated = calculateEstimatedHours(initiative as InitiativeWithDetails, config);
      const hours = estimated.hours;
      const workType = initiative.type || 'Uncategorized';

      if (!workTypeData[workType]) {
        workTypeData[workType] = { count: 0, hours: 0 };
      }

      workTypeData[workType].count++;
      workTypeData[workType].hours += hours;
      totalActiveHours += hours;
    }

    // Calculate capacity metrics
    const capacityUtilization = totalActiveHours / 40;
    const availableHours = 40 - totalActiveHours;

    // Calculate capacity status
    const capacityBreakdown = await calculateMemberCapacity(teamMemberId, week, config);
    const capacityStatusString = formatCapacityStatus(capacityBreakdown);

    // Build dashboard metrics update object
    const metricsUpdate: any = {
      team_member_id: teamMemberId,
      total_assignments: totalAssignments,
      active_assignments: activeAssignments,
      active_hours_per_week: totalActiveHours,
      available_hours: availableHours,
      capacity_utilization: capacityUtilization,
      capacity_status: capacityStatusString,
      // Work type breakdowns
      epic_gold_count: workTypeData['Epic Gold']?.count || 0,
      epic_gold_hours: workTypeData['Epic Gold']?.hours || 0,
      governance_count: workTypeData['Governance']?.count || 0,
      governance_hours: workTypeData['Governance']?.hours || 0,
      system_initiative_count: workTypeData['System Initiative']?.count || 0,
      system_initiative_hours: workTypeData['System Initiative']?.hours || 0,
      system_projects_count: workTypeData['System Project']?.count || 0,
      system_projects_hours: workTypeData['System Project']?.hours || 0,
      epic_upgrades_count: workTypeData['Epic Upgrades']?.count || 0,
      epic_upgrades_hours: workTypeData['Epic Upgrades']?.hours || 0,
      general_support_count: workTypeData['General Support']?.count || 0,
      general_support_hours: workTypeData['General Support']?.hours || 0,
      policy_count: workTypeData['Policy/Guidelines']?.count || 0,
      policy_hours: workTypeData['Policy/Guidelines']?.hours || 0,
      market_count: workTypeData['Market Project']?.count || 0,
      market_hours: workTypeData['Market Project']?.hours || 0,
      ticket_count: workTypeData['Ticket']?.count || 0,
      ticket_hours: workTypeData['Ticket']?.hours || 0,
    };

    // Upsert dashboard_metrics (update if exists, insert if not)
    const { error: upsertError } = await supabase
      .from('dashboard_metrics')
      .upsert(metricsUpdate, { onConflict: 'team_member_id' });

    if (upsertError) {
      console.error('Error updating dashboard_metrics:', upsertError);
      throw upsertError;
    }

    console.log(`✓ Dashboard metrics recalculated for team member ${teamMemberId}`);
  } catch (error) {
    console.error('Error recalculating dashboard metrics:', error);
    throw error;
  }
}
