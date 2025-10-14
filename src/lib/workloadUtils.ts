// Workload calculation utilities

export type WorkEffort = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface WorkEffortHours {
  min: number;
  max: number;
  label: string;
}

// Define hour ranges for each work effort level
export const WORK_EFFORT_HOURS: Record<WorkEffort, WorkEffortHours> = {
  'XS': { min: 0.5, max: 1, label: 'Less than 1 hr/wk' },
  'S': { min: 1, max: 2, label: '1-2 hrs/wk' },
  'M': { min: 2, max: 5, label: '2-5 hrs/wk' },
  'L': { min: 5, max: 10, label: '5-10 hrs/wk' },
  'XL': { min: 10, max: 20, label: 'More than 10 hrs/wk' }
};

// Parse work effort from various formats in CSV
export const parseWorkEffort = (effortStr?: string): WorkEffort | null => {
  if (!effortStr) return null;

  const normalized = effortStr.trim().toUpperCase();

  if (normalized.includes('XL') || normalized.includes('MORE THAN 10')) return 'XL';
  if (normalized.includes('L -') || normalized.includes('5-10')) return 'L';
  if (normalized.includes('M -') || normalized.includes('2-5')) return 'M';
  if (normalized.includes('S -') || normalized.includes('1-2')) return 'S';
  if (normalized.includes('XS') || normalized.includes('LESS THAN 1')) return 'XS';

  return null;
};

// Calculate estimated hours for a work effort level
export const getEstimatedHours = (effort: WorkEffort): WorkEffortHours => {
  return WORK_EFFORT_HOURS[effort];
};

// Calculate total workload for assignments
export interface WorkloadBreakdown {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  totalMin: number;
  totalMax: number;
  totalAssignments: number;
}

export const calculateWorkload = (assignments: Array<{ work_effort?: string }>): WorkloadBreakdown => {
  const breakdown: WorkloadBreakdown = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    totalMin: 0,
    totalMax: 0,
    totalAssignments: assignments.length
  };

  assignments.forEach(assignment => {
    const effort = parseWorkEffort(assignment.work_effort);
    if (effort) {
      breakdown[effort]++;
      const hours = getEstimatedHours(effort);
      breakdown.totalMin += hours.min;
      breakdown.totalMax += hours.max;
    }
  });

  return breakdown;
};

// Determine capacity status based on workload
export type CapacityStatus = 'available' | 'at_capacity' | 'over_capacity';

export const getCapacityStatus = (hoursMax: number): CapacityStatus => {
  if (hoursMax < 30) return 'available';
  if (hoursMax <= 40) return 'at_capacity';
  return 'over_capacity';
};

export const getCapacityColor = (status: CapacityStatus): string => {
  switch (status) {
    case 'available': return '#22C55E'; // green
    case 'at_capacity': return '#F59E0B'; // amber
    case 'over_capacity': return '#EF4444'; // red
  }
};

export const getCapacityEmoji = (status: CapacityStatus): string => {
  switch (status) {
    case 'available': return '🟢';
    case 'at_capacity': return '🟡';
    case 'over_capacity': return '🔴';
  }
};

export const getCapacityLabel = (status: CapacityStatus): string => {
  switch (status) {
    case 'available': return 'Available';
    case 'at_capacity': return 'At Capacity';
    case 'over_capacity': return 'Over Capacity';
  }
};
