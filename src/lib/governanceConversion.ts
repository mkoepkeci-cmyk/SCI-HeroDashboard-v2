/**
 * Governance Request → Initiative Conversion
 *
 * Handles the workflow of converting governance requests into initiatives
 * when an SCI is assigned during the "Ready for Governance" stage.
 */

import { supabase, GovernanceRequest, Initiative, TeamMember } from './supabase';

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
 * 2. Create a new initiative (type: Governance, status: Planning)
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
        status: 'Planning',  // Starts in planning phase
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
          status: 'Active',  // Change from Planning to Active
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
