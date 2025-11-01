import { DIVISION_REGIONS } from '../../lib/governanceUtils';

interface Tab1Data {
  title: string;
  division_region: string;
  submitter_name: string;
  submitter_email: string;
  problem_statement: string;
  desired_outcomes: string;
  sponsor_name: string;
  sponsor_title: string;
  patient_care_value: string;
  compliance_regulatory_value: string;
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
}

interface Tab1ContentProps {
  data: Tab1Data;
  setData: (data: Tab1Data) => void;
}

export const Tab1Content = ({ data, setData }: Tab1ContentProps) => {

  return (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Initiative Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Brief, descriptive title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division/Region</label>
            <select
              value={data.division_region}
              onChange={(e) => setData({ ...data, division_region: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Select division/region</option>
              {DIVISION_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submitter Name</label>
            <input
              type="text"
              value={data.submitter_name}
              onChange={(e) => setData({ ...data, submitter_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submitter Email</label>
            <input
              type="email"
              value={data.submitter_email}
              onChange={(e) => setData({ ...data, submitter_email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Executive Sponsor Name</label>
            <input
              type="text"
              value={data.sponsor_name}
              onChange={(e) => setData({ ...data, sponsor_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., Dr. Sarah Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Executive Sponsor Title</label>
            <input
              type="text"
              value={data.sponsor_title}
              onChange={(e) => setData({ ...data, sponsor_title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., SVP Clinical Excellence"
            />
          </div>
        </div>
      </div>

      {/* Enterprise Need */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Enterprise Need</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
            <textarea
              value={data.problem_statement}
              onChange={(e) => setData({ ...data, problem_statement: e.target.value })}
              rows={6}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Describe the enterprise-level problem or opportunity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desired Outcomes</label>
            <textarea
              value={data.desired_outcomes}
              onChange={(e) => setData({ ...data, desired_outcomes: e.target.value })}
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Specific enterprise-wide outcomes expected"
            />
          </div>
        </div>
      </div>

      {/* Additional Comments */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Comments</h3>
        <textarea
          value={data.additional_comments}
          onChange={(e) => setData({ ...data, additional_comments: e.target.value })}
          rows={5}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Any additional context or information"
        />
      </div>
    </div>
  );
};
