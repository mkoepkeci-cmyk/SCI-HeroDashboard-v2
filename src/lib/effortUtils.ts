import { EffortSize, EFFORT_SIZES, EffortLog, EffortSummary } from './supabase';

/**
 * Get the Monday of the week for a given date
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Get effort size details by size code
 */
export function getEffortSizeDetails(size: EffortSize) {
  return EFFORT_SIZES.find(e => e.size === size);
}

/**
 * Get effort size from hours
 * Updated to match workload_calculator_config (2025-10-26)
 */
export function getEffortSizeFromHours(hours: number): EffortSize {
  if (hours <= 1) return 'XS';     // 0.5 hrs (less than 1 hr/wk)
  if (hours <= 2.5) return 'S';    // 1.5 hrs (1-2 hrs/wk)
  if (hours <= 5.5) return 'M';    // 3.5 hrs (2-5 hrs/wk)
  if (hours <= 11) return 'L';     // 7.5 hrs (5-10 hrs/wk)
  return 'XL';                     // 15 hrs (more than 10 hrs/wk)
}

/**
 * Calculate capacity status based on total weekly hours
 */
export function getCapacityStatus(totalHours: number): EffortSummary['capacity_status'] {
  if (totalHours >= 50) return 'critical';
  if (totalHours >= 45) return 'over';
  if (totalHours >= 40) return 'near';
  if (totalHours >= 30) return 'normal';
  return 'under';
}

/**
 * Get capacity status color
 */
export function getCapacityColor(status: EffortSummary['capacity_status']): string {
  switch (status) {
    case 'critical': return '#dc2626'; // red-600
    case 'over': return '#f97316'; // orange-500
    case 'near': return '#f59e0b'; // amber-500
    case 'normal': return '#3b82f6'; // blue-500
    case 'under': return '#10b981'; // emerald-500
  }
}

/**
 * Get capacity status emoji
 */
export function getCapacityEmoji(status: EffortSummary['capacity_status']): string {
  switch (status) {
    case 'critical': return '🔴';
    case 'over': return '🟠';
    case 'near': return '🟡';
    case 'normal': return '🟢';
    case 'under': return '🟢';
  }
}

/**
 * Get capacity status label
 */
export function getCapacityLabel(status: EffortSummary['capacity_status']): string {
  switch (status) {
    case 'critical': return 'Critical - Over 50 hrs';
    case 'over': return 'Over Capacity - 45+ hrs';
    case 'near': return 'Near Capacity - 40-44 hrs';
    case 'normal': return 'Normal - 30-39 hrs';
    case 'under': return 'Under Capacity - <30 hrs';
  }
}

/**
 * Format week range for display
 */
export function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', options);
  const endStr = end.toLocaleDateString('en-US', options);

  return `${startStr} - ${endStr}`;
}

/**
 * Get last N weeks as week start dates
 */
export function getLastNWeeks(n: number, fromDate: Date = new Date()): string[] {
  const weeks: string[] = [];
  const current = new Date(fromDate);

  for (let i = 0; i < n; i++) {
    weeks.push(getWeekStartDate(current));
    current.setDate(current.getDate() - 7);
  }

  return weeks.reverse();
}

/**
 * Calculate effort summary from logs
 */
export function calculateEffortSummary(logs: EffortLog[], weekStartDate: string): EffortSummary {
  const weekLogs = logs.filter(log => log.week_start_date === weekStartDate);
  const totalHours = weekLogs.reduce((sum, log) => sum + log.hours_spent, 0);
  const initiativeIds = new Set(weekLogs.map(log => log.initiative_id));

  // Group by work type would require initiative data
  const effortByWorkType: Record<string, number> = {};

  return {
    week_start_date: weekStartDate,
    total_hours: totalHours,
    initiative_count: initiativeIds.size,
    effort_by_work_type: effortByWorkType,
    capacity_status: getCapacityStatus(totalHours),
  };
}

/**
 * Calculate trend between two values
 */
export function calculateTrend(current: number, previous: number): {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage?: number;
} {
  if (!previous || previous === 0) {
    return { trend: 'stable' };
  }

  const change = ((current - previous) / previous) * 100;

  if (change > 20) {
    return { trend: 'increasing', percentage: change };
  } else if (change < -20) {
    return { trend: 'decreasing', percentage: change };
  } else {
    return { trend: 'stable', percentage: change };
  }
}

/**
 * Get trend icon
 */
export function getTrendIcon(trend: 'increasing' | 'decreasing' | 'stable'): string {
  switch (trend) {
    case 'increasing': return '↗';
    case 'decreasing': return '↘';
    case 'stable': return '→';
  }
}

/**
 * Get trend color
 */
export function getTrendColor(trend: 'increasing' | 'decreasing' | 'stable', context: 'effort' | 'impact' = 'effort'): string {
  // For effort tracking, increasing is concerning (more work)
  // For impact metrics, increasing is positive (more results)
  if (context === 'effort') {
    switch (trend) {
      case 'increasing': return '#f59e0b'; // amber
      case 'decreasing': return '#10b981'; // green
      case 'stable': return '#6b7280'; // gray
    }
  } else {
    switch (trend) {
      case 'increasing': return '#10b981'; // green
      case 'decreasing': return '#f59e0b'; // amber
      case 'stable': return '#6b7280'; // gray
    }
  }
}

/**
 * Validate week start date (must be a Monday)
 */
export function isValidWeekStartDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date.getDay() === 1; // Monday
}

/**
 * Get week number in year
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
