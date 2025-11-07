import { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TeamMember, InitiativeWithDetails } from '../lib/supabase';
import { getCapacityColor, getCapacityEmoji } from '../lib/workloadUtils';

interface TeamCapacityModalProps {
  teamMember: TeamMember;
  plannedHours: number;
  actualHours: number;
  capacityStatus: string;
  initiatives: InitiativeWithDetails[];
  onClose: () => void;
}

export function TeamCapacityModal({
  teamMember,
  plannedHours,
  actualHours,
  capacityStatus,
  initiatives,
  onClose,
}: TeamCapacityModalProps) {
  const [missingDataExpanded, setMissingDataExpanded] = useState(false);

  // Get display name
  const displayName = teamMember.first_name && teamMember.last_name
    ? `${teamMember.first_name} ${teamMember.last_name}`
    : teamMember.first_name || teamMember.name;

  const variance = actualHours - plannedHours;
  const varianceFormatted = variance >= 0 ? `+${variance.toFixed(1)}h` : `${variance.toFixed(1)}h`;

  // Get color for percentage
  const getCapacityColor = (pct: number): string => {
    if (pct >= 85) return '#dc2626'; // red-600 - over
    if (pct >= 75) return '#f97316'; // orange-500 - at
    if (pct >= 60) return '#f59e0b'; // amber-500 - near
    return '#10b981'; // emerald-500 - under
  };

  // Detect missing data - ONLY check fields needed for CAPACITY CALCULATION
  const incompleteInitiatives = initiatives.filter(i => {
    const hasRole = i.role && i.role !== 'Unknown';
    const hasEffort = i.work_effort && i.work_effort !== 'Unknown';
    const hasType = i.type && i.type !== 'Unknown';
    const hasPhase = i.phase && i.phase !== 'Unknown';
    const isGovernance = i.type === 'Governance';

    // Governance doesn't need phase
    if (isGovernance) {
      return !hasRole || !hasEffort || !hasType;
    } else {
      return !hasRole || !hasEffort || !hasType || !hasPhase;
    }
  });

  const missingDataByType = {
    role: initiatives.filter(i => !i.role || i.role === 'Unknown').length,
    work_effort: initiatives.filter(i => !i.work_effort || i.work_effort === 'Unknown').length,
    type: initiatives.filter(i => !i.type || i.type === 'Unknown').length,
    phase: initiatives.filter(i => (!i.phase || i.phase === 'Unknown') && i.type !== 'Governance').length,
  };

  const hasMissingData = incompleteInitiatives.length > 0;

  // Chart 1: Work Type Distribution (Pie Chart)
  const workTypeData = initiatives.reduce((acc, init) => {
    const type = init.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const workTypePieData = Object.entries(workTypeData).map(([name, value]) => ({
    name,
    value,
  }));

  const WORK_TYPE_COLORS: Record<string, string> = {
    'Project': '#9C5C9D',
    'System Initiative': '#00A1E0',
    'Policy': '#6F47D0',
    'Epic Gold': '#9B2F6A',
    'Governance': '#6F47D0',
    'General Support': '#F58025',
    'Other': '#565658',
  };


  // Chart 2: Work Effort Distribution (Bar Chart)
  const effortData = initiatives.reduce((acc, init) => {
    const effort = init.work_effort || 'Unknown';
    acc[effort] = (acc[effort] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const effortBarData = Object.entries(effortData).map(([effort, count]) => ({
    effort,
    count,
  }));

  // Chart 3: Initiative Phase Distribution (Bar Chart)
  const phaseData = initiatives.reduce((acc, init) => {
    const phase = init.phase || 'Unknown';
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const phaseBarData = Object.entries(phaseData).map(([phase, count]) => ({
    phase,
    count,
  }));

  // Chart 4: Role Breakdown (Donut Chart)
  const roleData = initiatives.reduce((acc, init) => {
    const role = init.role || 'Unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rolePieData = Object.entries(roleData).map(([name, value]) => ({
    name,
    value,
  }));

  const ROLE_COLORS: Record<string, string> = {
    'Owner': '#9B2F6A',
    'Primary': '#00A1E0',
    'Co-Owner': '#6F47D0',
    'Secondary': '#F58025',
    'Support': '#565658',
    'Unknown': '#D1D5DB',
  };

  // Chart 5: Status Health (Stat Cards)
  const statusCounts = initiatives.reduce((acc, init) => {
    const status = init.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Chart 6: Service Line Coverage
  const serviceLineData = initiatives.reduce((acc, init) => {
    const serviceLine = init.service_line || 'Unknown';
    acc[serviceLine] = (acc[serviceLine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceLineBarData = Object.entries(serviceLineData)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 8) // Top 8 service lines
    .map(([serviceLine, count]) => ({
      serviceLine: serviceLine.length > 20 ? serviceLine.substring(0, 20) + '...' : serviceLine,
      count,
    }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{displayName}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-600 mb-1">Planned Capacity:</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-2xl text-gray-900">{plannedHours.toFixed(1)}h</span>
                  <span className="font-bold text-sm" style={{ color: getCapacityColor(Math.round((plannedHours / 40) * 100)) }}>
                    ({Math.round((plannedHours / 40) * 100)}%)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Actual Capacity:</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-2xl text-gray-900">{actualHours.toFixed(1)}h</span>
                  <span className="font-bold text-sm" style={{ color: getCapacityColor(Math.round((actualHours / 40) * 100)) }}>
                    ({Math.round((actualHours / 40) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-gray-600">Variance: </span>
              <span className={`font-semibold ${variance >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {varianceFormatted}
              </span>
            </div>

            {/* Missing Data Alert */}
            {hasMissingData && (
              <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800">
                      {incompleteInitiatives.length} initiative{incompleteInitiatives.length !== 1 ? 's' : ''} missing capacity calculation data
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {missingDataByType.role > 0 && `${missingDataByType.role} missing role`}
                      {missingDataByType.work_effort > 0 && `${missingDataByType.role > 0 ? ', ' : ''}${missingDataByType.work_effort} missing work effort`}
                      {missingDataByType.type > 0 && `${(missingDataByType.role > 0 || missingDataByType.work_effort > 0) ? ', ' : ''}${missingDataByType.type} missing type`}
                      {missingDataByType.phase > 0 && `${(missingDataByType.role > 0 || missingDataByType.work_effort > 0 || missingDataByType.type > 0) ? ', ' : ''}${missingDataByType.phase} missing phase`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Productivity Metrics Grid - 2 rows x 3 columns */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Row 1, Col 1: Work Type Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Work Type Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={workTypePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={(entry) => `${entry.value}`}
                  >
                    {workTypePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={WORK_TYPE_COLORS[entry.name] || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {workTypePieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: WORK_TYPE_COLORS[entry.name] || '#999' }}></div>
                    <span className="text-gray-700">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 1, Col 2: Work Effort Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Work Effort Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={effortBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="effort" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00A1E0" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Row 1, Col 3: Phase Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Phase Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={phaseBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="phase" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#9B2F6A" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Row 2, Col 1: Role Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Role Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={rolePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    label={(entry) => `${entry.value}`}
                  >
                    {rolePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name] || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {rolePieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: ROLE_COLORS[entry.name] || '#999' }}></div>
                    <span className="text-gray-700">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2, Col 2: Status Health */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Status Health</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="bg-white rounded p-2 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-[#9B2F6A]">{count}</div>
                    <div className="text-xs text-gray-600 truncate" title={status}>{status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2, Col 3: Service Line Coverage */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Service Line Coverage (Top 8)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={serviceLineBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="serviceLine" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F58025" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expandable Missing Data Details */}
          {hasMissingData && (
            <div className="border border-yellow-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setMissingDataExpanded(!missingDataExpanded)}
                className="w-full bg-yellow-50 hover:bg-yellow-100 transition-colors p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900">
                    Incomplete Initiatives ({incompleteInitiatives.length})
                  </span>
                </div>
                {missingDataExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {missingDataExpanded && (
                <div className="bg-white p-4 space-y-2 max-h-60 overflow-y-auto">
                  {incompleteInitiatives.map(init => {
                    const missing: string[] = [];
                    if (!init.role || init.role === 'Unknown') missing.push('Role');
                    if (!init.work_effort || init.work_effort === 'Unknown') missing.push('Work Effort');
                    if (!init.type || init.type === 'Unknown') missing.push('Type');
                    if ((!init.phase || init.phase === 'Unknown') && init.type !== 'Governance') missing.push('Phase');

                    return (
                      <div key={init.id} className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-900 text-sm mb-1">{init.initiative_name}</div>
                        <div className="text-xs text-red-600">
                          Missing: {missing.join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
