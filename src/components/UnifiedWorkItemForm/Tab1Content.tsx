import { Plus, X } from 'lucide-react';
import { DIVISION_REGIONS } from '../../lib/governanceUtils';

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
  metrics: Metric[];
  setMetrics: (metrics: Metric[]) => void;
}

export const Tab1Content = ({ data, setData, metrics, setMetrics }: Tab1ContentProps) => {
  const addMetric = () => {
    setMetrics([...metrics, {
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

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const updated = [...metrics];
    updated[index][field] = value;
    setMetrics(updated);
  };

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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">System Clinical Leader/Sponsor</label>
            <input
              type="text"
              value={data.system_clinical_leader}
              onChange={(e) => setData({ ...data, system_clinical_leader: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
            <textarea
              value={data.problem_statement}
              onChange={(e) => setData({ ...data, problem_statement: e.target.value })}
              rows={6}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Describe the system-level problem or opportunity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desired Outcomes</label>
            <textarea
              value={data.desired_outcomes}
              onChange={(e) => setData({ ...data, desired_outcomes: e.target.value })}
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Specific system-wide outcomes expected"
            />
          </div>
        </div>
      </div>

      {/* Impact Metrics - Simplified for space */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Impact Metrics</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add metrics to track the impact of this initiative (optional).
        </p>
        {metrics.map((metric, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Metric {index + 1}</h4>
              {metrics.length > 1 && (
                <button
                  onClick={() => removeMetric(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Metric Name</label>
                <input
                  type="text"
                  value={metric.metricName}
                  onChange={(e) => updateMetric(index, 'metricName', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={metric.metricType}
                  onChange={(e) => updateMetric(index, 'metricType', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Quality">Quality</option>
                  <option value="Efficiency">Efficiency</option>
                  <option value="Adoption">Adoption</option>
                  <option value="Financial">Financial</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select
                  value={metric.unit}
                  onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Percentage">%</option>
                  <option value="Minutes">Minutes</option>
                  <option value="Hours">Hours</option>
                  <option value="Count">Count</option>
                  <option value="Dollars">$</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Baseline Value</label>
                <input
                  type="text"
                  value={metric.baselineValue}
                  onChange={(e) => updateMetric(index, 'baselineValue', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target Value</label>
                <input
                  type="text"
                  value={metric.targetValue}
                  onChange={(e) => updateMetric(index, 'targetValue', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Measurement Method</label>
                <input
                  type="text"
                  value={metric.measurementMethod}
                  onChange={(e) => updateMetric(index, 'measurementMethod', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  placeholder="How measured?"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addMetric}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Metric
        </button>
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
