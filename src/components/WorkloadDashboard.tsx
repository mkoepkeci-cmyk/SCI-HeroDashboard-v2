import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface TeamMemberWorkload {
  id: string;
  name: string;
  totalAssignments: number;
  activeAssignments: number;
  activeHoursPerWeek: number;
  availableHours: number;
  capacityUtilization: number;
  capacityStatus: string;
  workTypeBreakdown: {
    epicGold: { count: number; hours: number };
    governance: { count: number; hours: number };
    sysInit: { count: number; hours: number };
    sysProj: { count: number; hours: number };
    genSupport: { count: number; hours: number };
    policy: { count: number; hours: number };
  };
  dataQuality: {
    hasWorkEffort: number;
    missingWorkEffort: number;
    completionRate: number;
  };
}

interface WorkloadDashboardProps {
  teamMembers: TeamMemberWorkload[];
}

export const WorkloadDashboard: React.FC<WorkloadDashboardProps> = ({ teamMembers }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMemberWorkload | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'utilization' | 'dataQuality'>('utilization');
  const [showDataQuality, setShowDataQuality] = useState(true);

  // Sort team members
  const sortedMembers = [...teamMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'hours':
        return b.activeHoursPerWeek - a.activeHoursPerWeek;
      case 'utilization':
        return b.capacityUtilization - a.capacityUtilization;
      case 'dataQuality':
        return b.dataQuality.completionRate - a.dataQuality.completionRate;
      default:
        return 0;
    }
  });

  // Calculate team stats
  const totalActiveHours = teamMembers.reduce((sum, m) => sum + m.activeHoursPerWeek, 0);
  const avgUtilization = teamMembers.reduce((sum, m) => sum + m.capacityUtilization, 0) / teamMembers.length;
  const overCapacity = teamMembers.filter(m => m.capacityUtilization >= 1.0).length;
  const nearCapacity = teamMembers.filter(m => m.capacityUtilization >= 0.8 && m.capacityUtilization < 1.0).length;
  const available = teamMembers.filter(m => m.capacityUtilization < 0.8).length;
  const avgDataQuality = teamMembers.reduce((sum, m) => sum + m.dataQuality.completionRate, 0) / teamMembers.length;

  const getCapacityColor = (utilization: number) => {
    if (utilization >= 1.0) return '#EF4444';
    if (utilization >= 0.8) return '#F59E0B';
    return '#22C55E';
  };

  const getDataQualityColor = (rate: number) => {
    if (rate >= 0.8) return '#22C55E';
    if (rate >= 0.5) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-[#F58025] to-[#E07020] rounded-lg p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Team Workload Analysis</h2>
            <p className="text-sm text-white/90">{teamMembers.length} SCIs • {totalActiveHours.toFixed(1)}h/week active</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{(avgUtilization * 100).toFixed(0)}%</div>
              <div className="text-xs text-white/90">Avg Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overCapacity + nearCapacity}</div>
              <div className="text-xs text-white/90">At/Over</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(avgDataQuality * 100).toFixed(0)}%</div>
              <div className="text-xs text-white/90">Data Quality</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="utilization">Capacity %</option>
            <option value="hours">Hours/Week</option>
            <option value="dataQuality">Data Quality</option>
            <option value="name">Name</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDataQuality}
            onChange={(e) => setShowDataQuality(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-700">Show Data Quality</span>
        </label>
      </div>

      {/* Compact Team Grid */}
      <div className="grid grid-cols-4 gap-2">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-white border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer"
            style={{
              borderLeft: `4px solid ${getCapacityColor(member.capacityUtilization)}`
            }}
          >
            {/* Name & Avatar */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: getCapacityColor(member.capacityUtilization) }}
              >
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs truncate">{member.name}</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Capacity</span>
                <span
                  className="font-bold"
                  style={{ color: getCapacityColor(member.capacityUtilization) }}
                >
                  {(member.capacityUtilization * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Hours/Wk</span>
                <span className="font-semibold">{member.activeHoursPerWeek.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold">{member.activeAssignments}</span>
              </div>
              {showDataQuality && (
                <div className="flex justify-between text-xs pt-1 border-t">
                  <span className="text-gray-600">Data Quality</span>
                  <span
                    className="font-bold"
                    style={{ color: getDataQualityColor(member.dataQuality.completionRate) }}
                  >
                    {(member.dataQuality.completionRate * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* Capacity Bar */}
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(member.capacityUtilization * 100, 100)}%`,
                  backgroundColor: getCapacityColor(member.capacityUtilization)
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Member Detail */}
      {selectedMember && (
        <div className="bg-white border-2 border-[#F58025] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">{selectedMember.name}'s Workload Detail</h3>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Left: Metrics */}
            <div className="space-y-2">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600">Total Assignments</div>
                <div className="text-xl font-bold">{selectedMember.totalAssignments}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600">Active Assignments</div>
                <div className="text-xl font-bold">{selectedMember.activeAssignments}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600">Hours/Week</div>
                <div className="text-xl font-bold">{selectedMember.activeHoursPerWeek.toFixed(1)}h</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600">Capacity</div>
                <div
                  className="text-xl font-bold"
                  style={{ color: getCapacityColor(selectedMember.capacityUtilization) }}
                >
                  {(selectedMember.capacityUtilization * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Middle: Work Type Breakdown */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Work Type Breakdown</h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(selectedMember.workTypeBreakdown).map(([type, data]) => {
                  if (data.count === 0 && data.hours === 0) return null;
                  const typeLabels: Record<string, string> = {
                    epicGold: 'Epic Gold',
                    governance: 'Governance',
                    sysInit: 'System Initiative',
                    sysProj: 'System Project',
                    genSupport: 'General Support',
                    policy: 'Policy'
                  };
                  return (
                    <div key={type} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <span className="font-medium">{typeLabels[type]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{data.count} items</span>
                        <span className="font-bold text-[#F58025]">{data.hours.toFixed(1)}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Data Quality */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Data Quality</h4>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Completion Rate</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getDataQualityColor(selectedMember.dataQuality.completionRate) }}
                  >
                    {(selectedMember.dataQuality.completionRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Has Work Effort</span>
                    <span className="font-semibold text-green-600">{selectedMember.dataQuality.hasWorkEffort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Missing Data</span>
                    <span className="font-semibold text-red-600">{selectedMember.dataQuality.missingWorkEffort}</span>
                  </div>
                </div>
                {selectedMember.dataQuality.missingWorkEffort > 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ {selectedMember.dataQuality.missingWorkEffort} assignment{selectedMember.dataQuality.missingWorkEffort !== 1 ? 's' : ''} missing work effort estimates
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
