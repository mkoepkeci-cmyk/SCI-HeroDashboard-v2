import { Plus, X } from 'lucide-react';
import { TeamMember } from '../../lib/supabase';
import { useFieldOptions } from '../../lib/useFieldOptions';

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
  const { serviceLines } = useFieldOptions('service_line');
  const { options: workTypes } = useFieldOptions('work_type');
  const { options: roles } = useFieldOptions('role');
  const { options: phases } = useFieldOptions('phase');
  const { options: workEfforts } = useFieldOptions('work_effort');
  const { options: statuses } = useFieldOptions('status');

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
      {/* Initiative Name - Read-only display from Tab 1 */}
      {data.initiativeName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Initiative Name</div>
          <div className="text-lg font-medium text-gray-900">{data.initiativeName}</div>
        </div>
      )}

      {/* SCI Assignment */}
      <div>
        <h3 className="text-lg font-semibold mb-4">SCI Assignment</h3>
        <p className="text-sm text-gray-600 mb-4">
          Assign SCIs to this initiative with their roles (Owner, Co-Owner, Secondary, Support).
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
                  {roles.map(option => (
                    <option key={option.key} value={option.label}>
                      {option.label}
                    </option>
                  ))}
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
        <h3 className="text-lg font-semibold mb-4">Work Type Details</h3>
        <div className="space-y-4">
          {/* Initiative Name - editable field for entering/updating the name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initiative Name
            </label>
            <input
              type="text"
              value={data.initiativeName}
              onChange={(e) => setData({ ...data, initiativeName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Enter initiative name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Type
              </label>
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select work type</option>
                {workTypes.map(option => (
                  <option key={option.key} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select status</option>
                {statuses.map(option => (
                  <option key={option.key} value={option.label}>
                    {option.label}
                  </option>
                ))}
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
                {phases.map(option => (
                  <option key={option.key} value={option.label}>
                    {option.label}
                  </option>
                ))}
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
                <option value="">Select effort</option>
                {workEfforts.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* EHRs Impacted */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EHRs Impacted</label>
              <select
                value={data.ehrsImpacted}
                onChange={(e) => setData({ ...data, ehrsImpacted: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select EHR</option>
                <option value="All">All</option>
                <option value="Epic">Epic</option>
                <option value="Cerner">Cerner</option>
                <option value="Altera">Altera</option>
                <option value="Epic and Cerner">Epic and Cerner</option>
              </select>
            </div>

            {/* Dept/Service Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dept/Service Line</label>
              <select
                value={data.serviceLine}
                onChange={(e) => setData({ ...data, serviceLine: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select dept/service line</option>
                {serviceLines.map(option => (
                  <option key={option.key} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Governance Type - Direct Hours (only show for Governance work type) */}
          {data.type === 'Governance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direct Hours Per Week
              </label>
              <input
                type="number"
                step="0.5"
                value={data.directHoursPerWeek}
                onChange={(e) => setData({ ...data, directHoursPerWeek: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="e.g., 2.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                For Governance work, specify actual hours per week (bypasses capacity formula)
              </p>
            </div>
          )}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeframe Display (Custom)
            </label>
            <input
              type="text"
              value={data.timeframeDisplay}
              onChange={(e) => setData({ ...data, timeframeDisplay: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., FY25-Q1 to Q3"
            />
          </div>
        </div>
      </div>

      {/* Governance & Collaboration */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Governance & Collaboration</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Executive Sponsor Name</label>
              <input
                type="text"
                value={data.clinicalSponsorName}
                onChange={(e) => setData({ ...data, clinicalSponsorName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Executive Sponsor Title</label>
              <input
                type="text"
                value={data.clinicalSponsorTitle}
                onChange={(e) => setData({ ...data, clinicalSponsorTitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Governance Bodies (comma-separated)
            </label>
            <textarea
              value={data.governanceBodies}
              onChange={(e) => setData({ ...data, governanceBodies: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., Clinical Informatics Council, Pharmacy Committee"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Collaborators (comma-separated)
            </label>
            <textarea
              value={data.keyCollaborators}
              onChange={(e) => setData({ ...data, keyCollaborators: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., Dr. Smith, Nursing Leadership, IT Team"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
