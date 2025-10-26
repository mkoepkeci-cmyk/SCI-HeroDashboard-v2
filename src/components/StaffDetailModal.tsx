import { X, Briefcase, Clock, Target, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Database } from '../lib/supabase';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type TeamMember = Database['public']['Tables']['team_members']['Row'];

interface StaffDetailModalProps {
  member: TeamMember & {
    assignments: Assignment[];
    capacity_warnings?: string;
    dashboard_metrics?: {
      active_hours_per_week: number;
      capacity_utilization: number;
    };
  };
  onClose: () => void;
}

const WORK_EFFORT_COLORS = {
  'XS': '#10B981', // green
  'S': '#3B82F6',  // blue
  'M': '#F59E0B',  // amber
  'L': '#EF4444',  // red
  'XL': '#DC2626', // dark red
};

const WORK_TYPE_COLORS = [
  '#00A1E0', // blue
  '#9B2F6A', // magenta
  '#6F47D0', // purple
  '#F58025', // orange
  '#22C55E', // green
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
];

const STATUS_COLORS: Record<string, string> = {
  'Active': '#22C55E',
  'Planning': '#3B82F6',
  'On Hold': '#F59E0B',
  'Completed': '#9CA3AF',
  'Cancelled': '#EF4444',
};

const WORK_EFFORT_HOURS: Record<string, number> = {
  'XS': 0.5,
  'S': 1.5,
  'M': 3.5,
  'L': 7.5,
  'XL': 15,
};

// Helper function to extract effort code from full text
function parseWorkEffort(effort: string | null | undefined): string | null {
  if (!effort) return null;

  // If it's already just a code (XS, S, M, L, XL), return it
  if (/^(XS|S|M|L|XL)$/.test(effort)) return effort;

  // Extract code from formats like "S - 1-2 hrs/wk" or "M - 2-5 hrs/wk"
  const match = effort.match(/^(XS|S|M|L|XL)\s*-/);
  return match ? match[1] : null;
}

// Helper function to get hours from work effort string
function getWorkEffortHours(effort: string | null | undefined): number {
  const code = parseWorkEffort(effort);
  return code ? WORK_EFFORT_HOURS[code] || 0 : 0;
}

export default function StaffDetailModal({ member, onClose }: StaffDetailModalProps) {
  const [showMissingDataDetails, setShowMissingDataDetails] = useState(false);

  // Debug logging
  console.log('StaffDetailModal - member:', member.name);
  console.log('StaffDetailModal - assignments count:', member.assignments?.length || 0);
  console.log('StaffDetailModal - sample assignment:', member.assignments?.[0]);

  // Filter to ACTIVE assignments only
  const activeStatuses = ['Active', 'Planning', 'Not Started', 'In Progress'];
  const activeAssignments = (member.assignments || []).filter(a =>
    a.status && activeStatuses.includes(a.status)
  );

  // Calculate work type breakdown (ACTIVE assignments only)
  const workTypeBreakdown = activeAssignments.reduce((acc, assignment) => {
    const type = assignment.work_type || 'Unknown';
    const hours = getWorkEffortHours(assignment.work_effort);

    if (!acc[type]) {
      acc[type] = { name: type, count: 0, hours: 0 };
    }
    acc[type].count++;
    if (hours > 0) {
      acc[type].hours += hours;
    }
    return acc;
  }, {} as Record<string, { name: string; count: number; hours: number }>);

  const workTypeData = Object.values(workTypeBreakdown)
    .sort((a, b) => b.hours - a.hours);

  // Calculate work effort breakdown (ACTIVE assignments only)
  const workEffortBreakdown = activeAssignments.reduce((acc, assignment) => {
    const code = parseWorkEffort(assignment.work_effort) || 'Unknown';
    const hours = getWorkEffortHours(assignment.work_effort);

    if (!acc[code]) {
      acc[code] = { name: code, count: 0, hours: 0 };
    }
    acc[code].count++;
    acc[code].hours += hours;
    return acc;
  }, {} as Record<string, { name: string; count: number; hours: number }>);

  const workEffortData = ['XS', 'S', 'M', 'L', 'XL', 'Unknown']
    .filter(effort => workEffortBreakdown[effort])
    .map(effort => workEffortBreakdown[effort]);

  // Calculate status breakdown (ALL assignments to show complete picture)
  const statusBreakdown = (member.assignments || []).reduce((acc, assignment) => {
    const status = assignment.status || 'Unknown';
    if (!acc[status]) {
      acc[status] = { name: status, count: 0 };
    }
    acc[status].count++;
    return acc;
  }, {} as Record<string, { name: string; count: number }>);

  const statusData = Object.values(statusBreakdown)
    .sort((a, b) => b.count - a.count);

  // Calculate data quality - check ALL fields
  // Use ACTIVE assignments only (already filtered at top of component)
  const totalAssignments = activeAssignments.length;
  const hasEffort = activeAssignments.filter(a => a.work_effort).length;
  const missingEffort = totalAssignments - hasEffort;

  // Check for all missing data types (only for ACTIVE assignments)
  const assignmentsWithMissingData = activeAssignments.map(assignment => {
    const missingFields: string[] = [];
    if (!assignment.work_effort) missingFields.push('Work Effort');
    if (!assignment.phase) missingFields.push('Phase');
    if (!assignment.role_type) missingFields.push('Role Type');

    return {
      assignment,
      missingFields
    };
  }).filter(item => item.missingFields.length > 0);

  const totalMissingDataCount = assignmentsWithMissingData.length;
  const completionRate = totalAssignments > 0 ? ((totalAssignments - totalMissingDataCount) / totalAssignments) * 100 : 100;

  // Use dashboard_metrics for accurate capacity data (matches Workload tab)
  const totalHours = member.dashboard_metrics?.active_hours_per_week || 0;
  const capacityPercentage = member.dashboard_metrics?.capacity_utilization
    ? Math.round(member.dashboard_metrics.capacity_utilization * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#9B2F6A] text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{member.name}</h2>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{totalAssignments} Active Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{totalHours.toFixed(1)}h/wk</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{capacityPercentage}% Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{completionRate.toFixed(0)}% Data Complete</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Data Quality Alert (if any missing data) */}
        {totalMissingDataCount > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 mb-0">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Incomplete Assignment Data</p>
                <p className="text-red-800 text-sm">
                  {totalMissingDataCount} of {totalAssignments} assignments have missing data fields.
                  {missingEffort > 0 && ' Work effort data is required for accurate capacity calculation.'}
                </p>
                <button
                  onClick={() => setShowMissingDataDetails(!showMissingDataDetails)}
                  className="mt-2 text-sm font-semibold text-red-700 hover:text-red-900 flex items-center gap-1"
                >
                  {showMissingDataDetails ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show Missing Assignments ({totalMissingDataCount})
                    </>
                  )}
                </button>
                {showMissingDataDetails && (
                  <div className="mt-3 bg-white border border-red-200 rounded-lg max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-red-100 sticky top-0">
                        <tr>
                          <th className="text-left p-2 font-semibold text-red-900">Assignment Name</th>
                          <th className="text-left p-2 font-semibold text-red-900">Work Type</th>
                          <th className="text-left p-2 font-semibold text-red-900">Status</th>
                          <th className="text-left p-2 font-semibold text-red-900">Missing Fields</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignmentsWithMissingData.map((item, idx) => (
                          <tr key={item.assignment.id} className={idx % 2 === 0 ? 'bg-red-50' : 'bg-white'}>
                            <td className="p-2 text-gray-900">
                              {item.assignment.assignment_name || 'Unnamed Assignment'}
                            </td>
                            <td className="p-2 text-gray-700">
                              {item.assignment.work_type || 'N/A'}
                            </td>
                            <td className="p-2">
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${STATUS_COLORS[item.assignment.status] || '#9CA3AF'}20`,
                                  color: STATUS_COLORS[item.assignment.status] || '#9CA3AF'
                                }}
                              >
                                {item.assignment.status || 'N/A'}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {item.missingFields.map((field, fieldIdx) => (
                                  <span
                                    key={fieldIdx}
                                    className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work Type Breakdown - Hours */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#9B2F6A]" />
                Work Type Distribution (Hours/Week)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workTypeData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.hours.toFixed(1)}h`}
                    labelLine={true}
                  >
                    {workTypeData.map((entry, index) => (
                      <Cell key={entry.name} fill={WORK_TYPE_COLORS[index % WORK_TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)} hrs/wk`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {workTypeData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: WORK_TYPE_COLORS[index % WORK_TYPE_COLORS.length] }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span>{item.count} assignments</span>
                      <span className="font-semibold">{item.hours.toFixed(1)}h/wk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Effort Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00A1E0]" />
                Work Effort Sizing
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workEffortData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => value}
                    labelFormatter={(label) => `Size: ${label}`}
                  />
                  <Bar dataKey="count" fill="#00A1E0" name="Count" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {workEffortData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: WORK_EFFORT_COLORS[item.name as keyof typeof WORK_EFFORT_COLORS] || '#9CA3AF' }}
                      />
                      <span className="text-gray-700 font-medium">{item.name}</span>
                      <span className="text-gray-500 text-xs">
                        ({WORK_EFFORT_HOURS[item.name] || 0}h each)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span>{item.count} assignments</span>
                      <span className="font-semibold">{item.hours.toFixed(1)}h/wk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#6F47D0]" />
                Assignment Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6F47D0" name="Assignments" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item.name] || '#9CA3AF' }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-gray-600 font-semibold">{item.count} assignments</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#F58025]" />
                Capacity Summary
              </h3>
              <div className="space-y-6">
                {/* Capacity Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Capacity</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {capacityPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(capacityPercentage, 100)}%`,
                        backgroundColor: capacityPercentage >= 100 ? '#EF4444' : capacityPercentage >= 80 ? '#F59E0B' : '#22C55E'
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-900">{totalHours.toFixed(1)}h</div>
                    <div className="text-sm text-blue-700">Active Hours/Week</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-gray-900">{member.available_hours || 40}h</div>
                    <div className="text-sm text-gray-700">Available Hours</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-900">{hasEffort}</div>
                    <div className="text-sm text-green-700">With Work Effort</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-amber-900">{missingEffort}</div>
                    <div className="text-sm text-amber-700">Missing Effort Data</div>
                  </div>
                </div>

                {/* Data Quality Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Data Completeness</span>
                    <span className="text-lg font-bold text-gray-900">
                      {completionRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${completionRate}%`,
                        backgroundColor: completionRate >= 90 ? '#22C55E' : completionRate >= 70 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Last updated: {new Date(member.updated_at || member.created_at).toLocaleDateString()}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#7d2555] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
