import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase, TeamMember, InitiativeWithDetails } from '../lib/supabase';
import { AssignmentTab } from './OtherWorkForm/AssignmentTab';
import { CollaborationTab } from './OtherWorkForm/CollaborationTab';

interface TeamMemberAssignment {
  teamMemberId: string;
  teamMemberName: string;
  role: string;
}

interface OtherWorkFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  editingInitiative?: InitiativeWithDetails;
}

export const OtherWorkForm = ({ onClose, onSuccess, editingInitiative }: OtherWorkFormProps) => {
  const [activeTab, setActiveTab] = useState<'assignment' | 'collaboration'>('assignment');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const isEditing = !!editingInitiative;

  // Tab 1: Assignment & Work Details
  const [assignmentData, setAssignmentData] = useState({
    title: editingInitiative?.initiative_name || '',
    workType: editingInitiative?.type || '',
    status: editingInitiative?.status || 'Not Started',
    phase: editingInitiative?.phase || '',
    workEffort: editingInitiative?.work_effort || 'M',
    ehrsImpacted: editingInitiative?.ehrs_impacted || '',
    serviceLine: editingInitiative?.service_line || '',
    startDate: editingInitiative?.start_date || '',
    endDate: editingInitiative?.end_date || '',
    timeframeDisplay: editingInitiative?.timeframe_display || '',
    directHoursPerWeek: editingInitiative?.direct_hours_per_week?.toString() || ''
  });

  const [teamMemberAssignments, setTeamMemberAssignments] = useState<TeamMemberAssignment[]>([{
    teamMemberId: editingInitiative?.team_member_id || '',
    teamMemberName: editingInitiative?.owner_name || '',
    role: editingInitiative?.role || ''
  }]);

  // Tab 2: Governance & Collaboration
  const [collaborationData, setCollaborationData] = useState({
    clinicalSponsorName: editingInitiative?.clinical_sponsor_name || '',
    clinicalSponsorTitle: editingInitiative?.clinical_sponsor_title || '',
    governanceBodies: editingInitiative?.governance_bodies?.join(', ') || '',
    keyCollaborators: editingInitiative?.key_collaborators?.join(', ') || ''
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!assignmentData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!assignmentData.workType) {
        throw new Error('Work Type is required');
      }
      if (!assignmentData.status) {
        throw new Error('Status is required');
      }

      // Get first assignment for primary fields
      const firstAssignment = teamMemberAssignments[0];

      // Validate team member assignment
      if (!firstAssignment?.teamMemberId) {
        throw new Error('At least one SCI team member must be assigned');
      }

      const selectedMember = teamMembers.find(m => m.id === firstAssignment.teamMemberId);

      const initiativeData: any = {
        initiative_name: assignmentData.title,
        type: assignmentData.workType,
        status: assignmentData.status,
        phase: assignmentData.phase || null,
        work_effort: assignmentData.workEffort || null,
        ehrs_impacted: assignmentData.ehrsImpacted || null,
        service_line: assignmentData.serviceLine || null,
        start_date: assignmentData.startDate || null,
        end_date: assignmentData.endDate || null,
        timeframe_display: assignmentData.timeframeDisplay || null,
        clinical_sponsor_name: collaborationData.clinicalSponsorName || null,
        clinical_sponsor_title: collaborationData.clinicalSponsorTitle || null,
        governance_bodies: collaborationData.governanceBodies
          ? collaborationData.governanceBodies.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        key_collaborators: collaborationData.keyCollaborators
          ? collaborationData.keyCollaborators.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        direct_hours_per_week: assignmentData.workType === 'Governance' && assignmentData.directHoursPerWeek
          ? parseFloat(assignmentData.directHoursPerWeek)
          : null,
        team_member_id: firstAssignment.teamMemberId,
        role: firstAssignment.role || 'Owner',
        owner_name: selectedMember?.name || '',
        is_draft: false,
        updated_at: new Date().toISOString()
      };

      console.log('Saving initiative with data:', initiativeData);
      console.log('Edit mode:', isEditing, 'Initiative ID:', editingInitiative?.id);

      if (isEditing && editingInitiative) {
        // Update existing initiative
        console.log('🔄 Updating initiative in database, ID:', editingInitiative.id);
        console.log('🔄 New status:', initiativeData.status);
        const { data: updateData, error: updateError } = await supabase
          .from('initiatives')
          .update(initiativeData)
          .eq('id', editingInitiative.id)
          .select();

        if (updateError) {
          console.error('❌ Database update error:', updateError);
          throw updateError;
        }
        console.log('✅ Database update successful:', updateData);
      } else {
        // Create new initiative
        const { error: insertError } = await supabase
          .from('initiatives')
          .insert(initiativeData);

        if (insertError) throw insertError;
      }

      // Success
      if (onSuccess) {
        await onSuccess();
      }
      onClose();

    } catch (err: any) {
      console.error('Error saving:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Work Item' : 'New Work Item'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quick entry for supporting work (Governance, Tickets, Projects, etc.)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'assignment'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assignment')}
            >
              Assignment & Work Details
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'collaboration'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('collaboration')}
            >
              Governance & Collaboration
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'assignment' && (
            <AssignmentTab
              data={assignmentData}
              setData={setAssignmentData}
              teamMembers={teamMembers}
              loadingMembers={loadingMembers}
              teamMemberAssignments={teamMemberAssignments}
              setTeamMemberAssignments={setTeamMemberAssignments}
            />
          )}
          {activeTab === 'collaboration' && (
            <CollaborationTab
              data={collaborationData}
              setData={setCollaborationData}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
