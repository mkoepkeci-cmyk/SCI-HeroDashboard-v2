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
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          {/* Initiative Name - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initiative Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.initiativeName}
              onChange={(e) => setData({ ...data, initiativeName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Enter initiative name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Work Type - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Type <span className="text-red-500">*</span>
              </label>
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
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

            {/* Status - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
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
                <option value="">Select effort</option>
                <option value="XS">XS - Less than 1 hr/wk</option>
                <option value="S">S - 1-2 hrs/wk</option>
                <option value="M">M - 2-5 hrs/wk</option>
                <option value="L">L - 5-10 hrs/wk</option>
                <option value="XL">XL - More than 10 hrs/wk</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Sponsor Name</label>
              <input
                type="text"
                value={data.clinicalSponsorName}
                onChange={(e) => setData({ ...data, clinicalSponsorName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Sponsor Title</label>
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
