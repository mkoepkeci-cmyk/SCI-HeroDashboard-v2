import { Plus, X } from 'lucide-react';
import { TeamMember } from '../../lib/supabase';

interface TeamMemberAssignment {
  teamMemberId: string;
  teamMemberName: string;
  role: string;
}

interface AssignmentData {
  title: string;
  workType: string;
  status: string;
  phase: string;
  workEffort: string;
  ehrsImpacted: string;
  serviceLine: string;
  startDate: string;
  endDate: string;
  timeframeDisplay: string;
  directHoursPerWeek: string;
}

interface AssignmentTabProps {
  data: AssignmentData;
  setData: (data: AssignmentData) => void;
  teamMembers: TeamMember[];
  loadingMembers: boolean;
  teamMemberAssignments: TeamMemberAssignment[];
  setTeamMemberAssignments: (assignments: TeamMemberAssignment[]) => void;
}

export const AssignmentTab = ({
  data,
  setData,
  teamMembers,
  loadingMembers,
  teamMemberAssignments,
  setTeamMemberAssignments
}: AssignmentTabProps) => {

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

    // Auto-fill name when selecting team member
    if (field === 'teamMemberId') {
      const member = teamMembers.find(m => m.id === value);
      if (member) {
        updated[index].teamMemberName = member.name;
      }
    }

    setTeamMemberAssignments(updated);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Brief, descriptive title"
        />
      </div>

      {/* SCI Assignment */}
      <div>
        <h3 className="text-lg font-semibold mb-4">SCI Assignment</h3>
        <p className="text-sm text-gray-600 mb-4">
          Assign SCIs to this work item with their roles (Owner, Co-Owner, Secondary, Support).
        </p>

        {teamMemberAssignments.map((assignment, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">SCI {index + 1}</h4>
              {teamMemberAssignments.length > 1 && (
                <button
                  onClick={() => removeTeamMember(index)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
                <select
                  value={assignment.teamMemberId}
                  onChange={(e) => updateTeamMemberAssignment(index, 'teamMemberId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  disabled={loadingMembers}
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={assignment.role}
                  onChange={(e) => updateTeamMemberAssignment(index, 'role', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select role</option>
                  <option value="Owner">Owner</option>
                  <option value="Co-Owner">Co-Owner</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Support">Support</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addTeamMember}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Work Type Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Work Type Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Work Type - FILTERED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Type <span className="text-red-500">*</span>
              </label>
              <select
                value={data.workType}
                onChange={(e) => setData({ ...data, workType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select work type</option>
                <option value="Epic Gold">Epic Gold</option>
                <option value="Governance">Governance</option>
                <option value="System Project">System Project</option>
                <option value="Epic Upgrades">Epic Upgrades</option>
                <option value="General Support">General Support</option>
                <option value="Policy/Guidelines">Policy/Guidelines</option>
                <option value="Market Project">Market Project</option>
                <option value="Ticket">Ticket</option>
                {/* System Initiative is EXCLUDED */}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Phase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
              <select
                value={data.phase}
                onChange={(e) => setData({ ...data, phase: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select phase</option>
                <option value="Discovery/Define">Discovery/Define</option>
                <option value="Design">Design</option>
                <option value="Build">Build</option>
                <option value="Validate/Test">Validate/Test</option>
                <option value="Deploy">Deploy</option>
                <option value="Did we Deliver">Did we Deliver</option>
                <option value="Post Go Live Support">Post Go Live Support</option>
                <option value="In Progress">In Progress</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Steady State">Steady State</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            {/* Work Effort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Effort (Estimated Weekly Hours)</label>
              <select
                value={data.workEffort}
                onChange={(e) => setData({ ...data, workEffort: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="XS">XS - Less than 1 hr/wk</option>
                <option value="S">S - 1-2 hrs/wk</option>
                <option value="M">M - 2-5 hrs/wk</option>
                <option value="L">L - 5-10 hrs/wk</option>
                <option value="XL">XL - More than 10 hrs/wk</option>
              </select>
            </div>

            {/* Governance Direct Hours - Only show if Governance selected */}
            {data.workType === 'Governance' && (
              <div className="col-span-2 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Direct Hours Per Week (Governance Only)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.directHoursPerWeek}
                  onChange={(e) => setData({ ...data, directHoursPerWeek: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="e.g., 2.5"
                />
                <p className="text-xs text-purple-700 mt-1">
                  For Governance work, specify actual hours per week (bypasses capacity formula)
                </p>
              </div>
            )}

            {/* EHRs Impacted */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EHRs Impacted</label>
              <select
                value={data.ehrsImpacted}
                onChange={(e) => setData({ ...data, ehrsImpacted: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select EHRs</option>
                <option value="All">All</option>
                <option value="Epic">Epic</option>
                <option value="Cerner">Cerner</option>
                <option value="Altera">Altera</option>
                <option value="Epic and Cerner">Epic and Cerner</option>
              </select>
            </div>

            {/* Service Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Line</label>
              <select
                value={data.serviceLine}
                onChange={(e) => setData({ ...data, serviceLine: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select service line</option>
                <option value="Ambulatory">Ambulatory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Nursing">Nursing</option>
                <option value="Pharmacy & Oncology">Pharmacy & Oncology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency Department">Emergency Department</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Perioperative">Perioperative</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
                <option value="Revenue Cycle">Revenue Cycle</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => setData({ ...data, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={data.endDate}
              onChange={(e) => setData({ ...data, endDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe Display (Custom)</label>
            <input
              type="text"
              value={data.timeframeDisplay}
              onChange={(e) => setData({ ...data, timeframeDisplay: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., In Progress - Testing Phase"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
