import { useState } from 'react';
import { X, UserCircle, AlertCircle } from 'lucide-react';
import { supabase, InitiativeWithDetails, TeamMember } from '../lib/supabase';
import { recalculateDashboardMetrics } from '../lib/workloadCalculator';

interface ReassignModalProps {
  initiative: InitiativeWithDetails;
  allTeamMembers: TeamMember[];
  currentOwnerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReassignModal({
  initiative,
  allTeamMembers,
  currentOwnerName,
  onClose,
  onSuccess,
}: ReassignModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>(initiative.role || 'Owner');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = ['Owner', 'Co-Owner', 'Secondary', 'Support'];

  // Filter out current owner from list
  const availableMembers = allTeamMembers.filter(
    m => m.name !== currentOwnerName
  );

  const handleReassign = async () => {
    if (!selectedMemberId) {
      setError('Please select a team member');
      return;
    }

    const newOwner = allTeamMembers.find(m => m.id === selectedMemberId);
    if (!newOwner) {
      setError('Invalid team member selected');
      return;
    }

    // Get the old owner's team_member_id before reassignment
    const oldOwnerId = initiative.team_member_id;

    try {
      setSaving(true);
      setError(null);

      // Update initiative with new owner
      const { error: updateError } = await supabase
        .from('initiatives')
        .update({
          owner_name: newOwner.name,
          team_member_id: newOwner.id,
          role: selectedRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initiative.id);

      if (updateError) throw updateError;

      // Recalculate dashboard_metrics for both the old and new owners
      // This ensures workload updates immediately in the dashboard
      console.log('Recalculating dashboard metrics after reassignment...');

      const recalculations = [];

      // Recalculate for new owner
      recalculations.push(
        recalculateDashboardMetrics(newOwner.id)
          .then(() => console.log(`✓ Metrics updated for new owner: ${newOwner.name}`))
          .catch(err => console.error(`Error recalculating metrics for ${newOwner.name}:`, err))
      );

      // Recalculate for old owner (if we have their ID)
      if (oldOwnerId) {
        recalculations.push(
          recalculateDashboardMetrics(oldOwnerId)
            .then(() => console.log(`✓ Metrics updated for old owner`))
            .catch(err => console.error(`Error recalculating metrics for old owner:`, err))
        );
      }

      // Wait for all recalculations to complete
      await Promise.all(recalculations);

      // Success!
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error reassigning initiative:', err);
      setError('Failed to reassign initiative. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Reassign Initiative</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Initiative Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initiative
            </label>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="font-medium text-sm text-gray-900">
                {initiative.initiative_name}
              </div>
              {initiative.service_line && (
                <div className="text-xs text-gray-500 mt-1">
                  {initiative.service_line}
                </div>
              )}
            </div>
          </div>

          {/* Current Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Owner
            </label>
            <div className="p-2 bg-yellow-50 rounded border border-yellow-200 text-sm text-gray-700">
              {currentOwnerName}
            </div>
          </div>

          {/* New Owner Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reassign To <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a team member...</option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReassign}
            disabled={saving || !selectedMemberId}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Reassigning...' : 'Reassign'}
          </button>
        </div>
      </div>
    </div>
  );
}
