import { useState } from 'react';
import { X, Save, AlertCircle, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { supabase, GovernanceRequest } from '../lib/supabase';
import { DIVISION_REGIONS, validateGovernanceRequest } from '../lib/governanceUtils';
import { generateNextRequestId } from '../lib/governanceConversion';

interface Metric {
  metricName: string;
  metricType: string;
  unit: string;
  baselineValue: string;
  baselineDate: string;
  currentValue: string;
  measurementDate: string;
  targetValue: string;
  improvement: string;
  measurementMethod: string;
}

interface GovernanceRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingRequest?: GovernanceRequest;
}

export const GovernanceRequestForm = ({ onClose, onSuccess, editingRequest }: GovernanceRequestFormProps) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSystemLevelModal, setShowSystemLevelModal] = useState(!editingRequest);
  const [confirmedSystemLevel, setConfirmedSystemLevel] = useState(false);

  const isEditing = !!editingRequest;

  const [formData, setFormData] = useState<{
    title: string;
    division_region: string;
    submitter_name: string;
    submitter_email: string;
    problem_statement: string;
    desired_outcomes: string;
    system_clinical_leader: string;
    patient_care_value: string;
    compliance_regulatory_value: string;
    financial_impact: string;
    target_timeline: string;
    estimated_scope: string;
    projected_annual_revenue: string;
    projection_basis: string;
    calculation_methodology: string;
    key_assumptions: string;
    impact_commonspirit_board_goal: boolean;
    impact_commonspirit_2026_5for25: boolean;
    impact_system_policy: boolean;
    impact_patient_safety: boolean;
    impact_regulatory_compliance: boolean;
    impact_financial: boolean;
    impact_other: string;
    supporting_information: string;
    groups_nurses: boolean;
    groups_physicians_apps: boolean;
    groups_therapies: boolean;
    groups_lab: boolean;
    groups_pharmacy: boolean;
    groups_radiology: boolean;
    groups_administration: boolean;
    groups_other: string;
    regions_impacted: string;
    required_date: string;
    required_date_reason: string;
    additional_comments: string;
    status: string;
  }>({
    title: editingRequest?.title || '',
    division_region: editingRequest?.division_region || '',
    submitter_name: editingRequest?.submitter_name || '',
    submitter_email: editingRequest?.submitter_email || '',
    problem_statement: editingRequest?.problem_statement || '',
    desired_outcomes: editingRequest?.desired_outcomes || '',
    system_clinical_leader: editingRequest?.system_clinical_leader || '',
    patient_care_value: editingRequest?.patient_care_value || '',
    compliance_regulatory_value: editingRequest?.compliance_regulatory_value || '',
    financial_impact: editingRequest?.financial_impact?.toString() || '', // Legacy field
    target_timeline: editingRequest?.target_timeline || '',
    estimated_scope: editingRequest?.estimated_scope || '',

    // New financial fields
    projected_annual_revenue: editingRequest?.projected_annual_revenue?.toString() || '',
    projection_basis: editingRequest?.projection_basis || '',
    calculation_methodology: editingRequest?.calculation_methodology || '',
    key_assumptions: editingRequest?.key_assumptions?.join('\n') || '',

    // Impact Categories
    impact_commonspirit_board_goal: editingRequest?.impact_commonspirit_board_goal || false,
    impact_commonspirit_2026_5for25: editingRequest?.impact_commonspirit_2026_5for25 || false,
    impact_system_policy: editingRequest?.impact_system_policy || false,
    impact_patient_safety: editingRequest?.impact_patient_safety || false,
    impact_regulatory_compliance: editingRequest?.impact_regulatory_compliance || false,
    impact_financial: editingRequest?.impact_financial || false,
    impact_other: editingRequest?.impact_other || '',

    // Supporting Information
    supporting_information: editingRequest?.supporting_information || '',

    // Groups Impacted
    groups_nurses: editingRequest?.groups_nurses || false,
    groups_physicians_apps: editingRequest?.groups_physicians_apps || false,
    groups_therapies: editingRequest?.groups_therapies || false,
    groups_lab: editingRequest?.groups_lab || false,
    groups_pharmacy: editingRequest?.groups_pharmacy || false,
    groups_radiology: editingRequest?.groups_radiology || false,
    groups_administration: editingRequest?.groups_administration || false,
    groups_other: editingRequest?.groups_other || '',

    // Regional Impact
    regions_impacted: editingRequest?.regions_impacted || '',

    // Required Date
    required_date: editingRequest?.required_date || '',
    required_date_reason: editingRequest?.required_date_reason || '',

    // Additional Comments
    additional_comments: editingRequest?.additional_comments || '',

    // Status
    status: editingRequest?.status || 'Draft',
  });

  // Metrics state (dynamic array)
  const [metrics, setMetrics] = useState<Metric[]>(() => {
    if (editingRequest?.impact_metrics && editingRequest.impact_metrics.length > 0) {
      return editingRequest.impact_metrics.map(m => ({
        metricName: m.metric_name,
        metricType: m.metric_type,
        unit: m.unit,
        baselineValue: m.baseline_value?.toString() || '',
        baselineDate: m.baseline_date || '',
        currentValue: m.current_value?.toString() || '',
        measurementDate: m.measurement_date || '',
        targetValue: m.target_value?.toString() || '',
        improvement: m.improvement || '',
        measurementMethod: m.measurement_method || '',
      }));
    }
    return [{
      metricName: '',
      metricType: '',
      unit: '',
      baselineValue: '',
      baselineDate: '',
      currentValue: '',
      measurementDate: '',
      targetValue: '',
      improvement: '',
      measurementMethod: '',
    }];
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  // Metric management functions
  const addMetric = () => {
    setMetrics([...metrics, {
      metricName: '',
      metricType: '',
      unit: '',
      baselineValue: '',
      baselineDate: '',
      currentValue: '',
      measurementDate: '',
      targetValue: '',
      improvement: '',
      measurementMethod: '',
    }]);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const updated = [...metrics];
    updated[index][field] = value;
    setMetrics(updated);
  };

  const handleSaveDraft = async () => {
    console.log('💾 SAVE AS DRAFT function called');
    try {
      setSaving(true);
      setError(null);
      console.log('💾 Form data:', { title: formData.title, submitter: formData.submitter_name, email: formData.submitter_email });

      // Validate basic required fields
      if (!formData.title || !formData.submitter_name || !formData.submitter_email) {
        console.log('❌ Validation failed - missing required fields');
        setError('Please fill in at least Title, Submitter Name, and Email to save a draft');
        setSaving(false);
        return;
      }

      console.log('✅ Validation passed, preparing to save...');

      // Prepare metrics data (only include metrics with a name)
      const validMetrics = metrics.filter(m => m.metricName && m.metricName.trim());
      const impactMetrics = validMetrics.map(m => ({
        metric_name: m.metricName.trim(),
        metric_type: m.metricType,
        unit: m.unit,
        baseline_value: m.baselineValue ? parseFloat(m.baselineValue) : undefined,
        baseline_date: m.baselineDate || undefined,
        current_value: m.currentValue ? parseFloat(m.currentValue) : undefined,
        measurement_date: m.measurementDate || undefined,
        target_value: m.targetValue ? parseFloat(m.targetValue) : undefined,
        improvement: m.improvement || undefined,
        measurement_method: m.measurementMethod || undefined,
      }));

      // Prepare financial data
      const keyAssumptions = formData.key_assumptions
        ? formData.key_assumptions.split('\n').map(s => s.trim()).filter(s => s)
        : [];

      const requestData = {
        title: formData.title,
        division_region: formData.division_region || 'System Request',
        submitter_name: formData.submitter_name,
        submitter_email: formData.submitter_email,
        problem_statement: formData.problem_statement,
        desired_outcomes: formData.desired_outcomes,
        system_clinical_leader: formData.system_clinical_leader || null,
        patient_care_value: formData.patient_care_value || null,
        compliance_regulatory_value: formData.compliance_regulatory_value || null,
        financial_impact: formData.financial_impact ? parseFloat(formData.financial_impact) : null,
        target_timeline: formData.target_timeline || null,
        estimated_scope: formData.estimated_scope || null,
        // Impact metrics
        impact_metrics: impactMetrics.length > 0 ? impactMetrics : null,
        // Financial fields
        projected_annual_revenue: formData.projected_annual_revenue ? parseFloat(formData.projected_annual_revenue) : null,
        projection_basis: formData.projection_basis || null,
        calculation_methodology: formData.calculation_methodology || null,
        key_assumptions: keyAssumptions.length > 0 ? keyAssumptions : null,
        // Impact categories
        impact_commonspirit_board_goal: formData.impact_commonspirit_board_goal,
        impact_commonspirit_2026_5for25: formData.impact_commonspirit_2026_5for25,
        impact_system_policy: formData.impact_system_policy,
        impact_patient_safety: formData.impact_patient_safety,
        impact_regulatory_compliance: formData.impact_regulatory_compliance,
        impact_financial: formData.impact_financial,
        impact_other: formData.impact_other || null,
        // Supporting information
        supporting_information: formData.supporting_information || null,
        // Groups impacted
        groups_nurses: formData.groups_nurses,
        groups_physicians_apps: formData.groups_physicians_apps,
        groups_therapies: formData.groups_therapies,
        groups_lab: formData.groups_lab,
        groups_pharmacy: formData.groups_pharmacy,
        groups_radiology: formData.groups_radiology,
        groups_administration: formData.groups_administration,
        groups_other: formData.groups_other || null,
        // Regional impact
        regions_impacted: formData.regions_impacted || null,
        // Required date
        required_date: formData.required_date || null,
        required_date_reason: formData.required_date_reason || null,
        // Additional comments
        additional_comments: formData.additional_comments || null,
        // Work assignment fields (optional, set by SCI lead during assignment)
        work_effort: null,
        work_phase: null,
        work_type: null,
        assigned_role: null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update existing request
        const { error: updateError } = await supabase
          .from('governance_requests')
          .update(requestData)
          .eq('id', editingRequest.id);

        if (updateError) throw updateError;

        alert('SCI consultant request updated successfully!');
      } else {
        // Create new request
        const requestId = await generateNextRequestId();

        const { error: insertError } = await supabase
          .from('governance_requests')
          .insert({
            ...requestData,
            request_id: requestId,
            status: 'Draft',  // Always set to Draft when saving as draft
          });

        if (insertError) throw insertError;
      }

      // Update formData status to reflect the save
      setFormData(prev => ({ ...prev, status: 'Draft' }));

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    console.log('🚀 SUBMIT FOR REVIEW function called');
    try {
      setSaving(true);
      setError(null);
      console.log('🚀 Form data:', { title: formData.title, submitter: formData.submitter_name, email: formData.submitter_email });

      // Validate all required fields for submission
      const errors = validateGovernanceRequest(formData, true);
      console.log('🚀 Validation errors:', errors);
      if (Object.keys(errors).length > 0) {
        console.log('❌ Validation failed:', Object.values(errors));
        setError(`Please fix the following errors:\n${Object.values(errors).join('\n')}`);
        setSaving(false);
        return;
      }

      console.log('✅ Validation passed, preparing to submit...');

      // Prepare metrics data (only include metrics with a name)
      const validMetrics = metrics.filter(m => m.metricName && m.metricName.trim());
      const impactMetrics = validMetrics.map(m => ({
        metric_name: m.metricName.trim(),
        metric_type: m.metricType,
        unit: m.unit,
        baseline_value: m.baselineValue ? parseFloat(m.baselineValue) : undefined,
        baseline_date: m.baselineDate || undefined,
        current_value: m.currentValue ? parseFloat(m.currentValue) : undefined,
        measurement_date: m.measurementDate || undefined,
        target_value: m.targetValue ? parseFloat(m.targetValue) : undefined,
        improvement: m.improvement || undefined,
        measurement_method: m.measurementMethod || undefined,
      }));

      // Prepare financial data
      const keyAssumptions = formData.key_assumptions
        ? formData.key_assumptions.split('\n').map(s => s.trim()).filter(s => s)
        : [];

      const requestData = {
        title: formData.title,
        division_region: formData.division_region,
        submitter_name: formData.submitter_name,
        submitter_email: formData.submitter_email,
        problem_statement: formData.problem_statement,
        desired_outcomes: formData.desired_outcomes,
        system_clinical_leader: formData.system_clinical_leader || null,
        patient_care_value: formData.patient_care_value || null,
        compliance_regulatory_value: formData.compliance_regulatory_value || null,
        financial_impact: formData.financial_impact ? parseFloat(formData.financial_impact) : null,
        target_timeline: formData.target_timeline || null,
        estimated_scope: formData.estimated_scope || null,
        // Impact metrics
        impact_metrics: impactMetrics.length > 0 ? impactMetrics : null,
        // Financial fields
        projected_annual_revenue: formData.projected_annual_revenue ? parseFloat(formData.projected_annual_revenue) : null,
        projection_basis: formData.projection_basis || null,
        calculation_methodology: formData.calculation_methodology || null,
        key_assumptions: keyAssumptions.length > 0 ? keyAssumptions : null,
        // Impact categories
        impact_commonspirit_board_goal: formData.impact_commonspirit_board_goal,
        impact_commonspirit_2026_5for25: formData.impact_commonspirit_2026_5for25,
        impact_system_policy: formData.impact_system_policy,
        impact_patient_safety: formData.impact_patient_safety,
        impact_regulatory_compliance: formData.impact_regulatory_compliance,
        impact_financial: formData.impact_financial,
        impact_other: formData.impact_other || null,
        // Supporting information
        supporting_information: formData.supporting_information || null,
        // Groups impacted
        groups_nurses: formData.groups_nurses,
        groups_physicians_apps: formData.groups_physicians_apps,
        groups_therapies: formData.groups_therapies,
        groups_lab: formData.groups_lab,
        groups_pharmacy: formData.groups_pharmacy,
        groups_radiology: formData.groups_radiology,
        groups_administration: formData.groups_administration,
        groups_other: formData.groups_other || null,
        // Regional impact
        regions_impacted: formData.regions_impacted || null,
        // Required date
        required_date: formData.required_date || null,
        required_date_reason: formData.required_date_reason || null,
        // Additional comments
        additional_comments: formData.additional_comments || null,
        status: 'Ready for Review',
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update existing request and change status to Ready for Review
        const { error: updateError } = await supabase
          .from('governance_requests')
          .update({
            ...requestData,
            status: 'Ready for Review',
            submitted_date: editingRequest.submitted_date || new Date().toISOString(),
          })
          .eq('id', editingRequest.id);

        if (updateError) throw updateError;
      } else {
        // Create new request and submit
        const requestId = await generateNextRequestId();

        const { error: insertError } = await supabase
          .from('governance_requests')
          .insert({
            ...requestData,
            request_id: requestId,
            status: 'Ready for Review',
            submitted_date: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      // Update formData status to reflect the submission
      setFormData(prev => ({ ...prev, status: 'Ready for Review' }));

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Error submitting request:', err);
      setError(err.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  // System-level confirmation modal
  if (showSystemLevelModal && !isEditing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            System-Level SCI Consultant Request
          </h2>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              This portal is exclusively for <strong>system-level requests</strong> that:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Impact the entire organization or multiple divisions/markets</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Require system-level governance approval and CI number assignment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Utilize enterprise resources (system clinical informatics team, IT infrastructure)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Establish organization-wide standards or policies</span>
              </li>
            </ul>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Individual market or facility-level requests should NOT be submitted through this portal.
                If your request only affects a single market or facility, please work with your local leadership.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedSystemLevel}
                onChange={(e) => setConfirmedSystemLevel(e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-900 font-medium">
                I confirm this is a system-level request that requires system governance approval
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (confirmedSystemLevel) {
                  setShowSystemLevelModal(false);
                }
              }}
              disabled={!confirmedSystemLevel}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit SCI Consultant Request' : 'New System-Level SCI Consultant Request'}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-gray-600">
                  {isEditing
                    ? `Request ID: ${editingRequest.request_id}`
                    : 'Submit a system-level initiative for review and approval'
                  }
                </p>
                {isEditing && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                    formData.status === 'Ready for Review' ? 'bg-blue-100 text-blue-700' :
                    formData.status === 'Needs Refinement' ? 'bg-yellow-100 text-yellow-700' :
                    formData.status === 'Ready for Governance' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {formData.status}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900 whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initiative Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., SDOH Screening Expansion to Emergency Departments"
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Clear, descriptive title for your system-level initiative
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Division/Region <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.division_region}
                onChange={(e) => handleChange('division_region', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              >
                <option value="">Select division/region...</option>
                {DIVISION_REGIONS.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submitter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.submitter_name}
                  onChange={(e) => handleChange('submitter_name', e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submitter Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.submitter_email}
                  onChange={(e) => handleChange('submitter_email', e.target.value)}
                  placeholder="your.email@commonspirit.org"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Clinical Leader/Sponsor
              </label>
              <input
                type="text"
                value={formData.system_clinical_leader}
                onChange={(e) => handleChange('system_clinical_leader', e.target.value)}
                placeholder="e.g., Dr. Sarah Johnson, SVP Clinical Excellence"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Clinical leader sponsoring this initiative
              </p>
            </div>
          </div>

          {/* Problem Statement & Outcomes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">System-Level Need</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.problem_statement}
                onChange={(e) => handleChange('problem_statement', e.target.value)}
                placeholder="What system-level problem or opportunity is being addressed? Clearly articulate why this requires system-level governance and affects multiple markets or the entire organization..."
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                <strong>Important:</strong> Clearly indicate this is system-level (affects multiple markets, requires enterprise resources, organization-wide impact)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired Outcomes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.desired_outcomes}
                onChange={(e) => handleChange('desired_outcomes', e.target.value)}
                placeholder="What specific system-wide outcomes are you trying to achieve? Be as specific as possible..."
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Value Proposition</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Care Value
              </label>
              <textarea
                rows={3}
                value={formData.patient_care_value}
                onChange={(e) => handleChange('patient_care_value', e.target.value)}
                placeholder="How does this improve patient care across the system or multiple markets?"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliance/Regulatory Value
              </label>
              <textarea
                rows={3}
                value={formData.compliance_regulatory_value}
                onChange={(e) => handleChange('compliance_regulatory_value', e.target.value)}
                placeholder="System-wide regulatory requirements, compliance benefits (e.g., CMS mandates affecting all facilities)"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Timeline
              </label>
              <input
                type="text"
                value={formData.target_timeline}
                onChange={(e) => handleChange('target_timeline', e.target.value)}
                placeholder="Q1 2026"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Scope/Effort
              </label>
              <textarea
                rows={3}
                value={formData.estimated_scope}
                onChange={(e) => handleChange('estimated_scope', e.target.value)}
                placeholder="Brief description of resources, timeline, complexity at system scale..."
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#00A1E0]">Impact Metrics</h3>
            {metrics.map((metric, index) => (
              <div key={index} className="bg-[#00A1E0]/10 border border-[#00A1E0]/30 rounded p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Metric #{index + 1}</span>
                  <div className="flex gap-2">
                    {index === metrics.length - 1 && (
                      <button type="button" onClick={addMetric} className="text-[#00A1E0] text-xs hover:text-[#0088c2] flex items-center gap-1">
                        <Plus size={14} />
                        Add Metric
                      </button>
                    )}
                    {metrics.length > 1 && (
                      <button type="button" onClick={() => removeMetric(index)} className="text-red-600 text-xs hover:text-red-700">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Metric Name</label>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="e.g., Time Reduction"
                      value={metric.metricName}
                      onChange={e => updateMetric(index, 'metricName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Metric Type</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={metric.metricType}
                      onChange={e => updateMetric(index, 'metricType', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option>Quality</option>
                      <option>Efficiency</option>
                      <option>Adoption</option>
                      <option>Financial</option>
                      <option>Patient Experience</option>
                      <option>Clinical Outcome</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Unit</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={metric.unit}
                      onChange={e => updateMetric(index, 'unit', e.target.value)}
                    >
                      <option value="">Select Unit</option>
                      <option>Percentage</option>
                      <option>Minutes</option>
                      <option>Count</option>
                      <option>Dollars</option>
                      <option>Score</option>
                      <option>Rate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Baseline Value</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="Starting value"
                      value={metric.baselineValue}
                      onChange={e => updateMetric(index, 'baselineValue', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Baseline Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={metric.baselineDate}
                      onChange={e => updateMetric(index, 'baselineDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Current Value</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="Current value"
                      value={metric.currentValue}
                      onChange={e => updateMetric(index, 'currentValue', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Current Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={metric.measurementDate}
                      onChange={e => updateMetric(index, 'measurementDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Target Value</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="Goal (optional)"
                      value={metric.targetValue}
                      onChange={e => updateMetric(index, 'targetValue', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Improvement</label>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="Auto-calc or manual"
                      value={metric.improvement}
                      onChange={e => updateMetric(index, 'improvement', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold mb-1">Measurement Method</label>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="How was this measured?"
                      value={metric.measurementMethod}
                      onChange={e => updateMetric(index, 'measurementMethod', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue & Financial Impact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#00A1E0]">Revenue & Financial Impact</h3>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Projected Financial Impact (Estimates/Pilot)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Projected Annual Revenue/Savings ($)</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Estimated full 12-month impact"
                    value={formData.projected_annual_revenue}
                    onChange={e => handleChange('projected_annual_revenue', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Projection Basis</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder='e.g., "Pilot data × 12 months"'
                    value={formData.projection_basis}
                    onChange={e => handleChange('projection_basis', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Calculation Methodology</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Show your work - be specific"
                value={formData.calculation_methodology}
                onChange={e => handleChange('calculation_methodology', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Key Assumptions (one per line)</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="List ALL assumptions"
                value={formData.key_assumptions}
                onChange={e => handleChange('key_assumptions', e.target.value)}
              />
            </div>
          </div>

          {/* Category of Impact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Category of Impact</h3>
            <p className="text-sm text-gray-600">Check all that apply. These should be demonstrable if checked.</p>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.impact_commonspirit_board_goal}
                  onChange={(e) => handleChange('impact_commonspirit_board_goal', e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-900">CommonSpirit Board Goal</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.impact_commonspirit_2026_5for25}
                  onChange={(e) => handleChange('impact_commonspirit_2026_5for25', e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-900">CommonSpirit 2026 or 5 for '25</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.impact_system_policy}
                  onChange={(e) => handleChange('impact_system_policy', e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-900">System Policy</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.impact_patient_safety}
                  onChange={(e) => handleChange('impact_patient_safety', e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-900">Patient Safety</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.impact_regulatory_compliance}
                  onChange={(e) => handleChange('impact_regulatory_compliance', e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-900">Regulatory Compliance</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.impact_financial}
                  onChange={(e) => handleChange('impact_financial', e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-900">Financial</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other:</label>
                <input
                  type="text"
                  value={formData.impact_other}
                  onChange={(e) => handleChange('impact_other', e.target.value)}
                  placeholder="Specify other impact category"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Information
              </label>
              <textarea
                rows={4}
                value={formData.supporting_information}
                onChange={(e) => handleChange('supporting_information', e.target.value)}
                placeholder="Any regulatory, policy, practice guidelines, etc. that support the request and selected categories..."
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Groups Impacted */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Groups Impacted by Problem</h3>
            <p className="text-sm text-gray-600">Check all that apply. Please ensure that each group is aware and supports the request.</p>

            <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.groups_nurses}
                onChange={(e) => handleChange('groups_nurses', e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-900">Nurses</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.groups_physicians_apps}
                onChange={(e) => handleChange('groups_physicians_apps', e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-900">Physicians/APPs</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.groups_therapies}
                onChange={(e) => handleChange('groups_therapies', e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-900">Therapies</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.groups_lab}
                onChange={(e) => handleChange('groups_lab', e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-900">Lab</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.groups_pharmacy}
                onChange={(e) => handleChange('groups_pharmacy', e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-900">Pharmacy</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.groups_radiology}
                onChange={(e) => handleChange('groups_radiology', e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-900">Radiology</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.groups_administration}
                onChange={(e) => handleChange('groups_administration', e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-900">Administration</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other:</label>
              <input
                type="text"
                value={formData.groups_other}
                onChange={(e) => handleChange('groups_other', e.target.value)}
                placeholder="Specify other groups"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              </div>
            </div>
          </div>

          {/* Regional Impact & Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Regional Impact & Timeline</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What regions are impacted by this change?
              </label>
              <input
                type="text"
                value={formData.regions_impacted}
                onChange={(e) => handleChange('regions_impacted', e.target.value)}
                placeholder="e.g., All regions (South, Mountain, Northwest, California, Central) or specific regions"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Is there a required date for problem resolution?
              </label>
              <input
                type="date"
                value={formData.required_date}
                onChange={(e) => handleChange('required_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Regulation effective date, policy effective date, survey action plan, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Required Date
              </label>
              <input
                type="text"
                value={formData.required_date_reason}
                onChange={(e) => handleChange('required_date_reason', e.target.value)}
                placeholder="e.g., CMS regulation effective date, Joint Commission requirement"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Additional Comments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Additional Comments</h3>

            <div>
              <textarea
                rows={5}
                value={formData.additional_comments}
                onChange={(e) => handleChange('additional_comments', e.target.value)}
                placeholder="Any additional information that would be helpful in evaluating this request..."
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
          <button
            onClick={() => {
              console.log('🖱️ SAVE AS DRAFT BUTTON CLICKED');
              handleSaveDraft();
            }}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save as Draft
          </button>

          <button
            onClick={() => {
              console.log('🖱️ SUBMIT FOR REVIEW BUTTON CLICKED');
              handleSubmitForReview();
            }}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {formData.status === 'Needs Refinement' ? 'Resubmit for Review' : 'Submit for Review'}
          </button>

          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
