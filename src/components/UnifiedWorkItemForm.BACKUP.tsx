import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Plus } from 'lucide-react';
import { supabase, TeamMember, InitiativeWithDetails, GovernanceRequest, JournalEntry } from '../lib/supabase';
import { DIVISION_REGIONS } from '../lib/governanceUtils';
import { CompletionIndicator } from './CompletionIndicator';
import { recalculateDashboardMetrics } from '../lib/workloadCalculator';

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
    projected_annual_revenue: '',
    projection_basis: '',
    calculation_methodology: '',
    key_assumptions: '',
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

  const [tab1Metrics, setTab1Metrics] = useState<Metric[]>([{
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
    directHoursPerWeek: '' // For Governance type only
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

  // Tab 4: Outcomes & Results (from related tables)
  const [tab4Metrics, setTab4Metrics] = useState<Metric[]>([{
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

  const [tab4Financial, setTab4Financial] = useState({
    actualRevenue: '',
    actualTimeframe: '',
    measurementStartDate: '',
    measurementEndDate: '',
    projectedAnnual: '',
    projectionBasis: '',
    calculationMethodology: '',
    keyAssumptions: ''
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
      // Load from initiatives table (Tab 2-4 populated, Tab 1 might be empty)
      loadFromInitiative(editingInitiative);
    } else if (linkedGovernanceRequest) {
      // Load from governance_requests (Tab 1 pre-filled, Tab 2-4 empty)
      loadFromGovernanceRequest(linkedGovernanceRequest);
    }
    // else: Brand new - all tabs empty (default state)
  }, [editingInitiative, linkedGovernanceRequest]);

  const loadFromInitiative = (initiative: InitiativeWithDetails) => {
    console.log('🔍 UnifiedWorkItemForm - Loading from initiative:', initiative);

    // Tab 1: Governance fields (might be empty for 409 existing initiatives)
    const govMeta = initiative.governance_metadata || {};
    setTab1Data({
      title: initiative.initiative_name || '',
      division_region: govMeta.division_region || '',
      submitter_name: govMeta.submitter?.name || '',
      submitter_email: govMeta.submitter?.email || '',
      problem_statement: initiative.problem_statement || '',
      desired_outcomes: initiative.desired_outcomes || '',
      system_clinical_leader: govMeta.system_clinical_leader || '',
      patient_care_value: govMeta.patient_care_value || '',
      compliance_regulatory_value: govMeta.compliance_regulatory_value || '',
      target_timeline: govMeta.target_timeline || '',
      estimated_scope: govMeta.estimated_scope || '',
      projected_annual_revenue: govMeta.projected_annual_revenue?.toString() || '',
      projection_basis: govMeta.projection_basis || '',
      calculation_methodology: govMeta.calculation_methodology || '',
      key_assumptions: govMeta.key_assumptions?.join('\n') || '',
      impact_commonspirit_board_goal: govMeta.impact_categories?.board_goal || false,
      impact_commonspirit_2026_5for25: govMeta.impact_categories?.five_for_25 || false,
      impact_system_policy: govMeta.impact_categories?.system_policy || false,
      impact_patient_safety: govMeta.impact_categories?.patient_safety || false,
      impact_regulatory_compliance: govMeta.impact_categories?.regulatory_compliance || false,
      impact_financial: govMeta.impact_categories?.financial || false,
      impact_other: govMeta.impact_categories?.other || '',
      supporting_information: govMeta.supporting_information || '',
      groups_nurses: govMeta.groups_impacted?.nurses || false,
      groups_physicians_apps: govMeta.groups_impacted?.physicians_apps || false,
      groups_therapies: govMeta.groups_impacted?.therapies || false,
      groups_lab: govMeta.groups_impacted?.lab || false,
      groups_pharmacy: govMeta.groups_impacted?.pharmacy || false,
      groups_radiology: govMeta.groups_impacted?.radiology || false,
      groups_administration: govMeta.groups_impacted?.administration || false,
      groups_other: govMeta.groups_impacted?.other || '',
      regions_impacted: govMeta.regions_impacted || '',
      required_date: govMeta.required_date || '',
      required_date_reason: govMeta.required_date_reason || '',
      additional_comments: govMeta.additional_comments || ''
    });

    // Tab 1 metrics (from governance_metadata if available)
    if (govMeta.impact_metrics && govMeta.impact_metrics.length > 0) {
      setTab1Metrics(govMeta.impact_metrics.map((m: any) => ({
        metricName: m.metric_name || '',
        metricType: m.metric_type || '',
        unit: m.unit || '',
        baselineValue: m.baseline_value?.toString() || '',
        baselineDate: m.baseline_date || '',
        currentValue: m.current_value?.toString() || '',
        measurementDate: m.measurement_date || '',
        targetValue: m.target_value?.toString() || '',
        improvement: m.improvement || '',
        measurementMethod: m.measurement_method || ''
      })));
    }

    // Tab 2: Work Scope & Assignments
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

    // Tab 3: Proposed Solution & Journal
    setTab3Data({
      proposedSolution: initiative.proposed_solution || '',
      votingStatement: initiative.voting_statement || '',
      ehrAreasImpacted: initiative.ehr_areas_impacted || []
    });
    setJournalEntries(initiative.journal_log || []);

    // Tab 4: Metrics from initiative_metrics table
    if (initiative.metrics && initiative.metrics.length > 0) {
      setTab4Metrics(initiative.metrics.map(m => ({
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

    // Tab 4: Financial Impact
    if (initiative.financial_impact) {
      setTab4Financial({
        actualRevenue: initiative.financial_impact.actual_revenue?.toString() || '',
        actualTimeframe: initiative.financial_impact.actual_timeframe || '',
        measurementStartDate: initiative.financial_impact.measurement_start_date || '',
        measurementEndDate: initiative.financial_impact.measurement_end_date || '',
        projectedAnnual: initiative.financial_impact.projected_annual?.toString() || '',
        projectionBasis: initiative.financial_impact.projection_basis || '',
        calculationMethodology: initiative.financial_impact.calculation_methodology || '',
        keyAssumptions: initiative.financial_impact.key_assumptions?.join('\n') || ''
      });
    }

    // Tab 4: Performance Data
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

    // Tab 4: Projections
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

    // Tab 4: Story
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
    console.log('🔍 UnifiedWorkItemForm - Loading from governance request:', request);

    // Tab 1: Pre-fill from governance request
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
      projected_annual_revenue: request.projected_annual_revenue?.toString() || '',
      projection_basis: request.projection_basis || '',
      calculation_methodology: request.calculation_methodology || '',
      key_assumptions: request.key_assumptions?.join('\n') || '',
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

    // Tab 1 metrics
    if (request.impact_metrics && request.impact_metrics.length > 0) {
      setTab1Metrics(request.impact_metrics.map((m: any) => ({
        metricName: m.metric_name || '',
        metricType: m.metric_type || '',
        unit: m.unit || '',
        baselineValue: m.baseline_value?.toString() || '',
        baselineDate: m.baseline_date || '',
        currentValue: m.current_value?.toString() || '',
        measurementDate: m.measurement_date || '',
        targetValue: m.target_value?.toString() || '',
        improvement: m.improvement || '',
        measurementMethod: m.measurement_method || ''
      })));
    }

    // Tab 2: Pre-fill initiative name and type from governance request
    setTab2Data(prev => ({
      ...prev,
      initiativeName: request.title || '',
      type: 'Governance' // Default type for governance requests
    }));

    // Tabs 3-4 stay empty for new governance requests
  };

  // Metric management functions
  const addTab1Metric = () => {
    setTab1Metrics([...tab1Metrics, {
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

  const removeTab1Metric = (index: number) => {
    setTab1Metrics(tab1Metrics.filter((_, i) => i !== index));
  };

  const updateTab1Metric = (index: number, field: keyof Metric, value: string) => {
    const updated = [...tab1Metrics];
    updated[index][field] = value;
    setTab1Metrics(updated);
  };

  const addTab4Metric = () => {
    setTab4Metrics([...tab4Metrics, {
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

  const removeTab4Metric = (index: number) => {
    setTab4Metrics(tab4Metrics.filter((_, i) => i !== index));
  };

  const updateTab4Metric = (index: number, field: keyof Metric, value: string) => {
    const updated = [...tab4Metrics];
    updated[index][field] = value;
    setTab4Metrics(updated);
  };

  // Team member assignment functions
  const addTeamMember = () => {
    setTeamMemberAssignments([...teamMemberAssignments, {
      teamMemberId: '',
      teamMemberName: '',
      role: ''
    }]);
  };

  const removeTeamMember = (index: number) => {
    if (teamMemberAssignments.length > 1) {
      setTeamMemberAssignments(teamMemberAssignments.filter((_, i) => i !== index));
    }
  };

  const updateTeamMemberAssignment = (index: number, field: keyof TeamMemberAssignment, value: string) => {
    const updated = [...teamMemberAssignments];
    updated[index][field] = value;

    // If changing team member, auto-fill name
    if (field === 'teamMemberId') {
      const member = teamMembers.find(m => m.id === value);
      if (member) {
        updated[index].teamMemberName = member.name;
      }
    }

    setTeamMemberAssignments(updated);
  };

  // Journal log functions
  const addJournalEntry = () => {
    if (newJournalEntry.trim()) {
      const entry: JournalEntry = {
        timestamp: new Date().toISOString(),
        author: currentUser.name,
        author_id: currentUser.id,
        entry: newJournalEntry.trim()
      };
      setJournalEntries([entry, ...journalEntries]); // Prepend (newest first)
      setNewJournalEntry('');
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Validation
  const validateForm = () => {
    const errors: string[] = [];

    // Tab 2 required fields
    if (!tab2Data.initiativeName?.trim()) {
      errors.push('Initiative name is required (Tab 2)');
    }
    if (!tab2Data.type) {
      errors.push('Work type is required (Tab 2)');
    }
    if (!tab2Data.status) {
      errors.push('Status is required (Tab 2)');
    }

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

      // Prepare governance metadata (Tab 1)
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
        projected_annual_revenue: tab1Data.projected_annual_revenue ? parseFloat(tab1Data.projected_annual_revenue) : null,
        projection_basis: tab1Data.projection_basis,
        calculation_methodology: tab1Data.calculation_methodology,
        key_assumptions: tab1Data.key_assumptions ? tab1Data.key_assumptions.split('\n').filter(a => a.trim()) : [],
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
        additional_comments: tab1Data.additional_comments,
        impact_metrics: tab1Metrics
          .filter(m => m.metricName?.trim())
          .map(m => ({
            metric_name: m.metricName,
            metric_type: m.metricType,
            unit: m.unit,
            baseline_value: m.baselineValue ? parseFloat(m.baselineValue) : null,
            baseline_date: m.baselineDate,
            current_value: m.currentValue ? parseFloat(m.currentValue) : null,
            measurement_date: m.measurementDate,
            target_value: m.targetValue ? parseFloat(m.targetValue) : null,
            improvement: m.improvement,
            measurement_method: m.measurementMethod
          }))
      };

      // Prepare initiative data (Tabs 2-3)
      const initiativeData = {
        // Tab 1 fields
        problem_statement: tab1Data.problem_statement || null,
        desired_outcomes: tab1Data.desired_outcomes || null,
        governance_metadata: governanceMetadata,
        request_id: linkedGovernanceRequest?.request_id || editingInitiative?.request_id || null,
        governance_request_id: linkedGovernanceRequest?.id || editingInitiative?.governance_request_id || null,

        // Tab 2 fields
        team_member_id: tab2Data.teamMemberId || null,
        role: tab2Data.role || null,
        owner_name: tab2Data.ownerName || teamMembers.find(m => m.id === tab2Data.teamMemberId)?.name || '',
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

        // Tab 3 fields
        proposed_solution: tab3Data.proposedSolution || null,
        voting_statement: tab3Data.votingStatement || null,
        ehr_areas_impacted: tab3Data.ehrAreasImpacted.length > 0 ? tab3Data.ehrAreasImpacted : null,
        journal_log: journalEntries,

        // Metadata
        is_draft: isDraft,
        updated_at: new Date().toISOString(),
        last_updated_by: currentUser.name
      };

      let initiativeId = editingInitiative?.id;

      if (isEditing) {
        // Update existing initiative
        const { error: updateError } = await supabase
          .from('initiatives')
          .update(initiativeData)
          .eq('id', editingInitiative.id);

        if (updateError) throw updateError;
      } else {
        // Insert new initiative
        const { data: insertedData, error: insertError } = await supabase
          .from('initiatives')
          .insert({
            ...initiativeData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        initiativeId = insertedData.id;
      }

      if (!initiativeId) {
        throw new Error('Failed to get initiative ID');
      }

      // Tab 4: Save related tables (only if data exists)

      // Save metrics (initiative_metrics table)
      const validTab4Metrics = tab4Metrics.filter(m => m.metricName?.trim());
      if (validTab4Metrics.length > 0) {
        // Delete existing metrics
        await supabase
          .from('initiative_metrics')
          .delete()
          .eq('initiative_id', initiativeId);

        // Insert new metrics
        const metricsToInsert = validTab4Metrics.map((m, index) => ({
          initiative_id: initiativeId,
          metric_name: m.metricName,
          metric_type: m.metricType,
          unit: m.unit,
          baseline_value: m.baselineValue ? parseFloat(m.baselineValue) : null,
          baseline_date: m.baselineDate || null,
          current_value: m.currentValue ? parseFloat(m.currentValue) : null,
          measurement_date: m.measurementDate || null,
          target_value: m.targetValue ? parseFloat(m.targetValue) : null,
          improvement: m.improvement || null,
          measurement_method: m.measurementMethod || null,
          display_order: index
        }));

        const { error: metricsError } = await supabase
          .from('initiative_metrics')
          .insert(metricsToInsert);

        if (metricsError) throw metricsError;
      }

      // Save financial impact
      const hasFinancialData = tab4Financial.actualRevenue || tab4Financial.projectedAnnual ||
                              tab4Financial.calculationMethodology;
      if (hasFinancialData) {
        const keyAssumptions = tab4Financial.keyAssumptions
          ? tab4Financial.keyAssumptions.split('\n').map(s => s.trim()).filter(s => s)
          : [];

        const financialData = {
          initiative_id: initiativeId,
          actual_revenue: tab4Financial.actualRevenue ? parseFloat(tab4Financial.actualRevenue) : null,
          actual_timeframe: tab4Financial.actualTimeframe || null,
          measurement_start_date: tab4Financial.measurementStartDate || null,
          measurement_end_date: tab4Financial.measurementEndDate || null,
          projected_annual: tab4Financial.projectedAnnual ? parseFloat(tab4Financial.projectedAnnual) : null,
          projection_basis: tab4Financial.projectionBasis || null,
          calculation_methodology: tab4Financial.calculationMethodology || null,
          key_assumptions: keyAssumptions.length > 0 ? keyAssumptions : null,
          updated_at: new Date().toISOString()
        };

        // Check if financial record exists
        const { data: existingFinancial } = await supabase
          .from('initiative_financial_impact')
          .select('id')
          .eq('initiative_id', initiativeId)
          .single();

        if (existingFinancial) {
          await supabase
            .from('initiative_financial_impact')
            .update(financialData)
            .eq('initiative_id', initiativeId);
        } else {
          await supabase
            .from('initiative_financial_impact')
            .insert(financialData);
        }
      }

      // Save performance data
      const hasPerformanceData = tab4Performance.usersDeployed || tab4Performance.primaryOutcome;
      if (hasPerformanceData) {
        const performanceData = {
          initiative_id: initiativeId,
          users_deployed: tab4Performance.usersDeployed ? parseInt(tab4Performance.usersDeployed) : null,
          total_potential_users: tab4Performance.totalPotentialUsers ? parseInt(tab4Performance.totalPotentialUsers) : null,
          primary_outcome: tab4Performance.primaryOutcome || null,
          measurement_method: tab4Performance.performanceMeasurementMethod || null,
          sample_size: tab4Performance.sampleSize || null,
          measurement_period: tab4Performance.measurementPeriod || null,
          annual_impact_calculated: tab4Performance.annualImpactCalculated || null,
          calculation_formula: tab4Performance.calculationFormula || null,
          updated_at: new Date().toISOString()
        };

        const { data: existingPerformance } = await supabase
          .from('initiative_performance_data')
          .select('id')
          .eq('initiative_id', initiativeId)
          .single();

        if (existingPerformance) {
          await supabase
            .from('initiative_performance_data')
            .update(performanceData)
            .eq('initiative_id', initiativeId);
        } else {
          await supabase
            .from('initiative_performance_data')
            .insert(performanceData);
        }
      }

      // Save projections
      const hasProjectionData = tab4Projections.projectionScenario || tab4Projections.projectedUsers;
      if (hasProjectionData) {
        const assumptions = tab4Projections.projectionAssumptions
          ? tab4Projections.projectionAssumptions.split('\n').map(s => s.trim()).filter(s => s)
          : [];

        const projectionData = {
          initiative_id: initiativeId,
          scenario_description: tab4Projections.projectionScenario || null,
          projected_users: tab4Projections.projectedUsers ? parseInt(tab4Projections.projectedUsers) : null,
          percent_of_organization: tab4Projections.percentOfOrganization ? parseFloat(tab4Projections.percentOfOrganization) : null,
          projected_time_savings: tab4Projections.projectedTimeSavings || null,
          projected_dollar_value: tab4Projections.projectedDollarValue || null,
          revenue_impact: tab4Projections.revenueImpact || null,
          calculation_method: tab4Projections.projectionCalculationMethod || null,
          assumptions: assumptions.length > 0 ? assumptions : null,
          sensitivity_notes: tab4Projections.sensitivityNotes || null,
          additional_benefits: tab4Projections.additionalBenefits || null,
          updated_at: new Date().toISOString()
        };

        const { data: existingProjection } = await supabase
          .from('initiative_projections')
          .select('id')
          .eq('initiative_id', initiativeId)
          .single();

        if (existingProjection) {
          await supabase
            .from('initiative_projections')
            .update(projectionData)
            .eq('initiative_id', initiativeId);
        } else {
          await supabase
            .from('initiative_projections')
            .insert(projectionData);
        }
      }

      // Save story
      const hasStoryData = tab4Story.challenge || tab4Story.approach || tab4Story.outcome;
      if (hasStoryData) {
        const storyData = {
          initiative_id: initiativeId,
          challenge: tab4Story.challenge || null,
          approach: tab4Story.approach || null,
          outcome: tab4Story.outcome || null,
          collaboration_detail: tab4Story.collaborationDetail || null,
          updated_at: new Date().toISOString()
        };

        const { data: existingStory } = await supabase
          .from('initiative_stories')
          .select('id')
          .eq('initiative_id', initiativeId)
          .single();

        if (existingStory) {
          await supabase
            .from('initiative_stories')
            .update(storyData)
            .eq('initiative_id', initiativeId);
        } else {
          await supabase
            .from('initiative_stories')
            .insert(storyData);
        }
      }

      // Recalculate dashboard metrics
      await recalculateDashboardMetrics();

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Error saving initiative:', err);
      setError(err.message || 'Failed to save initiative');
    } finally {
      setSaving(false);
    }
  };

  // Tab rendering components (defined inline for now, can be extracted later)
  const renderTab1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All fields in Tab 1 (Request Details) are optional.
          This tab captures governance and intake context. For existing initiatives, these fields may be empty.
        </p>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initiative Title
            </label>
            <input
              type="text"
              value={tab1Data.title}
              onChange={(e) => setTab1Data({ ...tab1Data, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Brief, descriptive title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division/Region
            </label>
            <select
              value={tab1Data.division_region}
              onChange={(e) => setTab1Data({ ...tab1Data, division_region: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Select division/region</option>
              {DIVISION_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submitter Name
            </label>
            <input
              type="text"
              value={tab1Data.submitter_name}
              onChange={(e) => setTab1Data({ ...tab1Data, submitter_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submitter Email
            </label>
            <input
              type="email"
              value={tab1Data.submitter_email}
              onChange={(e) => setTab1Data({ ...tab1Data, submitter_email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Clinical Leader/Sponsor
            </label>
            <input
              type="text"
              value={tab1Data.system_clinical_leader}
              onChange={(e) => setTab1Data({ ...tab1Data, system_clinical_leader: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* System-Level Need */}
      <div>
        <h3 className="text-lg font-semibold mb-4">System-Level Need</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem Statement
            </label>
            <textarea
              value={tab1Data.problem_statement}
              onChange={(e) => setTab1Data({ ...tab1Data, problem_statement: e.target.value })}
              rows={6}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Describe the system-level problem or opportunity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desired Outcomes
            </label>
            <textarea
              value={tab1Data.desired_outcomes}
              onChange={(e) => setTab1Data({ ...tab1Data, desired_outcomes: e.target.value })}
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Specific system-wide outcomes expected"
            />
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Value Proposition</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Care Value
            </label>
            <textarea
              value={tab1Data.patient_care_value}
              onChange={(e) => setTab1Data({ ...tab1Data, patient_care_value: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compliance/Regulatory Value
            </label>
            <textarea
              value={tab1Data.compliance_regulatory_value}
              onChange={(e) => setTab1Data({ ...tab1Data, compliance_regulatory_value: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Timeline
              </label>
              <input
                type="text"
                value={tab1Data.target_timeline}
                onChange={(e) => setTab1Data({ ...tab1Data, target_timeline: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="e.g., Q1 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Scope
              </label>
              <input
                type="text"
                value={tab1Data.estimated_scope}
                onChange={(e) => setTab1Data({ ...tab1Data, estimated_scope: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics - Dynamic Array */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Impact Metrics</h3>
        {tab1Metrics.map((metric, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Metric {index + 1}</h4>
              {tab1Metrics.length > 1 && (
                <button
                  onClick={() => removeTab1Metric(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Metric Name</label>
                <input
                  type="text"
                  value={metric.metricName}
                  onChange={(e) => updateTab1Metric(index, 'metricName', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Metric Type</label>
                <select
                  value={metric.metricType}
                  onChange={(e) => updateTab1Metric(index, 'metricType', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                >
                  <option value="">Select type</option>
                  <option value="Quality">Quality</option>
                  <option value="Efficiency">Efficiency</option>
                  <option value="Adoption">Adoption</option>
                  <option value="Financial">Financial</option>
                  <option value="Safety">Safety</option>
                  <option value="Satisfaction">Satisfaction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select
                  value={metric.unit}
                  onChange={(e) => updateTab1Metric(index, 'unit', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                >
                  <option value="">Select unit</option>
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Minutes">Minutes</option>
                  <option value="Hours">Hours</option>
                  <option value="Count">Count</option>
                  <option value="Dollars">Dollars ($)</option>
                  <option value="Days">Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Baseline Value</label>
                <input
                  type="text"
                  value={metric.baselineValue}
                  onChange={(e) => updateTab1Metric(index, 'baselineValue', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Baseline Date</label>
                <input
                  type="date"
                  value={metric.baselineDate}
                  onChange={(e) => updateTab1Metric(index, 'baselineDate', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Value</label>
                <input
                  type="text"
                  value={metric.currentValue}
                  onChange={(e) => updateTab1Metric(index, 'currentValue', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Measurement Date</label>
                <input
                  type="date"
                  value={metric.measurementDate}
                  onChange={(e) => updateTab1Metric(index, 'measurementDate', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target Value</label>
                <input
                  type="text"
                  value={metric.targetValue}
                  onChange={(e) => updateTab1Metric(index, 'targetValue', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Measurement Method</label>
                <input
                  type="text"
                  value={metric.measurementMethod}
                  onChange={(e) => updateTab1Metric(index, 'measurementMethod', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  placeholder="How is this metric measured?"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addTab1Metric}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Another Metric
        </button>
      </div>

      {/* Revenue & Financial Impact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue & Financial Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projected Annual Revenue
            </label>
            <input
              type="number"
              value={tab1Data.projected_annual_revenue}
              onChange={(e) => setTab1Data({ ...tab1Data, projected_annual_revenue: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Dollar amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projection Basis
            </label>
            <input
              type="text"
              value={tab1Data.projection_basis}
              onChange={(e) => setTab1Data({ ...tab1Data, projection_basis: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., Per user, per year"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculation Methodology
            </label>
            <textarea
              value={tab1Data.calculation_methodology}
              onChange={(e) => setTab1Data({ ...tab1Data, calculation_methodology: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="How was the financial impact calculated?"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Assumptions (one per line)
            </label>
            <textarea
              value={tab1Data.key_assumptions}
              onChange={(e) => setTab1Data({ ...tab1Data, key_assumptions: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="List key assumptions (one per line)"
            />
          </div>
        </div>
      </div>

      {/* Category of Impact - Checkboxes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Category of Impact</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.impact_commonspirit_board_goal}
              onChange={(e) => setTab1Data({ ...tab1Data, impact_commonspirit_board_goal: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">CommonSpirit Board Goal</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.impact_commonspirit_2026_5for25}
              onChange={(e) => setTab1Data({ ...tab1Data, impact_commonspirit_2026_5for25: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">CommonSpirit 2026 5-for-25</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.impact_system_policy}
              onChange={(e) => setTab1Data({ ...tab1Data, impact_system_policy: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">System Policy</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.impact_patient_safety}
              onChange={(e) => setTab1Data({ ...tab1Data, impact_patient_safety: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Patient Safety</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.impact_regulatory_compliance}
              onChange={(e) => setTab1Data({ ...tab1Data, impact_regulatory_compliance: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Regulatory Compliance</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.impact_financial}
              onChange={(e) => setTab1Data({ ...tab1Data, impact_financial: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Financial Impact</span>
          </label>

          <div>
            <label className="flex items-center gap-2 mb-1">
              <span className="text-sm">Other (specify):</span>
            </label>
            <input
              type="text"
              value={tab1Data.impact_other}
              onChange={(e) => setTab1Data({ ...tab1Data, impact_other: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supporting Information
            </label>
            <textarea
              value={tab1Data.supporting_information}
              onChange={(e) => setTab1Data({ ...tab1Data, supporting_information: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Groups Impacted - Checkboxes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Groups Impacted</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.groups_nurses}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_nurses: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Nurses</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.groups_physicians_apps}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_physicians_apps: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Physicians/APPs</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.groups_therapies}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_therapies: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Therapies</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.groups_lab}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_lab: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Lab</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.groups_pharmacy}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_pharmacy: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Pharmacy</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.groups_radiology}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_radiology: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Radiology</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tab1Data.groups_administration}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_administration: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Administration</span>
          </label>

          <div>
            <label className="flex items-center gap-2 mb-1">
              <span className="text-sm">Other (specify):</span>
            </label>
            <input
              type="text"
              value={tab1Data.groups_other}
              onChange={(e) => setTab1Data({ ...tab1Data, groups_other: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Regional Impact & Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Regional Impact & Timeline</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regions Impacted
            </label>
            <input
              type="text"
              value={tab1Data.regions_impacted}
              onChange={(e) => setTab1Data({ ...tab1Data, regions_impacted: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., All divisions, California, Texas"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Date
              </label>
              <input
                type="date"
                value={tab1Data.required_date}
                onChange={(e) => setTab1Data({ ...tab1Data, required_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Date Reason
              </label>
              <input
                type="text"
                value={tab1Data.required_date_reason}
                onChange={(e) => setTab1Data({ ...tab1Data, required_date_reason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Why is this date important?"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Comments */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Comments</h3>
        <textarea
          value={tab1Data.additional_comments}
          onChange={(e) => setTab1Data({ ...tab1Data, additional_comments: e.target.value })}
          rows={5}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Any additional context or information"
        />
      </div>
    </div>
  );

  const renderTab2 = () => {
    // This is where Tab 2 content will go
    // For now, returning a placeholder
    return (
      <div className="space-y-6">
        <p className="text-gray-600">Tab 2: Work Scope & Assignments - Under construction</p>
      </div>
    );
  };

  const renderTab3 = () => {
    // This is where Tab 3 content will go
    return (
      <div className="space-y-6">
        <p className="text-gray-600">Tab 3: Proposed Solution & Journal Log - Under construction</p>
      </div>
    );
  };

  const renderTab4 = () => {
    // This is where Tab 4 content will go
    return (
      <div className="space-y-6">
        <p className="text-gray-600">Tab 4: Outcomes & Results - Under construction</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Initiative' : 'New Initiative'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-4">
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab1'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('tab1')}
            >
              Request Details
              <span className="ml-2 text-xs text-gray-400">(optional)</span>
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab2'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('tab2')}
            >
              Work Scope & Assignments
              <span className="ml-2 text-xs text-red-500">*</span>
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab3'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('tab3')}
            >
              Proposed Solution
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tab4'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          {activeTab === 'tab1' && renderTab1()}
          {activeTab === 'tab2' && renderTab2()}
          {activeTab === 'tab3' && renderTab3()}
          {activeTab === 'tab4' && renderTab4()}
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
