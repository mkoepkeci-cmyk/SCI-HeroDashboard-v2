import { useState, useEffect } from 'react';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, Initiative, TeamMember } from '../lib/supabase';
import ReassignModal from './ReassignModal';

interface UnassignedWorkViewProps {
  allTeamMembers: TeamMember[];
  onReassignComplete: () => void;
}

export const UnassignedWorkView = ({ allTeamMembers, onReassignComplete }: UnassignedWorkViewProps) => {
  const [systemInitiatives, setSystemInitiatives] = useState<Initiative[]>([]);
  const [otherWork, setOtherWork] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassigningInitiative, setReassigningInitiative] = useState<Initiative | null>(null);

  useEffect(() => {
    fetchUnassignedWork();
  }, []);

  const fetchUnassignedWork = async () => {
    try {
      setLoading(true);

      // Fetch all unassigned initiatives (team_member_id IS NULL)
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .is('team_member_id', null)
        .neq('status', 'Deleted')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Split into System Initiatives and Other Work
      const systemTypes = ['System Initiative', 'System Project'];
      const system = (data || []).filter(i => systemTypes.includes(i.type));
      const other = (data || []).filter(i => !systemTypes.includes(i.type));

      setSystemInitiatives(system);
      setOtherWork(other);
    } catch (error) {
      console.error('Error fetching unassigned work:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassignClick = (initiative: Initiative) => {
    setReassigningInitiative(initiative);
  };

  const handleReassignComplete = () => {
    setReassigningInitiative(null);
    fetchUnassignedWork();
    onReassignComplete();
  };

  const renderTable = (initiatives: Initiative[], title: string) => {
    if (initiatives.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium">No unassigned {title.toLowerCase()}</p>
            <p className="text-sm mt-1">All {title.toLowerCase()} are assigned to team members</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Initiative Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Service Line</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Request ID</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {initiatives.map((initiative) => (
              <tr key={initiative.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{initiative.initiative_name}</div>
                  {initiative.request_id && (
                    <div className="text-xs text-gray-500 mt-1">{initiative.request_id}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {initiative.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {initiative.service_line || '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    initiative.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    initiative.status === 'Not Started' ? 'bg-gray-100 text-gray-800' :
                    initiative.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                    initiative.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {initiative.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {initiative.request_id || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleReassignClick(initiative)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Reassign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading unassigned work...</div>
      </div>
    );
  }

  const totalUnassigned = systemInitiatives.length + otherWork.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unassigned Work</h2>
            <p className="text-gray-700">
              Initiatives that need to be assigned to a team member
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">{totalUnassigned}</div>
            <div className="text-sm text-gray-600 mt-1">Unassigned Items</div>
          </div>
        </div>

        {totalUnassigned > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Action Required:</strong> These initiatives were unassigned when their previous owner was deleted.
              Click "Reassign" to assign them to an active team member.
            </div>
          </div>
        )}
      </div>

      {/* System Initiatives Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">System Initiatives & Projects</h3>
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {systemInitiatives.length}
          </span>
        </div>
        {renderTable(systemInitiatives, 'System Initiatives & Projects')}
      </div>

      {/* Other Work Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Other Work</h3>
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
            {otherWork.length}
          </span>
        </div>
        {renderTable(otherWork, 'Other Work')}
      </div>

      {/* Empty State */}
      {totalUnassigned === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            All Work Assigned!
          </h3>
          <p className="text-gray-600">
            Great job! There are no unassigned initiatives. All work is assigned to active team members.
          </p>
        </div>
      )}

      {/* Reassign Modal */}
      {reassigningInitiative && (
        <ReassignModal
          initiative={reassigningInitiative}
          currentOwnerName={reassigningInitiative.owner_name}
          allTeamMembers={allTeamMembers}
          onClose={() => setReassigningInitiative(null)}
          onSuccess={handleReassignComplete}
        />
      )}
    </div>
  );
};
