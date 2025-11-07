import { DIVISION_REGIONS } from '../../lib/governanceUtils';

interface Tab1Data {
  title: string;
  division_region: string;
  submitter_name: string;
  submitter_email: string;
  problem_statement: string;
  desired_outcomes: string;
  system_clinical_leader: string;
  patient_care_value: string;
  compliance_regulatory_value: string;
  target_timeline: string;
  estimated_scope: string;
  // Financial fields removed - moved to Tab 4
  // projected_annual_revenue: string;
  // projection_basis: string;
  // calculation_methodology: string;
  // key_assumptions: string;
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
    <div className="space-y-2">
      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
        <p className="text-xs text-blue-800">
          <strong>Request Details:</strong> This tab captures the original governance request information.
          Fields are optional for initiatives not created through the governance portal.
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Initiative Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="e.g., SDOH Screening Expansion to Emergency Departments"
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Clear, descriptive title for your system-level initiative
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Division/Region
          </label>
          <select
            value={data.division_region}
            onChange={(e) => setData({ ...data, division_region: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          >
            <option value="">Select division/region...</option>
            {DIVISION_REGIONS.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Submitter Name
            </label>
            <input
              type="text"
              value={data.submitter_name}
              onChange={(e) => setData({ ...data, submitter_name: e.target.value })}
              placeholder="Your full name"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Submitter Email
            </label>
            <input
              type="email"
              value={data.submitter_email}
              onChange={(e) => setData({ ...data, submitter_email: e.target.value })}
              placeholder="your.email@commonspirit.org"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            System Clinical Leader/Sponsor
          </label>
          <input
            type="text"
            value={data.system_clinical_leader}
            onChange={(e) => setData({ ...data, system_clinical_leader: e.target.value })}
            placeholder="e.g., Dr. Sarah Johnson, SVP Clinical Excellence"
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Clinical leader sponsoring this initiative
          </p>
        </div>
      </div>

      {/* System-Level Need */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">System-Level Need</h3>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Problem Statement
          </label>
          <textarea
            rows={2}
            value={data.problem_statement}
            onChange={(e) => setData({ ...data, problem_statement: e.target.value })}
            placeholder="What system-level problem or opportunity is being addressed? Clearly articulate why this requires system-level governance and affects multiple markets or the entire organization..."
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            <strong>Important:</strong> Clearly indicate this is system-level (affects multiple markets, requires enterprise resources, organization-wide impact)
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Desired Outcomes
          </label>
          <textarea
            rows={2}
            value={data.desired_outcomes}
            onChange={(e) => setData({ ...data, desired_outcomes: e.target.value })}
            placeholder="What specific system-wide outcomes are you trying to achieve? Be as specific as possible..."
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Value Proposition */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Value Proposition</h3>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Patient Care Value
          </label>
          <textarea
            rows={2}
            value={data.patient_care_value}
            onChange={(e) => setData({ ...data, patient_care_value: e.target.value })}
            placeholder="How does this improve patient care across the system or multiple markets?"
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Compliance/Regulatory Value
          </label>
          <textarea
            rows={2}
            value={data.compliance_regulatory_value}
            onChange={(e) => setData({ ...data, compliance_regulatory_value: e.target.value })}
            placeholder="System-wide regulatory requirements, compliance benefits (e.g., CMS mandates affecting all facilities)"
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Target Timeline
          </label>
          <input
            type="text"
            value={data.target_timeline}
            onChange={(e) => setData({ ...data, target_timeline: e.target.value })}
            placeholder="Q1 2026"
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Estimated Scope/Effort
          </label>
          <textarea
            rows={2}
            value={data.estimated_scope}
            onChange={(e) => setData({ ...data, estimated_scope: e.target.value })}
            placeholder="Brief description of resources, timeline, complexity at system scale..."
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Category of Impact */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Category of Impact</h3>
        <p className="text-xs text-gray-600">Check all that apply. These should be demonstrable if checked.</p>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.impact_commonspirit_board_goal}
              onChange={(e) => setData({ ...data, impact_commonspirit_board_goal: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">CommonSpirit Board Goal</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.impact_commonspirit_2026_5for25}
              onChange={(e) => setData({ ...data, impact_commonspirit_2026_5for25: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">CommonSpirit 2026 or 5 for '25</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.impact_system_policy}
              onChange={(e) => setData({ ...data, impact_system_policy: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">System Policy</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.impact_patient_safety}
              onChange={(e) => setData({ ...data, impact_patient_safety: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Patient Safety</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.impact_regulatory_compliance}
              onChange={(e) => setData({ ...data, impact_regulatory_compliance: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Regulatory Compliance</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.impact_financial}
              onChange={(e) => setData({ ...data, impact_financial: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Financial</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Other:</label>
            <input
              type="text"
              value={data.impact_other}
              onChange={(e) => setData({ ...data, impact_other: e.target.value })}
              placeholder="Specify other impact category"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Supporting Information
          </label>
          <textarea
            rows={2}
            value={data.supporting_information}
            onChange={(e) => setData({ ...data, supporting_information: e.target.value })}
            placeholder="Any regulatory, policy, practice guidelines, etc. that support the request and selected categories..."
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Groups Impacted */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Groups Impacted by Problem</h3>
        <p className="text-sm text-gray-600">Check all that apply. Please ensure that each group is aware and supports the request.</p>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.groups_nurses}
              onChange={(e) => setData({ ...data, groups_nurses: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Nurses</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.groups_physicians_apps}
              onChange={(e) => setData({ ...data, groups_physicians_apps: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Physicians/APPs</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.groups_therapies}
              onChange={(e) => setData({ ...data, groups_therapies: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Therapies</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.groups_lab}
              onChange={(e) => setData({ ...data, groups_lab: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Lab</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.groups_pharmacy}
              onChange={(e) => setData({ ...data, groups_pharmacy: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Pharmacy</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.groups_radiology}
              onChange={(e) => setData({ ...data, groups_radiology: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Radiology</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.groups_administration}
              onChange={(e) => setData({ ...data, groups_administration: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-900">Administration</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Other:</label>
            <input
              type="text"
              value={data.groups_other}
              onChange={(e) => setData({ ...data, groups_other: e.target.value })}
              placeholder="Specify other groups"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Regional Impact & Timeline */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Regional Impact & Timeline</h3>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            What regions are impacted by this change?
          </label>
          <input
            type="text"
            value={data.regions_impacted}
            onChange={(e) => setData({ ...data, regions_impacted: e.target.value })}
            placeholder="e.g., All regions (South, Mountain, Northwest, California, Central) or specific regions"
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Is there a required date for problem resolution?
          </label>
          <input
            type="date"
            value={data.required_date}
            onChange={(e) => setData({ ...data, required_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Regulation effective date, policy effective date, survey action plan, etc.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Reason for Required Date
          </label>
          <input
            type="text"
            value={data.required_date_reason}
            onChange={(e) => setData({ ...data, required_date_reason: e.target.value })}
            placeholder="e.g., CMS regulation effective date, Joint Commission requirement"
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Additional Comments */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Additional Comments</h3>

        <div>
          <textarea
            rows={2}
            value={data.additional_comments}
            onChange={(e) => setData({ ...data, additional_comments: e.target.value })}
            placeholder="Any additional information that would be helpful in evaluating this request..."
            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
