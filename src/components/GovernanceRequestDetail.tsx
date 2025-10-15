import { useState, useEffect } from 'react';
import { X, Save, FileText, DollarSign, Users, Clock, CheckCircle2, AlertCircle, Loader2, MessageSquare, Send, ArrowRight, Link as LinkIcon, Trash2 } from 'lucide-react';
import { supabase, GovernanceRequest, GovernanceComment, TeamMember, Initiative } from '../lib/supabase';
import { getStatusConfig, formatDate, formatDateTime, formatCurrency, getAvailableStatuses, DIVISION_REGIONS } from '../lib/governanceUtils';
import { convertGovernanceRequestToInitiative, approveGovernanceRequest, createInitiativeForAssignedRequest, populateInitiativeDetails } from '../lib/governanceConversion';

interface GovernanceRequestDetailProps {
  request: GovernanceRequest;
  onClose: () => void;
  onUpdate: () => void;  // Refresh parent data
  onEdit?: (request: GovernanceRequest) => void;  // Open form in edit mode
  onViewInitiative?: (initiativeId: string) => void; // Navigate to initiative view
}

export const GovernanceRequestDetail = ({ request, onClose, onUpdate, onEdit, onViewInitiative }: GovernanceRequestDetailProps) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<GovernanceComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [linkedInitiative, setLinkedInitiative] = useState<Initiative | null>(null);

  // Assignment state (for "Ready for Governance" conversion)
  const [assignedSciId, setAssignedSciId] = useState(request.assigned_sci_id || '');
  const [workEffort, setWorkEffort] = useState('');
  const [converting, setConverting] = useState(false);

  // Form state
  const [formData, setFormData] = useState(request);

  useEffect(() => {
    fetchComments();
    fetchTeamMembers();
    if (request.linked_initiative_id) {
      fetchLinkedInitiative();
    }
  }, [request.id]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('governance_comments')
      .select('*')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true });

    setComments(data || []);
  };

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('name', { ascending: true });

    setTeamMembers(data || []);
  };

  const fetchLinkedInitiative = async () => {
    if (!request.linked_initiative_id) return;

    const { data } = await supabase
      .from('initiatives')
      .select('*')
      .eq('id', request.linked_initiative_id)
      .single();

    setLinkedInitiative(data);
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log('handleStatusChange called with:', newStatus);
    console.log('Current request.id:', request.id);

    try {
      setSaving(true);

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Set submitted_date when changing to Ready for Review
      if (newStatus === 'Ready for Review' && !request.submitted_date) {
        updateData.submitted_date = new Date().toISOString();
        console.log('Setting submitted_date');
      }

      console.log('Updating with data:', updateData);

      const { error, data } = await supabase
        .from('governance_requests')
        .update(updateData)
        .eq('id', request.id)
        .select();

      console.log('Update result:', { error, data });

      if (error) throw error;

      // Phase 1: Create initiative when status changes to "Ready for Review" (if SCI is assigned)
      if (newStatus === 'Ready for Review' && formData.assigned_sci_id && !request.linked_initiative_id) {
        console.log('Phase 1: Creating minimal initiative for Ready for Review status...');
        const result = await createInitiativeForAssignedRequest(
          request.id,
          formData.assigned_sci_id,
          formData.assigned_sci_name || 'Unknown'
        );

        if (!result.success && !result.error?.includes('already exists')) {
          console.warn('Phase 1 failed:', result.error);
        } else {
          console.log('Phase 1 complete: Initiative created:', result.initiativeId);
        }
      }

      // Phase 2: Populate full details when status changes to "Ready for Governance"
      if (newStatus === 'Ready for Governance' && request.linked_initiative_id) {
        console.log('Phase 2: Populating full initiative details for Ready for Governance status...');
        const result = await populateInitiativeDetails(request.id);

        if (!result.success) {
          console.warn('Phase 2 failed:', result.error);
          alert(`Warning: Initiative details could not be populated: ${result.error}`);
        } else {
          console.log('Phase 2 complete: Initiative fully populated:', result.initiativeId);
        }
      }

      setFormData({ ...formData, status: newStatus } as any);
      onUpdate(); // Refresh parent
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error?.message || JSON.stringify(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSci = async () => {
    if (!assignedSciId || !workEffort) {
      alert('Please select an SCI and work effort estimate');
      return;
    }

    const selectedSci = teamMembers.find(tm => tm.id === assignedSciId);
    if (!selectedSci) return;

    try {
      setConverting(true);

      const result = await convertGovernanceRequestToInitiative({
        governanceRequestId: request.id,
        assignedSciId,
        assignedSciName: selectedSci.name,
        workEffort,
        convertedBy: 'System Reviewer' // In real app, would be current user
      });

      if (!result.success) {
        alert(result.error || 'Failed to create initiative');
        return;
      }

      // Success! Refresh data
      alert(`Initiative created successfully for ${selectedSci.name}!`);
      onUpdate();

    } catch (error: any) {
      console.error('Error converting request:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setConverting(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Mark this request as approved/completed by governance?')) return;

    try {
      setSaving(true);

      const result = await approveGovernanceRequest({
        governanceRequestId: request.id,
        approvedBy: 'System Reviewer'
      });

      if (!result.success) {
        alert(result.error || 'Failed to approve request');
        return;
      }

      alert('Request marked as approved! Linked initiative updated to Active status.');
      onUpdate();

    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      setPostingComment(true);

      const { error } = await supabase
        .from('governance_comments')
        .insert({
          request_id: request.id,
          author_name: 'System Reviewer', // In real app, current user
          comment_text: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();

    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ Are you sure you want to permanently delete this governance request?\n\nThis will delete:\n- The governance request\n- All associated comments\n- Any linked attachments or links\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);

      // Delete the request (CASCADE will handle comments, attachments, links)
      const { error } = await supabase
        .from('governance_requests')
        .delete()
        .eq('id', request.id);

      if (error) throw error;

      onUpdate(); // Refresh portal
      onClose(); // Close detail modal

    } catch (error: any) {
      console.error('Error deleting request:', error);
      alert(`Failed to delete request: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('governance_requests')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      setEditing(false);
      onUpdate();

    } catch (error) {
      console.error('Error saving request:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const statusConfig = getStatusConfig(formData.status);
  const canEdit = formData.status === 'Draft' || formData.status === 'Needs Refinement';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono font-medium text-purple-700">
                  {formData.request_id}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    color: statusConfig.color,
                    backgroundColor: statusConfig.bgColor,
                    border: `1px solid ${statusConfig.borderColor}`
                  }}
                >
                  {statusConfig.icon} {statusConfig.label}
                </span>
              </div>
              {editing ? (
                <input
                  className="text-2xl font-bold text-gray-900 w-full border-b-2 border-purple-300 focus:border-purple-600 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{formData.title}</h2>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Submitted by {formData.submitter_name} • Last updated {formatDateTime(formData.updated_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {/* Status Management Panel */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Status Management</h3>
            <div className="flex gap-3 items-center">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg p-2"
                disabled={saving}
              >
                {/* For Draft status, only show Ready for Review option */}
                {request.status === 'Draft' ? (
                  <>
                    <option value="Draft">Draft</option>
                    <option value="Ready for Review">Ready for Review</option>
                  </>
                ) : (
                  <>
                    <option value="Draft">Draft</option>
                    <option value="Ready for Review">Ready for Review</option>
                    <option value="Needs Refinement">Needs Refinement</option>
                    <option value="Ready for Governance">Ready for Governance</option>
                    <option value="Dismissed">Dismissed</option>
                  </>
                )}
              </select>
              <button
                onClick={() => handleStatusChange(formData.status)}
                disabled={saving || formData.status === request.status}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Status
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SCI Assignment Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assign SCI
            </h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  System Clinical Informaticist
                </label>
                <select
                  value={assignedSciId}
                  onChange={(e) => setAssignedSciId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select SCI...</option>
                  {teamMembers.map(tm => (
                    <option key={tm.id} value={tm.id}>{tm.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={async () => {
                  if (!assignedSciId) {
                    alert('Please select an SCI');
                    return;
                  }

                  const selectedSci = teamMembers.find(tm => tm.id === assignedSciId);
                  if (!selectedSci) return;

                  try {
                    setSaving(true);

                    // Update governance request with assigned SCI
                    const { error } = await supabase
                      .from('governance_requests')
                      .update({
                        assigned_sci_id: assignedSciId,
                        assigned_sci_name: selectedSci.name,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', request.id);

                    if (error) throw error;

                    // Note: Initiative will be created when status changes to "Ready for Review"
                    setFormData({ ...formData, assigned_sci_id: assignedSciId, assigned_sci_name: selectedSci.name });
                    onUpdate();

                  } catch (error: any) {
                    alert(`Failed to assign SCI: ${error.message}`);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={!assignedSciId || saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
            {formData.assigned_sci_name && (
              <p className="text-sm text-blue-700 mt-2">
                Currently assigned to: <strong>{formData.assigned_sci_name}</strong>
              </p>
            )}
          </div>

          {/* SCI Assignment Panel (Ready for Governance, not yet converted) */}
          {formData.status === 'Ready for Governance' && !request.linked_initiative_id && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                Assign SCI for Governance Prep
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                This request is ready for governance preparation. Assign an SCI to build the
                business case and supporting materials. An initiative will be created automatically.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    System Clinical Informaticist <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignedSciId}
                    onChange={(e) => setAssignedSciId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="">Select SCI...</option>
                    {teamMembers.map(tm => (
                      <option key={tm.id} value={tm.id}>{tm.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estimated Prep Effort <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={workEffort}
                    onChange={(e) => setWorkEffort(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="">Select effort size...</option>
                    <option value="XS">XS - Extra Small (1.5 hrs/week)</option>
                    <option value="S">S - Small (4 hrs/week)</option>
                    <option value="M">M - Medium (8 hrs/week)</option>
                    <option value="L">L - Large (13 hrs/week)</option>
                    <option value="XL">XL - Extra Large (18 hrs/week)</option>
                    <option value="XXL">XXL - Double XL (25 hrs/week)</option>
                  </select>
                </div>

                <button
                  onClick={handleAssignSci}
                  disabled={!assignedSciId || !workEffort || converting}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {converting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Initiative...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Assign SCI & Create Initiative
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Linked Initiative (if converted) */}
          {linkedInitiative && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {formData.status === 'Completed' ? 'Initiative Approved' : 'Initiative Created'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {formData.status === 'Completed'
                      ? `This request was approved on ${formatDate(request.approved_date)}. The initiative is now active for implementation.`
                      : `An initiative was created on ${formatDate(request.converted_at)} for ${request.assigned_sci_name} to prepare the governance materials.`
                    }
                  </p>
                  <p className="text-sm font-medium text-blue-900 mt-2">
                    {linkedInitiative.initiative_name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Status: {linkedInitiative.status} • Type: {linkedInitiative.type}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onViewInitiative && linkedInitiative) {
                      onViewInitiative(linkedInitiative.id);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Initiative →
                </button>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division/Region</label>
                {editing ? (
                  <select
                    value={formData.division_region}
                    onChange={(e) => setFormData({ ...formData, division_region: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    {DIVISION_REGIONS.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.division_region}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitter Email</label>
                <p className="text-gray-900">{formData.submitter_email}</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
              {editing ? (
                <textarea
                  rows={4}
                  value={formData.problem_statement}
                  onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{formData.problem_statement}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Desired Outcomes</label>
              {editing ? (
                <textarea
                  rows={4}
                  value={formData.desired_outcomes}
                  onChange={(e) => setFormData({ ...formData, desired_outcomes: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{formData.desired_outcomes}</p>
              )}
            </div>
          </div>

          {/* Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Patient Care Value
              </h4>
              <p className="text-sm text-blue-800">{formData.patient_care_value || 'Not specified'}</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Compliance/Regulatory
              </h4>
              <p className="text-sm text-orange-800">{formData.compliance_regulatory_value || 'Not specified'}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Impact
              </h4>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(formData.financial_impact)}
              </p>
            </div>
          </div>

          {/* Leadership & Timeline */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Leadership & Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Sponsor</label>
                <p className="text-gray-900">{formData.system_clinical_leader || 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned SCI</label>
                <p className="text-gray-900">{formData.assigned_sci_name || 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Timeline</label>
                <p className="text-gray-900">{formData.target_timeline || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Scope</label>
                <p className="text-gray-900">{formData.estimated_scope || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </h3>

            {/* Comment list */}
            <div className="space-y-3 mb-4">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No comments yet</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{comment.author_name}</span>
                      <span className="text-xs text-gray-500">{formatDateTime(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
                  </div>
                ))
              )}
            </div>

            {/* New comment input */}
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
              />
              <button
                onClick={handlePostComment}
                disabled={!newComment.trim() || postingComment}
                className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {postingComment ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3 bg-gray-50">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(request);
                }}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    onEdit(request);
                    onClose(); // Close detail modal before opening form
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Edit Request
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                title="Delete this governance request (for testing purposes)"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <div className="flex-1"></div>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
