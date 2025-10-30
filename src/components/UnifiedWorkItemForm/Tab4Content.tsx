import { Plus, X } from 'lucide-react';

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

interface Tab4FinancialData {
  // Projected Financial Impact (from planning/pilot)
  projectedAnnual: string;
  projectionBasis: string;
  calculationMethodology: string;
  keyAssumptions: string;
  // Realized Financial Impact (actual measured)
  actualRevenue: string;
  actualTimeframe: string;
  measurementStartDate: string;
  measurementEndDate: string;
}

interface Tab4PerformanceData {
  usersDeployed: string;
  totalPotentialUsers: string;
  primaryOutcome: string;
  performanceMeasurementMethod: string;
  sampleSize: string;
  measurementPeriod: string;
  annualImpactCalculated: string;
  calculationFormula: string;
}

interface Tab4ProjectionsData {
  projectionScenario: string;
  projectedUsers: string;
  percentOfOrganization: string;
  projectedTimeSavings: string;
  projectedDollarValue: string;
  revenueImpact: string;
  projectionCalculationMethod: string;
  projectionAssumptions: string;
  sensitivityNotes: string;
  additionalBenefits: string;
}

interface Tab4StoryData {
  challenge: string;
  approach: string;
  outcome: string;
  collaborationDetail: string;
}

interface Tab4ContentProps {
  metrics: Metric[];
  setMetrics: (metrics: Metric[]) => void;
  financial: Tab4FinancialData;
  setFinancial: (data: Tab4FinancialData) => void;
  performance: Tab4PerformanceData;
  setPerformance: (data: Tab4PerformanceData) => void;
  projections: Tab4ProjectionsData;
  setProjections: (data: Tab4ProjectionsData) => void;
  story: Tab4StoryData;
  setStory: (data: Tab4StoryData) => void;
}

export const Tab4Content = ({
  metrics,
  setMetrics,
  financial,
  setFinancial,
  performance,
  setPerformance,
  projections,
  setProjections,
  story,
  setStory
}: Tab4ContentProps) => {
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
      {/* Impact Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Impact Metrics</h3>
        <p className="text-sm text-gray-600 mb-4">
          Track quantitative outcomes and performance metrics for this initiative.
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
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Metric Name</label>
                <input
                  type="text"
                  value={metric.metricName}
                  onChange={(e) => updateMetric(index, 'metricName', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  placeholder="e.g., Medication Order Time"
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
                  <option value="Satisfaction">Satisfaction</option>
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
                  <option value="Days">Days</option>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Value</label>
                <input
                  type="text"
                  value={metric.currentValue}
                  onChange={(e) => updateMetric(index, 'currentValue', e.target.value)}
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

              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Measurement Method</label>
                <input
                  type="text"
                  value={metric.measurementMethod}
                  onChange={(e) => updateMetric(index, 'measurementMethod', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  placeholder="How is this metric measured?"
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

      {/* Revenue & Financial Impact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue & Financial Impact</h3>

        {/* Projected Financial Impact */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-md font-semibold text-blue-900 mb-3">Projected Financial Impact (Estimated/Pilot)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projected Annual Revenue/Savings ($)</label>
              <input
                type="number"
                value={financial.projectedAnnual}
                onChange={(e) => setFinancial({ ...financial, projectedAnnual: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Estimated full 12-month impact"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projection Basis</label>
              <input
                type="text"
                value={financial.projectionBasis}
                onChange={(e) => setFinancial({ ...financial, projectionBasis: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="e.g., Pilot data × 12 months"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Methodology</label>
              <textarea
                value={financial.calculationMethodology}
                onChange={(e) => setFinancial({ ...financial, calculationMethodology: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="How was the financial impact calculated?"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Assumptions</label>
              <textarea
                value={financial.keyAssumptions}
                onChange={(e) => setFinancial({ ...financial, keyAssumptions: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Enter assumptions (one per line)"
              />
            </div>
          </div>
        </div>

        {/* Realized Financial Impact */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-md font-semibold text-green-900 mb-3">Realized Financial Impact (Actual Measured)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Revenue ($)</label>
              <input
                type="number"
                value={financial.actualRevenue}
                onChange={(e) => setFinancial({ ...financial, actualRevenue: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Dollar amount realized"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Timeframe</label>
              <input
                type="text"
                value={financial.actualTimeframe}
                onChange={(e) => setFinancial({ ...financial, actualTimeframe: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="e.g., FY24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Start Date</label>
              <input
                type="date"
                value={financial.measurementStartDate}
                onChange={(e) => setFinancial({ ...financial, measurementStartDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Measurement End Date</label>
              <input
                type="date"
                value={financial.measurementEndDate}
                onChange={(e) => setFinancial({ ...financial, measurementEndDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Data */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Actual Performance Data</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Users Deployed</label>
            <input
              type="number"
              value={performance.usersDeployed}
              onChange={(e) => setPerformance({ ...performance, usersDeployed: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Potential Users</label>
            <input
              type="number"
              value={performance.totalPotentialUsers}
              onChange={(e) => setPerformance({ ...performance, totalPotentialUsers: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Outcome</label>
            <textarea
              value={performance.primaryOutcome}
              onChange={(e) => setPerformance({ ...performance, primaryOutcome: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Describe the primary outcome achieved"
            />
          </div>
        </div>
      </div>

      {/* Projection Model (If Scaling) */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Projection Model (If Scaling)</h3>
        <p className="text-sm text-gray-600 mb-4">
          If planning to scale this initiative, provide projection details for future expansion.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Projection Scenario</label>
            <input
              type="text"
              value={projections.projectionScenario}
              onChange={(e) => setProjections({ ...projections, projectionScenario: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., System-wide rollout"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projected Scale (# users)</label>
            <input
              type="number"
              value={projections.projectedUsers}
              onChange={(e) => setProjections({ ...projections, projectedUsers: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Number of users"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% of Organization</label>
            <input
              type="number"
              value={projections.percentOfOrganization}
              onChange={(e) => setProjections({ ...projections, percentOfOrganization: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Percentage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projected Time Savings</label>
            <input
              type="text"
              value={projections.projectedTimeSavings}
              onChange={(e) => setProjections({ ...projections, projectedTimeSavings: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., 50 hours/week"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projected Dollar Value</label>
            <input
              type="text"
              value={projections.projectedDollarValue}
              onChange={(e) => setProjections({ ...projections, projectedDollarValue: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Dollar amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Impact Type</label>
            <input
              type="text"
              value={projections.revenueImpact}
              onChange={(e) => setProjections({ ...projections, revenueImpact: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., Cost Avoidance, Direct Revenue"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Projection Detail/Calculation</label>
            <textarea
              value={projections.projectionCalculationMethod}
              onChange={(e) => setProjections({ ...projections, projectionCalculationMethod: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="How did you calculate these projections?"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Projection Assumptions</label>
            <textarea
              value={projections.projectionAssumptions}
              onChange={(e) => setProjections({ ...projections, projectionAssumptions: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Enter assumptions (one per line)"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sensitivity Notes</label>
            <textarea
              value={projections.sensitivityNotes}
              onChange={(e) => setProjections({ ...projections, sensitivityNotes: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="What assumptions could change these numbers?"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Benefits</label>
            <textarea
              value={projections.additionalBenefits}
              onChange={(e) => setProjections({ ...projections, additionalBenefits: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Other anticipated benefits from scaling"
            />
          </div>
        </div>
      </div>

      {/* Impact Story */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Impact Story</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
            <textarea
              value={story.challenge}
              onChange={(e) => setStory({ ...story, challenge: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="What was the challenge or problem?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approach</label>
            <textarea
              value={story.approach}
              onChange={(e) => setStory({ ...story, approach: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="How did you approach the solution?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
            <textarea
              value={story.outcome}
              onChange={(e) => setStory({ ...story, outcome: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="What was the result or impact?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collaboration Details</label>
            <textarea
              value={story.collaborationDetail}
              onChange={(e) => setStory({ ...story, collaborationDetail: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Who did you collaborate with?"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
