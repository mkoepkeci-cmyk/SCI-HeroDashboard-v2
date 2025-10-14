import { useState, useEffect } from 'react';
import { AlertCircle, Plus, X, Save } from 'lucide-react';
import { supabase, TeamMember, InitiativeWithDetails } from '../lib/supabase';
import { CompletionIndicator } from './CompletionIndicator';

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

interface InitiativeSubmissionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  editingInitiative?: InitiativeWithDetails;
}

export const InitiativeSubmissionForm = ({ onClose, onSuccess, editingInitiative }: InitiativeSubmissionFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const isEditing = !!editingInitiative;

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (err) {
        console.error('Error fetching team members:', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchTeamMembers();

    if (editingInitiative) {
      setFormData({
        teamMemberId: editingInitiative.team_member_id || '',
        role: editingInitiative.role || '',
        ownerName: editingInitiative.owner_name,
        initiativeName: editingInitiative.initiative_name,
        type: editingInitiative.type,
        status: editingInitiative.status,
        phase: (editingInitiative as any).phase || '',
        workEffort: (editingInitiative as any).work_effort || '',
        ehrsImpacted: editingInitiative.ehrs_impacted || '',
        serviceLine: editingInitiative.service_line || '',
        startDate: editingInitiative.start_date || '',
        endDate: editingInitiative.end_date || '',
        timeframeDisplay: editingInitiative.timeframe_display || '',
        clinicalSponsorName: editingInitiative.clinical_sponsor_name || '',
        clinicalSponsorTitle: editingInitiative.clinical_sponsor_title || '',
        governanceBodies: editingInitiative.governance_bodies?.join(', ') || '',
        keyCollaborators: editingInitiative.key_collaborators?.join(', ') || '',
        actualRevenue: editingInitiative.financial_impact?.actual_revenue?.toString() || '',
        actualTimeframe: editingInitiative.financial_impact?.actual_timeframe || '',
        measurementStartDate: editingInitiative.financial_impact?.measurement_start_date || '',
        measurementEndDate: editingInitiative.financial_impact?.measurement_end_date || '',
        projectedAnnual: editingInitiative.financial_impact?.projected_annual?.toString() || '',
        projectionBasis: editingInitiative.financial_impact?.projection_basis || '',
        calculationMethodology: editingInitiative.financial_impact?.calculation_methodology || '',
        keyAssumptions: editingInitiative.financial_impact?.key_assumptions?.join('\\n') || '',
        usersDeployed: editingInitiative.performance_data?.users_deployed?.toString() || '',
        totalPotentialUsers: editingInitiative.performance_data?.total_potential_users?.toString() || '',
        primaryOutcome: editingInitiative.performance_data?.primary_outcome || '',
        performanceMeasurementMethod: editingInitiative.performance_data?.measurement_method || '',
        sampleSize: editingInitiative.performance_data?.sample_size || '',
        measurementPeriod: editingInitiative.performance_data?.measurement_period || '',
        annualImpactCalculated: editingInitiative.performance_data?.annual_impact_calculated || '',
        calculationFormula: editingInitiative.performance_data?.calculation_formula || '',
        projectionScenario: editingInitiative.projections?.scenario_description || '',
        projectedUsers: editingInitiative.projections?.projected_users?.toString() || '',
        percentOfOrganization: editingInitiative.projections?.percent_of_organization?.toString() || '',
        projectedTimeSavings: editingInitiative.projections?.projected_time_savings || '',
        projectedDollarValue: editingInitiative.projections?.projected_dollar_value || '',
        revenueImpact: editingInitiative.projections?.revenue_impact || '',
        projectionCalculationMethod: editingInitiative.projections?.calculation_method || '',
        projectionAssumptions: editingInitiative.projections?.assumptions?.join('\\n') || '',
        sensitivityNotes: editingInitiative.projections?.sensitivity_notes || '',
        additionalBenefits: editingInitiative.projections?.additional_benefits || '',
        challenge: editingInitiative.story?.challenge || '',
        approach: editingInitiative.story?.approach || '',
        outcome: editingInitiative.story?.outcome || '',
        collaborationDetail: editingInitiative.story?.collaboration_detail || ''
      });

      if (editingInitiative.metrics && editingInitiative.metrics.length > 0) {
        setMetrics(editingInitiative.metrics.map(m => ({
          metricName: m.metric_name,
          metricType: m.metric_type,
          unit: m.unit,
          baselineValue: m.baseline_value?.toString() || '',
          baselineDate: m.baseline_date || '',
          currentValue: m.current_value?.toString() || '',
          measurementDate: m.measurement_date || '',
          targetValue: m.target_value?.toString() || '',
          improvement: m.improvement || '',
          measurementMethod: m.measurement_method || ''
        })));
      }

      setIsDraft(editingInitiative.is_draft);
    }
  }, [editingInitiative]);

  const [formData, setFormData] = useState({
    teamMemberId: '',
    role: '',
    ownerName: '',
    initiativeName: '',
    type: '',
    status: '',
    phase: '',
    workEffort: '',
    ehrsImpacted: '',
    serviceLine: '',
    startDate: '',
    endDate: '',
    timeframeDisplay: '',
    clinicalSponsorName: '',
    clinicalSponsorTitle: '',
    governanceBodies: '',
    keyCollaborators: '',

    actualRevenue: '',
    actualTimeframe: '',
    measurementStartDate: '',
    measurementEndDate: '',
    projectedAnnual: '',
    projectionBasis: '',
    calculationMethodology: '',
    keyAssumptions: '',

    usersDeployed: '',
    totalPotentialUsers: '',
    primaryOutcome: '',
    performanceMeasurementMethod: '',
    sampleSize: '',
    measurementPeriod: '',
    annualImpactCalculated: '',
    calculationFormula: '',

    projectionScenario: '',
    projectedUsers: '',
    percentOfOrganization: '',
    projectedTimeSavings: '',
    projectedDollarValue: '',
    revenueImpact: '',
    projectionCalculationMethod: '',
    projectionAssumptions: '',
    sensitivityNotes: '',
    additionalBenefits: '',

    challenge: '',
    approach: '',
    outcome: '',
    collaborationDetail: ''
  });

  const [metrics, setMetrics] = useState<Metric[]>([{
    metricName: '',
    metricType: '',
    unit: '',
    baselineValue: '',
    baselineDate: '',
    currentValue: '',
    measurementDate: '',
    targetValue: '',
    improvement: '',
    measurementMethod: ''
  }]);

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
      measurementMethod: ''
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

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const initiativeData = {
        team_member_id: formData.teamMemberId || null,
        role: formData.role || null,
        owner_name: formData.ownerName,
        initiative_name: formData.initiativeName,
        type: formData.type,
        status: formData.status,
        phase: formData.phase || null,
        work_effort: formData.workEffort || null,
        ehrs_impacted: formData.ehrsImpacted || null,
        service_line: formData.serviceLine || null,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        timeframe_display: formData.timeframeDisplay || null,
        clinical_sponsor_name: formData.clinicalSponsorName || null,
        clinical_sponsor_title: formData.clinicalSponsorTitle || null,
        key_collaborators: formData.keyCollaborators ? formData.keyCollaborators.split(',').map(s => s.trim()) : [],
        governance_bodies: formData.governanceBodies ? formData.governanceBodies.split(',').map(s => s.trim()) : [],
        is_draft: saveAsDraft,
        last_updated_by: formData.ownerName
      };

      let initiative;

      if (isEditing) {
        const { data, error: initiativeError } = await supabase
          .from('initiatives')
          .update(initiativeData)
          .eq('id', editingInitiative.id)
          .select()
          .single();

        if (initiativeError) throw initiativeError;
        initiative = data;
      } else {
        const { data, error: initiativeError } = await supabase
          .from('initiatives')
          .insert(initiativeData)
          .select()
          .single();

        if (initiativeError) throw initiativeError;
        initiative = data;
      }

      if (!initiative) throw new Error(isEditing ? 'Failed to update initiative' : 'Failed to create initiative');

      // When editing, delete ALL existing metrics first
      if (isEditing) {
        const { error: deleteError } = await supabase
          .from('initiative_metrics')
          .delete()
          .eq('initiative_id', initiative.id);

        if (deleteError) {
          console.error('Error deleting existing metrics:', deleteError);
          throw new Error(`Failed to delete existing metrics: ${deleteError.message}`);
        }
      }

      // Insert new metrics (only those with a metric name filled in)
      const validMetrics = metrics.filter(m => m.metricName && m.metricName.trim());

      if (validMetrics.length > 0) {
        const metricsToInsert = validMetrics.map((m, idx) => ({
          initiative_id: initiative.id,
          metric_name: m.metricName.trim(),
          metric_type: m.metricType,
          unit: m.unit,
          baseline_value: m.baselineValue ? parseFloat(m.baselineValue) : null,
          baseline_date: m.baselineDate || null,
          current_value: m.currentValue ? parseFloat(m.currentValue) : null,
          measurement_date: m.measurementDate || null,
          target_value: m.targetValue ? parseFloat(m.targetValue) : null,
          improvement: m.improvement || null,
          measurement_method: m.measurementMethod || null,
          display_order: idx
        }));

        const { error: metricsError } = await supabase
          .from('initiative_metrics')
          .insert(metricsToInsert);

        if (metricsError) {
          console.error('Error inserting metrics:', metricsError);
          throw new Error(`Failed to insert metrics: ${metricsError.message}`);
        }
      }

      const financialData = {
        initiative_id: initiative.id,
        actual_revenue: formData.actualRevenue ? parseFloat(formData.actualRevenue) : null,
        actual_timeframe: formData.actualTimeframe || null,
        measurement_start_date: formData.measurementStartDate || null,
        measurement_end_date: formData.measurementEndDate || null,
        projected_annual: formData.projectedAnnual ? parseFloat(formData.projectedAnnual) : null,
        projection_basis: formData.projectionBasis || null,
        calculation_methodology: formData.calculationMethodology || null,
        key_assumptions: formData.keyAssumptions ? formData.keyAssumptions.split('\n').map(s => s.trim()).filter(s => s) : []
      };

      if (isEditing && editingInitiative.financial_impact) {
        const { error: financialError } = await supabase
          .from('initiative_financial_impact')
          .update(financialData)
          .eq('id', editingInitiative.financial_impact.id);
        if (financialError) throw financialError;
      } else if (formData.actualRevenue || formData.projectedAnnual) {
        const { error: financialError } = await supabase
          .from('initiative_financial_impact')
          .insert(financialData);
        if (financialError) throw financialError;
      }

      const usersDeployed = formData.usersDeployed ? parseInt(formData.usersDeployed) : null;
      const totalUsers = formData.totalPotentialUsers ? parseInt(formData.totalPotentialUsers) : null;
      const adoptionRate = usersDeployed && totalUsers ? (usersDeployed / totalUsers) * 100 : null;

      const performanceData = {
        initiative_id: initiative.id,
        users_deployed: usersDeployed,
        total_potential_users: totalUsers,
        adoption_rate: adoptionRate,
        primary_outcome: formData.primaryOutcome || null,
        measurement_method: formData.performanceMeasurementMethod || null,
        sample_size: formData.sampleSize || null,
        measurement_period: formData.measurementPeriod || null,
        annual_impact_calculated: formData.annualImpactCalculated || null,
        calculation_formula: formData.calculationFormula || null
      };

      if (isEditing && editingInitiative.performance_data) {
        const { error: performanceError } = await supabase
          .from('initiative_performance_data')
          .update(performanceData)
          .eq('id', editingInitiative.performance_data.id);
        if (performanceError) throw performanceError;
      } else if (formData.usersDeployed || formData.primaryOutcome) {
        const { error: performanceError } = await supabase
          .from('initiative_performance_data')
          .insert(performanceData);
        if (performanceError) throw performanceError;
      }

      const projectionData = {
        initiative_id: initiative.id,
        scenario_description: formData.projectionScenario || null,
        projected_users: formData.projectedUsers ? parseInt(formData.projectedUsers) : null,
        percent_of_organization: formData.percentOfOrganization ? parseFloat(formData.percentOfOrganization) : null,
        projected_time_savings: formData.projectedTimeSavings || null,
        projected_dollar_value: formData.projectedDollarValue || null,
        revenue_impact: formData.revenueImpact || null,
        calculation_method: formData.projectionCalculationMethod || null,
        assumptions: formData.projectionAssumptions ? formData.projectionAssumptions.split('\n').map(s => s.trim()).filter(s => s) : [],
        sensitivity_notes: formData.sensitivityNotes || null,
        additional_benefits: formData.additionalBenefits || null
      };

      if (isEditing && editingInitiative.projections) {
        const { error: projectionError } = await supabase
          .from('initiative_projections')
          .update(projectionData)
          .eq('id', editingInitiative.projections.id);
        if (projectionError) throw projectionError;
      } else if (formData.projectionScenario) {
        const { error: projectionError } = await supabase
          .from('initiative_projections')
          .insert(projectionData);
        if (projectionError) throw projectionError;
      }

      const storyData = {
        initiative_id: initiative.id,
        challenge: formData.challenge || null,
        approach: formData.approach || null,
        outcome: formData.outcome || null,
        collaboration_detail: formData.collaborationDetail || null
      };

      if (isEditing && editingInitiative.story) {
        const { error: storyError } = await supabase
          .from('initiative_stories')
          .update(storyData)
          .eq('id', editingInitiative.story.id);
        if (storyError) throw storyError;
      } else if (formData.challenge || formData.approach || formData.outcome) {
        const { error: storyError } = await supabase
          .from('initiative_stories')
          .insert(storyData);
        if (storyError) throw storyError;
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error submitting initiative:', err);
      setError(err.message || 'Failed to submit initiative');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#9B2F6A]">{isEditing ? 'Edit Initiative' : 'Submit Initiative Data'}</h2>
          {isEditing && editingInitiative && (
            <p className="text-sm text-gray-600 mt-1">Last updated {new Date(editingInitiative.updated_at).toLocaleDateString()}</p>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {isEditing && editingInitiative && (
        <div className="mb-4">
          <CompletionIndicator
            completionStatus={editingInitiative.completion_status}
            completionPercentage={editingInitiative.completion_percentage}
            variant="full"
            showSections={true}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-bold text-lg mb-3 text-[#6F47D0]">Basic Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Team Member</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.teamMemberId}
                onChange={e => setFormData({ ...formData, teamMemberId: e.target.value })}
                disabled={loadingMembers}
              >
                <option value="">Select team member (optional)</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Role</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="">Select role (optional)</option>
                <option>Primary</option>
                <option>Co-Owner</option>
                <option>Secondary</option>
                <option>Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Owner *</label>
              <input
                required
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Your name"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Initiative Name *</label>
              <input
                required
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Clear, descriptive name"
                value={formData.initiativeName}
                onChange={e => setFormData({ ...formData, initiativeName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Type *</label>
              <select
                required
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select Type</option>
                <option>System Initiative</option>
                <option>Project</option>
                <option>Epic Gold</option>
                <option>Governance</option>
                <option>General Support</option>
                <option>Policy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Status *</label>
              <select
                required
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="">Select Status</option>
                <option>Planning</option>
                <option>Active</option>
                <option>Scaling</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phase</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.phase}
                onChange={e => setFormData({ ...formData, phase: e.target.value })}
              >
                <option value="">Select Phase (optional)</option>
                <option>Discovery/Define</option>
                <option>Design</option>
                <option>Build</option>
                <option>Validate/Test</option>
                <option>Deploy</option>
                <option>Did we Deliver</option>
                <option>Post Go Live Support</option>
                <option>Maintenance</option>
                <option>Steady State</option>
                <option>N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Work Effort</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.workEffort}
                onChange={e => setFormData({ ...formData, workEffort: e.target.value })}
              >
                <option value="">Select Size (optional)</option>
                <option value="XS">XS - Less than 1 hr/wk</option>
                <option value="S">S - 1-2 hrs/wk</option>
                <option value="M">M - 2-5 hrs/wk</option>
                <option value="L">L - 5-10 hrs/wk</option>
                <option value="XL">XL - More than 10 hrs/wk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">EHRs Impacted</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.ehrsImpacted}
                onChange={e => setFormData({ ...formData, ehrsImpacted: e.target.value })}
              >
                <option value="">Select EHR (optional)</option>
                <option>All</option>
                <option>Epic</option>
                <option>Cerner</option>
                <option>Altera</option>
                <option>Epic and Cerner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Service Line</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g., Ambulatory, Pharmacy, Nursing"
                value={formData.serviceLine}
                onChange={e => setFormData({ ...formData, serviceLine: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">End Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Timeframe Display</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder='How you want it shown (e.g., "FY25-Q1 to Q3")'
                value={formData.timeframeDisplay}
                onChange={e => setFormData({ ...formData, timeframeDisplay: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-bold text-lg mb-3 text-[#6F47D0]">Governance & Collaboration</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Clinical Sponsor Name</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Name of clinical leader"
                  value={formData.clinicalSponsorName}
                  onChange={e => setFormData({ ...formData, clinicalSponsorName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Clinical Sponsor Title</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Title/role"
                  value={formData.clinicalSponsorTitle}
                  onChange={e => setFormData({ ...formData, clinicalSponsorTitle: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Governance Bodies & Working Groups</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Comma-separated list (e.g., AI Steering Committee, Physician Experience Council)"
                value={formData.governanceBodies}
                onChange={e => setFormData({ ...formData, governanceBodies: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Key Collaborators</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Comma-separated list of major partners"
                value={formData.keyCollaborators}
                onChange={e => setFormData({ ...formData, keyCollaborators: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-bold text-lg mb-3 text-[#00A1E0]">Impact Metrics</h3>
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

        <div className="border-b pb-4">
          <h3 className="font-bold text-lg mb-3 text-[#00A1E0]">Revenue & Financial Impact</h3>
          <div className="space-y-4">
            {/* Projected Financial Impact */}
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
                    value={formData.projectedAnnual}
                    onChange={e => setFormData({ ...formData, projectedAnnual: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Projection Basis</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder='e.g., "Pilot data × 12 months"'
                    value={formData.projectionBasis}
                    onChange={e => setFormData({ ...formData, projectionBasis: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Realized Financial Impact */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <h4 className="font-semibold text-sm mb-2 text-green-900">Realized Financial Impact (Actual Data)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Realized Revenue/Savings ($)</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Actual dollar amount achieved"
                    value={formData.actualRevenue}
                    onChange={e => setFormData({ ...formData, actualRevenue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Measurement Timeframe</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder='e.g., "FY25 Q1-Q2"'
                    value={formData.actualTimeframe}
                    onChange={e => setFormData({ ...formData, actualTimeframe: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Measurement Start Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.measurementStartDate}
                    onChange={e => setFormData({ ...formData, measurementStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Measurement End Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.measurementEndDate}
                    onChange={e => setFormData({ ...formData, measurementEndDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Calculation Methodology</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Show your work - be specific"
                value={formData.calculationMethodology}
                onChange={e => setFormData({ ...formData, calculationMethodology: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Key Assumptions (one per line)</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="List ALL assumptions"
                value={formData.keyAssumptions}
                onChange={e => setFormData({ ...formData, keyAssumptions: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-bold text-lg mb-3 text-[#6F47D0]">Actual Performance Data</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Users/Providers Deployed</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Current #"
                value={formData.usersDeployed}
                onChange={e => setFormData({ ...formData, usersDeployed: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Total Potential Users</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Total possible"
                value={formData.totalPotentialUsers}
                onChange={e => setFormData({ ...formData, totalPotentialUsers: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Adoption Rate (%)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
                placeholder="Auto-calculated"
                value={
                  formData.usersDeployed && formData.totalPotentialUsers
                    ? ((parseInt(formData.usersDeployed) / parseInt(formData.totalPotentialUsers)) * 100).toFixed(1)
                    : ''
                }
                disabled
              />
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Measured Outcome Description</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Describe actual measured outcomes"
                value={formData.primaryOutcome}
                onChange={e => setFormData({ ...formData, primaryOutcome: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Measurement Method</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="How measured"
                  value={formData.performanceMeasurementMethod}
                  onChange={e => setFormData({ ...formData, performanceMeasurementMethod: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Sample Size</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., n=50"
                  value={formData.sampleSize}
                  onChange={e => setFormData({ ...formData, sampleSize: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Calculated Annual Impact</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Show calculation"
                value={formData.annualImpactCalculated}
                onChange={e => setFormData({ ...formData, annualImpactCalculated: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Calculation Formula</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Show the math"
                value={formData.calculationFormula}
                onChange={e => setFormData({ ...formData, calculationFormula: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-bold text-lg mb-3 text-[#F58025]">Projection Model (If Scaling)</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Projection Scenario</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="What you're projecting (e.g., 80% org-wide adoption)"
                value={formData.projectionScenario}
                onChange={e => setFormData({ ...formData, projectionScenario: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Projected Scale (# users)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Target number"
                  value={formData.projectedUsers}
                  onChange={e => setFormData({ ...formData, projectedUsers: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">% of Organization</label>
                <input
                  type="number"
                  step="any"
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., 80"
                  value={formData.percentOfOrganization}
                  onChange={e => setFormData({ ...formData, percentOfOrganization: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Projected Dollar Value</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., $357.1M"
                  value={formData.projectedDollarValue}
                  onChange={e => setFormData({ ...formData, projectedDollarValue: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Projection Detail/Calculation</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Show the math"
                value={formData.projectionCalculationMethod}
                onChange={e => setFormData({ ...formData, projectionCalculationMethod: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Additional Benefits (Optional)</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Other projected benefits"
                value={formData.additionalBenefits}
                onChange={e => setFormData({ ...formData, additionalBenefits: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Projection Assumptions (one per line)</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="List all assumptions for projection"
                value={formData.projectionAssumptions}
                onChange={e => setFormData({ ...formData, projectionAssumptions: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="pb-4">
          <h3 className="font-bold text-lg mb-3 text-[#9B2F6A]">Impact Story</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Challenge</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="What problem were you solving? Be specific about the impact."
                value={formData.challenge}
                onChange={e => setFormData({ ...formData, challenge: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Approach</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="How did you approach the solution?"
                value={formData.approach}
                onChange={e => setFormData({ ...formData, approach: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Outcome</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="What were the results? Be specific with numbers."
                value={formData.outcome}
                onChange={e => setFormData({ ...formData, outcome: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Key Collaborators</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="List sponsors, governance bodies, technical partners"
                value={formData.collaborationDetail}
                onChange={e => setFormData({ ...formData, collaborationDetail: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            disabled={submitting}
            className="flex-1 bg-[#9B2F6A] text-white py-3 rounded hover:bg-[#8F2561] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {submitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Initiative' : 'Save & Publish')}
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={submitting}
              className="flex-1 bg-[#00A1E0] text-white py-3 rounded hover:bg-[#0088c2] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving Draft...' : 'Save as Draft'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-8 border border-gray-300 rounded hover:bg-gray-50 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <div className="bg-[#00A1E0]/10 border border-[#00A1E0]/30 rounded p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#00A1E0] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#565658]">
              <p className="font-semibold mb-1">Submission Tips</p>
              <p>
                Fill out as much detail as possible. All fields except Owner, Initiative Name, Type, and Status are
                optional, but more detail helps showcase impact. Data is immediately saved to the database.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
