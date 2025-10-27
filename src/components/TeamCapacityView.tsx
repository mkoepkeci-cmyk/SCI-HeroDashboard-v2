import { useState, useEffect } from 'react';
import { TeamMemberWithDetails, Manager } from '../lib/supabase';
import { TeamCapacityCard } from './TeamCapacityCard';
import { TeamCapacityModal } from './TeamCapacityModal';
import { supabase } from '../lib/supabase';

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
    </>
  );
}
