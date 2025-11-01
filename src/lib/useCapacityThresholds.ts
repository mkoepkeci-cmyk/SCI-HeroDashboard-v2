import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface CapacityThreshold {
  id: string;
  label: string;
  min_percentage: number;
  max_percentage: number;
  color: string;
  color_name: string | null;
  emoji: string | null;
  display_order: number;
  is_active: boolean;
}

export interface CapacityThresholdMatch {
  label: string;
  color: string;
  emoji: string | null;
  min: number;
  max: number;
}

// =============================================================================
// CACHE
// =============================================================================

let cachedThresholds: CapacityThreshold[] | null = null;
let cacheLoadedAt: number = 0;
const CACHE_TTL = 60000; // 1 minute (matching calculator config pattern)

// =============================================================================
// LOAD THRESHOLDS FROM DATABASE
// =============================================================================

export async function loadCapacityThresholds(): Promise<CapacityThreshold[]> {
  // Return cached if valid
  const now = Date.now();
  if (cachedThresholds && (now - cacheLoadedAt) < CACHE_TTL) {
    return cachedThresholds;
  }

  try {
    const { data, error } = await supabase
      .from('capacity_thresholds')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    cachedThresholds = data || [];
    cacheLoadedAt = now;
    return cachedThresholds;
  } catch (error) {
    console.error('Error loading capacity thresholds:', error);
    // Fallback to default thresholds if database fails
    return getDefaultThresholds();
  }
}

// =============================================================================
// CLEAR CACHE
// =============================================================================

export function clearCapacityThresholdsCache(): void {
  cachedThresholds = null;
  cacheLoadedAt = 0;
}

// =============================================================================
// GET THRESHOLD FOR PERCENTAGE
// =============================================================================

export function getThresholdForPercentage(
  percentage: number,
  thresholds: CapacityThreshold[]
): CapacityThresholdMatch {
  // Find matching threshold
  for (const threshold of thresholds) {
    if (percentage >= threshold.min_percentage && percentage < threshold.max_percentage) {
      return {
        label: threshold.label,
        color: threshold.color,
        emoji: threshold.emoji,
        min: threshold.min_percentage,
        max: threshold.max_percentage,
      };
    }
  }

  // Fallback: if percentage exceeds all ranges, use the last threshold
  const lastThreshold = thresholds[thresholds.length - 1];
  if (lastThreshold) {
    return {
      label: lastThreshold.label,
      color: lastThreshold.color,
      emoji: lastThreshold.emoji,
      min: lastThreshold.min_percentage,
      max: lastThreshold.max_percentage,
    };
  }

  // Ultimate fallback (should never happen)
  return {
    label: 'Unknown',
    color: '#6b7280', // gray
    emoji: '⚪',
    min: 0,
    max: 100,
  };
}

// =============================================================================
// GET COLOR FOR PERCENTAGE (simple helper)
// =============================================================================

export function getCapacityColor(
  percentage: number,
  thresholds: CapacityThreshold[]
): string {
  const match = getThresholdForPercentage(percentage, thresholds);
  return match.color;
}

// =============================================================================
// DEFAULT THRESHOLDS (fallback if database unavailable)
// =============================================================================

function getDefaultThresholds(): CapacityThreshold[] {
  return [
    {
      id: 'default-1',
      label: 'Well Under Capacity',
      min_percentage: 0,
      max_percentage: 45,
      color: '#22c55e',
      color_name: 'Green',
      emoji: '🟢',
      display_order: 1,
      is_active: true,
    },
    {
      id: 'default-2',
      label: 'Under Capacity',
      min_percentage: 45,
      max_percentage: 60,
      color: '#84cc16',
      color_name: 'Lime Green',
      emoji: '🟢',
      display_order: 2,
      is_active: true,
    },
    {
      id: 'default-3',
      label: 'Approaching Capacity',
      min_percentage: 60,
      max_percentage: 75,
      color: '#eab308',
      color_name: 'Yellow',
      emoji: '🟡',
      display_order: 3,
      is_active: true,
    },
    {
      id: 'default-4',
      label: 'Near Capacity',
      min_percentage: 75,
      max_percentage: 85,
      color: '#f59e0b',
      color_name: 'Yellow-Orange',
      emoji: '🟠',
      display_order: 4,
      is_active: true,
    },
    {
      id: 'default-5',
      label: 'At Capacity',
      min_percentage: 85,
      max_percentage: 95,
      color: '#f97316',
      color_name: 'Orange',
      emoji: '🟠',
      display_order: 5,
      is_active: true,
    },
    {
      id: 'default-6',
      label: 'Over Capacity',
      min_percentage: 95,
      max_percentage: 105,
      color: '#fb923c',
      color_name: 'Red-Orange',
      emoji: '🔴',
      display_order: 6,
      is_active: true,
    },
    {
      id: 'default-7',
      label: 'Severely Over Capacity',
      min_percentage: 105,
      max_percentage: 200,
      color: '#dc2626',
      color_name: 'Red',
      emoji: '🔴',
      display_order: 7,
      is_active: true,
    },
  ];
}

// =============================================================================
// REACT HOOK
// =============================================================================

export function useCapacityThresholds() {
  const [thresholds, setThresholds] = useState<CapacityThreshold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadCapacityThresholds().then((data) => {
      if (mounted) {
        setThresholds(data);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const getColorForPct = (pct: number): string => {
    return getCapacityColor(pct, thresholds);
  };

  const getThresholdForPct = (pct: number): CapacityThresholdMatch => {
    return getThresholdForPercentage(pct, thresholds);
  };

  return {
    thresholds,
    loading,
    getColorForPct,
    getThresholdForPct,
  };
}
