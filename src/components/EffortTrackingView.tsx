import { useState, useEffect } from 'react';
import { Clock, Save, Copy, UserPlus, User } from 'lucide-react';
import { supabase, InitiativeWithDetails, EffortLog, EFFORT_SIZES, EffortSize, TeamMember } from '../lib/supabase';
import { getWeekStartDate, formatWeekRange, getEffortSizeFromHours } from '../lib/effortUtils';
import { SystemInitiativesTable } from './SystemInitiativesTable';
import { OtherWorkTable } from './OtherWorkTable';
import { UnifiedWorkItemForm } from './UnifiedWorkItemForm';
import { OtherWorkForm } from './OtherWorkForm';

interface InitiativeEffortEntry {
  initiative: InitiativeWithDetails;
  hours: number;
  effortSize: EffortSize;
  note: string;
  skipped: boolean;
  existingLog?: EffortLog;
  hasChanges: boolean;
  isMiscAssignment?: boolean;
  miscAssignmentName?: string;
}

interface EffortTrackingViewProps {
  teamMemberId: string | null;
  teamMemberName?: string | null;
  selectedWeek: string;
  onSave: () => void;
  onInitiativeUpdate?: () => void; // Callback when initiative is edited/updated
}

export const EffortTrackingView = ({
  teamMemberId,
  teamMemberName,
  selectedWeek,
  onSave,
  onInitiativeUpdate
}: EffortTrackingViewProps) => {
  const [entries, setEntries] = useState<InitiativeEffortEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastWeekData, setLastWeekData] = useState<EffortLog[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Form state
  const [editingSystemInitiative, setEditingSystemInitiative] = useState<InitiativeWithDetails | null>(null);
  const [editingOtherWork, setEditingOtherWork] = useState<InitiativeWithDetails | null>(null);
  const [showAddOtherWork, setShowAddOtherWork] = useState(false);

  // Capacity calculation state
  const [plannedHours, setPlannedHours] = useState<number>(0);
  const [actualHours, setActualHours] = useState<number>(0);
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

  useEffect(() => {
    loadConfigWeights();
    loadData();
    loadTeamMembers();
  }, [teamMemberId, selectedWeek]);

  // Load calculator config weights
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

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAllTeamMembers(data || []);
    } catch (err) {
      console.error('Error loading team members:', err);
    }
  };

  const loadData = async () => {
    if (!teamMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch initiatives
      const { data: fetchedInitiatives, error: initError } = await supabase
        .from('initiatives')
        .select('*')
        .order('initiative_name', { ascending: true });

      if (initError) throw initError;

      // Fetch related data
      const { data: metrics } = await supabase.from('initiative_metrics').select('*').order('display_order', { ascending: true });
      const { data: financialImpact } = await supabase.from('initiative_financial_impact').select('*');
      const { data: performanceData } = await supabase.from('initiative_performance_data').select('*');
      const { data: projections } = await supabase.from('initiative_projections').select('*');
      const { data: stories } = await supabase.from('initiative_stories').select('*');

      // Join initiatives with related data
      const allInitiatives: InitiativeWithDetails[] = (fetchedInitiatives || []).map((initiative) => ({
        ...initiative,
        metrics: (metrics || []).filter((m) => m.initiative_id === initiative.id),
        financial_impact: (financialImpact || []).find((f) => f.initiative_id === initiative.id),
        performance_data: (performanceData || []).find((p) => p.initiative_id === initiative.id),
        projections: (projections || []).find((p) => p.initiative_id === initiative.id),
        story: (stories || []).find((s) => s.initiative_id === initiative.id),
      }));

      // Load existing logs for selected week
      const { data: currentLogs, error: currentError } = await supabase
        .from('effort_logs')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .eq('week_start_date', selectedWeek);

      if (currentError) throw currentError;

      // Get most recent save timestamp
      if (currentLogs && currentLogs.length > 0) {
        const mostRecent = currentLogs.reduce((latest, log) => {
          const logTime = new Date(log.updated_at).getTime();
          const latestTime = new Date(latest.updated_at).getTime();
          return logTime > latestTime ? log : latest;
        });
        setLastSavedAt(mostRecent.updated_at);
      } else {
        setLastSavedAt(null);
      }

      // Load last week's logs for copying
      const lastWeek = new Date(selectedWeek);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString().split('T')[0];

      const { data: previousLogs } = await supabase
        .from('effort_logs')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .eq('week_start_date', lastWeekStr);

      setLastWeekData(previousLogs || []);

      // Filter initiatives for this team member
      let filteredInitiatives = allInitiatives.filter(
        i => (
          i.status === 'Active' || i.status === 'Planning' || i.status === 'Scaling' ||
          i.status === 'Not Started' || i.status === 'In Progress' || i.status === 'On Hold'
        )
      );

      if (teamMemberName) {
        filteredInitiatives = filteredInitiatives.filter(
          i => i.owner_name === teamMemberName || i.team_member_id === teamMemberId
        );
      }

      // Sort initiatives
      const statusPriority: Record<string, number> = {
        'Planning': 1,
        'Active': 2,
        'In Progress': 3,
        'Scaling': 4,
      };

      filteredInitiatives.sort((a, b) => {
        const aPriority = statusPriority[a.status || ''] || 99;
        const bPriority = statusPriority[b.status || ''] || 99;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return (a.initiative_name || '').localeCompare(b.initiative_name || '');
      });

      const newEntries: InitiativeEffortEntry[] = filteredInitiatives.map(initiative => {
        const existingLog = (currentLogs || []).find(log => log.initiative_id === initiative.id);

        if (existingLog) {
          const hours = existingLog.hours_spent || 0;
          const isSkipped = hours === 0 && existingLog.note?.toLowerCase().includes('no work');

          return {
            initiative,
            hours,
            effortSize: existingLog.effort_size,
            note: existingLog.note || '',
            skipped: isSkipped || false,
            existingLog,
            hasChanges: false,
          };
        }

        // Pre-populate from initiative's work_effort
        const workEffort = initiative.work_effort as EffortSize | null;
        const effortSizeDetails = workEffort ? EFFORT_SIZES.find(e => e.size === workEffort) : null;
        const prePopulatedHours = effortSizeDetails?.hours || 0;
        const prePopulatedSize = workEffort || 'M';

        return {
          initiative,
          hours: prePopulatedHours,
          effortSize: prePopulatedSize,
          note: '',
          skipped: false,
          existingLog: undefined,
          hasChanges: false,
        };
      });

      setEntries(newEntries);
    } catch (err) {
      console.error('Error loading effort data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate capacity
  const calculateCapacity = () => {
    if (!teamMemberId) return;

    let planned = 0;
    entries.forEach(entry => {
      if (entry.isMiscAssignment) return;

      const init = entry.initiative;
      const hasRole = init.role && init.role !== 'Unknown';
      const hasEffort = init.work_effort && init.work_effort !== 'Unknown';
      const hasType = init.type && init.type !== 'Unknown';
      const hasPhase = init.phase && init.phase !== 'Unknown';
      const isGovernance = init.type === 'Governance';

      if (!hasRole || !hasEffort || !hasType || (!hasPhase && !isGovernance)) {
        return;
      }

      const baseHours = init.work_effort ? (configWeights.effortSizes[init.work_effort] || 0) : 0;
      const roleWeight = init.role ? (configWeights.roleWeights[init.role] || 1) : 1;
      const typeWeight = init.type ? (configWeights.typeWeights[init.type] || 1) : 1;
      const phaseWeight = configWeights.phaseWeights[init.phase || 'N/A'] || 1;

      planned += baseHours * roleWeight * typeWeight * phaseWeight;
    });

    setPlannedHours(planned);

    const actual = entries.reduce((sum, entry) => sum + entry.hours, 0);
    setActualHours(actual);
  };

  useEffect(() => {
    if (entries.length > 0 && Object.keys(configWeights.effortSizes).length > 0) {
      calculateCapacity();
    }
  }, [entries, configWeights, teamMemberId]);

  // Event handlers
  const handleHoursChange = (index: number, value: string) => {
    const hours = parseFloat(value) || 0;
    setEntries(prev =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              hours,
              effortSize: getEffortSizeFromHours(hours),
              hasChanges: true,
            }
          : entry
      )
    );
  };

  const handleSizeClick = (index: number, size: EffortSize) => {
    const sizeDetails = EFFORT_SIZES.find(e => e.size === size);
    if (!sizeDetails) return;

    setEntries(prev =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              hours: sizeDetails.hours,
              effortSize: size,
              hasChanges: true,
            }
          : entry
      )
    );
  };

  const handleNoteChange = (index: number, value: string) => {
    setEntries(prev =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              note: value,
              hasChanges: true,
            }
          : entry
      )
    );
  };

  const handleSkipToggle = (index: number) => {
    setEntries(prev =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              skipped: !entry.skipped,
              hours: !entry.skipped ? 0 : entry.hours,
              note: !entry.skipped ? 'No work this week' : '',
              hasChanges: true,
            }
          : entry
      )
    );
  };

  const handleMiscAssignmentNameChange = (index: number, value: string) => {
    setEntries(prev =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              miscAssignmentName: value,
              hasChanges: true,
            }
          : entry
      )
    );
  };

  const copyFromLastWeek = () => {
    if (!lastWeekData.length) return;

    setEntries(prev =>
      prev.map(entry => {
        const lastWeekLog = lastWeekData.find(log => log.initiative_id === entry.initiative.id);
        if (lastWeekLog) {
          return {
            ...entry,
            hours: lastWeekLog.hours_spent,
            effortSize: lastWeekLog.effort_size,
            note: lastWeekLog.note || '',
            hasChanges: true,
          };
        }
        return entry;
      })
    );
  };

  const handleRemoveInitiative = async (index: number) => {
    const entry = entries[index];
    const name = entry.isMiscAssignment ? entry.miscAssignmentName : entry.initiative.initiative_name;

    if (!confirm(`Delete "${name || 'this item'}"?\n\nThis will permanently delete the initiative and all associated data. This cannot be undone.`)) {
      return;
    }

    try {
      if (!entry.initiative.id.startsWith('misc-')) {
        const { error: initError } = await supabase
          .from('initiatives')
          .update({
            status: 'Deleted',
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.initiative.id);

        if (initError) throw initError;
      }

      setEntries(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Error deleting initiative:', err);
      alert('Failed to delete initiative. Please try again.');
    }
  };

  const handleAddMiscAssignment = () => {
    const tempInitiative: InitiativeWithDetails = {
      id: `misc-${Date.now()}`,
      initiative_name: 'Misc Assignment',
      type: 'General Support',
      status: 'Active',
      owner_name: teamMemberName || '',
      team_member_id: teamMemberId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: [],
      is_draft: false,
      completion_status: {
        basic: true,
        governance: false,
        metrics: false,
        financial: false,
        performance: false,
        projections: false,
        story: false,
      },
      completion_percentage: 100,
    };

    const newEntry: InitiativeEffortEntry = {
      initiative: tempInitiative,
      hours: 0,
      effortSize: 'S',
      note: '',
      skipped: false,
      hasChanges: true,
      isMiscAssignment: true,
      miscAssignmentName: '',
    };

    setEntries(prev => [newEntry, ...prev]);
  };

  const handleSaveAll = async () => {
    if (!teamMemberId) return;

    try {
      setSaving(true);

      const changedEntries = entries.filter(e =>
        e.hours > 0 ||
        e.skipped ||
        (e.isMiscAssignment && e.miscAssignmentName?.trim())
      );

      for (const entry of changedEntries) {
        let initiativeId = entry.initiative.id;

        // If misc assignment, create initiative first
        if (entry.isMiscAssignment && entry.miscAssignmentName) {
          const initiativeName = entry.miscAssignmentName.trim() || 'Misc Assignment';

          const { data: newInitiative, error: initError } = await supabase
            .from('initiatives')
            .insert({
              initiative_name: initiativeName,
              type: 'General Support',
              status: 'Active',
              owner_name: teamMemberName || '',
              team_member_id: teamMemberId || '',
              is_draft: false,
            })
            .select()
            .single();

          if (initError) throw initError;
          if (newInitiative) {
            initiativeId = newInitiative.id;
          }
        }

        // Upsert effort log
        const { error: logError } = await supabase
          .from('effort_logs')
          .upsert({
            team_member_id: teamMemberId,
            initiative_id: initiativeId,
            week_start_date: selectedWeek,
            hours_spent: entry.hours,
            effort_size: entry.effortSize,
            note: entry.note || null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'team_member_id,initiative_id,week_start_date'
          });

        if (logError) throw logError;
      }

      // Mark all entries as saved
      setEntries(prev => prev.map(e => ({ ...e, hasChanges: false })));
      setLastSavedAt(new Date().toISOString());

      if (onSave) {
        await onSave();
      }

      await loadData();
    } catch (err) {
      console.error('Error saving effort logs:', err);
      alert('Failed to save effort logs. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditInitiative = (initiative: InitiativeWithDetails) => {
    console.log('Edit initiative clicked:', initiative);
    console.log('Initiative type:', initiative.type);
    console.log('Governance request ID:', initiative.governance_request_id);

    if (initiative.type === 'System Initiative') {
      setEditingSystemInitiative(initiative);
    } else {
      setEditingOtherWork(initiative);
    }
  };

  if (!teamMemberId) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Team Member</h3>
        <p className="text-gray-600">Choose a team member above to log effort</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assignments...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Initiatives</h3>
        <p className="text-gray-600">This team member has no active initiatives to log effort for.</p>
      </div>
    );
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const changedCount = entries.filter(e =>
    e.hasChanges && (
      e.hours > 0 ||
      e.skipped ||
      (e.isMiscAssignment && e.miscAssignmentName?.trim())
    )
  ).length;

  const plannedCapacityPct = Math.round((plannedHours / 40) * 100);
  const variance = actualHours - plannedHours;

  return (
    <div className="space-y-4">
      {/* Header with capacity and actions */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-lg font-semibold text-gray-700">
                Planned: {plannedHours.toFixed(1)} hrs/wk ({plannedCapacityPct}%)
              </div>
              <div className="text-2xl font-bold text-gray-900">
                Actual: {actualHours.toFixed(1)} hrs
              </div>
              <div className="text-sm text-gray-600">
                Variance: {variance > 0 ? '+' : ''}{variance.toFixed(1)} hrs {variance > 0 ? 'over' : variance < 0 ? 'under' : 'on'} estimate
              </div>
              {lastSavedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  Last saved: {new Date(lastSavedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(lastSavedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Today is: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
              <div className="text-sm text-gray-600">Active initiatives</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastWeekData.length > 0 && (
              <button
                onClick={copyFromLastWeek}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Last Week
              </button>
            )}
            <button
              onClick={handleSaveAll}
              disabled={saving || changedCount === 0}
              className="px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8B2858] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : `Save ${changedCount > 0 ? `(${changedCount})` : 'All'}`}
            </button>
          </div>
        </div>
      </div>

      {/* System Initiatives Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">System Initiatives</h2>

        <SystemInitiativesTable
          entries={entries}
          onHoursChange={handleHoursChange}
          onSizeClick={handleSizeClick}
          onNoteChange={handleNoteChange}
          onSkipToggle={handleSkipToggle}
          onEditInitiative={handleEditInitiative}
          onRemoveInitiative={handleRemoveInitiative}
          allTeamMembers={allTeamMembers}
        />
      </div>

      {/* Other Work Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Other Work</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAddMiscAssignment}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Misc. Assignment
            </button>
            <button
              onClick={() => setShowAddOtherWork(true)}
              className="px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8B2858] transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Work Item
            </button>
          </div>
        </div>

        <OtherWorkTable
          entries={entries}
          onHoursChange={handleHoursChange}
          onSizeClick={handleSizeClick}
          onNoteChange={handleNoteChange}
          onSkipToggle={handleSkipToggle}
          onEditInitiative={handleEditInitiative}
          onRemoveInitiative={handleRemoveInitiative}
          onMiscAssignmentNameChange={handleMiscAssignmentNameChange}
          allTeamMembers={allTeamMembers}
        />
      </div>

      {/* Footer with unsaved total */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Total hours (unsaved)</div>
            <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)} hrs</div>
          </div>
          <div className="text-sm text-gray-500">
            {changedCount > 0 && `${changedCount} unsaved change${changedCount !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingSystemInitiative && (
        <UnifiedWorkItemForm
          editingInitiative={editingSystemInitiative}
          onClose={() => setEditingSystemInitiative(null)}
          onSuccess={async () => {
            setEditingSystemInitiative(null);
            await loadData();
            // Notify parent to refresh dashboard counts
            if (onInitiativeUpdate) {
              await onInitiativeUpdate();
            }
          }}
        />
      )}

      {showAddOtherWork && (
        <OtherWorkForm
          onClose={() => setShowAddOtherWork(false)}
          onSuccess={async () => {
            setShowAddOtherWork(false);
            await loadData();
            // Notify parent to refresh dashboard counts
            if (onInitiativeUpdate) {
              await onInitiativeUpdate();
            }
          }}
        />
      )}

      {editingOtherWork && (
        <OtherWorkForm
          editingInitiative={editingOtherWork}
          onClose={() => setEditingOtherWork(null)}
          onSuccess={async () => {
            setEditingOtherWork(null);
            await loadData();
            // Notify parent to refresh dashboard counts
            if (onInitiativeUpdate) {
              await onInitiativeUpdate();
            }
          }}
        />
      )}
    </div>
  );
};
