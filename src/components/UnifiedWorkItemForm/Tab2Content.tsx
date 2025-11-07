import { Plus, X } from 'lucide-react';
import { TeamMember } from '../../lib/supabase';

interface TeamMemberAssignment {
  teamMemberId: string;
  teamMemberName: string;
  role: string;
}

interface Tab2Data {
  teamMemberId: string;
  role: string;
  ownerName: string;
  initiativeName: string;
  type: string;
  status: string;
  phase: string;
  workEffort: string;
  ehrsImpacted: string;
  serviceLine: string;
  startDate: string;
  endDate: string;
  timeframeDisplay: string;
  clinicalSponsorName: string;
  clinicalSponsorTitle: string;
  governanceBodies: string;
  keyCollaborators: string;
  directHoursPerWeek: string;
}

interface Tab2ContentProps {
  data: Tab2Data;
  setData: (data: Tab2Data) => void;
  teamMembers: TeamMember[];
  loadingMembers: boolean;
  teamMemberAssignments: TeamMemberAssignment[];
  setTeamMemberAssignments: (assignments: TeamMemberAssignment[]) => void;
}

export const Tab2Content = ({
  data,
  setData,
  teamMembers,
  loadingMembers,
  teamMemberAssignments,
  setTeamMemberAssignments
}: Tab2ContentProps) => {
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
    <div className="space-y-2">
      {/* Initiative Name - Read-only display from Tab 1 */}
      {data.initiativeName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
          <div className="text-sm text-gray-500 mb-1">Initiative Name</div>
          <div className="text-lg font-medium text-gray-900">{data.initiativeName}</div>
        </div>
      )}

      {/* SCI Assignment */}
      <div>
        <h3 className="text-sm font-semibold mb-2">SCI Assignment</h3>
        <p className="text-xs text-gray-600 mb-2">
          Assign SCIs to this initiative with their roles (Owner, Co-Owner, Secondary, Support).
        </p>

        {teamMemberAssignments.map((assignment, index) => (
          <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Team Member</label>
                <select
                  value={assignment.teamMemberId}
                  onChange={(e) => updateTeamMemberAssignment(index, 'teamMemberId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
                  disabled={loadingMembers}
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Role</label>
                <select
                  value={assignment.role}
                  onChange={(e) => updateTeamMemberAssignment(index, 'role', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
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
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Work Type Details */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Work Type Details</h3>
        <div className="space-y-2">
          {/* Initiative Name - editable field for entering/updating the name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Initiative Name
            </label>
            <input
              type="text"
              value={data.initiativeName}
              onChange={(e) => setData({ ...data, initiativeName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="Enter initiative name"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Work Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Work Type
              </label>
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              >
                <option value="">Select work type</option>
                <option value="Epic Gold">Epic Gold</option>
                <option value="Governance">Governance</option>
                <option value="System Initiative">System Initiative</option>
                <option value="System Project">System Project</option>
                <option value="Epic Upgrades">Epic Upgrades</option>
                <option value="General Support">General Support</option>
                <option value="Policy/Guidelines">Policy/Guidelines</option>
                <option value="Market Project">Market Project</option>
                <option value="Ticket">Ticket</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Status
              </label>
              <select
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              >
                <option value="">Select status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Phase */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Phase</label>
              <select
                value={data.phase}
                onChange={(e) => setData({ ...data, phase: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
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

            {/* EHRs Impacted */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">EHRs Impacted</label>
              <select
                value={data.ehrsImpacted}
                onChange={(e) => setData({ ...data, ehrsImpacted: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              >
                <option value="">Select EHR</option>
                <option value="All">All</option>
                <option value="Epic">Epic</option>
                <option value="Cerner">Cerner</option>
                <option value="Altera">Altera</option>
                <option value="Epic and Cerner">Epic and Cerner</option>
              </select>
            </div>

            {/* Service Line */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Service Line</label>
              <select
                value={data.serviceLine}
                onChange={(e) => setData({ ...data, serviceLine: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
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

          {/* Governance Type - Direct Hours (only show for Governance work type) */}
          {data.type === 'Governance' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Direct Hours Per Week
              </label>
              <input
                type="number"
                step="0.5"
                value={data.directHoursPerWeek}
                onChange={(e) => setData({ ...data, directHoursPerWeek: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
                placeholder="e.g., 2.5"
              />
              <p className="text-xs text-gray-500 mt-0.5">
                For Governance work, specify actual hours per week (bypasses capacity formula)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Timeline</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Start Date</label>
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => setData({ ...data, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">End Date</label>
            <input
              type="date"
              value={data.endDate}
              onChange={(e) => setData({ ...data, endDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Timeframe Display (Custom)
            </label>
            <input
              type="text"
              value={data.timeframeDisplay}
              onChange={(e) => setData({ ...data, timeframeDisplay: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="e.g., FY25-Q1 to Q3"
            />
          </div>
        </div>
      </div>

      {/* Governance & Collaboration */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Governance & Collaboration</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Clinical Sponsor Name</label>
              <input
                type="text"
                value={data.clinicalSponsorName}
                onChange={(e) => setData({ ...data, clinicalSponsorName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Clinical Sponsor Title</label>
              <input
                type="text"
                value={data.clinicalSponsorTitle}
                onChange={(e) => setData({ ...data, clinicalSponsorTitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Governance Bodies (comma-separated)
            </label>
            <textarea
              value={data.governanceBodies}
              onChange={(e) => setData({ ...data, governanceBodies: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="e.g., Clinical Informatics Council, Pharmacy Committee"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Key Collaborators (comma-separated)
            </label>
            <textarea
              value={data.keyCollaborators}
              onChange={(e) => setData({ ...data, keyCollaborators: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
              placeholder="e.g., Dr. Smith, Nursing Leadership, IT Team"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
