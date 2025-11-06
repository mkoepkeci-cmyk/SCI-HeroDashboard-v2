import { useState, useRef, useEffect } from 'react';
import { supabase, TeamMember, Manager, TEAM_MEMBER_ROLES, getTeamMemberDisplayName, getManagerDisplayName } from '../lib/supabase';
import { Users, Edit, Trash2, Plus, X, Save } from 'lucide-react';

interface TeamManagementPanelProps {
  teamMembers: TeamMember[];
  managers: Manager[];
  onTeamMemberUpdate: () => void;
}

export function TeamManagementPanel({ teamMembers, managers, onTeamMemberUpdate }: TeamManagementPanelProps) {
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editFormRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    role: string;
    specialty: string[];
    is_active: boolean;
  }>({
    first_name: '',
    last_name: '',
    role: 'System CI',
    specialty: [],
    is_active: true,
  });

  // Scroll to edit form when it opens
  useEffect(() => {
    if ((editingMember || isAddingNew) && editFormRef.current) {
      editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editingMember, isAddingNew]);

  const handleEdit = (member: TeamMember) => {
    console.log('[TeamManagementPanel] handleEdit - member data:', member);
    console.log('[TeamManagementPanel] handleEdit - specialty field:', member.specialty);
    console.log('[TeamManagementPanel] handleEdit - specialty type:', typeof member.specialty);

    // Parse specialty - it could be an array, JSON string, or null
    let specialtyArray: string[] = [];
    if (member.specialty) {
      if (Array.isArray(member.specialty)) {
        specialtyArray = member.specialty;
      } else if (typeof member.specialty === 'string') {
        try {
          const parsed = JSON.parse(member.specialty);
          if (Array.isArray(parsed)) {
            specialtyArray = parsed;
          } else {
            // Single string value
            specialtyArray = [member.specialty];
          }
        } catch (e) {
          // If parse fails, treat as single item
          specialtyArray = [member.specialty];
        }
      }
    }

    console.log('[TeamManagementPanel] handleEdit - parsed specialty array:', specialtyArray);

    setEditingMember(member);
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      role: member.role,
      specialty: specialtyArray,
      is_active: member.is_active !== undefined ? member.is_active : true,
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingMember(null);
    setFormData({
      first_name: '',
      last_name: '',
      role: 'System CI',
      specialty: [],
      is_active: true,
    });
    setIsAddingNew(true);
  };

  const handleCancel = () => {
    setEditingMember(null);
    setIsAddingNew(false);
    setFormData({
      first_name: '',
      last_name: '',
      role: 'System CI',
      specialty: [],
      is_active: true,
    });
    setError(null);
  };

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }

    console.log('[TeamManagementPanel] Saving team member with specialty:', formData.specialty);

    setSaving(true);

    try {
      if (isAddingNew) {
        // Create new team member
        const insertData = {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          name: `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim(),
          role: formData.role,
          specialty: formData.specialty.length > 0 ? formData.specialty : null,
          is_active: formData.is_active,
          total_assignments: 0,
        };
        console.log('[TeamManagementPanel] Inserting:', insertData);

        const { error: insertError } = await supabase
          .from('team_members')
          .insert(insertData);

        if (insertError) throw insertError;
      } else if (editingMember) {
        // Update existing team member
        const updateData = {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          name: `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim(),
          role: formData.role,
          specialty: formData.specialty.length > 0 ? formData.specialty : null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        };
        console.log('[TeamManagementPanel] Updating member', editingMember.id, 'with:', updateData);

        const { data: updatedMember, error: updateError } = await supabase
          .from('team_members')
          .update(updateData)
          .eq('id', editingMember.id)
          .select()
          .single();

        if (updateError) throw updateError;
        console.log('[TeamManagementPanel] Update successful');
        console.log('[TeamManagementPanel] Updated member returned from DB:', updatedMember);
        console.log('[TeamManagementPanel] Specialty in DB response:', updatedMember?.specialty);
      }

      // Small delay to ensure DB commit completes before refresh
      await new Promise(resolve => setTimeout(resolve, 100));

      onTeamMemberUpdate();
      handleCancel();
    } catch (err) {
      console.error('[TeamManagementPanel] Error saving team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    console.log('🗑️ Attempting to delete:', member.name, member.id);

    // Count initiatives assigned to this member
    const { count, error: countError } = await supabase
      .from('initiatives')
      .select('*', { count: 'exact', head: true })
      .eq('team_member_id', member.id)
      .neq('status', 'Deleted');

    if (countError) {
      console.error('Error counting initiatives:', countError);
    }

    const initiativeCount = count || 0;
    console.log('📊 Initiative count:', initiativeCount);

    const message = `Are you sure you want to delete ${getTeamMemberDisplayName(member)}?\n\n` +
      (initiativeCount > 0
        ? `${initiativeCount} initiative(s) will be UNASSIGNED (not deleted) and can be reassigned from Workload → Team → Unassigned tab.\n\n`
        : '') +
      `Effort logs and summaries will be permanently deleted.\n\n` +
      `This action cannot be undone.`;

    console.log('⚠️ Showing confirmation dialog');
    if (!confirm(message)) {
      console.log('❌ User cancelled deletion');
      return;
    }

    console.log('✅ User confirmed deletion, proceeding...');

    try {
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', member.id);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      console.log('✅ Delete successful, refreshing data...');
      onTeamMemberUpdate();
    } catch (err) {
      console.error('❌ Error deleting team member:', err);
      alert('Failed to delete team member: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const toggleSpecialty = (specialty: string) => {
    console.log('[TeamManagementPanel] toggleSpecialty called with:', specialty);
    console.log('[TeamManagementPanel] Current specialty array:', formData.specialty);

    setFormData(prev => {
      const newSpecialty = prev.specialty.includes(specialty)
        ? prev.specialty.filter(s => s !== specialty)
        : [...prev.specialty, specialty];

      console.log('[TeamManagementPanel] New specialty array:', newSpecialty);

      return {
        ...prev,
        specialty: newSpecialty,
      };
    });
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'Unassigned';
    const manager = managers.find(m => m.id === managerId);
    return manager ? getManagerDisplayName(manager) : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#9B2F6A]" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Team Members</h3>
            <p className="text-sm text-gray-600">{teamMembers.length} active team members</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#7d2555] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Edit/Add Form */}
      {(editingMember || isAddingNew) && (
        <div ref={editFormRef} className="bg-white border-2 border-[#9B2F6A] rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {isAddingNew ? 'Add New Team Member' : `Edit ${getTeamMemberDisplayName(editingMember!)}`}
            </h4>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
                placeholder="First name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
                placeholder="Last name"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
              >
                {TEAM_MEMBER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Active/Inactive Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Manager (Read-only with link) */}
            {editingMember && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {getManagerName(editingMember.manager_id)}
                  <span className="text-xs text-gray-500 ml-2">(edit in Managers tab)</span>
                </div>
              </div>
            )}
          </div>

          {/* Service Lines Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Lines
              <span className="text-xs text-gray-500 ml-2 font-normal">
                (Select service lines this team member supports - does not create initiatives)
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {[
                'Ambulatory',
                'Pharmacy',
                'Nursing',
                'Pharmacy & Oncology',
                'Cardiology',
                'Emergency Department',
                'Inpatient',
                'Perioperative',
                'Laboratory',
                'Radiology',
                'Revenue Cycle',
                'Other'
              ].map(serviceLine => (
                <label
                  key={serviceLine}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:bg-white px-2 py-1 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.specialty.includes(serviceLine)}
                    onChange={() => toggleSpecialty(serviceLine)}
                    className="rounded border-gray-300 text-[#9B2F6A] focus:ring-[#9B2F6A]"
                  />
                  {serviceLine}
                </label>
              ))}
            </div>
            {formData.specialty.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {formData.specialty.length} selected: {formData.specialty.join(', ')}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#7d2555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Team Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Lines
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manager
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No team members found. Click "Add Team Member" to create one.
                </td>
              </tr>
            ) : (
              teamMembers.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getTeamMemberDisplayName(member)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        // Parse specialty field - it may be a JSON string instead of array
                        let specialtyArray: string[] = [];
                        if (member.specialty) {
                          if (Array.isArray(member.specialty)) {
                            specialtyArray = member.specialty;
                          } else if (typeof member.specialty === 'string') {
                            try {
                              const parsed = JSON.parse(member.specialty);
                              if (Array.isArray(parsed)) {
                                specialtyArray = parsed;
                              }
                            } catch (e) {
                              // If parse fails, treat as single item
                              specialtyArray = [member.specialty];
                            }
                          }
                        }

                        if (specialtyArray.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-1">
                              {specialtyArray.slice(0, 2).map(s => (
                                <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  {s}
                                </span>
                              ))}
                              {specialtyArray.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  +{specialtyArray.length - 2} more
                                </span>
                              )}
                            </div>
                          );
                        } else {
                          return <span className="text-gray-400 text-xs">None assigned</span>;
                        }
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getManagerName(member.manager_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit team member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('🖱️ DELETE BUTTON CLICKED for:', member.name);
                          handleDelete(member);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete team member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
