import { useState } from 'react';
import { Plus, Edit, UserX, UserCheck, X, Users as UsersIcon } from 'lucide-react';
import { supabase, Manager, TeamMember, getManagerDisplayName, getTeamMemberDisplayName } from '../lib/supabase';

interface ManagersPanelProps {
  managers: Manager[];
  teamMembers: TeamMember[];
  onManagerUpdate: () => void;
}

export function ManagersPanel({ managers, teamMembers, onManagerUpdate }: ManagersPanelProps) {
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [assigningTeamFor, setAssigningTeamFor] = useState<Manager | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const getTeamSize = (managerId: string) => {
    return teamMembers.filter(m => m.manager_id === managerId).length;
  };

  const handleOpenAddForm = () => {
    setFormData({ firstName: '', lastName: '', email: '' });
    setEditingManager(null);
    setShowAddForm(true);
  };

  const handleOpenEditForm = (manager: Manager) => {
    setFormData({
      firstName: manager.first_name,
      lastName: manager.last_name,
      email: manager.email || '',
    });
    setEditingManager(manager);
    setShowAddForm(true);
  };

  const handleSaveManager = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First name and last name are required');
      return;
    }

    try {
      if (editingManager) {
        // Update existing manager
        const { error } = await supabase
          .from('managers')
          .update({
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            email: formData.email.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingManager.id);

        if (error) throw error;
      } else {
        // Create new manager
        const { error } = await supabase
          .from('managers')
          .insert([{
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            email: formData.email.trim() || null,
            is_active: true,
          }]);

        if (error) throw error;
      }

      onManagerUpdate();
      setShowAddForm(false);
      setEditingManager(null);
    } catch (err) {
      console.error('Error saving manager:', err);
      alert('Failed to save manager. Check console for details.');
    }
  };

  const handleToggleActive = async (manager: Manager) => {
    if (!confirm(`${manager.is_active ? 'Deactivate' : 'Activate'} ${getManagerDisplayName(manager)}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('managers')
        .update({
          is_active: !manager.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', manager.id);

      if (error) throw error;
      onManagerUpdate();
    } catch (err) {
      console.error('Error toggling manager active status:', err);
      alert('Failed to update manager status. Check console for details.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Managers ({managers.length})</h3>
          <p className="text-sm text-gray-600 mt-1">Manage team leaders and assign SCIs to their teams</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8B2858] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Manager
        </button>
      </div>

      {/* Managers Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Manager Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Team Size</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Active</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {managers.map(manager => (
              <tr key={manager.id} className={!manager.is_active ? 'bg-gray-50 opacity-60' : ''}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {getManagerDisplayName(manager)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {manager.email || '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <UsersIcon className="w-3 h-3" />
                    {getTeamSize(manager.id)} SCIs
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {manager.is_active ? (
                    <span className="text-green-600 font-semibold">✓ Yes</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setAssigningTeamFor(manager)}
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 rounded transition-colors"
                      title="Assign team members"
                    >
                      <UsersIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditForm(manager)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                      title="Edit manager"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(manager)}
                      className={`${
                        manager.is_active
                          ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      } p-1 rounded transition-colors`}
                      title={manager.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {manager.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {managers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No managers found. Click "Add Manager" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Manager Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingManager ? 'Edit Manager' : 'Add New Manager'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingManager(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  First Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
                  placeholder="Carrie"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
                  placeholder="Rodriguez"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
                  placeholder="carrie.rodriguez@example.com (optional)"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingManager(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManager}
                className="flex-1 px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8B2858] transition-colors"
              >
                {editingManager ? 'Save Changes' : 'Add Manager'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Assignment Modal */}
      {assigningTeamFor && (
        <TeamAssignmentModal
          manager={assigningTeamFor}
          teamMembers={teamMembers}
          onClose={() => setAssigningTeamFor(null)}
          onSave={onManagerUpdate}
        />
      )}
    </div>
  );
}

// Team Assignment Modal Component
interface TeamAssignmentModalProps {
  manager: Manager;
  teamMembers: TeamMember[];
  onClose: () => void;
  onSave: () => void;
}

function TeamAssignmentModal({ manager, teamMembers, onClose, onSave }: TeamAssignmentModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(teamMembers.filter(m => m.manager_id === manager.id).map(m => m.id))
  );
  const [saving, setSaving] = useState(false);

  const assignedMembers = teamMembers.filter(m => selectedMembers.has(m.id));
  const unassignedMembers = teamMembers.filter(m => !selectedMembers.has(m.id));

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update all team members: set manager_id for selected, null for unselected
      for (const member of teamMembers) {
        const shouldBeAssigned = selectedMembers.has(member.id);
        const isCurrentlyAssigned = member.manager_id === manager.id;

        // Only update if assignment changed
        if (shouldBeAssigned !== isCurrentlyAssigned) {
          const { error } = await supabase
            .from('team_members')
            .update({
              manager_id: shouldBeAssigned ? manager.id : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', member.id);

          if (error) throw error;
        }
      }

      await onSave();
      onClose();
    } catch (err) {
      console.error('Error saving team assignments:', err);
      alert('Failed to save team assignments. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Assign Team Members to {getManagerDisplayName(manager)}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Click team members to move them between assigned and unassigned lists
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Assigned Column */}
          <div>
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-2">
              <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                {manager.first_name}'s Team ({assignedMembers.length})
              </h4>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50 space-y-1 min-h-[300px]">
              {assignedMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className="w-full text-left px-3 py-2 bg-white border border-purple-300 rounded hover:bg-purple-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{getTeamMemberDisplayName(member)}</div>
                  {member.specialty && Array.isArray(member.specialty) && member.specialty.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                      {member.specialty.slice(0, 2).map(s => (
                        <span key={s} className="bg-blue-100 text-blue-700 px-1 rounded">{s}</span>
                      ))}
                      {member.specialty.length > 2 && (
                        <span className="text-gray-400">+{member.specialty.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
              {assignedMembers.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No team members assigned yet
                </div>
              )}
            </div>
          </div>

          {/* Unassigned Column */}
          <div>
            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-2">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Not Assigned ({unassignedMembers.length})
              </h4>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50 space-y-1 min-h-[300px]">
              {unassignedMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">{getTeamMemberDisplayName(member)}</div>
                  {member.specialty && Array.isArray(member.specialty) && member.specialty.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                      {member.specialty.slice(0, 2).map(s => (
                        <span key={s} className="bg-blue-100 text-blue-700 px-1 rounded">{s}</span>
                      ))}
                      {member.specialty.length > 2 && (
                        <span className="text-gray-400">+{member.specialty.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
              {unassignedMembers.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  All team members assigned
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8B2858] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Team Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
}
