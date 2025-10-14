import React from 'react';

interface CapacityGaugeProps {
  utilization: number; // 0.0 to 1.0+ (can exceed 1.0 for over capacity)
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercentage?: boolean;
}

export const CapacityGauge: React.FC<CapacityGaugeProps> = ({
  utilization,
  size = 'md',
  showLabel = true,
  showPercentage = true,
}) => {
  // Clamp display percentage to 100% max for visual purposes
  const displayPercentage = Math.min(utilization * 100, 100);
  const actualPercentage = utilization * 100;

  // Determine color based on utilization
  const getColor = () => {
    if (utilization >= 1.0) return '#EF4444'; // red - over capacity
    if (utilization >= 0.8) return '#F59E0B'; // amber - near capacity
    return '#22C55E'; // green - available
  };

  const getBackgroundColor = () => {
    if (utilization >= 1.0) return '#FEE2E2'; // red background
    if (utilization >= 0.8) return '#FEF3C7'; // amber background
    return '#D1FAE5'; // green background
  };

  const getStatusEmoji = () => {
    if (utilization >= 1.0) return '🔴';
    if (utilization >= 0.8) return '🟡';
    return '🟢';
  };

  const getStatusLabel = () => {
    if (utilization >= 1.0) return 'Over Capacity';
    if (utilization >= 0.8) return 'Near Capacity';
    return 'Available';
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      width: 120,
      height: 120,
      strokeWidth: 8,
      fontSize: 'text-lg',
      labelSize: 'text-xs',
    },
    md: {
      width: 160,
      height: 160,
      strokeWidth: 12,
      fontSize: 'text-2xl',
      labelSize: 'text-sm',
    },
    lg: {
      width: 200,
      height: 200,
      strokeWidth: 16,
      fontSize: 'text-3xl',
      labelSize: 'text-base',
    },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={config.width}
          height={config.height}
        >
          {/* Background track */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            fill="none"
            stroke={getBackgroundColor()}
            strokeWidth={config.strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${config.fontSize}`} style={{ color: getColor() }}>
            {actualPercentage.toFixed(0)}%
          </div>
          {showPercentage && (
            <div className={`${config.labelSize} text-gray-600 font-medium mt-1`}>
              capacity
            </div>
          )}
        </div>
      </div>

      {/* Status label */}
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-xl">{getStatusEmoji()}</span>
          <span
            className="text-sm font-semibold"
            style={{ color: getColor() }}
          >
            {getStatusLabel()}
          </span>
        </div>
      )}
    </div>
  );
};

interface HorizontalCapacityBarProps {
  utilization: number;
  label?: string;
  height?: number;
  showPercentage?: boolean;
}

export const HorizontalCapacityBar: React.FC<HorizontalCapacityBarProps> = ({
  utilization,
  label,
  height = 24,
  showPercentage = true,
}) => {
  const displayPercentage = Math.min(utilization * 100, 100);
  const actualPercentage = utilization * 100;

  const getColor = () => {
    if (utilization >= 1.0) return '#EF4444';
    if (utilization >= 0.8) return '#F59E0B';
    return '#22C55E';
  };

  const getBackgroundColor = () => {
    if (utilization >= 1.0) return '#FEE2E2';
    if (utilization >= 0.8) return '#FEF3C7';
    return '#D1FAE5';
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span
              className="text-xs font-bold"
              style={{ color: getColor() }}
            >
              {actualPercentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          backgroundColor: getBackgroundColor(),
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${displayPercentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
    </div>
  );
};

interface TeamCapacityOverviewProps {
  totalActiveHours: number;
  totalCapacity: number;
  overCapacityCount: number;
  nearCapacityCount: number;
  availableCount: number;
}

export const TeamCapacityOverview: React.FC<TeamCapacityOverviewProps> = ({
  totalActiveHours,
  totalCapacity,
  overCapacityCount,
  nearCapacityCount,
  availableCount,
}) => {
  const avgUtilization = totalCapacity > 0 ? totalActiveHours / totalCapacity : 0;

  return (
    <div className="bg-gradient-to-r from-[#F58025] to-[#E07020] rounded-lg p-6 text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Team Capacity Overview</h2>

      <div className="grid grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="text-3xl font-bold">{totalActiveHours.toFixed(1)}</div>
          <div className="text-sm text-white/90 font-medium mt-1">Active hrs/week</div>
        </div>

        {/* Average Utilization */}
        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="text-3xl font-bold">{(avgUtilization * 100).toFixed(1)}%</div>
          <div className="text-sm text-white/90 font-medium mt-1">Avg Utilization</div>
        </div>

        {/* Over Capacity */}
        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            <div className="text-3xl font-bold">{overCapacityCount}</div>
          </div>
          <div className="text-sm text-white/90 font-medium mt-1">Over Capacity</div>
        </div>

        {/* Available */}
        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟢</span>
            <div className="text-3xl font-bold">{availableCount}</div>
          </div>
          <div className="text-sm text-white/90 font-medium mt-1">Available</div>
        </div>
      </div>

      {/* Team capacity bar */}
      <div className="mt-4">
        <HorizontalCapacityBar
          utilization={avgUtilization}
          label="Team Capacity"
          height={32}
        />
      </div>
    </div>
  );
};
