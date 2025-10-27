import { TeamMember } from '../lib/supabase';
import { getCapacityColor, getCapacityEmoji } from '../lib/workloadUtils';

interface TeamCapacityCardProps {
  teamMember: TeamMember;
  plannedHours: number;
  actualHours: number;
  capacityStatus: string;
  initiativeCount: number;
  onClick: () => void;
}

export function TeamCapacityCard({
  teamMember,
  plannedHours,
  actualHours,
  capacityStatus,
  initiativeCount,
  onClick,
}: TeamCapacityCardProps) {
  const variance = actualHours - plannedHours;
  const varianceFormatted = variance >= 0 ? `+${variance.toFixed(1)}h` : `${variance.toFixed(1)}h`;
  const varianceColor = variance > 0 ? 'text-red-600' : variance < 0 ? 'text-blue-600' : 'text-gray-600';

  // Get display name
  const displayName = teamMember.first_name && teamMember.last_name
    ? `${teamMember.first_name} ${teamMember.last_name}`
    : teamMember.first_name || teamMember.name;

  // Get initials for avatar
  const initials = teamMember.first_name && teamMember.last_name
    ? `${teamMember.first_name.charAt(0)}${teamMember.last_name.charAt(0)}`
    : displayName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);

  // Calculate capacity percentages
  const baseHours = 40; // Standard work week
  const plannedPct = Math.round((plannedHours / baseHours) * 100);
  const actualPct = Math.round((actualHours / baseHours) * 100);

  // Get capacity color based on planned percentage
  const getColorForPct = (pct: number): string => {
    if (pct >= 85) return '#dc2626'; // red-600 - over
    if (pct >= 75) return '#f97316'; // orange-500 - at
    if (pct >= 60) return '#f59e0b'; // amber-500 - near
    return '#10b981'; // emerald-500 - under
  };

  const plannedColor = getColorForPct(plannedPct);
  const actualColor = getColorForPct(actualPct);

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 rounded-lg p-3 hover:shadow-lg transition-all cursor-pointer hover:border-[#9B2F6A] w-[200px] relative"
      style={{ minWidth: '200px', maxWidth: '200px' }}
    >
      {/* Initiative Count Badge */}
      <div className="absolute top-2 right-2 bg-[#9B2F6A] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        {initiativeCount}
      </div>

      {/* Header with Avatar and Name */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm bg-[#9B2F6A]"
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-bold text-sm truncate text-gray-900">{displayName}</h3>
        </div>
      </div>

      {/* Capacity Metrics - More Compact */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Planned:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-gray-900">{plannedHours.toFixed(1)}h</span>
            <span className="font-bold text-sm" style={{ color: plannedColor }}>({plannedPct}%)</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Actual:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-gray-900">{actualHours.toFixed(1)}h</span>
            <span className="font-bold text-sm" style={{ color: actualColor }}>({actualPct}%)</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Variance:</span>
          <span className={`font-semibold ${varianceColor}`}>{varianceFormatted}</span>
        </div>
      </div>
    </div>
  );
}
