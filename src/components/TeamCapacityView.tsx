import { useState, useEffect } from 'react';
import { TeamMemberWithDetails, Manager } from '../lib/supabase';
import { TeamCapacityCard } from './TeamCapacityCard';
import { TeamCapacityModal } from './TeamCapacityModal';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamCapacityViewProps {
  teamMembers: TeamMemberWithDetails[];
  managers: Manager[];
}

interface TeamMemberCapacity {
  member: TeamMemberWithDetails;
  plannedHours: number;
  actualHours: number;
  plannedPct: number;
  variance: number;
}

export default function TeamCapacityView({ teamMembers, managers }: TeamCapacityViewProps) {
  const [selectedManagerFilter, setSelectedManagerFilter] = useState<string | null>(null);
  const [capacityData, setCapacityData] = useState<TeamMemberCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithDetails | null>(null);
  const [showTeamAnalytics, setShowTeamAnalytics] = useState(false);
  const [configWeights, setConfigWeights] = useState<{
    effortSizes: Record<string, number>;
    roleWeights: Record<string, number>;
    typeWeights: Record<string, number>;
    phaseWeights: Record<string, number>;
  }>({
    effortSizes: {},
    roleWeights: {},
    typeWeights: {},
    phaseWeights: {},
  });

  // Load calculator config weights
  useEffect(() => {
    loadConfigWeights();
  }, []);

  const loadConfigWeights = async () => {
    try {
      const { data: config, error } = await supabase
        .from('workload_calculator_config')
        .select('*');

      if (error) throw error;

      const sizes: Record<string, number> = {};
      const roles: Record<string, number> = {};
      const types: Record<string, number> = {};
      const phases: Record<string, number> = {};

      (config || []).forEach(c => {
        const value = parseFloat(c.value);
        if (c.config_type === 'effort_size') sizes[c.key] = value;
        if (c.config_type === 'role_weight') roles[c.key] = value;
        if (c.config_type === 'work_type_weight') types[c.key] = value;
        if (c.config_type === 'phase_weight') phases[c.key] = value;
      });

      setConfigWeights({
        effortSizes: sizes,
        roleWeights: roles,
        typeWeights: types,
        phaseWeights: phases,
      });
    } catch (err) {
      console.error('Error loading workload calculator config:', err);
    }
  };

  // Calculate capacity for all team members
  useEffect(() => {
    if (teamMembers.length > 0 && Object.keys(configWeights.effortSizes).length > 0) {
      calculateAllCapacity();
    }
  }, [teamMembers, configWeights]);

  const calculateAllCapacity = async () => {
    setLoading(true);

    const capacities = await Promise.all(
      teamMembers.map(async (member) => {
        // Calculate planned hours
        const activeStatuses = ['Active', 'Planning', 'Scaling', 'Not Started', 'In Progress'];
        const activeInitiatives = (member.initiatives || []).filter(i =>
          activeStatuses.includes(i.status || '')
        );

        let plannedHours = 0;
        activeInitiatives.forEach(init => {
          const hasRole = init.role && init.role !== 'Unknown';
          const hasEffort = init.work_effort && init.work_effort !== 'Unknown';
          const hasType = init.type && init.type !== 'Unknown';
          const hasPhase = init.phase && init.phase !== 'Unknown';
          const isGovernance = init.type === 'Governance';

          // Skip if missing required data
          if (!hasRole || !hasEffort || !hasType || (!hasPhase && !isGovernance)) {
            return;
          }

          const baseHours = configWeights.effortSizes[init.work_effort] || 0;
          const roleWeight = configWeights.roleWeights[init.role] || 1;
          const typeWeight = configWeights.typeWeights[init.type] || 1;
          const phaseWeight = configWeights.phaseWeights[init.phase || 'N/A'] || 1;

          plannedHours += baseHours * roleWeight * typeWeight * phaseWeight;
        });

        // Get actual hours - ONLY for active initiatives (same as BulkEffortEntry)
        let actualHours = 0;
        try {
          const activeInitiativeIds = activeInitiatives.map(i => i.id);

          if (activeInitiativeIds.length > 0) {
            const { data: recentLogs, error } = await supabase
              .from('effort_logs')
              .select('initiative_id, hours_spent, updated_at')
              .eq('team_member_id', member.id)
              .in('initiative_id', activeInitiativeIds)
              .order('updated_at', { ascending: false});

            if (!error && recentLogs) {
              // Get most recent hours per initiative
              const latestHours = new Map<string, number>();
              recentLogs.forEach(log => {
                if (!latestHours.has(log.initiative_id)) {
                  latestHours.set(log.initiative_id, log.hours_spent || 0);
                }
              });

              actualHours = Array.from(latestHours.values()).reduce((sum, hours) => sum + hours, 0);
            }
          }
        } catch (err) {
          console.error(`Error loading actual hours for ${member.name}:`, err);
        }

        const plannedPct = Math.round((plannedHours / 40) * 100);
        const variance = actualHours - plannedHours;

        return {
          member,
          plannedHours,
          actualHours,
          plannedPct,
          variance,
        };
      })
    );

    setCapacityData(capacities);
    setLoading(false);
  };

  // Get capacity status based on planned %
  const getCapacityStatus = (plannedPct: number): string => {
    if (plannedPct >= 85) return 'over';
    if (plannedPct >= 75) return 'at';
    if (plannedPct >= 60) return 'near';
    return 'under';
  };

  const filteredCapacityData = capacityData.filter(
    c => !selectedManagerFilter || c.member.manager_id === selectedManagerFilter
  );

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <div className="text-gray-500">Loading team capacity data...</div>
      </div>
    );
  }

  return (
    <>
      {/* Manager Filter Buttons */}
      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700 mr-2">Filter by Manager:</span>
          <button
            onClick={() => setSelectedManagerFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedManagerFilter === null
                ? 'bg-[#9B2F6A] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Teams ({teamMembers.length})
          </button>
          {managers.map(manager => (
            <button
              key={manager.id}
              onClick={() => setSelectedManagerFilter(manager.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedManagerFilter === manager.id
                  ? 'bg-[#9B2F6A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {manager.first_name} {manager.last_name} ({capacityData.filter(c => c.member.manager_id === manager.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Capacity Cards Grid */}
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {filteredCapacityData.map(capacity => {
          // Filter to ONLY active initiatives for the count
          const activeStatuses = ['Active', 'Planning', 'Scaling', 'Not Started', 'In Progress'];
          const activeInitiatives = (capacity.member.initiatives || []).filter(i =>
            activeStatuses.includes(i.status || '')
          );

          return (
            <TeamCapacityCard
              key={capacity.member.id}
              teamMember={capacity.member}
              plannedHours={capacity.plannedHours}
              actualHours={capacity.actualHours}
              capacityStatus={getCapacityStatus(capacity.plannedPct)}
              initiativeCount={activeInitiatives.length}
              onClick={() => setSelectedMember(capacity.member)}
            />
          );
        })}
      </div>

      {/* Team Productivity Dashboard */}
      {(() => {
        const activeStatuses = ['Active', 'In Progress', 'Not Started', 'Planning', 'Scaling'];
        const allInitiatives = filteredCapacityData.flatMap(c =>
          (c.member.initiatives || []).filter(i => activeStatuses.includes(i.status || ''))
        );

        // For Status Health, include ALL initiatives (even Completed, On Hold, Deleted) for visibility
        const allInitiativesIncludingCompleted = filteredCapacityData.flatMap(c =>
          (c.member.initiatives || []).filter(i => i.status !== 'Deleted') // Exclude only Deleted
        );

        // Calculate metrics from aggregated initiatives
        const workTypeData = allInitiatives.reduce((acc, init) => {
          const type = init.type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const workTypePieData = Object.entries(workTypeData).map(([name, value]) => ({
          name,
          value,
        }));

        const effortData = allInitiatives.reduce((acc, init) => {
          const effort = init.work_effort || 'Unknown';
          acc[effort] = (acc[effort] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const effortBarData = Object.entries(effortData).map(([effort, count]) => ({
          effort,
          count,
        }));

        const phaseData = allInitiatives.reduce((acc, init) => {
          const phase = init.phase || 'Unknown';
          acc[phase] = (acc[phase] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const phaseBarData = Object.entries(phaseData).map(([phase, count]) => ({
          phase,
          count,
        }));

        const roleData = allInitiatives.reduce((acc, init) => {
          const role = init.role || 'Unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const rolePieData = Object.entries(roleData).map(([name, value]) => ({
          name,
          value,
        }));

        // Status counts include ALL statuses for visibility (not just active)
        const statusCounts = allInitiativesIncludingCompleted.reduce((acc, init) => {
          const status = init.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const serviceLineData = allInitiatives.reduce((acc, init) => {
          const serviceLine = init.service_line || 'Unknown';
          acc[serviceLine] = (acc[serviceLine] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const serviceLineBarData = Object.entries(serviceLineData)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([serviceLine, count]) => ({
            serviceLine: serviceLine.length > 20 ? serviceLine.substring(0, 20) + '...' : serviceLine,
            count,
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

        const ROLE_COLORS: Record<string, string> = {
          'Owner': '#9B2F6A',
          'Primary': '#00A1E0',
          'Co-Owner': '#6F47D0',
          'Secondary': '#F58025',
          'Support': '#565658',
          'Unknown': '#D1D5DB',
        };

        // Calculate total team capacity
        const totalPlannedHours = filteredCapacityData.reduce((sum, c) => sum + c.plannedHours, 0);
        const totalActualHours = filteredCapacityData.reduce((sum, c) => sum + c.actualHours, 0);
        const totalVariance = totalActualHours - totalPlannedHours;
        const teamCount = filteredCapacityData.length;
        const totalAvailableHours = teamCount * 40;
        const plannedPct = (totalPlannedHours / totalAvailableHours) * 100;
        const actualPct = (totalActualHours / totalAvailableHours) * 100;

        return (
          <div className="bg-white border rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Productivity Analytics</h3>

            {/* Team Capacity Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Team Capacity Summary ({teamCount} SCIs)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Planned Capacity</div>
                  <div className="text-2xl font-bold text-[#9B2F6A]">{totalPlannedHours.toFixed(1)}h</div>
                  <div className="text-sm font-semibold text-purple-600">({plannedPct.toFixed(0)}% of {totalAvailableHours}h)</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Actual Capacity</div>
                  <div className="text-2xl font-bold text-[#00A1E0]">{totalActualHours.toFixed(1)}h</div>
                  <div className="text-sm font-semibold text-blue-600">({actualPct.toFixed(0)}% of {totalAvailableHours}h)</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Variance</div>
                  <div className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalVariance >= 0 ? '+' : ''}{totalVariance.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-700">
                    {totalVariance >= 0 ? 'Over' : 'Under'} Capacity
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Work Type Distribution */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Work Type Distribution</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={workTypePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
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
                <div className="flex flex-wrap gap-1 mt-1 text-xs">
                  {workTypePieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: WORK_TYPE_COLORS[entry.name] || '#999' }}></div>
                      <span className="text-gray-700 text-xs">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Effort Distribution */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Work Effort Distribution</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={effortBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="effort" type="category" tick={{ fontSize: 9 }} width={40} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00A1E0" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Phase Distribution */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Phase Distribution</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={phaseBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="phase" type="category" tick={{ fontSize: 8 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9B2F6A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Role Breakdown */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Role Breakdown</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={rolePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
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
                <div className="flex flex-wrap gap-1 mt-1 text-xs">
                  {rolePieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: ROLE_COLORS[entry.name] || '#999' }}></div>
                      <span className="text-gray-700 text-xs">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Health */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Status Health</h4>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="bg-white rounded p-1 text-center border border-gray-200">
                      <div className="text-lg font-bold text-[#9B2F6A]">{count}</div>
                      <div className="text-xs text-gray-600 truncate" title={status}>{status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Line Coverage */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Service Line Coverage (Top 8)</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={serviceLineBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="serviceLine" type="category" tick={{ fontSize: 7 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F58025" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Team Metrics Section */}
      {(() => {
        const totalInitiatives = filteredCapacityData.reduce((sum, c) =>
          sum + (c.member.initiatives || []).filter(i => i.status !== 'Deleted').length, 0
        );

        const totalRevenue = filteredCapacityData.reduce((sum, c) =>
          sum + (c.member.initiatives || [])
            .filter(i => i.status !== 'Deleted')
            .reduce((rev, i) => rev + (i.financial_impact?.projected_annual || 0), 0), 0
        );

        const avgCapacity = filteredCapacityData.length > 0
          ? filteredCapacityData.reduce((sum, c) => sum + c.plannedPct, 0) / filteredCapacityData.length
          : 0;

        return (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{totalInitiatives}</div>
                <div className="text-sm text-gray-700 mt-1">Total Initiatives</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  ${(totalRevenue / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-700 mt-1">Revenue Impact</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {avgCapacity.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-700 mt-1">Avg Capacity</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Capacity Modal */}
      {selectedMember && (() => {
        const capacity = capacityData.find(c => c.member.id === selectedMember.id);
        if (!capacity) return null;

        // Filter to ONLY active initiatives (not Completed, Deleted, On Hold)
        const activeStatuses = ['Active', 'In Progress', 'Not Started', 'Planning', 'Scaling'];
        const activeInitiatives = (selectedMember.initiatives || []).filter(i =>
          activeStatuses.includes(i.status || '')
        );

        return (
          <TeamCapacityModal
            teamMember={selectedMember}
            plannedHours={capacity.plannedHours}
            actualHours={capacity.actualHours}
            capacityStatus={getCapacityStatus(capacity.plannedPct)}
            initiatives={activeInitiatives}
            onClose={() => setSelectedMember(null)}
          />
        );
      })()}

      {/* Team Analytics Modal */}
      {showTeamAnalytics && (() => {
        // Aggregate all initiatives from filtered team members
        const activeStatuses = ['Active', 'In Progress', 'Not Started', 'Planning', 'Scaling'];
        const allInitiatives = filteredCapacityData.flatMap(c =>
          (c.member.initiatives || []).filter(i => activeStatuses.includes(i.status || ''))
        );

        // Calculate total planned and actual hours
        const totalPlannedHours = filteredCapacityData.reduce((sum, c) => sum + c.plannedHours, 0);
        const totalActualHours = filteredCapacityData.reduce((sum, c) => sum + c.actualHours, 0);

        // Create a virtual team member object
        const teamAggregate = {
          id: 'team-aggregate',
          name: selectedManagerFilter
            ? managers.find(m => m.id === selectedManagerFilter)?.first_name + ' ' + managers.find(m => m.id === selectedManagerFilter)?.last_name + "'s Team"
            : 'All Teams',
          first_name: selectedManagerFilter
            ? managers.find(m => m.id === selectedManagerFilter)?.first_name
            : 'All',
          last_name: selectedManagerFilter
            ? managers.find(m => m.id === selectedManagerFilter)?.last_name + "'s Team"
            : 'Teams',
          initiatives: allInitiatives,
        } as TeamMemberWithDetails;

        return (
          <TeamCapacityModal
            teamMember={teamAggregate}
            plannedHours={totalPlannedHours}
            actualHours={totalActualHours}
            capacityStatus={getCapacityStatus(Math.round((totalPlannedHours / (filteredCapacityData.length * 40)) * 100))}
            initiatives={allInitiatives}
            onClose={() => setShowTeamAnalytics(false)}
          />
        );
      })()}
    </>
  );
}
