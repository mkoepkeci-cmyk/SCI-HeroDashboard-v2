import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { supabase, GovernanceRequest } from '../lib/supabase';

interface SCIRequestsCardProps {
  teamMemberId: string;
  onRequestClick?: (request: GovernanceRequest) => void;
}

export const SCIRequestsCard = ({ teamMemberId, onRequestClick }: SCIRequestsCardProps) => {
  const [requests, setRequests] = useState<GovernanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSCIRequests();
  }, [teamMemberId]);

  const fetchSCIRequests = async () => {
    try {
      setLoading(true);

      // Fetch requests assigned to this SCI that need SCI work
      // Only Draft, Ready for Review, and Needs Refinement
      // (Once Ready for Governance, it moves to main initiative list)
      const { data, error } = await supabase
        .from('governance_requests')
        .select('*')
        .eq('assigned_sci_id', teamMemberId)
        .in('status', ['Draft', 'Ready for Review', 'Needs Refinement'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching SCI requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate counts by status
  const draftCount = requests.filter(r => r.status === 'Draft').length;
  const readyForReviewCount = requests.filter(r => r.status === 'Ready for Review').length;
  const needsRefinementCount = requests.filter(r => r.status === 'Needs Refinement').length;
  const activeCount = requests.length;

  // Only render if there are qualifying requests
  if (loading) {
    return null; // Don't show loading state, just hide until loaded
  }

  if (activeCount === 0) {
    return null; // Don't render if no requests
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-purple-900">Assigned System Requests</h3>
        </div>
        <div className="flex items-center gap-2">
          {readyForReviewCount > 0 && (
            <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
              {readyForReviewCount} Review
            </span>
          )}
          {draftCount > 0 && (
            <span className="bg-gray-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
              {draftCount} Draft
            </span>
          )}
          {needsRefinementCount > 0 && (
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
              {needsRefinementCount} Refine
            </span>
          )}
        </div>
      </div>

      {/* List of Requests */}
      <div className="space-y-1.5">
        {requests.slice(0, 5).map(request => {
          const statusColors: Record<string, string> = {
            'Ready for Review': 'bg-purple-100 text-purple-800 border-purple-300',
            'Draft': 'bg-gray-100 text-gray-800 border-gray-300',
            'Needs Refinement': 'bg-orange-100 text-orange-800 border-orange-300',
          };

          return (
            <div
              key={request.id}
              onClick={() => onRequestClick?.(request)}
              className="bg-white rounded p-2 border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{request.title}</p>
                  <p className="text-xs text-gray-500">{request.request_id}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border font-medium whitespace-nowrap ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                  {request.status}
                </span>
              </div>
            </div>
          );
        })}

        {requests.length > 5 && (
          <p className="text-xs text-purple-600 text-center py-1">
            + {requests.length - 5} more
          </p>
        )}
      </div>

      {/* Action Link */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <button
          onClick={() => {
            // Navigate to System Intake portal filtered to this SCI's requests
            window.location.hash = 'governance';
          }}
          className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline"
        >
          View All in System Intake Portal →
        </button>
      </div>
    </div>
  );
};
