/**
 * Governance Request → Initiative Conversion
 *
 * Two-phase workflow:
 * Phase 1 (SCI Assignment): Create minimal initiative for effort tracking
 * Phase 2 (Ready for Governance): Populate full initiative details for searchability
 */

import { supabase, GovernanceRequest, Initiative, TeamMember } from './supabase';
import { recalculateDashboardMetrics } from './workloadCalculator';

/**
 * Phase 1: Create a minimal initiative when an SCI is assigned
 *
 * This happens as soon as an SCI is assigned to a governance request (can be in Draft status).
 * Creates a basic initiative so the SCI can start logging effort immediately.
 *
 * Fields populated:
 * - owner_name, team_member_id (the assigned SCI)
 * - initiative_name (from governance request title)
 * - type: 'Governance'
 * - status: 'Not Started' (will change to In Progress in Phase 2)
 * - governance_request_id (link back)
 * - clinical_sponsor_name (basic info)
 */
export async function createInitiativeForAssignedRequest(
  governanceRequestId: string,
  assignedSciId: string,
  assignedSciName: string
): Promise<ConversionResult> {
  try {
    console.log('Phase 1: Creating minimal initiative for effort tracking');

    // Fetch the governance request
    const { data: govRequest, error: fetchError } = await supabase
      .from('governance_requests')
      .select('*')
      .eq('id', governanceRequestId)
      .single();

    if (fetchError || !govRequest) {
      return {
        success: false,
        error: `Failed to fetch governance request: ${fetchError?.message || 'Not found'}`
      };
    }

    // Check if initiative already exists
    if (govRequest.linked_initiative_id) {
      console.log('Initiative already exists, skipping creation');
      return {
        success: true, // Not an error - initiative already exists
        initiativeId: govRequest.linked_initiative_id,
        error: 'Initiative already exists for this request'
      };
    }

    // Create a MINIMAL initiative for effort tracking
    const { data: initiative, error: initiativeError } = await supabase
      .from('initiatives')
      .insert({
        owner_name: assignedSciName,
        initiative_name: govRequest.title,
        type: 'System Initiative',  // System Initiative work type
        status: 'Not Started',  // Will become In Progress in Phase 2
        role: 'Owner',
        work_effort: govRequest.work_effort,  // Transfer work effort estimate from governance request
        team_member_id: assignedSciId,
        governance_request_id: govRequest.id,  // Link back to governance request
        request_id: govRequest.request_id,  // GOV-YYYY-XXX display ID for UI
        clinical_sponsor_name: govRequest.system_clinical_leader,
        is_draft: false,
        is_active: true,
      })
      .select()
      .single();

    if (initiativeError || !initiative) {
      return {
        success: false,
        error: `Failed to create initiative: ${initiativeError?.message || 'Unknown error'}`
      };
    }

    console.log('Phase 1 complete: Minimal initiative created:', initiative.id);

    // Update governance request with link to initiative
    const { error: updateError } = await supabase
      .from('governance_requests')
      .update({
        linked_initiative_id: initiative.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', governanceRequestId);

    if (updateError) {
      console.warn('Failed to update governance request:', updateError);
    }

    // Recalculate dashboard metrics for the assigned SCI
    if (assignedSciId) {
      try {
        await recalculateDashboardMetrics(assignedSciId);
        console.log('Phase 1: Dashboard metrics recalculated for', assignedSciName);
      } catch (metricsError) {
        console.warn('Failed to recalculate dashboard metrics:', metricsError);
        // Don't fail the whole operation if metrics update fails
      }
    }

    return {
      success: true,
      initiativeId: initiative.id,
      initiative: initiative as Initiative
    };

  } catch (error: any) {
    console.error('Error creating initiative for assigned request:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Phase 2: Populate full initiative details when governance request reaches "Ready for Governance"
 *
 * This happens when the governance request status changes to "Ready for Governance".
 * Enhances the existing minimal initiative with full details to make it searchable in Initiatives tab.
 *
 * Additional fields populated:
 * - problem_statement (from governance request)
 * - desired_outcomes
 * - governance_bodies
 * - key_collaborators
 * - financial_impact data
 * - start_date, end_date
 * - status: 'In Progress' (changes from Not Started)
 *
 * Also creates:
 * - initiative_stories record (challenge, outcome)
 * - initiative_financial_impact record (if financial data exists)
 */
export async function populateInitiativeDetails(
  governanceRequestId: string
): Promise<ConversionResult> {
  try {
    console.log('Phase 2: Populating full initiative details');

    // Fetch the governance request
    const { data: govRequest, error: fetchError } = await supabase
      .from('governance_requests')
      .select('*')
      .eq('id', governanceRequestId)
      .single();

    if (fetchError || !govRequest) {
      return {
        success: false,
        error: `Failed to fetch governance request: ${fetchError?.message || 'Not found'}`
      };
    }

    // Validate that initiative exists
    if (!govRequest.linked_initiative_id) {
      return {
        success: false,
        error: 'No linked initiative found. Phase 1 must be completed first (SCI assignment).'
      };
    }

    // Update the initiative with full details and defaults for "Ready for Governance"
    const { data: initiative, error: updateError } = await supabase
      .from('initiatives')
      .update({
        // Status and Phase defaults
        status: 'In Progress',  // Change from Not Started to In Progress when Ready for Governance
        phase: 'Discovery/Define',  // Default phase for new governance initiatives

        // Ensure SCI is set as owner (in case it wasn't set in Phase 1)
        owner_name: govRequest.assigned_sci_name || govRequest.owner_name,
        team_member_id: govRequest.assigned_sci_id || govRequest.team_member_id,

        // Ensure work effort is set (defense-in-depth in case Phase 1 missed it)
        work_effort: govRequest.work_effort,

        // Ensure display ID is set (defense-in-depth)
        request_id: govRequest.request_id,  // GOV-YYYY-XXX display ID for UI

        // Core governance data
        problem_statement: govRequest.problem_statement,
        desired_outcomes: govRequest.desired_outcomes,
        governance_bodies: govRequest.governance_bodies,
        key_collaborators: govRequest.key_collaborators,
        start_date: govRequest.submitted_date || new Date().toISOString(),
        timeframe_display: `Target: ${govRequest.target_timeline || 'TBD'}`,

        // Value propositions
        patient_care_value: govRequest.patient_care_value,
        compliance_regulatory_value: govRequest.compliance_regulatory_value,
        estimated_scope: govRequest.estimated_scope,

        // Basic information
        division_region: govRequest.division_region,
        submitter_name: govRequest.submitter_name,
        submitter_email: govRequest.submitter_email,

        // Impact categories (strategic alignment)
        impact_commonspirit_board_goal: govRequest.impact_commonspirit_board_goal || false,
        impact_commonspirit_2026_5for25: govRequest.impact_commonspirit_2026_5for25 || false,
        impact_system_policy: govRequest.impact_system_policy || false,
        impact_patient_safety: govRequest.impact_patient_safety || false,
        impact_regulatory_compliance: govRequest.impact_regulatory_compliance || false,
        impact_financial: govRequest.impact_financial || false,
        impact_other: govRequest.impact_other,

        // Supporting information
        supporting_information: govRequest.supporting_information,

        // Groups impacted (stakeholder tracking)
        groups_nurses: govRequest.groups_nurses || false,
        groups_physicians_apps: govRequest.groups_physicians_apps || false,
        groups_therapies: govRequest.groups_therapies || false,
        groups_lab: govRequest.groups_lab || false,
        groups_pharmacy: govRequest.groups_pharmacy || false,
        groups_radiology: govRequest.groups_radiology || false,
        groups_administration: govRequest.groups_administration || false,
        groups_other: govRequest.groups_other,

        // Regional impact
        regions_impacted: govRequest.regions_impacted,
        required_date: govRequest.required_date,
        required_date_reason: govRequest.required_date_reason,

        // Additional context
        additional_comments: govRequest.additional_comments,

        updated_at: new Date().toISOString()
      })
      .eq('id', govRequest.linked_initiative_id)
      .select()
      .single();

    if (updateError || !initiative) {
      return {
        success: false,
        error: `Failed to update initiative: ${updateError?.message || 'Unknown error'}`
      };
    }

    console.log('Phase 2: Initiative updated to Active status');

    // Create/update initiative story with challenge and outcome
    const { data: existingStory } = await supabase
      .from('initiative_stories')
      .select('*')
      .eq('initiative_id', govRequest.linked_initiative_id)
      .single();

    if (existingStory) {
      // Update existing story
      await supabase
        .from('initiative_stories')
        .update({
          challenge: govRequest.problem_statement,
          outcome: govRequest.desired_outcomes,
          updated_at: new Date().toISOString()
        })
        .eq('initiative_id', govRequest.linked_initiative_id);
    } else {
      // Create new story
      await supabase
        .from('initiative_stories')
        .insert({
          initiative_id: govRequest.linked_initiative_id,
          challenge: govRequest.problem_statement,
          outcome: govRequest.desired_outcomes
        });
    }

    console.log('Phase 2: Initiative story created/updated');

    // Create/update financial impact if data exists
    if (govRequest.projected_annual_revenue || govRequest.financial_impact) {
      const { data: existingFinancial } = await supabase
        .from('initiative_financial_impact')
        .select('*')
        .eq('initiative_id', govRequest.linked_initiative_id)
        .single();

      const financialData = {
        projected_annual: govRequest.projected_annual_revenue || govRequest.financial_impact,
        projection_basis: govRequest.projection_basis,
        calculation_methodology: govRequest.calculation_methodology,
        key_assumptions: govRequest.key_assumptions,
        updated_at: new Date().toISOString()
      };

      if (existingFinancial) {
        // Update existing financial record
        await supabase
          .from('initiative_financial_impact')
          .update(financialData)
          .eq('initiative_id', govRequest.linked_initiative_id);
      } else {
        // Create new financial record
        await supabase
          .from('initiative_financial_impact')
          .insert({
            ...financialData,
            initiative_id: govRequest.linked_initiative_id,
          });
      }

      console.log('Phase 2: Financial impact created/updated with methodology and assumptions');
    }

    // Create/update initiative metrics if they exist
    if (govRequest.impact_metrics && Array.isArray(govRequest.impact_metrics) && govRequest.impact_metrics.length > 0) {
      // Delete existing metrics first
      await supabase
        .from('initiative_metrics')
        .delete()
        .eq('initiative_id', govRequest.linked_initiative_id);

      // Insert new metrics from governance request
      const metricsToInsert = govRequest.impact_metrics.map((metric: any, index: number) => ({
        initiative_id: govRequest.linked_initiative_id,
        metric_name: metric.metric_name,
        metric_type: metric.metric_type,
        unit: metric.unit,
        baseline_value: metric.baseline_value,
        baseline_date: metric.baseline_date,
        current_value: metric.current_value,
        measurement_date: metric.measurement_date,
        target_value: metric.target_value,
        improvement: metric.improvement,
        measurement_method: metric.measurement_method,
        display_order: index
      }));

      await supabase
        .from('initiative_metrics')
        .insert(metricsToInsert);

      console.log(`Phase 2: ${metricsToInsert.length} impact metrics transferred to initiative`);
    }

    console.log('Phase 2 complete: Initiative fully populated with metrics, financials, and searchable');

    // Recalculate dashboard metrics for the assigned SCI
    if (govRequest.assigned_sci_id) {
      try {
        await recalculateDashboardMetrics(govRequest.assigned_sci_id);
        console.log('Phase 2: Dashboard metrics recalculated for', govRequest.assigned_sci_name);
      } catch (metricsError) {
        console.warn('Failed to recalculate dashboard metrics:', metricsError);
        // Don't fail the whole operation if metrics update fails
      }
    }

    return {
      success: true,
      initiativeId: initiative.id,
      initiative: initiative as Initiative
    };

  } catch (error: any) {
    console.error('Error populating initiative details:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

export interface ConversionParams {
  governanceRequestId: string;
  assignedSciId: string;
  assignedSciName: string;
  workEffort: string;  // XS, S, M, L, XL, XXL
  convertedBy: string;  // Name of person doing the conversion
}

export interface ConversionResult {
  success: boolean;
  initiativeId?: string;
  error?: string;
  initiative?: Initiative;
}

/**
 * Convert a governance request to an initiative
 *
 * This happens when a governance request reaches "Ready for Governance" status
 * and an SCI is assigned to work on the governance prep.
 *
 * Process:
 * 1. Fetch the governance request
 * 2. Create a new initiative (type: Governance, status: Not Started)
 * 3. Pre-populate initiative with data from governance request
 * 4. Link the two records together
 * 5. Update governance request status to "In Progress"
 * 6. Optionally update work_type_summary count
 */
export async function convertGovernanceRequestToInitiative(
  params: ConversionParams
): Promise<ConversionResult> {
  try {
    // Step 1: Fetch the governance request
    const { data: govRequest, error: fetchError } = await supabase
      .from('governance_requests')
      .select('*')
      .eq('id', params.governanceRequestId)
      .single();

    if (fetchError || !govRequest) {
      return {
        success: false,
        error: `Failed to fetch governance request: ${fetchError?.message || 'Not found'}`
      };
    }

    // Validation: Check if already converted
    if (govRequest.linked_initiative_id) {
      return {
        success: false,
        error: 'This governance request has already been converted to an initiative'
      };
    }

    // Validation: Check status
    if (govRequest.status !== 'Ready for Governance') {
      return {
        success: false,
        error: `Cannot convert request with status "${govRequest.status}". Must be "Ready for Governance".`
      };
    }

    // Step 2: Create the initiative for governance prep work
    const { data: initiative, error: initiativeError } = await supabase
      .from('initiatives')
      .insert({
        owner_name: params.assignedSciName,
        initiative_name: `${govRequest.title} - Governance Prep`,  // Indicate it's prep work
        type: 'Governance',  // Special type for governance prep
        status: 'Not Started',  // Starts in not started phase
        phase: 'Governance Preparation',
        work_effort: params.workEffort,
        role: 'Owner',  // Assigned SCI is the owner
        team_member_id: params.assignedSciId,
        clinical_sponsor_name: govRequest.system_clinical_leader,
        timeframe_display: `Governance prep for ${govRequest.target_timeline || 'upcoming governance review'}`,
        governance_request_id: govRequest.id,  // Link back to governance request
        is_draft: false,
        is_active: true,
        // Initialize completion tracking (basic info is pre-filled from governance request)
        completion_status: {
          basic: true,
          governance: true,
          metrics: false,
          financial: false,
          performance: false,
          projections: false,
          story: false
        },
        completion_percentage: 28  // 2 out of 7 sections complete (basic + governance)
      })
      .select()
      .single();

    if (initiativeError || !initiative) {
      return {
        success: false,
        error: `Failed to create initiative: ${initiativeError?.message || 'Unknown error'}`
      };
    }

    // Step 3: Pre-populate initiative with governance request data

    // 3a. Create initiative story with problem statement and desired outcomes
    const { error: storyError } = await supabase
      .from('initiative_stories')
      .insert({
        initiative_id: initiative.id,
        challenge: govRequest.problem_statement,
        outcome: govRequest.desired_outcomes
      });

    if (storyError) {
      console.warn('Failed to create initiative story:', storyError);
    }

    // 3b. Create financial impact if financial data exists
    if (govRequest.financial_impact) {
      const { error: financialError } = await supabase
        .from('initiative_financial_impact')
        .insert({
          initiative_id: initiative.id,
          projected_annual: govRequest.financial_impact
        });

      if (financialError) {
        console.warn('Failed to create financial impact:', financialError);
      }
    }

    // Step 4: Update governance request with link to initiative
    const { error: updateError } = await supabase
      .from('governance_requests')
      .update({
        linked_initiative_id: initiative.id,
        assigned_sci_id: params.assignedSciId,
        assigned_sci_name: params.assignedSciName,
        status: 'In Progress',  // Move to "In Progress" since SCI is now working on it
        converted_at: new Date().toISOString(),
        converted_by: params.convertedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.governanceRequestId);

    if (updateError) {
      console.error('Failed to update governance request:', updateError);
      // Don't fail the whole conversion, but log it
    }

    // Step 5: Optionally increment work_type_summary count for "Governance"
    // (This is optional - the count can also be calculated dynamically from initiatives)
    await incrementWorkTypeCount(params.assignedSciId, 'Governance');

    return {
      success: true,
      initiativeId: initiative.id,
      initiative: initiative as Initiative
    };

  } catch (error: any) {
    console.error('Error converting governance request to initiative:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Increment work type count for a team member
 *
 * This updates the work_type_summary table to reflect the new assignment.
 */
async function incrementWorkTypeCount(
  teamMemberId: string,
  workType: string
): Promise<void> {
  try {
    // Check if entry exists
    const { data: existing } = await supabase
      .from('work_type_summary')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .eq('work_type', workType)
      .single();

    if (existing) {
      // Update existing count
      await supabase
        .from('work_type_summary')
        .update({ count: existing.count + 1 })
        .eq('team_member_id', teamMemberId)
        .eq('work_type', workType);
    } else {
      // Create new entry
      await supabase
        .from('work_type_summary')
        .insert({
          team_member_id: teamMemberId,
          work_type: workType,
          count: 1
        });
    }
  } catch (error) {
    console.warn('Failed to update work_type_summary:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Mark governance request as approved
 *
 * This is called when governance actually approves the request.
 * It updates the linked initiative to change from "Governance prep" to active work.
 */
export interface ApprovalParams {
  governanceRequestId: string;
  approvedBy: string;
}

export async function approveGovernanceRequest(
  params: ApprovalParams
): Promise<ConversionResult> {
  try {
    // Fetch governance request
    const { data: govRequest, error: fetchError } = await supabase
      .from('governance_requests')
      .select('*')
      .eq('id', params.governanceRequestId)
      .single();

    if (fetchError || !govRequest) {
      return {
        success: false,
        error: 'Governance request not found'
      };
    }

    // Update governance request
    const { error: updateError } = await supabase
      .from('governance_requests')
      .update({
        status: 'Completed',  // Mark as completed in governance process
        approved_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.governanceRequestId);

    if (updateError) {
      return {
        success: false,
        error: `Failed to update governance request: ${updateError.message}`
      };
    }

    // If there's a linked initiative, update it to active implementation
    if (govRequest.linked_initiative_id) {
      const { error: initiativeError } = await supabase
        .from('initiatives')
        .update({
          status: 'In Progress',  // Change from Not Started to In Progress
          type: 'System Initiative',  // Change from Governance to System Initiative
          phase: 'Implementation',
          initiative_name: govRequest.title,  // Remove "- Governance Prep" suffix
          updated_at: new Date().toISOString()
        })
        .eq('id', govRequest.linked_initiative_id);

      if (initiativeError) {
        console.warn('Failed to update linked initiative:', initiativeError);
      }

      // Update work type count (decrement Governance, increment System Initiative)
      if (govRequest.assigned_sci_id) {
        await decrementWorkTypeCount(govRequest.assigned_sci_id, 'Governance');
        await incrementWorkTypeCount(govRequest.assigned_sci_id, 'System Initiative');
      }
    }

    return {
      success: true
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Decrement work type count for a team member
 */
async function decrementWorkTypeCount(
  teamMemberId: string,
  workType: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('work_type_summary')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .eq('work_type', workType)
      .single();

    if (existing && existing.count > 0) {
      if (existing.count === 1) {
        // Delete the entry if count would go to 0
        await supabase
          .from('work_type_summary')
          .delete()
          .eq('team_member_id', teamMemberId)
          .eq('work_type', workType);
      } else {
        // Decrement the count
        await supabase
          .from('work_type_summary')
          .update({ count: existing.count - 1 })
          .eq('team_member_id', teamMemberId)
          .eq('work_type', workType);
      }
    }
  } catch (error) {
    console.warn('Failed to update work_type_summary:', error);
  }
}

/**
 * Get the next available request ID
 */
export async function generateNextRequestId(): Promise<string> {
  const currentYear = new Date().getFullYear();

  try {
    // Find the highest sequence number for this year
    const { data: requests, error } = await supabase
      .from('governance_requests')
      .select('request_id')
      .like('request_id', `GOV-${currentYear}-%`)
      .order('request_id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching request IDs:', error);
      return `GOV-${currentYear}-001`;
    }

    if (!requests || requests.length === 0) {
      return `GOV-${currentYear}-001`;
    }

    // Extract sequence number from latest request ID
    const latestId = requests[0].request_id;
    const match = latestId.match(/GOV-\d{4}-(\d{3})/);

    if (match) {
      const sequence = parseInt(match[1], 10) + 1;
      const paddedSequence = sequence.toString().padStart(3, '0');
      return `GOV-${currentYear}-${paddedSequence}`;
    }

    return `GOV-${currentYear}-001`;

  } catch (error) {
    console.error('Error generating request ID:', error);
    return `GOV-${currentYear}-001`;
  }
}
