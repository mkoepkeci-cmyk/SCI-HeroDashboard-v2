import { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, AlertCircle, Calendar, BarChart3, User, List } from 'lucide-react';
import { supabase, InitiativeWithDetails, EffortLog, TeamMember } from '../lib/supabase';
import {
  getWeekStartDate,
  formatWeekRange,
  getCapacityStatus,
  getCapacityColor,
  getCapacityEmoji,
  getCapacityLabel,
  getTrendIcon,
  getTrendColor,
  getLastNWeeks,
} from '../lib/effortUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import BulkEffortEntry from './BulkEffortEntry';
import { InitiativeSubmissionForm } from './InitiativeSubmissionForm';

interface PersonalWorkloadDashboardProps {
  teamMember: TeamMember | null;
  allTeamMembers: TeamMember[];
  initiatives: InitiativeWithDetails[];
  onTeamMemberChange: (member: TeamMember) => void;
  onInitiativesRefresh?: () => void; // Callback to refresh initiatives after editing
}

interface WorkTypeEffort {
  workType: string;
  hours: number;
  color: string;
  percentage: number;
}

const WORK_TYPE_COLORS: Record<string, string> = {
  'Epic Gold': '#9B2F6A',
  'System Initiative': '#00A1E0',
  'Governance': '#6F47D0',
  'Project': '#9C5C9D',
  'General Support': '#F58025',
  'Policy': '#6F47D0',
  'Epic Upgrades': '#00A1E0',
};

export default function PersonalWorkloadDashboard({
  teamMember,
  allTeamMembers,
  initiatives,
  onTeamMemberChange,
  onInitiativesRefresh,
}: PersonalWorkloadDashboardProps) {
  const [effortLogs, setEffortLogs] = useState<EffortLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getWeekStartDate());
  const [view, setView] = useState<'summary' | 'entry'>('entry');
  const [editingInitiative, setEditingInitiative] = useState<InitiativeWithDetails | null>(null);

  const recentWeeks = useMemo(() => getLastNWeeks(8), []);

  useEffect(() => {
    loadEffortLogs();
  }, [teamMember?.id]);

  const loadEffortLogs = async () => {
    if (!teamMember) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('effort_logs')
        .select('*')
        .eq('team_member_id', teamMember.id)
        .gte('week_start_date', recentWeeks[0])
        .order('week_start_date', { ascending: false });

      if (error) throw error;
      setEffortLogs(data || []);
    } catch (err) {
      console.error('Error loading effort logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate current week summary
  const currentWeekSummary = useMemo(() => {
    const weekLogs = effortLogs.filter(log => log.week_start_date === selectedWeek);
    const totalHours = weekLogs.reduce((sum, log) => sum + log.hours_spent, 0);
    const initiativeIds = new Set(weekLogs.map(log => log.initiative_id));

    // Group by work type
    const byWorkType: Record<string, number> = {};
    weekLogs.forEach(log => {
      const initiative = initiatives.find(i => i.id === log.initiative_id);
      if (initiative) {
        const workType = initiative.type;
        byWorkType[workType] = (byWorkType[workType] || 0) + log.hours_spent;
      }
    });

    const workTypeEfforts: WorkTypeEffort[] = Object.entries(byWorkType).map(([workType, hours]) => ({
      workType,
      hours,
      color: WORK_TYPE_COLORS[workType] || '#565658',
      percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0,
    })).sort((a, b) => b.hours - a.hours);

    const capacityStatus = getCapacityStatus(totalHours);

    return {
      totalHours,
      initiativeCount: initiativeIds.size,
      workTypeEfforts,
      capacityStatus,
      weekLogs,
    };
  }, [effortLogs, selectedWeek, initiatives]);

  // Calculate weekly trend data for chart
  const weeklyTrendData = useMemo(() => {
    return recentWeeks.map(weekStart => {
      const weekLogs = effortLogs.filter(log => log.week_start_date === weekStart);
      const totalHours = weekLogs.reduce((sum, log) => sum + log.hours_spent, 0);
      const capacityStatus = getCapacityStatus(totalHours);

      return {
        week: formatWeekRange(weekStart).split(' - ')[0], // Just start date
        weekFull: formatWeekRange(weekStart),
        hours: totalHours,
        capacity: capacityStatus,
        color: getCapacityColor(capacityStatus),
      };
    });
  }, [effortLogs, recentWeeks]);

  // Top effort initiatives this week
  const topInitiatives = useMemo(() => {
    const weekLogs = effortLogs.filter(log => log.week_start_date === selectedWeek);
    const initiativeHours = new Map<string, { initiative: InitiativeWithDetails; hours: number; trend: string }>();

    weekLogs.forEach(log => {
      const initiative = initiatives.find(i => i.id === log.initiative_id);
      if (initiative) {
        initiativeHours.set(log.initiative_id, {
          initiative,
          hours: log.hours_spent,
          trend: '→', // Will calculate actual trend if we have historical data
        });
      }
    });

    return Array.from(initiativeHours.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10);
  }, [effortLogs, selectedWeek, initiatives]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading workload data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Effort Tracking</h2>
        <p className="text-blue-100">Log your time, manage capacity, and stay balanced</p>
      </div>

      {/* Staff Selector + Week Selector + View Toggle */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Staff Selector */}
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <label className="text-sm font-medium text-gray-700 flex-shrink-0">Team Member:</label>
            <select
              value={teamMember?.id || ''}
              onChange={(e) => {
                const member = allTeamMembers.find(m => m.id === e.target.value);
                if (member) onTeamMemberChange(member);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {!teamMember && <option value="">Select a team member...</option>}
              {allTeamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Week Selector */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <label className="text-sm font-medium text-gray-700 flex-shrink-0">Week:</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {recentWeeks.map(week => (
                <option key={week} value={week}>
                  {formatWeekRange(week)} {week === getWeekStartDate() && '(Current)'}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('entry')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                view === 'entry'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              Log Effort
            </button>
            <button
              onClick={() => setView('summary')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                view === 'summary'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Summary
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Content Based on View */}
      {view === 'entry' ? (
        <BulkEffortEntry
          teamMemberId={teamMember?.id || null}
          teamMemberName={teamMember?.name || null}
          initiatives={initiatives}
          selectedWeek={selectedWeek}
          onSave={loadEffortLogs}
          onEditInitiative={(initiative) => setEditingInitiative(initiative)}
        />
      ) : (
        <>
          {/* Summary View - Existing Dashboard Content */}

      {/* Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Weekly Effort</div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{currentWeekSummary.totalHours} hrs</div>
          <div className="text-xs text-gray-500 mt-1">
            Across {currentWeekSummary.initiativeCount} initiatives
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Capacity Status</div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCapacityEmoji(currentWeekSummary.capacityStatus)}</span>
            <div className="text-sm font-semibold" style={{ color: getCapacityColor(currentWeekSummary.capacityStatus) }}>
              {getCapacityLabel(currentWeekSummary.capacityStatus)}
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((currentWeekSummary.totalHours / 50) * 100, 100)}%`,
                  backgroundColor: getCapacityColor(currentWeekSummary.capacityStatus),
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Active Assignments</div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{teamMember?.total_assignments || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            {currentWeekSummary.initiativeCount} with logged effort this week
          </div>
        </div>
      </div>

      {/* Capacity Alert */}
      {currentWeekSummary.capacityStatus === 'over' || currentWeekSummary.capacityStatus === 'critical' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-900">Capacity Warning</div>
            <div className="text-sm text-red-700 mt-1">
              You're currently logging {currentWeekSummary.totalHours} hours per week, which exceeds recommended capacity.
              Consider discussing workload prioritization with your manager.
            </div>
          </div>
        </div>
      )}

      {/* Effort Breakdown by Work Type */}
      {currentWeekSummary.workTypeEfforts.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Effort Breakdown</h3>
          <div className="space-y-3">
            {currentWeekSummary.workTypeEfforts.map((effort) => (
              <div key={effort.workType}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{effort.workType}</span>
                  <span className="text-gray-600">
                    {effort.hours} hrs ({effort.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${effort.percentage}%`,
                      backgroundColor: effort.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">8-Week Effort Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border rounded-lg shadow-lg p-3">
                      <div className="font-semibold text-gray-900">{data.weekFull}</div>
                      <div className="text-sm text-gray-600 mt-1">{data.hours} hours</div>
                      <div className="text-xs mt-1" style={{ color: data.color }}>
                        {getCapacityLabel(data.capacity)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {weeklyTrendData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Initiatives This Week */}
      {topInitiatives.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Effort Initiatives This Week</h3>
          <div className="space-y-2">
            {topInitiatives.map(({ initiative, hours, trend }) => (
              <div
                key={initiative.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: WORK_TYPE_COLORS[initiative.type] || '#565658' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{initiative.initiative_name}</div>
                    <div className="text-xs text-gray-500">{initiative.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">{hours} hrs</span>
                  <span className="text-gray-400">{trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {currentWeekSummary.totalHours === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Effort Logged</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You haven't logged any effort for {formatWeekRange(selectedWeek)} yet.
            Switch to "Log Effort" view to start tracking your time.
          </p>
        </div>
      )}
        </>
      )}

      {/* Edit Initiative Modal */}
      {editingInitiative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 py-8">
            <div className="max-w-6xl w-full">
              <InitiativeSubmissionForm
                editingInitiative={editingInitiative}
                onClose={() => setEditingInitiative(null)}
                onSuccess={() => {
                  setEditingInitiative(null);
                  if (onInitiativesRefresh) {
                    onInitiativesRefresh();
                  }
                  loadEffortLogs(); // Refresh effort logs in case initiative details changed
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
