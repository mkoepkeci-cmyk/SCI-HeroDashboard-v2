import { useState } from 'react';
import { Loader2, X } from 'lucide-react';

interface TeamMemberSummary {
  id: string;
  name: string;
  capacity_utilization: number;
  active_hours_per_week: number;
  available_hours: number;
  workTypes: { [key: string]: number };
  assignments: Array<{
    id: string;
    assignment_name: string;
    work_type: string;
    work_effort?: string;
    status: string;
    phase?: string;
  }>;
}

interface LoadBalanceModalProps {
  fromMember: TeamMemberSummary;
  allMembers: TeamMemberSummary[];
  onClose: () => void;
}

export function LoadBalanceModal({ fromMember, allMembers, onClose }: LoadBalanceModalProps) {
  const [toMember, setToMember] = useState<TeamMemberSummary | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');

  const analyzeLoadBalance = async () => {
    if (!toMember) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Build focused context with ONLY these two members' detailed data
      const context = {
        loadBalanceRequest: {
          from: {
            name: fromMember.name,
            capacity: Math.round(fromMember.capacity_utilization * 100),
            activeHours: fromMember.active_hours_per_week,
            availableHours: fromMember.available_hours,
            workTypes: fromMember.workTypes,
            // INCLUDE detailed assignments for source SCI
            assignments: fromMember.assignments.map(a => ({
              id: a.id,
              name: a.assignment_name,
              workType: a.work_type,
              workEffort: a.work_effort,
              status: a.status,
              phase: a.phase,
            })),
          },
          to: {
            name: toMember.name,
            capacity: Math.round(toMember.capacity_utilization * 100),
            activeHours: toMember.active_hours_per_week,
            availableHours: toMember.available_hours,
            workTypes: toMember.workTypes,
            // Include assignments to see existing workload
            assignments: toMember.assignments.map(a => ({
              name: a.assignment_name,
              workType: a.work_type,
              workEffort: a.work_effort,
            })),
          },
        },
      };

      // Call AI API with load balance specific prompt
      const response = await fetch('/api/load-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: JSON.stringify(context, null, 2),
          question: `Analyze the workload imbalance between ${fromMember.name} (${Math.round(fromMember.capacity_utilization * 100)}% capacity) and ${toMember.name} (${Math.round(toMember.capacity_utilization * 100)}% capacity). Recommend which specific assignments to move from ${fromMember.name} to ${toMember.name} to achieve better balance. Prioritize assignments that match ${toMember.name}'s existing work types and that would have the most impact on balancing the load.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setAiRecommendations(data.message);
    } catch (err) {
      console.error('Load balance analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze workload');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              ⚖️ Load Balance Workload
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Source and Target Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* From Member (Overloaded) */}
            <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
              <div className="text-sm text-gray-600 mb-1 font-medium">From (Overloaded)</div>
              <div className="font-bold text-xl mb-2">{fromMember.name}</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Capacity:</span>
                  <span className="text-red-600 font-bold text-lg">
                    {Math.round(fromMember.capacity_utilization * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hours/week:</span>
                  <span className="font-semibold">{fromMember.active_hours_per_week.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Assignments:</span>
                  <span className="font-semibold">{fromMember.assignments.length}</span>
                </div>
              </div>
            </div>

            {/* To Member (Available Capacity) */}
            <div className={`border-2 rounded-lg p-4 ${toMember ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
              <div className="text-sm text-gray-600 mb-1 font-medium">To (Available Capacity)</div>
              <select
                value={toMember?.id || ''}
                onChange={(e) => {
                  const member = allMembers.find(m => m.id === e.target.value);
                  setToMember(member || null);
                  setAiRecommendations(''); // Clear previous recommendations
                }}
                className="w-full p-2 border rounded-lg mb-3 font-semibold"
              >
                <option value="">Select team member...</option>
                {allMembers
                  .filter(m => m.id !== fromMember.id)
                  .sort((a, b) => a.capacity_utilization - b.capacity_utilization)
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {Math.round(m.capacity_utilization * 100)}% capacity
                    </option>
                  ))
                }
              </select>

              {toMember && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-green-600 font-bold text-lg">
                      {Math.round(toMember.capacity_utilization * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hours/week:</span>
                    <span className="font-semibold">{toMember.active_hours_per_week.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available:</span>
                    <span className="font-semibold text-green-600">{toMember.available_hours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Assignments:</span>
                    <span className="font-semibold">{toMember.assignments.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeLoadBalance}
            disabled={!toMember || isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-[#9B2F6A] to-[#6F47D0] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-4"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing with AI...
              </>
            ) : (
              <>
                🤖 Analyze with AI
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-800 font-semibold">Error</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {/* AI Recommendations */}
          {aiRecommendations && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <h3 className="font-bold text-lg">AI Recommendations</h3>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
                {aiRecommendations}
              </div>
            </div>
          )}

          {/* Help Text */}
          {!aiRecommendations && !isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <div className="font-semibold mb-1">💡 How it works:</div>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Select a team member with available capacity</li>
                <li>AI will analyze all of {fromMember.name}'s assignments</li>
                <li>Get specific recommendations on which assignments to move</li>
                <li>AI considers work type match, effort size, and overall impact</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
