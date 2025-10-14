import { useMemo } from 'react';
import { EffortLog } from '../lib/supabase';
import { formatWeekRange, getTrendIcon, getTrendColor } from '../lib/effortUtils';

interface EffortSparklineProps {
  effortLogs: EffortLog[];
  height?: number;
  width?: number;
  showTrend?: boolean;
  showTotal?: boolean;
}

export default function EffortSparkline({
  effortLogs,
  height = 40,
  width = 120,
  showTrend = true,
  showTotal = true,
}: EffortSparklineProps) {
  const data = useMemo(() => {
    // Sort logs by date
    const sorted = [...effortLogs].sort(
      (a, b) => new Date(a.week_start_date).getTime() - new Date(b.week_start_date).getTime()
    );

    if (sorted.length === 0) return null;

    const hours = sorted.map(log => log.hours_spent);
    const maxHours = Math.max(...hours, 20); // Ensure at least 20 as max for scale
    const totalHours = hours.reduce((sum, h) => sum + h, 0);

    // Calculate trend
    const recentHours = sorted.slice(-2).map(log => log.hours_spent);
    const trend: 'increasing' | 'decreasing' | 'stable' =
      recentHours.length === 2
        ? recentHours[1] > recentHours[0] * 1.2
          ? 'increasing'
          : recentHours[1] < recentHours[0] * 0.8
          ? 'decreasing'
          : 'stable'
        : 'stable';

    const trendPercentage =
      recentHours.length === 2 && recentHours[0] > 0
        ? ((recentHours[1] - recentHours[0]) / recentHours[0]) * 100
        : 0;

    return {
      logs: sorted,
      hours,
      maxHours,
      totalHours,
      trend,
      trendPercentage,
      recentHours: recentHours[recentHours.length - 1] || 0,
    };
  }, [effortLogs]);

  if (!data || data.logs.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic">
        No effort logged yet
      </div>
    );
  }

  // Create SVG path for sparkline
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const pointGap = data.hours.length > 1 ? chartWidth / (data.hours.length - 1) : 0;

  const points = data.hours.map((hours, index) => {
    const x = padding + index * pointGap;
    const y = padding + chartHeight - (hours / data.maxHours) * chartHeight;
    return { x, y, hours, log: data.logs[index] };
  });

  const pathD = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x},${point.y}`;
      }
      return `L ${point.x},${point.y}`;
    })
    .join(' ');

  // Create area fill path
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="flex items-center gap-3">
      {/* Sparkline Chart */}
      <div className="relative group">
        <svg
          width={width}
          height={height}
          className="overflow-visible"
          style={{ display: 'block' }}
        >
          {/* Area fill */}
          <path
            d={areaD}
            fill="url(#effort-gradient)"
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={pathD}
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#3b82f6"
                className="hover:r-4 transition-all cursor-pointer"
              />
              {/* Tooltip */}
              <title>
                {formatWeekRange(point.log.week_start_date)}
                {'\n'}
                {point.hours} hours
                {point.log.note ? `\n${point.log.note}` : ''}
              </title>
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="effort-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover card with details */}
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-48">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg">
            <div className="font-semibold mb-1">Last {data.logs.length} weeks</div>
            {data.logs.slice(-3).reverse().map((log) => (
              <div key={log.id} className="flex justify-between py-1 border-t border-gray-700">
                <span className="text-gray-400">{formatWeekRange(log.week_start_date)}</span>
                <span className="font-medium">{log.hours_spent}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1 text-xs">
        {showTotal && (
          <div>
            <span className="text-gray-600">Current: </span>
            <span className="font-semibold text-gray-900">{data.recentHours}h</span>
          </div>
        )}
        {showTrend && data.logs.length > 1 && (
          <div className="flex items-center gap-1">
            <span
              className="font-semibold"
              style={{ color: getTrendColor(data.trend, 'effort') }}
            >
              {getTrendIcon(data.trend)}
            </span>
            <span className="text-gray-600">
              {data.trend === 'increasing' && 'Up'}
              {data.trend === 'decreasing' && 'Down'}
              {data.trend === 'stable' && 'Stable'}
              {Math.abs(data.trendPercentage) > 5 && (
                <span className="ml-1">
                  {Math.abs(Math.round(data.trendPercentage))}%
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
