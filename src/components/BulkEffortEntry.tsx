import { useState, useEffect } from 'react';
import { Clock, Save, Copy, User, X, UserPlus, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, InitiativeWithDetails, EffortLog, EFFORT_SIZES, EffortSize, TeamMember } from '../lib/supabase';
import { getWeekStartDate, formatWeekRange, getEffortSizeFromHours } from '../lib/effortUtils';
import { recalculateDashboardMetrics } from '../lib/workloadCalculator';
import ReassignModal from './ReassignModal';

interface BulkEffortEntryProps {
  teamMemberId: string | null;
  teamMemberName?: string | null; // For filtering by owner_name
  initiatives?: InitiativeWithDetails[]; // Optional - will fetch if not provided
  selectedWeek: string;
  onSave: () => void;
  onEditInitiative?: (initiative: InitiativeWithDetails) => void; // Callback to open edit form
  onAddInitiative?: () => void; // Callback to open add initiative form
}

interface InitiativeEffortEntry {
  initiative: InitiativeWithDetails;
  hours: number;
  effortSize: EffortSize;
  note: string;
  skipped: boolean; // True if explicitly marking as "no work this week"
  existingLog?: EffortLog;
  hasChanges: boolean;
  isMiscAssignment?: boolean; // True if this is an ad-hoc misc assignment
  miscAssignmentName?: string; // Name for misc assignments
}

export default function BulkEffortEntry({
  teamMemberId,
  teamMemberName,
  initiatives,
  selectedWeek,
  onSave,
  onEditInitiative,
  onAddInitiative,
}: BulkEffortEntryProps) {
  const [entries, setEntries] = useState<InitiativeEffortEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastWeekData, setLastWeekData] = useState<EffortLog[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [reassigningInitiative, setReassigningInitiative] = useState<InitiativeWithDetails | null>(null);
  const [showCompleted, setShowCompleted] = useState(false); // State for collapsed completed section
  const [completedInitiatives, setCompletedInitiatives] = useState<InitiativeWithDetails[]>([]); // Store completed initiatives
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

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

  // Initialize collapsed work types from localStorage or use defaults
  const [collapsedWorkTypes, setCollapsedWorkTypes] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('bulkEffortEntry_collapsedWorkTypes');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load collapsed work types from localStorage:', error);
    }
    // Default: all work types collapsed
    return new Set([
      'Governance',
      'Policy/Guidelines',
      'System Project',
      'Market Project',
      'System Initiative',
      'Ticket',
      'General Support',
      'Epic Gold',
      'Epic Upgrades',
      'Uncategorized'
    ]);
  });

  // Persist collapsed work types to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bulkEffortEntry_collapsedWorkTypes', JSON.stringify(Array.from(collapsedWorkTypes)));
    } catch (error) {
      console.warn('Failed to save collapsed work types to localStorage:', error);
    }
  }, [collapsedWorkTypes]);

  useEffect(() => {
    loadConfigWeights();
    loadData();
    loadTeamMembers();
  }, [teamMemberId, initiatives, selectedWeek]);

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

      console.log('[BulkEffortEntry] Loading data...');
      console.log('- Team Member ID:', teamMemberId);
      console.log('- Selected Week:', selectedWeek);
      console.log('- Initiatives passed:', initiatives?.length || 0);

      // Always fetch fresh initiatives from database to include newly created misc assignments
      console.log('- Fetching initiatives from database...');
      const { data: fetchedInitiatives, error: initError } = await supabase
        .from('initiatives')
        .select('*')
        .order('initiative_name', { ascending: true });

      if (initError) {
        console.error('Error fetching initiatives:', initError);
        throw initError;
      }

      // Fetch related data for initiatives (metrics, financial, performance, projections, stories)
      console.log('- Fetching related data (metrics, financial, performance, projections, stories)...');

      const { data: metrics, error: metricsError } = await supabase
        .from('initiative_metrics')
        .select('*')
        .order('display_order', { ascending: true });

      if (metricsError) throw metricsError;

      const { data: financialImpact, error: financialError } = await supabase
        .from('initiative_financial_impact')
        .select('*');

      if (financialError) throw financialError;

      const { data: performanceData, error: performanceError } = await supabase
        .from('initiative_performance_data')
        .select('*');

      if (performanceError) throw performanceError;

      const { data: projections, error: projectionsError } = await supabase
        .from('initiative_projections')
        .select('*');

      if (projectionsError) throw projectionsError;

      const { data: stories, error: storiesError } = await supabase
        .from('initiative_stories')
        .select('*');

      if (storiesError) throw storiesError;

      // Join initiatives with their related data
      const allInitiatives: InitiativeWithDetails[] = (fetchedInitiatives || []).map((initiative) => ({
        ...initiative,
        metrics: (metrics || []).filter((m) => m.initiative_id === initiative.id),
        financial_impact: (financialImpact || []).find((f) => f.initiative_id === initiative.id),
        performance_data: (performanceData || []).find((p) => p.initiative_id === initiative.id),
        projections: (projections || []).find((p) => p.initiative_id === initiative.id),
        story: (stories || []).find((s) => s.initiative_id === initiative.id),
      }));

      console.log('- Fetched initiatives with details:', allInitiatives.length);

      // Load existing logs for selected week
      const { data: currentLogs, error: currentError } = await supabase
        .from('effort_logs')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .eq('week_start_date', selectedWeek);

      if (currentError) throw currentError;

      // Get the most recent updated_at timestamp for this week
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

      const { data: previousLogs, error: prevError } = await supabase
        .from('effort_logs')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .eq('week_start_date', lastWeekStr);

      if (prevError) throw prevError;

      setLastWeekData(previousLogs || []);

      // Filter initiatives for this team member
      // Match by owner_name (from initiatives table) to team member name
      // ONLY include standard initiative statuses (not governance request statuses)
      // Governance requests (Draft, Ready for Review, Needs Refinement) show in SCIRequestsCard above
      let filteredInitiatives = allInitiatives.filter(
        i => (
          i.status === 'Active' || i.status === 'Planning' || i.status === 'Scaling' ||
          i.status === 'Not Started' || i.status === 'In Progress'
        )
      );

      // If we have a team member name, filter to only show their initiatives
      if (teamMemberName) {
        filteredInitiatives = filteredInitiatives.filter(
          i => i.owner_name === teamMemberName || i.team_member_id === teamMemberId
        );
        console.log(`- Filtering for ${teamMemberName}:`, filteredInitiatives.length, 'initiatives');
      } else {
        console.log('- Showing all active initiatives:', filteredInitiatives.length);
      }

      // Sort initiatives: priority statuses at top, then by name
      const statusPriority: Record<string, number> = {
        'Planning': 1,  // New initiatives being planned
        'Active': 2,     // Active work
        'In Progress': 3, // Work in progress
        'Scaling': 4,    // Scaling across organization
      };

      filteredInitiatives.sort((a, b) => {
        const aPriority = statusPriority[a.status || ''] || 99;
        const bPriority = statusPriority[b.status || ''] || 99;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Same priority level - sort by name
        return (a.initiative_name || '').localeCompare(b.initiative_name || '');
      });

      // Also filter completed initiatives for the collapsed section
      let completedInits = allInitiatives.filter(i => i.status === 'Completed');

      // Filter completed by team member if specified
      if (teamMemberName) {
        completedInits = completedInits.filter(
          i => i.owner_name === teamMemberName || i.team_member_id === teamMemberId
        );
      }

      // Sort completed by name
      completedInits.sort((a, b) => (a.initiative_name || '').localeCompare(b.initiative_name || ''));

      // Set completed initiatives state
      setCompletedInitiatives(completedInits);

      const newEntries: InitiativeEffortEntry[] = filteredInitiatives.map(initiative => {
        const existingLog = (currentLogs || []).find(log => log.initiative_id === initiative.id);

        // If there's an existing log, use its values
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

        // No existing log - pre-populate from initiative's work_effort
        const workEffort = initiative.work_effort as EffortSize | null;
        const effortSizeDetails = workEffort ? EFFORT_SIZES.find(e => e.size === workEffort) : null;
        const prePopulatedHours = effortSizeDetails?.hours || 0;
        const prePopulatedSize = workEffort || 'M';  // Default to Medium if no work_effort set

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

  // Helper function to get work type color
  const getWorkTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Epic Gold': '#9B2F6A',
      'Governance': '#6F47D0',
      'System Initiative': '#00A1E0',
      'System Project': '#00A1E0',
      'Epic Upgrades': '#00A1E0',
      'General Support': '#F58025',
      'Policy/Guidelines': '#6F47D0',
      'Market Project': '#9C5C9D',
      'Ticket': '#F58025',
      'Uncategorized': '#565658',
    };
    return colors[type] || '#565658';
  };

  // Calculate capacity (planned hours only - actual comes from entries)
  const calculateCapacity = () => {
    if (!teamMemberId) return;

    // Calculate planned hours from active initiatives
    let planned = 0;
    entries.forEach(entry => {
      if (entry.isMiscAssignment) return;

      const init = entry.initiative;
      const hasRole = init.role && init.role !== 'Unknown';
      const hasEffort = init.work_effort && init.work_effort !== 'Unknown';
      const hasType = init.type && init.type !== 'Unknown';
      const hasPhase = init.phase && init.phase !== 'Unknown';
      const isGovernance = init.type === 'Governance';

      // Skip if missing required data
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

    // Actual hours = sum of entry.hours (which are loaded from saved effort_logs)
    const actual = entries.reduce((sum, entry) => sum + entry.hours, 0);
    setActualHours(actual);
  };

  // Recalculate capacity when entries or config changes
  useEffect(() => {
    if (entries.length > 0 && Object.keys(configWeights.effortSizes).length > 0) {
      calculateCapacity();
    }
  }, [entries, configWeights, teamMemberId]);

  // Toggle work type section collapse
  const toggleWorkTypeSection = (workType: string) => {
    setCollapsedWorkTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workType)) {
        newSet.delete(workType);
      } else {
        newSet.add(workType);
      }
      return newSet;
    });
  };

  // Group entries by work type
  const groupEntriesByWorkType = () => {
    const grouped: { [key: string]: InitiativeEffortEntry[] } = {};
    entries.forEach(entry => {
      const workType = entry.initiative.type || 'Uncategorized';
      if (!grouped[workType]) {
        grouped[workType] = [];
      }
      grouped[workType].push(entry);
    });

    // Custom sort order for work types
    const workTypeOrder = [
      'Governance',
      'Policy/Guidelines',
      'System Project',
      'Market Project',
      'System Initiative',
      'Ticket',
      'General Support',
      'Epic Gold',
      'Epic Upgrades',
      'Uncategorized'
    ];

    // Sort work types by custom order
    return Object.keys(grouped).sort((a, b) => {
      const indexA = workTypeOrder.indexOf(a);
      const indexB = workTypeOrder.indexOf(b);

      // If both are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only A is in the list, it comes first
      if (indexA !== -1) return -1;

      // If only B is in the list, it comes first
      if (indexB !== -1) return 1;

      // If neither is in the list, sort alphabetically
      return a.localeCompare(b);
    }).reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {} as { [key: string]: InitiativeEffortEntry[] });
  };

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
              hours: !entry.skipped ? 0 : entry.hours, // Set to 0 when skipping
              note: !entry.skipped ? 'No work this week' : '', // Auto-fill note
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
      // Only update database if it's not a temporary/unsaved initiative
      if (!entry.initiative.id.startsWith('misc-')) {
        console.log('[Delete] Attempting to mark initiative as deleted:', entry.initiative.id, entry.initiative.initiative_name);

        // Instead of deleting, change status to "Deleted" so Google Sheets sync doesn't restore it
        // The effort tracking view only shows Active/Planning initiatives, so this will hide it
        const { error: initError } = await supabase
          .from('initiatives')
          .update({
            status: 'Deleted',
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.initiative.id);

        if (initError) {
          console.error('[Delete] Error from Supabase:', initError);
          throw initError;
        }

        console.log('[Delete] Initiative status changed to Deleted');
      } else {
        console.log('[Delete] Skipping database update for temporary initiative:', entry.initiative.id);
      }

      // Remove from UI immediately
      setEntries(prev => prev.filter((_, i) => i !== index));
      console.log('[Delete] Removed from UI');

      // Notify parent to refresh data
      onSave();
      console.log('[Delete] Notified parent component');
    } catch (err) {
      console.error('[Delete] Error deleting initiative:', err);
      alert(`Failed to delete initiative: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAddMiscAssignment = () => {
    // Create a temporary initiative object for the misc assignment
    const tempInitiative: InitiativeWithDetails = {
      id: `misc-${Date.now()}`, // Temporary ID
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

    // Add to the beginning of the array so it appears at the top
    setEntries(prev => [newEntry, ...prev]);
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

  const handleSaveAll = async () => {
    if (!teamMemberId) return;

    try {
      setSaving(true);

      // Save ALL entries that have data (not just entries with hasChanges=true)
      // This ensures all hours get saved, even if the page was reloaded after initial entry
      const changedEntries = entries.filter(e =>
        e.hours > 0 ||
        e.skipped ||
        (e.isMiscAssignment && e.miscAssignmentName?.trim())
      );

      for (const entry of changedEntries) {
        let initiativeId = entry.initiative.id;

        // If this is a misc assignment, create the initiative first
        if (entry.isMiscAssignment && entry.miscAssignmentName) {
          const initiativeName = entry.miscAssignmentName.trim() || 'Misc Assignment';

          // Create the initiative
          const { data: newInitiative, error: initError } = await supabase
            .from('initiatives')
            .insert([{
              initiative_name: initiativeName,
              type: 'General Support',
              status: 'Active',
              owner_name: teamMemberName || '',
              team_member_id: teamMemberId,
            }])
            .select()
            .single();

          if (initError) throw initError;
          if (!newInitiative) throw new Error('Failed to create misc assignment initiative');

          initiativeId = newInitiative.id;
        } else if (entry.isMiscAssignment && !entry.miscAssignmentName?.trim()) {
          // Skip misc assignments without a name
          continue;
        }

        const logData = {
          initiative_id: initiativeId,
          team_member_id: teamMemberId,
          week_start_date: selectedWeek, // Save to the week user is viewing/editing
          hours_spent: entry.hours,
          effort_size: entry.effortSize,
          note: entry.note.trim() || null,
        };

        if (entry.existingLog) {
          // Update
          const { error } = await supabase
            .from('effort_logs')
            .update(logData)
            .eq('id', entry.existingLog.id);

          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabase.from('effort_logs').insert([logData]);

          if (error) throw error;
        }
      }

      // Recalculate dashboard metrics to update capacity
      if (teamMemberId) {
        try {
          await recalculateDashboardMetrics(teamMemberId);
          console.log('✓ Dashboard metrics recalculated after effort save');
        } catch (metricsError) {
          console.error('Warning: Failed to recalculate dashboard metrics:', metricsError);
          // Don't fail the whole save if metrics recalculation fails
        }
      }

      onSave();
      await loadData(); // Reload to get fresh data
    } catch (err) {
      console.error('Error saving effort logs:', err);
      alert('Failed to save effort logs. Please try again.');
    } finally {
      setSaving(false);
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

  // Calculate capacity metrics
  const plannedCapacityPct = Math.round((plannedHours / 40) * 100);
  const variance = actualHours - plannedHours;

  return (
    <div className="space-y-4">
      {/* Header with actions */}
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
            {onAddInitiative && (
              <button
                onClick={onAddInitiative}
                className="px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8B2858] transition-colors flex items-center gap-2"
                title="Add a new initiative to your workload"
              >
                <span className="text-lg">+</span>
                Add Initiative
              </button>
            )}
            <button
              onClick={handleAddMiscAssignment}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Misc. Assignment
            </button>
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

      {/* Effort entry table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase w-16">Skip</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Initiative</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-32">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actual Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actual Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Note</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase w-10">Edit</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(() => {
                const groupedEntries = groupEntriesByWorkType();
                const allRows: JSX.Element[] = [];

                Object.entries(groupedEntries).forEach(([workType, workTypeEntries]) => {
                  const isCollapsed = collapsedWorkTypes.has(workType);
                  const color = getWorkTypeColor(workType);

                  // Add section header row
                  allRows.push(
                    <tr key={`header-${workType}`} className="bg-gray-50">
                      <td colSpan={9} className="px-4 py-2">
                        <button
                          onClick={() => toggleWorkTypeSection(workType)}
                          className="w-full flex items-center gap-3 text-left hover:bg-gray-100 transition-colors rounded px-2 py-1"
                        >
                          {isCollapsed ? (
                            <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          ) : (
                            <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          )}
                          <div
                            className="w-1 h-6 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-semibold text-gray-800">{workType}</span>
                          <span
                            className="text-sm px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${color}20`,
                              color: color
                            }}
                          >
                            {workTypeEntries.length}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );

                  // Add initiative rows if section is not collapsed
                  if (!isCollapsed) {
                    workTypeEntries.forEach((entry) => {
                      const index = entries.findIndex(e => e.initiative.id === entry.initiative.id);
                      allRows.push(
                        <tr key={entry.initiative.id} className={entry.hasChanges ? 'bg-blue-50/50' : ''}>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={entry.skipped}
                              onChange={() => handleSkipToggle(index)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                              title="Skip this week - mark as no work"
                            />
                          </td>
                          <td className="px-4 py-3">
                            {entry.isMiscAssignment ? (
                              <input
                                type="text"
                                value={entry.miscAssignmentName || ''}
                                onChange={(e) => handleMiscAssignmentNameChange(index, e.target.value)}
                                placeholder="Enter assignment name..."
                                className="w-full px-2 py-1 font-medium text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                              />
                            ) : (
                              <>
                                <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                                  {(() => {
                                    // Check if initiative is missing required data for capacity calculation
                                    const hasRole = entry.initiative.role && entry.initiative.role !== 'Unknown';
                                    const hasEffort = entry.initiative.work_effort && entry.initiative.work_effort !== 'Unknown';
                                    const hasType = entry.initiative.type && entry.initiative.type !== 'Unknown';
                                    const hasPhase = entry.initiative.phase && entry.initiative.phase !== 'Unknown';
                                    const isGovernance = entry.initiative.type === 'Governance';

                                    // Missing data if any required field is missing (Governance doesn't require phase)
                                    const isMissingData = !hasRole || !hasEffort || !hasType || (!hasPhase && !isGovernance);

                                    if (isMissingData) {
                                      const missingFields = [];
                                      if (!hasRole) missingFields.push('role');
                                      if (!hasEffort) missingFields.push('work effort');
                                      if (!hasType) missingFields.push('type');
                                      if (!hasPhase && !isGovernance) missingFields.push('phase');

                                      return (
                                        <span
                                          className="text-amber-500 font-bold flex-shrink-0"
                                          title={`Missing data: ${missingFields.join(', ')}. Cannot calculate capacity.`}
                                        >
                                          !
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                  <span>{entry.initiative.initiative_name}</span>
                                </div>
                                {entry.initiative.service_line && (
                                  <div className="text-xs text-gray-500">{entry.initiative.service_line}</div>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-700 truncate flex-1">
                                {entry.initiative.owner_name || teamMemberName}
                              </span>
                              {!entry.isMiscAssignment && (
                                <button
                                  onClick={() => setReassigningInitiative(entry.initiative)}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 rounded transition-colors"
                                  title="Reassign to another SCI"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-600">{entry.initiative.type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={entry.hours || ''}
                              onChange={(e) => handleHoursChange(index, e.target.value)}
                              placeholder="0"
                              step="0.5"
                              min="0"
                              max="168"
                              className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {/* Show estimated work effort from initiative */}
                              {entry.initiative.work_effort && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span title="Estimated weekly effort from initiative planning">📊 Est: {entry.initiative.work_effort}</span>
                                  <span className="text-gray-400">
                                    ({EFFORT_SIZES.find(e => e.size === entry.initiative.work_effort)?.hours || 0}h/wk)
                                  </span>
                                </div>
                              )}
                              {/* Actual effort size buttons for this week */}
                              <div className="flex gap-1">
                                {EFFORT_SIZES.map((size) => (
                                  <button
                                    key={size.size}
                                    onClick={() => handleSizeClick(index, size.size)}
                                    className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                                      entry.effortSize === size.size
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    style={{
                                      backgroundColor: entry.effortSize === size.size ? size.color : undefined,
                                    }}
                                    title={`${size.label} - ${size.hours}h`}
                                  >
                                    {size.size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={entry.note}
                              onChange={(e) => handleNoteChange(index, e.target.value)}
                              placeholder="Optional note..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {!entry.isMiscAssignment && onEditInitiative && (
                              <button
                                onClick={() => onEditInitiative(entry.initiative)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors p-1 rounded"
                                title="Edit initiative details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveInitiative(index)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                              title="Remove from list"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                </tr>
                      );
                    });
                  }
                });

                return allRows;
              })()}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">
                  Total Hours (unsaved):
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xl font-bold text-[#9B2F6A]">{totalHours.toFixed(1)}</span>
                </td>
                <td colSpan={3} className="px-4 py-3 text-sm text-gray-600">
                  This total updates as you enter hours above
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Completed Initiatives Section (Collapsed) */}
      {completedInitiatives.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showCompleted ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
              <span className="font-semibold text-gray-700">Completed Initiatives</span>
              <span className="text-sm text-gray-500">({completedInitiatives.length})</span>
            </div>
            <span className="text-xs text-gray-500">Click to {showCompleted ? 'collapse' : 'expand'}</span>
          </button>

          {showCompleted && (
            <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Initiative</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service Line</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {completedInitiatives.map((initiative) => (
                      <tr key={initiative.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{initiative.initiative_name}</span>
                            {initiative.timeframe_display && (
                              <span className="text-xs text-gray-500 mt-1">{initiative.timeframe_display}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {initiative.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{initiative.service_line || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {onEditInitiative && (
                            <button
                              onClick={() => onEditInitiative(initiative)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors p-1 rounded"
                              title="Edit initiative details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reassign Modal */}
      {reassigningInitiative && (
        <ReassignModal
          initiative={reassigningInitiative}
          allTeamMembers={allTeamMembers}
          currentOwnerName={reassigningInitiative.owner_name || teamMemberName || ''}
          onClose={() => setReassigningInitiative(null)}
          onSuccess={() => {
            loadData(); // Reload to reflect reassignment
            onSave(); // Notify parent component
          }}
        />
      )}
    </div>
  );
}
