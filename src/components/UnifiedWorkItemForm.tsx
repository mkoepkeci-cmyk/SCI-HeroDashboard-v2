import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, TeamMember, InitiativeWithDetails, GovernanceRequest, JournalEntry } from '../lib/supabase';
import { Tab1Content } from './UnifiedWorkItemForm/Tab1Content';
import { Tab2Content } from './UnifiedWorkItemForm/Tab2Content';
import { Tab3Content } from './UnifiedWorkItemForm/Tab3Content';
import { Tab4Content } from './UnifiedWorkItemForm/Tab4Content';
import { recalculateDashboardMetrics } from '../lib/workloadCalculator';

interface Metric {
  // Proposed Goals (from governance request)
  metricName: string;
  metricType: string;
  unit: string;
  baselineValue: string;
  baselineDate: string;
  targetValue: string;
  measurementMethod: string;
  // Actual Outcomes (user-entered measured results)
  actualValue: string;
  actualDate: string;
  actualImprovement: string;      // Auto-calculated: (actual - baseline) / baseline * 100
  varianceFromTarget: string;     // Auto-calculated: actual - target
}

interface TeamMemberAssignment {
  teamMemberId: string;
  teamMemberName: string;
  role: string;
}

interface UnifiedWorkItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingInitiative?: InitiativeWithDetails;
  linkedGovernanceRequest?: GovernanceRequest;
}

export const UnifiedWorkItemForm = ({
  onClose,
  onSuccess,
  editingInitiative,
  linkedGovernanceRequest
}: UnifiedWorkItemFormProps) => {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3' | 'tab4'>('tab2'); // Start on Tab 2 (work scope)
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isDraft, setIsDraft] = useState(false);

  const isEditing = !!editingInitiative;
  const isFromGovernance = !!linkedGovernanceRequest;

  // Get current user (for journal log)
  // TODO: Replace with actual user context when available
  const currentUser = {
    name: 'Current User',
    id: 'user-id-placeholder'
  };

  // Tab 1: Request Details (Governance fields - ALL OPTIONAL)
  // Financial fields removed - moved to Tab 4
  const [tab1Data, setTab1Data] = useState({
    title: '',
    division_region: '',
    submitter_name: '',
    submitter_email: '',
    problem_statement: '',
    desired_outcomes: '',
    system_clinical_leader: '',
    patient_care_value: '',
    compliance_regulatory_value: '',
    target_timeline: '',
    estimated_scope: '',
    impact_commonspirit_board_goal: false,
    impact_commonspirit_2026_5for25: false,
    impact_system_policy: false,
    impact_patient_safety: false,
    impact_regulatory_compliance: false,
    impact_financial: false,
    impact_other: '',
    supporting_information: '',
    groups_nurses: false,
    groups_physicians_apps: false,
    groups_therapies: false,
    groups_lab: false,
    groups_pharmacy: false,
    groups_radiology: false,
    groups_administration: false,
    groups_other: '',
    regions_impacted: '',
    required_date: '',
    required_date_reason: '',
    additional_comments: ''
  });

  // Tab 2: Work Scope & Assignments (Initiative core - REQUIRED FIELDS)
  const [tab2Data, setTab2Data] = useState({
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
    directHoursPerWeek: ''
  });

  const [teamMemberAssignments, setTeamMemberAssignments] = useState<TeamMemberAssignment[]>([{
    teamMemberId: '',
    teamMemberName: '',
    role: ''
  }]);

  // Tab 3: Proposed Solution & Journal Log (NEW)
  const [tab3Data, setTab3Data] = useState({
    proposedSolution: '',
    votingStatement: '',
    ehrAreasImpacted: [] as string[]
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newJournalEntry, setNewJournalEntry] = useState('');

  // Tab 4: Outcomes & Results - Updated for Pre/Post interface
  const [tab4Metrics, setTab4Metrics] = useState<Metric[]>([{
    // Proposed Goals
    metricName: '',
    metricType: '',
    unit: '',
    baselineValue: '',
    baselineDate: '',
    targetValue: '',
    measurementMethod: '',
    // Actual Outcomes
    actualValue: '',
    actualDate: '',
    actualImprovement: '',
    varianceFromTarget: ''
  }]);

  const [tab4Financial, setTab4Financial] = useState({
    // Projected (from governance request)
    projectedAnnual: '',
    projectionBasis: '',
    calculationMethodology: '',
    keyAssumptions: '',
    // Realized (user-entered measured results)
    actualRevenue: '',
    actualTimeframe: '',
    measurementStartDate: '',
    measurementEndDate: '',
    varianceFromProjected: ''  // Auto-calculated
  });

  const [tab4Performance, setTab4Performance] = useState({
    usersDeployed: '',
    totalPotentialUsers: '',
    primaryOutcome: '',
    performanceMeasurementMethod: '',
    sampleSize: '',
    measurementPeriod: '',
    annualImpactCalculated: '',
    calculationFormula: ''
  });

  const [tab4Projections, setTab4Projections] = useState({
    projectionScenario: '',
    projectedUsers: '',
    percentOfOrganization: '',
    projectedTimeSavings: '',
    projectedDollarValue: '',
    revenueImpact: '',
    projectionCalculationMethod: '',
    projectionAssumptions: '',
    sensitivityNotes: '',
    additionalBenefits: ''
  });

  const [tab4Story, setTab4Story] = useState({
    challenge: '',
    approach: '',
    outcome: '',
    collaborationDetail: ''
  });

  // Load team members
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
  }, []);

  // Load data based on context (editing vs new vs from governance)
  useEffect(() => {
    if (editingInitiative) {
      loadFromInitiative(editingInitiative);
    } else if (linkedGovernanceRequest) {
      loadFromGovernanceRequest(linkedGovernanceRequest);
    }
  }, [editingInitiative, linkedGovernanceRequest]);

  const loadFromInitiative = (initiative: InitiativeWithDetails) => {
    console.log('🔍 Loading from initiative:', initiative);
    console.log('🔍 Initiative governance fields:', {
      submitter_name: initiative.submitter_name,
      submitter_email: initiative.submitter_email,
      problem_statement: initiative.problem_statement,
      desired_outcomes: initiative.desired_outcomes,
      clinical_sponsor_name: initiative.clinical_sponsor_name,
      division_region: initiative.division_region
    });

    // Tab 1: Governance fields loaded directly from initiative columns
    // Phase 2 saves governance request data directly to initiative columns (not governance_metadata)
    // Financial fields removed - moved to Tab 4
    setTab1Data({
      title: initiative.initiative_name || '',
      division_region: initiative.division_region || '',
      submitter_name: initiative.submitter_name || '',
      submitter_email: initiative.submitter_email || '',
      problem_statement: initiative.problem_statement || '',
      desired_outcomes: initiative.desired_outcomes || '',
      system_clinical_leader: initiative.clinical_sponsor_name || '', // Phase 2 maps to clinical_sponsor_name
      patient_care_value: initiative.patient_care_value || '',
      compliance_regulatory_value: initiative.compliance_regulatory_value || '',
      target_timeline: initiative.timeframe_display || '', // Phase 2 formats target_timeline into timeframe_display
      estimated_scope: initiative.estimated_scope || '',
      impact_commonspirit_board_goal: initiative.impact_commonspirit_board_goal || false,
      impact_commonspirit_2026_5for25: initiative.impact_commonspirit_2026_5for25 || false,
      impact_system_policy: initiative.impact_system_policy || false,
      impact_patient_safety: initiative.impact_patient_safety || false,
      impact_regulatory_compliance: initiative.impact_regulatory_compliance || false,
      impact_financial: initiative.impact_financial || false,
      impact_other: initiative.impact_other || '',
      supporting_information: initiative.supporting_information || '',
      groups_nurses: initiative.groups_nurses || false,
      groups_physicians_apps: initiative.groups_physicians_apps || false,
      groups_therapies: initiative.groups_therapies || false,
      groups_lab: initiative.groups_lab || false,
      groups_pharmacy: initiative.groups_pharmacy || false,
      groups_radiology: initiative.groups_radiology || false,
      groups_administration: initiative.groups_administration || false,
      groups_other: initiative.groups_other || '',
      regions_impacted: initiative.regions_impacted || '',
      required_date: initiative.required_date || '',
      required_date_reason: initiative.required_date_reason || '',
      additional_comments: initiative.additional_comments || ''
    });

    // Load metrics from initiative_metrics related table into Tab 4
    // Updated for Pre/Post interface with actualValue, actualImprovement, varianceFromTarget
    if (initiative.metrics && initiative.metrics.length > 0) {
      setTab4Metrics(initiative.metrics.map((m: any) => ({
        // Proposed Goals
        metricName: m.metric_name || '',
        metricType: m.metric_type || '',
        unit: m.unit || '',
        baselineValue: m.baseline_value?.toString() || '',
        baselineDate: m.baseline_date || '',
        targetValue: m.target_value?.toString() || '',
        measurementMethod: m.measurement_method || '',
        // Actual Outcomes (current_value maps to actualValue, measurement_date maps to actualDate)
        actualValue: m.current_value?.toString() || '',
        actualDate: m.measurement_date || '',
        actualImprovement: m.improvement || '',
        varianceFromTarget: m.variance_from_target || ''
      })));
    }

    // Tab 2: Work Scope
    setTab2Data({
      teamMemberId: initiative.team_member_id || '',
      role: initiative.role || '',
      ownerName: initiative.owner_name,
      initiativeName: initiative.initiative_name,
      type: initiative.type,
      status: initiative.status,
      phase: (initiative as any).phase || '',
      workEffort: (initiative as any).work_effort || '',
      ehrsImpacted: initiative.ehrs_impacted || '',
      serviceLine: initiative.service_line || '',
      startDate: initiative.start_date || '',
      endDate: initiative.end_date || '',
      timeframeDisplay: initiative.timeframe_display || '',
      clinicalSponsorName: initiative.clinical_sponsor_name || '',
      clinicalSponsorTitle: initiative.clinical_sponsor_title || '',
      governanceBodies: initiative.governance_bodies?.join(', ') || '',
      keyCollaborators: initiative.key_collaborators?.join(', ') || '',
      directHoursPerWeek: (initiative as any).direct_hours_per_week?.toString() || ''
    });

    // Populate team member assignments for Tab 2
    // First check if we have team_members array from junction table (new way)
    if (initiative.team_members && initiative.team_members.length > 0) {
      const assignments = initiative.team_members
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))  // Primary first
        .map(tm => ({
          teamMemberId: tm.team_member_id,
          teamMemberName: tm.team_member_name || '',
          role: tm.role
        }));
      setTeamMemberAssignments(assignments);
      console.log('✅ Loaded', assignments.length, 'team member assignments from junction table');
    }
    // Fallback to old way (for backward compatibility with initiatives not yet migrated)
    else if (initiative.team_member_id && initiative.owner_name) {
      setTeamMemberAssignments([{
        teamMemberId: initiative.team_member_id,
        teamMemberName: initiative.owner_name,
        role: initiative.role || 'Owner'
      }]);
      console.log('✅ Loaded single team member from initiative.team_member_id (legacy)');
    }

    // Tab 3: Proposed Solution & Journal
    setTab3Data({
      proposedSolution: initiative.proposed_solution || '',
      votingStatement: initiative.voting_statement || '',
      ehrAreasImpacted: initiative.ehr_areas_impacted || []
    });
    setJournalEntries(initiative.journal_log || []);

    // Tab 4: Financial, Performance, Projections, Story
    // (Metrics already loaded above)

    // Load financial data from initiative columns (Phase 1 saves here) OR from financial_impact table
    console.log('💰 Loading financial data from initiative:', {
      projected_annual_revenue: initiative.projected_annual_revenue,
      projection_basis: initiative.projection_basis,
      calculation_methodology: initiative.calculation_methodology,
      key_assumptions: initiative.key_assumptions,
      financial_impact: initiative.financial_impact
    });

    // Calculate variance from projected if we have both values
    const projectedValue = initiative.projected_annual_revenue
      || initiative.financial_impact?.projected_annual
      || null;
    const actualValue = initiative.financial_impact?.actual_revenue || null;
    let varianceFromProjected = '';
    if (projectedValue !== null && actualValue !== null) {
      const variance = actualValue - projectedValue;
      varianceFromProjected = variance >= 0
        ? `+${variance.toLocaleString()}`
        : `-${Math.abs(variance).toLocaleString()}`;
    }

    setTab4Financial({
      // Projected data - try initiative columns first, then financial_impact table
      projectedAnnual: initiative.projected_annual_revenue?.toString()
        || initiative.financial_impact?.projected_annual?.toString()
        || '',
      projectionBasis: initiative.projection_basis
        || initiative.financial_impact?.projection_basis
        || '',
      calculationMethodology: initiative.calculation_methodology
        || initiative.financial_impact?.calculation_methodology
        || '',
      keyAssumptions: initiative.key_assumptions
        ? (Array.isArray(initiative.key_assumptions) ? initiative.key_assumptions.join('\n') : initiative.key_assumptions)
        : (initiative.financial_impact?.key_assumptions?.join('\n') || ''),
      // Actual data - only in financial_impact table
      actualRevenue: initiative.financial_impact?.actual_revenue?.toString() || '',
      actualTimeframe: initiative.financial_impact?.actual_timeframe || '',
      measurementStartDate: initiative.financial_impact?.measurement_start_date || '',
      measurementEndDate: initiative.financial_impact?.measurement_end_date || '',
      varianceFromProjected: varianceFromProjected
    });

    console.log('💰 Tab4 financial state set to:', {
      projectedAnnual: initiative.projected_annual_revenue?.toString() || initiative.financial_impact?.projected_annual?.toString() || '',
      projectionBasis: initiative.projection_basis || initiative.financial_impact?.projection_basis || ''
    });

    if (initiative.performance_data) {
      setTab4Performance({
        usersDeployed: initiative.performance_data.users_deployed?.toString() || '',
        totalPotentialUsers: initiative.performance_data.total_potential_users?.toString() || '',
        primaryOutcome: initiative.performance_data.primary_outcome || '',
        performanceMeasurementMethod: initiative.performance_data.measurement_method || '',
        sampleSize: initiative.performance_data.sample_size || '',
        measurementPeriod: initiative.performance_data.measurement_period || '',
        annualImpactCalculated: initiative.performance_data.annual_impact_calculated || '',
        calculationFormula: initiative.performance_data.calculation_formula || ''
      });
    }

    if (initiative.projections) {
      setTab4Projections({
        projectionScenario: initiative.projections.scenario_description || '',
        projectedUsers: initiative.projections.projected_users?.toString() || '',
        percentOfOrganization: initiative.projections.percent_of_organization?.toString() || '',
        projectedTimeSavings: initiative.projections.projected_time_savings || '',
        projectedDollarValue: initiative.projections.projected_dollar_value || '',
        revenueImpact: initiative.projections.revenue_impact || '',
        projectionCalculationMethod: initiative.projections.calculation_method || '',
        projectionAssumptions: initiative.projections.assumptions?.join('\n') || '',
        sensitivityNotes: initiative.projections.sensitivity_notes || '',
        additionalBenefits: initiative.projections.additional_benefits || ''
      });
    }

    if (initiative.story) {
      setTab4Story({
        challenge: initiative.story.challenge || '',
        approach: initiative.story.approach || '',
        outcome: initiative.story.outcome || '',
        collaborationDetail: initiative.story.collaboration_detail || ''
      });
    }

    setIsDraft(initiative.is_draft);
  };

  const loadFromGovernanceRequest = (request: GovernanceRequest) => {
    console.log('🔍 Loading from governance request:', request);

    // Tab 1: Pre-fill from governance request (financial fields removed - moved to Tab 4)
    setTab1Data({
      title: request.title || '',
      division_region: request.division_region || '',
      submitter_name: request.submitter_name || '',
      submitter_email: request.submitter_email || '',
      problem_statement: request.problem_statement || '',
      desired_outcomes: request.desired_outcomes || '',
      system_clinical_leader: request.system_clinical_leader || '',
      patient_care_value: request.patient_care_value || '',
      compliance_regulatory_value: request.compliance_regulatory_value || '',
      target_timeline: request.target_timeline || '',
      estimated_scope: request.estimated_scope || '',
      impact_commonspirit_board_goal: request.impact_commonspirit_board_goal || false,
      impact_commonspirit_2026_5for25: request.impact_commonspirit_2026_5for25 || false,
      impact_system_policy: request.impact_system_policy || false,
      impact_patient_safety: request.impact_patient_safety || false,
      impact_regulatory_compliance: request.impact_regulatory_compliance || false,
      impact_financial: request.impact_financial || false,
      impact_other: request.impact_other || '',
      supporting_information: request.supporting_information || '',
      groups_nurses: request.groups_nurses || false,
      groups_physicians_apps: request.groups_physicians_apps || false,
      groups_therapies: request.groups_therapies || false,
      groups_lab: request.groups_lab || false,
      groups_pharmacy: request.groups_pharmacy || false,
      groups_radiology: request.groups_radiology || false,
      groups_administration: request.groups_administration || false,
      groups_other: request.groups_other || '',
      regions_impacted: request.regions_impacted || '',
      required_date: request.required_date || '',
      required_date_reason: request.required_date_reason || '',
      additional_comments: request.additional_comments || ''
    });

    // Load metrics into Tab 4 (Outcomes & Results) - Updated for Pre/Post interface
    if (request.impact_metrics && request.impact_metrics.length > 0) {
      setTab4Metrics(request.impact_metrics.map((m: any) => ({
        // Proposed Goals (from governance request)
        metricName: m.metric_name || '',
        metricType: m.metric_type || '',
        unit: m.unit || '',
        baselineValue: m.baseline_value?.toString() || '',
        baselineDate: m.baseline_date || '',
        targetValue: m.target_value?.toString() || '',
        measurementMethod: m.measurement_method || '',
        // Actual Outcomes (empty - user will fill these out)
        actualValue: '',
        actualDate: '',
        actualImprovement: '',
        varianceFromTarget: ''
      })));
    }

    // Load financial data into Tab 4 (Projected side of Pre/Post interface)
    setTab4Financial({
      // Projected (from governance request)
      projectedAnnual: request.projected_annual_revenue?.toString() || '',
      projectionBasis: request.projection_basis || '',
      calculationMethodology: request.calculation_methodology || '',
      keyAssumptions: request.key_assumptions?.join('\n') || '',
      // Realized (empty - user will fill these out)
      actualRevenue: '',
      actualTimeframe: '',
      measurementStartDate: '',
      measurementEndDate: '',
      varianceFromProjected: ''
    });

    // Tab 2: Pre-fill initiative name, type, and clinical sponsor
    setTab2Data(prev => ({
      ...prev,
      initiativeName: request.title || '',
      type: 'Governance',
      clinicalSponsorName: request.system_clinical_leader || ''
    }));
  };

  // Validation - All fields are optional for progressive data entry
  const validateForm = () => {
    const errors: string[] = [];

    // No required fields - allow saving with any amount of data
    // Users can progressively fill out the form over time

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  // Save logic
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare governance metadata (Tab 1) - Financial fields removed (now in Tab 4)
      const governanceMetadata = {
        division_region: tab1Data.division_region,
        submitter: {
          name: tab1Data.submitter_name,
          email: tab1Data.submitter_email
        },
        system_clinical_leader: tab1Data.system_clinical_leader,
        patient_care_value: tab1Data.patient_care_value,
        compliance_regulatory_value: tab1Data.compliance_regulatory_value,
        target_timeline: tab1Data.target_timeline,
        estimated_scope: tab1Data.estimated_scope,
        impact_categories: {
          board_goal: tab1Data.impact_commonspirit_board_goal,
          five_for_25: tab1Data.impact_commonspirit_2026_5for25,
          system_policy: tab1Data.impact_system_policy,
          patient_safety: tab1Data.impact_patient_safety,
          regulatory_compliance: tab1Data.impact_regulatory_compliance,
          financial: tab1Data.impact_financial,
          other: tab1Data.impact_other
        },
        supporting_information: tab1Data.supporting_information,
        groups_impacted: {
          nurses: tab1Data.groups_nurses,
          physicians_apps: tab1Data.groups_physicians_apps,
          therapies: tab1Data.groups_therapies,
          lab: tab1Data.groups_lab,
          pharmacy: tab1Data.groups_pharmacy,
          radiology: tab1Data.groups_radiology,
          administration: tab1Data.groups_administration,
          other: tab1Data.groups_other
        },
        regions_impacted: tab1Data.regions_impacted,
        required_date: tab1Data.required_date,
        required_date_reason: tab1Data.required_date_reason,
        additional_comments: tab1Data.additional_comments
      };

      // Get primary assignment from teamMemberAssignments array
      const primaryAssignment = teamMemberAssignments[0];
      const primaryTeamMemberId = primaryAssignment?.teamMemberId || null;
      const primaryRole = primaryAssignment?.role || null;
      const primaryOwnerName = primaryAssignment?.teamMemberName || teamMembers.find(m => m.id === primaryTeamMemberId)?.name || '';

      console.log('💾 Saving with team member data:', {
        primaryAssignment,
        primaryTeamMemberId,
        primaryRole,
        primaryOwnerName,
        allAssignments: teamMemberAssignments
      });

      // Prepare initiative data
      const initiativeData = {
        // Tab 1
        problem_statement: tab1Data.problem_statement || null,
        desired_outcomes: tab1Data.desired_outcomes || null,
        governance_metadata: governanceMetadata,
        request_id: linkedGovernanceRequest?.request_id || editingInitiative?.request_id || null,
        governance_request_id: linkedGovernanceRequest?.id || editingInitiative?.governance_request_id || null,

        // Tab 2 - Use teamMemberAssignments array instead of tab2Data
        team_member_id: primaryTeamMemberId,
        role: primaryRole,
        owner_name: primaryOwnerName,
        initiative_name: tab2Data.initiativeName,
        type: tab2Data.type,
        status: tab2Data.status,
        phase: tab2Data.phase || null,
        work_effort: tab2Data.workEffort || null,
        ehrs_impacted: tab2Data.ehrsImpacted || null,
        service_line: tab2Data.serviceLine || null,
        start_date: tab2Data.startDate || null,
        end_date: tab2Data.endDate || null,
        timeframe_display: tab2Data.timeframeDisplay || null,
        clinical_sponsor_name: tab2Data.clinicalSponsorName || null,
        clinical_sponsor_title: tab2Data.clinicalSponsorTitle || null,
        governance_bodies: tab2Data.governanceBodies ? tab2Data.governanceBodies.split(',').map(s => s.trim()) : null,
        key_collaborators: tab2Data.keyCollaborators ? tab2Data.keyCollaborators.split(',').map(s => s.trim()) : null,
        direct_hours_per_week: tab2Data.directHoursPerWeek ? parseFloat(tab2Data.directHoursPerWeek) : null,

        // Tab 3
        proposed_solution: tab3Data.proposedSolution || null,
        voting_statement: tab3Data.votingStatement || null,
        ehr_areas_impacted: tab3Data.ehrAreasImpacted.length > 0 ? tab3Data.ehrAreasImpacted : null,
        journal_log: journalEntries,

        // Tab 4 - Financial data saved to initiative columns
        projected_annual_revenue: tab4Financial.projectedAnnual ? parseFloat(tab4Financial.projectedAnnual) : null,
        projection_basis: tab4Financial.projectionBasis || null,
        calculation_methodology: tab4Financial.calculationMethodology || null,
        key_assumptions: tab4Financial.keyAssumptions ? tab4Financial.keyAssumptions.split('\n').filter(a => a.trim()) : null,

        // Metadata
        is_draft: isDraft,
        updated_at: new Date().toISOString(),
        last_updated_by: currentUser.name
      };

      let initiativeId = editingInitiative?.id;

      if (isEditing) {
        console.log('📝 Updating initiative with ID:', editingInitiative.id);
        const { error: updateError } = await supabase
          .from('initiatives')
          .update(initiativeData)
          .eq('id', editingInitiative.id);

        if (updateError) {
          console.error('❌ Update error:', updateError);
          throw updateError;
        }
        console.log('✅ Initiative updated successfully');
      } else {
        console.log('➕ Inserting new initiative');
        const { data: insertedData, error: insertError } = await supabase
          .from('initiatives')
          .insert({
            ...initiativeData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          throw insertError;
        }
        initiativeId = insertedData.id;
        console.log('✅ Initiative inserted with ID:', initiativeId);
      }

      if (!initiativeId) {
        throw new Error('Failed to get initiative ID');
      }

      // Save Team Member Assignments to junction table
      console.log('💾 Saving team member assignments...');

      // Delete existing team member assignments
      const { error: deleteError } = await supabase
        .from('initiative_team_members')
        .delete()
        .eq('initiative_id', initiativeId);

      if (deleteError) {
        console.error('❌ Error deleting old team member assignments:', deleteError);
        // Don't throw - continue with insert
      }

      // Insert all team member assignments
      if (teamMemberAssignments.length > 0) {
        const assignments = teamMemberAssignments.map((assignment, index) => ({
          initiative_id: initiativeId,
          team_member_id: assignment.teamMemberId,
          role: assignment.role,
          is_primary: index === 0  // First one is primary owner
        }));

        console.log('📋 Attempting to insert assignments:', assignments);

        const { data: insertedData, error: assignmentError } = await supabase
          .from('initiative_team_members')
          .insert(assignments)
          .select();

        if (assignmentError) {
          console.error('❌ Error saving team member assignments:', assignmentError);
          console.error('❌ Error details:', {
            message: assignmentError.message,
            details: assignmentError.details,
            hint: assignmentError.hint,
            code: assignmentError.code
          });
          console.error('❌ Attempted to insert:', assignments);
          throw assignmentError;
        }
        console.log('✅ Team member assignments saved:', assignments.length);
        console.log('✅ Inserted data:', insertedData);
      } else {
        console.warn('⚠️ No team member assignments to save');
      }

      // Tab 4: Save related tables
      console.log('💾 Saving Tab 4 related data...');

      // 1. Save Metrics (initiative_metrics table)
      // UPDATE existing metrics or INSERT new ones (don't delete and re-create)
      if (tab4Metrics.length > 0 && tab4Metrics.some(m => m.metricName.trim())) {
        const metricsToSave = tab4Metrics
          .filter(m => m.metricName.trim())
          .map(m => ({
            initiative_id: initiativeId,
            metric_name: m.metricName,
            metric_type: m.metricType || null,
            unit: m.unit || null,
            baseline_value: m.baselineValue ? parseFloat(m.baselineValue) : null,
            baseline_date: m.baselineDate || null,
            target_value: m.targetValue ? parseFloat(m.targetValue) : null,
            measurement_method: m.measurementMethod || null,
            // Actual outcome fields
            current_value: m.actualValue ? parseFloat(m.actualValue) : null,
            measurement_date: m.actualDate || null,
            improvement: m.actualImprovement || null,
            variance_from_target: m.varianceFromTarget || null
          }));

        // Get existing metrics for this initiative
        const { data: existingMetrics } = await supabase
          .from('initiative_metrics')
          .select('id, metric_name')
          .eq('initiative_id', initiativeId);

        const existingMetricNames = new Set(existingMetrics?.map(m => m.metric_name) || []);

        // Update existing metrics and insert new ones
        for (const metric of metricsToSave) {
          if (existingMetricNames.has(metric.metric_name)) {
            // Update existing metric
            const { error: updateError } = await supabase
              .from('initiative_metrics')
              .update(metric)
              .eq('initiative_id', initiativeId)
              .eq('metric_name', metric.metric_name);

            if (updateError) {
              console.error('❌ Error updating metric:', metric.metric_name, updateError);
              throw updateError;
            }
          } else {
            // Insert new metric
            const { error: insertError } = await supabase
              .from('initiative_metrics')
              .insert(metric);

            if (insertError) {
              console.error('❌ Error inserting metric:', metric.metric_name, insertError);
              throw insertError;
            }
          }
        }

        console.log('✅ Metrics saved/updated:', metricsToSave.length);
      }

      // 2. Save Financial Impact (initiative_financial_impact table - for actual/realized data)
      if (tab4Financial.projectedAnnual || tab4Financial.actualRevenue) {
        const financialData = {
          initiative_id: initiativeId,
          projected_annual: parseFloat(tab4Financial.projectedAnnual) || null,
          projection_basis: tab4Financial.projectionBasis || null,
          calculation_methodology: tab4Financial.calculationMethodology || null,
          key_assumptions: tab4Financial.keyAssumptions || null,
          actual_revenue: parseFloat(tab4Financial.actualRevenue) || null,
          actual_timeframe: tab4Financial.actualTimeframe || null,
          measurement_start_date: tab4Financial.measurementStartDate || null,
          measurement_end_date: tab4Financial.measurementEndDate || null
        };

        // Check if financial impact already exists
        const { data: existingFinancial } = await supabase
          .from('initiative_financial_impact')
          .select('id')
          .eq('initiative_id', initiativeId)
          .single();

        if (existingFinancial) {
          // Update existing
          await supabase
            .from('initiative_financial_impact')
            .update(financialData)
            .eq('initiative_id', initiativeId);
          console.log('✅ Financial impact updated');
        } else {
          // Insert new
          await supabase
            .from('initiative_financial_impact')
            .insert(financialData);
          console.log('✅ Financial impact inserted');
        }
      }

      // Dashboard metrics will update automatically via real-time queries in parent component
      // No need to manually recalculate - parent's onSuccess() calls loadData() which refreshes everything

      // If this initiative is linked to a governance request, sync the phase back to governance_requests.work_phase
      const governanceRequestId = initiativeData.governance_request_id || editingInitiative?.governance_request_id;
      if (governanceRequestId && tab2Data.phase) {
        console.log('🔄 Syncing phase to governance_requests.work_phase:', {
          governanceRequestId,
          phase: tab2Data.phase
        });

        const { error: syncError } = await supabase
          .from('governance_requests')
          .update({ work_phase: tab2Data.phase })
          .eq('id', governanceRequestId);

        if (syncError) {
          console.error('❌ Error syncing work_phase to governance_requests:', syncError);
          // Don't throw - this is non-critical
        } else {
          console.log('✅ work_phase synced to governance_requests');
        }
      }

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Error saving initiative:', err);
      setError(err.message || 'Failed to save initiative');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Initiative' : 'New Initiative'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-4">
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab1' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tab1')}
            >
              Request Details
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab2' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tab2')}
            >
              Work Scope & Assignments
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab3' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tab3')}
            >
              Proposed Solution
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab4' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tab4')}
            >
              Outcomes & Results
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'tab1' && (
            <Tab1Content
              data={tab1Data}
              setData={setTab1Data}
            />
          )}
          {activeTab === 'tab2' && (
            <Tab2Content
              data={tab2Data}
              setData={setTab2Data}
              teamMembers={teamMembers}
              loadingMembers={loadingMembers}
              teamMemberAssignments={teamMemberAssignments}
              setTeamMemberAssignments={setTeamMemberAssignments}
            />
          )}
          {activeTab === 'tab3' && (
            <Tab3Content
              data={tab3Data}
              setData={setTab3Data}
              journalEntries={journalEntries}
              setJournalEntries={setJournalEntries}
              newJournalEntry={newJournalEntry}
              setNewJournalEntry={setNewJournalEntry}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'tab4' && tab4Metrics && tab4Financial && tab4Performance && tab4Projections && tab4Story && (
            <Tab4Content
              metrics={tab4Metrics}
              setMetrics={setTab4Metrics}
              financial={tab4Financial}
              setFinancial={setTab4Financial}
              performance={tab4Performance}
              setPerformance={setTab4Performance}
              projections={tab4Projections}
              setProjections={setTab4Projections}
              story={tab4Story}
              setStory={setTab4Story}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="w-4 h-4"
              />
              Save as Draft
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Initiative
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
