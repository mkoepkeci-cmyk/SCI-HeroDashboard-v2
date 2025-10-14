import { useState, useEffect } from 'react';
import { Clock, Save, Copy, User } from 'lucide-react';
import { supabase, InitiativeWithDetails, EffortLog, EFFORT_SIZES, EffortSize } from '../lib/supabase';
import { getWeekStartDate, formatWeekRange, getEffortSizeFromHours } from '../lib/effortUtils';

interface BulkEffortEntryProps {
  teamMemberId: string | null;
  initiatives: InitiativeWithDetails[];
  selectedWeek: string;
  onSave: () => void;
}

interface InitiativeEffortEntry {
  initiative: InitiativeWithDetails;
  hours: number;
  effortSize: EffortSize;
  note: string;
  existingLog?: EffortLog;
  hasChanges: boolean;
}

export default function BulkEffortEntry({
  teamMemberId,
  initiatives,
  selectedWeek,
  onSave,
}: BulkEffortEntryProps) {
  const [entries, setEntries] = useState<InitiativeEffortEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastWeekData, setLastWeekData] = useState<EffortLog[]>([]);

  useEffect(() => {
    loadData();
  }, [teamMemberId, initiatives, selectedWeek]);

  const loadData = async () => {
    if (!teamMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load existing logs for selected week
      const { data: currentLogs, error: currentError } = await supabase
        .from('effort_logs')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .eq('week_start_date', selectedWeek);

      if (currentError) throw currentError;

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

      // Create entries for all active initiatives
      // Note: Not filtering by team_member_id because initiatives might not have it set
      // Instead, we show all active/planning initiatives and let any team member log effort
      const activeInitiatives = initiatives.filter(
        i => i.status === 'Active' || i.status === 'Planning'
      );

      const newEntries: InitiativeEffortEntry[] = activeInitiatives.map(initiative => {
        const existingLog = (currentLogs || []).find(log => log.initiative_id === initiative.id);
        const hours = existingLog?.hours_spent || 0;

        return {
          initiative,
          hours,
          effortSize: existingLog?.effort_size || getEffortSizeFromHours(hours),
          note: existingLog?.note || '',
          existingLog,
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

  const handleSaveAll = async () => {
    if (!teamMemberId) return;

    try {
      setSaving(true);

      const changedEntries = entries.filter(e => e.hasChanges && e.hours > 0);

      for (const entry of changedEntries) {
        const logData = {
          initiative_id: entry.initiative.id,
          team_member_id: teamMemberId,
          week_start_date: selectedWeek,
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
  const changedCount = entries.filter(e => e.hasChanges && e.hours > 0).length;

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalHours} hrs</div>
              <div className="text-sm text-gray-600">Total for week</div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Initiative</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry, index) => (
                <tr key={entry.initiative.id} className={entry.hasChanges ? 'bg-blue-50/50' : ''}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-gray-900">{entry.initiative.initiative_name}</div>
                    {entry.initiative.service_line && (
                      <div className="text-xs text-gray-500">{entry.initiative.service_line}</div>
                    )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
