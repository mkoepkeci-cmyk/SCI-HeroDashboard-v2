import { Plus, X } from 'lucide-react';

interface Metric {
  // Proposed Goals (from governance request - read-only display)
  metricName: string;
  metricType: string;
  unit: string;
  baselineValue: string;
  baselineDate: string;
  targetValue: string;
  measurementMethod: string;
  // Actual Outcomes (editable by user)
  actualValue: string;
  actualDate: string;
  actualImprovement: string;
  varianceFromTarget: string;
}

interface Tab4FinancialData {
  // Projected (from governance request - read-only display)
  projectedAnnual: string;
  projectionBasis: string;
  calculationMethodology: string;
  keyAssumptions: string;
  // Realized (editable by user)
  actualRevenue: string;
  actualTimeframe: string;
  measurementStartDate: string;
  measurementEndDate: string;
  varianceFromProjected: string;
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
      targetValue: '',
      measurementMethod: '',
      actualValue: '',
      actualDate: '',
      actualImprovement: '',
      varianceFromTarget: ''
    }]);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const updated = [...metrics];
    updated[index][field] = value;

    // Auto-calculate improvement if we have baseline and actual
    if (field === 'actualValue' || field === 'baselineValue') {
      const baseline = parseFloat(field === 'baselineValue' ? value : updated[index].baselineValue);
      const actual = parseFloat(field === 'actualValue' ? value : updated[index].actualValue);

      if (!isNaN(baseline) && !isNaN(actual) && baseline !== 0) {
        const improvement = ((actual - baseline) / baseline * 100).toFixed(1);
        updated[index].actualImprovement = `${improvement}%`;
      }
    }

    // Auto-calculate variance from target
    if (field === 'actualValue' || field === 'targetValue') {
      const target = parseFloat(field === 'targetValue' ? value : updated[index].targetValue);
      const actual = parseFloat(field === 'actualValue' ? value : updated[index].actualValue);

      if (!isNaN(target) && !isNaN(actual)) {
        const variance = actual - target;
        updated[index].varianceFromTarget = variance >= 0 ? `+${variance}` : `${variance}`;
      }
    }

    setMetrics(updated);
  };

  // Auto-calculate financial variance
  const handleFinancialChange = (field: keyof Tab4FinancialData, value: string) => {
    const updated = { ...financial, [field]: value };

    if (field === 'actualRevenue' || field === 'projectedAnnual') {
      const projected = parseFloat(field === 'projectedAnnual' ? value : financial.projectedAnnual);
      const actual = parseFloat(field === 'actualRevenue' ? value : financial.actualRevenue);

      if (!isNaN(projected) && !isNaN(actual)) {
        const variance = actual - projected;
        updated.varianceFromProjected = variance >= 0 ? `+$${variance.toLocaleString()}` : `-$${Math.abs(variance).toLocaleString()}`;
      }
    }

    setFinancial(updated);
  };

  return (
    <div className="space-y-6">
      {/* Impact Metrics - Unified Pre/Post */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-[#00A1E0]">Impact Metrics Tracking</h3>
        <p className="text-sm text-gray-600 mb-4">
          Track proposed goals vs actual outcomes. Left side shows original targets from the governance request (read-only).
          Right side is where you enter actual measured results.
        </p>

        {metrics.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center mb-4">
            <p className="text-gray-600">No impact metrics defined yet. Click "Add Metric" to create your first metric.</p>
          </div>
        )}

        {metrics.map((metric, index) => (
          <div key={index} className="mb-3 border border-[#00A1E0]/30 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#00A1E0]/10 px-3 py-2 flex justify-between items-center">
              <div>
                <span className="font-semibold text-sm text-gray-900">
                  {metric.metricName || `Metric #${index + 1}`}
                </span>
                {metric.metricType && (
                  <span className="ml-2 text-xs text-gray-600">
                    ({metric.metricType} • {metric.unit || 'No unit'})
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {index === metrics.length - 1 && (
                  <button
                    type="button"
                    onClick={addMetric}
                    className="text-[#00A1E0] hover:text-[#0088c2] text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Metric
                  </button>
                )}
                {metrics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMetric(index)}
                    className="text-red-600 hover:text-red-700 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Pre/Post Grid */}
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* LEFT SIDE: Proposed Goals (Read-Only) */}
              <div className="bg-blue-50/50 p-3">
                <h4 className="text-xs font-semibold text-blue-900 mb-2">PROPOSED GOALS</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Metric Name</label>
                    <input
                      type="text"
                      value={metric.metricName}
                      onChange={(e) => updateMetric(index, 'metricName', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      placeholder="e.g., Screening Accuracy"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Type</label>
                      <select
                        value={metric.metricType}
                        onChange={(e) => updateMetric(index, 'metricType', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="">Select</option>
                        <option value="Quality">Quality</option>
                        <option value="Efficiency">Efficiency</option>
                        <option value="Adoption">Adoption</option>
                        <option value="Financial">Financial</option>
                        <option value="Patient Experience">Patient Experience</option>
                        <option value="Clinical Outcome">Clinical Outcome</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Unit</label>
                      <select
                        value={metric.unit}
                        onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="">Select</option>
                        <option value="Percentage">%</option>
                        <option value="Minutes">Minutes</option>
                        <option value="Count">Count</option>
                        <option value="Dollars">$</option>
                        <option value="Score">Score</option>
                        <option value="Rate">Rate</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Baseline Value</label>
                      <input
                        type="text"
                        value={metric.baselineValue}
                        onChange={(e) => updateMetric(index, 'baselineValue', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                        placeholder="32"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Baseline Date</label>
                      <input
                        type="date"
                        value={metric.baselineDate}
                        onChange={(e) => updateMetric(index, 'baselineDate', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Target Value</label>
                    <input
                      type="text"
                      value={metric.targetValue}
                      onChange={(e) => updateMetric(index, 'targetValue', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      placeholder="75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Measurement Method</label>
                    <textarea
                      value={metric.measurementMethod}
                      onChange={(e) => updateMetric(index, 'measurementMethod', e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      placeholder="How was this measured?"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Actual Outcomes (Editable) */}
              <div className="bg-green-50/50 p-3">
                <h4 className="text-xs font-semibold text-green-900 mb-2">ACTUAL OUTCOMES</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Actual Result</label>
                    <input
                      type="text"
                      value={metric.actualValue}
                      onChange={(e) => updateMetric(index, 'actualValue', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                      placeholder="Enter actual measured value"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Measurement Date</label>
                    <input
                      type="date"
                      value={metric.actualDate}
                      onChange={(e) => updateMetric(index, 'actualDate', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    />
                  </div>

                  {/* Only show auto-calculated metrics if actualValue is entered */}
                  {metric.actualValue && metric.actualValue.trim() && (
                    <div className="bg-white border border-green-200 rounded p-2">
                      <label className="block text-xs font-semibold text-green-900 mb-1">Auto-Calculated Metrics</label>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Improvement:</span>
                          <span className="font-semibold text-green-700">
                            {metric.actualImprovement || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Variance from Target:</span>
                          <span className={`font-semibold ${
                            metric.varianceFromTarget?.startsWith('+') ? 'text-green-700' :
                            metric.varianceFromTarget?.startsWith('-') ? 'text-red-700' :
                            'text-gray-500'
                          }`}>
                            {metric.varianceFromTarget || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Helper text - only show when no actual value */}
                  {(!metric.actualValue || !metric.actualValue.trim()) && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 italic">
                        Enter actual result to see improvement and variance calculations.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {metrics.length === 0 && (
          <button
            type="button"
            onClick={addMetric}
            className="w-full px-4 py-3 bg-[#00A1E0] text-white rounded-lg hover:bg-[#0088c2] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add First Metric
          </button>
        )}
      </div>

      {/* Financial Impact - Unified Pre/Post */}
      <div>
        <h3 className="text-sm font-semibold mb-1 text-[#00A1E0]">Financial Impact Tracking</h3>
        <p className="text-xs text-gray-600 mb-2">
          Track projected vs realized financial impact. Left side shows original estimates (from governance request).
          Right side is where you enter actual measured revenue/savings.
        </p>

        <div className="border border-[#00A1E0]/30 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            {/* LEFT SIDE: Projected (Read-Only) */}
            <div className="bg-blue-50/50 p-3">
              <h4 className="text-xs font-semibold text-blue-900 mb-2">PROJECTED (Estimates/Pilot)</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Projected Annual Revenue/Savings ($)</label>
                  <input
                    type="number"
                    value={financial.projectedAnnual}
                    onChange={(e) => handleFinancialChange('projectedAnnual', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    placeholder="12000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Projection Basis</label>
                  <input
                    type="text"
                    value={financial.projectionBasis}
                    onChange={(e) => handleFinancialChange('projectionBasis', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    placeholder="e.g., Pilot data × 12 months"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Calculation Methodology</label>
                  <textarea
                    value={financial.calculationMethodology}
                    onChange={(e) => handleFinancialChange('calculationMethodology', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    placeholder="Show your work - be specific"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Key Assumptions</label>
                  <textarea
                    value={financial.keyAssumptions}
                    onChange={(e) => handleFinancialChange('keyAssumptions', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    placeholder="List ALL assumptions (one per line)"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Realized (Editable) */}
            <div className="bg-green-50/50 p-3">
              <h4 className="text-xs font-semibold text-green-900 mb-2">REALIZED (Actual Measured)</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Actual Revenue ($)</label>
                  <input
                    type="number"
                    value={financial.actualRevenue}
                    onChange={(e) => handleFinancialChange('actualRevenue', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    placeholder="Dollar amount realized"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Actual Timeframe</label>
                  <input
                    type="text"
                    value={financial.actualTimeframe}
                    onChange={(e) => handleFinancialChange('actualTimeframe', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    placeholder="e.g., FY24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Measurement Start Date</label>
                    <input
                      type="date"
                      value={financial.measurementStartDate}
                      onChange={(e) => handleFinancialChange('measurementStartDate', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Measurement End Date</label>
                    <input
                      type="date"
                      value={financial.measurementEndDate}
                      onChange={(e) => handleFinancialChange('measurementEndDate', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="bg-white border border-green-200 rounded p-2 mt-2">
                  <label className="block text-xs font-semibold text-green-900 mb-1">Auto-Calculated Variance</label>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Variance from Projected:</span>
                    <span className={`text-sm font-bold ${
                      financial.varianceFromProjected?.startsWith('+') ? 'text-green-700' :
                      financial.varianceFromProjected?.startsWith('-') ? 'text-red-700' :
                      'text-gray-500'
                    }`}>
                      {financial.varianceFromProjected || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Calculated automatically when both projected and actual values are entered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Performance Data */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Actual Performance Data</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Users Deployed</label>
            <input
              type="number"
              value={performance.usersDeployed}
              onChange={(e) => setPerformance({ ...performance, usersDeployed: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Total Potential Users</label>
            <input
              type="number"
              value={performance.totalPotentialUsers}
              onChange={(e) => setPerformance({ ...performance, totalPotentialUsers: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Primary Outcome</label>
            <textarea
              value={performance.primaryOutcome}
              onChange={(e) => setPerformance({ ...performance, primaryOutcome: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Describe the primary outcome achieved"
            />
          </div>
        </div>
      </div>

      {/* Projection Model (If Scaling) */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Projection Model (If Scaling)</h3>
        <p className="text-xs text-gray-600 mb-2">
          If planning to scale this initiative, provide projection details for future expansion.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Projection Scenario</label>
            <input
              type="text"
              value={projections.projectionScenario}
              onChange={(e) => setProjections({ ...projections, projectionScenario: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., System-wide rollout"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Projected Scale (# users)</label>
            <input
              type="number"
              value={projections.projectedUsers}
              onChange={(e) => setProjections({ ...projections, projectedUsers: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Number of users"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">% of Organization</label>
            <input
              type="number"
              value={projections.percentOfOrganization}
              onChange={(e) => setProjections({ ...projections, percentOfOrganization: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Percentage"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Projected Time Savings</label>
            <input
              type="text"
              value={projections.projectedTimeSavings}
              onChange={(e) => setProjections({ ...projections, projectedTimeSavings: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 50 hours/week"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Projected Dollar Value</label>
            <input
              type="text"
              value={projections.projectedDollarValue}
              onChange={(e) => setProjections({ ...projections, projectedDollarValue: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Dollar amount"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Revenue Impact Type</label>
            <input
              type="text"
              value={projections.revenueImpact}
              onChange={(e) => setProjections({ ...projections, revenueImpact: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., Cost Avoidance, Direct Revenue"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Projection Detail/Calculation</label>
            <textarea
              value={projections.projectionCalculationMethod}
              onChange={(e) => setProjections({ ...projections, projectionCalculationMethod: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="How did you calculate these projections?"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Projection Assumptions</label>
            <textarea
              value={projections.projectionAssumptions}
              onChange={(e) => setProjections({ ...projections, projectionAssumptions: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Enter assumptions (one per line)"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Sensitivity Notes</label>
            <textarea
              value={projections.sensitivityNotes}
              onChange={(e) => setProjections({ ...projections, sensitivityNotes: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="What assumptions could change these numbers?"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Additional Benefits</label>
            <textarea
              value={projections.additionalBenefits}
              onChange={(e) => setProjections({ ...projections, additionalBenefits: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Other anticipated benefits from scaling"
            />
          </div>
        </div>
      </div>

      {/* Impact Story */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Impact Story</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Challenge</label>
            <textarea
              value={story.challenge}
              onChange={(e) => setStory({ ...story, challenge: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="What was the challenge or problem?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Approach</label>
            <textarea
              value={story.approach}
              onChange={(e) => setStory({ ...story, approach: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="How did you approach the solution?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Outcome</label>
            <textarea
              value={story.outcome}
              onChange={(e) => setStory({ ...story, outcome: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="What was the result or impact?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Collaboration Details</label>
            <textarea
              value={story.collaborationDetail}
              onChange={(e) => setStory({ ...story, collaborationDetail: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Who did you collaborate with?"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
