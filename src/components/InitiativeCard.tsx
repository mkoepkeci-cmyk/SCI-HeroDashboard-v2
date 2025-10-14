import { useState } from 'react';
import { ChevronDown, ChevronRight, Users, DollarSign, TrendingUp, Award, Target, Activity, Clock } from 'lucide-react';
import { InitiativeWithDetails } from '../lib/supabase';
import EffortSparkline from './EffortSparkline';
import EffortLogModal from './EffortLogModal';

interface InitiativeCardProps {
  initiative: InitiativeWithDetails;
  currentUserId?: string; // For effort logging
  onEffortUpdate?: () => void; // Callback to refresh data after effort log
}

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'Planning': 'bg-gray-100 text-gray-700 border-gray-300',
    'Active': 'bg-green-100 text-green-700 border-green-300',
    'Scaling': 'bg-blue-100 text-blue-700 border-blue-300',
    'Completed': 'bg-[#9B2F6A]/10 text-[#9B2F6A] border-[#9B2F6A]/30',
    'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};

const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'Epic Gold': '#9B2F6A',
    'System Initiative': '#00A1E0',
    'Governance': '#6F47D0',
    'General Support': '#F58025',
    'Project': '#9C5C9D',
    'Policy': '#6F47D0',
  };
  return colors[type] || '#565658';
};

const formatCurrency = (value?: number): string => {
  if (!value) return 'N/A';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
};

const formatPercentage = (value?: number): string => {
  if (!value) return 'N/A';
  return `${value.toFixed(1)}%`;
};

export const InitiativeCard = ({ initiative, currentUserId, onEffortUpdate }: InitiativeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEffortModal, setShowEffortModal] = useState(false);

  const hasMetrics = initiative.metrics && initiative.metrics.length > 0;
  const hasFinancial = !!initiative.financial_impact;
  const hasPerformance = !!initiative.performance_data;
  const hasProjections = !!initiative.projections;
  const hasStory = !!initiative.story;
  const hasEffortLogs = initiative.effort_logs && initiative.effort_logs.length > 0;

  const handleEffortSave = () => {
    if (onEffortUpdate) {
      onEffortUpdate();
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all">
      {/* Compact collapsed view */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getTypeColor(initiative.type) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-[#565658] text-sm truncate">{initiative.initiative_name}</h4>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${getStatusColor(initiative.status)}`}
                >
                  {initiative.status}
                </span>
                {initiative.phase && (
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300 flex-shrink-0">
                    {initiative.phase}
                  </span>
                )}
                {initiative.work_effort && (
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300 flex-shrink-0">
                    {initiative.work_effort}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                <span className="font-medium text-gray-700">{initiative.owner_name}</span>
                <span>•</span>
                <span>{initiative.type}</span>
                {initiative.role && (
                  <>
                    <span>•</span>
                    <span>{initiative.role}</span>
                  </>
                )}
                {initiative.ehrs_impacted && (
                  <>
                    <span>•</span>
                    <span className="text-[#00A1E0]">{initiative.ehrs_impacted}</span>
                  </>
                )}
                {initiative.service_line && (
                  <>
                    <span>•</span>
                    <span>{initiative.service_line}</span>
                  </>
                )}
                {hasFinancial && initiative.financial_impact?.actual_revenue && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(initiative.financial_impact.actual_revenue)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {hasMetrics && (
              <div className="w-5 h-5 rounded-full bg-[#00A1E0]/10 flex items-center justify-center" title="Has metrics">
                <Activity className="w-3 h-3 text-[#00A1E0]" />
              </div>
            )}
            {hasFinancial && (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center" title="Has financial data">
                <DollarSign className="w-3 h-3 text-green-600" />
              </div>
            )}
            {hasStory && (
              <div className="w-5 h-5 rounded-full bg-[#9B2F6A]/10 flex items-center justify-center" title="Has impact story">
                <Award className="w-3 h-3 text-[#9B2F6A]" />
              </div>
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* Effort Tracking Section */}
          {currentUserId && (initiative.status === 'Active' || initiative.status === 'Planning' || hasEffortLogs) && (
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
                  <Clock className="w-4 h-4" />
                  My Effort Tracking
                </h5>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEffortModal(true);
                  }}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Log Effort
                </button>
              </div>
              {hasEffortLogs ? (
                <div className="bg-blue-50 rounded p-3">
                  <EffortSparkline
                    effortLogs={initiative.effort_logs || []}
                    width={200}
                    height={50}
                  />
                  {initiative.effort_trend && (
                    <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-gray-600">
                      <span className="font-medium">Total time invested:</span>{' '}
                      {initiative.effort_trend.total_hours} hours over {initiative.effort_trend.weeks_logged} weeks
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic bg-blue-50 rounded p-3">
                  No effort logged yet. Click "Log Effort" to track your time on this initiative.
                </div>
              )}
            </div>
          )}

          {(initiative.clinical_sponsor_name || initiative.governance_bodies?.length || initiative.key_collaborators?.length) && (
            <div className="bg-white rounded-lg p-3 border">
              <h5 className="font-semibold text-sm mb-2 flex items-center gap-2 text-[#6F47D0]">
                <Users className="w-4 h-4" />
                Governance & Collaboration
              </h5>
              <div className="space-y-2 text-xs">
                {initiative.clinical_sponsor_name && (
                  <div>
                    <span className="font-medium text-gray-700">Clinical Sponsor: </span>
                    <span className="text-gray-600">
                      {initiative.clinical_sponsor_name}
                      {initiative.clinical_sponsor_title && `, ${initiative.clinical_sponsor_title}`}
                    </span>
                  </div>
                )}
                {initiative.governance_bodies && initiative.governance_bodies.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Governance Bodies: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {initiative.governance_bodies.map((body, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#6F47D0]/10 text-[#6F47D0] rounded">
                          {body}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {initiative.key_collaborators && initiative.key_collaborators.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Key Collaborators: </span>
                    <span className="text-gray-600">{initiative.key_collaborators.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasMetrics && (
            <div className="bg-white rounded-lg p-3 border">
              <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#00A1E0]">
                <Activity className="w-4 h-4" />
                Impact Metrics & Data
              </h5>
              <div className="space-y-3">
                {initiative.metrics.map((metric) => (
                  <div key={metric.id} className="bg-[#00A1E0]/5 rounded p-2 border border-[#00A1E0]/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-[#565658]">{metric.metric_name}</span>
                      <span className="text-xs px-2 py-0.5 bg-white rounded border">{metric.metric_type}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {metric.baseline_value !== null && (
                        <div>
                          <div className="text-gray-500">Baseline</div>
                          <div className="font-semibold">{metric.baseline_value} {metric.unit}</div>
                          {metric.baseline_date && (
                            <div className="text-gray-400 text-[10px]">{new Date(metric.baseline_date).toLocaleDateString()}</div>
                          )}
                        </div>
                      )}
                      {metric.current_value !== null && (
                        <div>
                          <div className="text-gray-500">Current</div>
                          <div className="font-semibold text-[#00A1E0]">{metric.current_value} {metric.unit}</div>
                          {metric.measurement_date && (
                            <div className="text-gray-400 text-[10px]">{new Date(metric.measurement_date).toLocaleDateString()}</div>
                          )}
                        </div>
                      )}
                      {metric.target_value !== null && (
                        <div>
                          <div className="text-gray-500">Target</div>
                          <div className="font-semibold">{metric.target_value} {metric.unit}</div>
                        </div>
                      )}
                      {metric.improvement && (
                        <div>
                          <div className="text-gray-500">Improvement</div>
                          <div className="font-semibold text-green-600">{metric.improvement}</div>
                        </div>
                      )}
                    </div>
                    {metric.measurement_method && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Method: </span>
                        {metric.measurement_method}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasFinancial && initiative.financial_impact && (
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-600">
                <DollarSign className="w-4 h-4" />
                Revenue & Financial Impact
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {initiative.financial_impact.actual_revenue && (
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-xs text-gray-600 mb-1">Actual Revenue/Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(initiative.financial_impact.actual_revenue)}
                    </div>
                    {initiative.financial_impact.actual_timeframe && (
                      <div className="text-xs text-gray-500 mt-1">{initiative.financial_impact.actual_timeframe}</div>
                    )}
                  </div>
                )}
                {initiative.financial_impact.projected_annual && (
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-gray-600 mb-1">Projected Annual</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(initiative.financial_impact.projected_annual)}
                    </div>
                    {initiative.financial_impact.projection_basis && (
                      <div className="text-xs text-gray-500 mt-1">{initiative.financial_impact.projection_basis}</div>
                    )}
                  </div>
                )}
              </div>
              {initiative.financial_impact.calculation_methodology && (
                <div className="mt-3 text-xs">
                  <div className="font-semibold text-gray-700 mb-1">Calculation Methodology</div>
                  <div className="text-gray-600 bg-gray-50 rounded p-2">{initiative.financial_impact.calculation_methodology}</div>
                </div>
              )}
              {initiative.financial_impact.key_assumptions && initiative.financial_impact.key_assumptions.length > 0 && (
                <div className="mt-3 text-xs">
                  <div className="font-semibold text-gray-700 mb-1">Key Assumptions</div>
                  <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                    {initiative.financial_impact.key_assumptions.map((assumption, idx) => (
                      <li key={idx}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {hasPerformance && initiative.performance_data && (
            <div className="bg-white rounded-lg p-3 border">
              <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#6F47D0]">
                <Target className="w-4 h-4" />
                Performance Data
              </h5>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {initiative.performance_data.users_deployed !== null && (
                  <div className="text-center p-2 bg-[#6F47D0]/5 rounded">
                    <div className="text-2xl font-bold text-[#6F47D0]">{initiative.performance_data.users_deployed}</div>
                    <div className="text-xs text-gray-600">Users Deployed</div>
                  </div>
                )}
                {initiative.performance_data.total_potential_users !== null && (
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-gray-700">{initiative.performance_data.total_potential_users}</div>
                    <div className="text-xs text-gray-600">Total Potential</div>
                  </div>
                )}
                {initiative.performance_data.adoption_rate !== null && (
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(initiative.performance_data.adoption_rate)}
                    </div>
                    <div className="text-xs text-gray-600">Adoption Rate</div>
                  </div>
                )}
              </div>
              {initiative.performance_data.primary_outcome && (
                <div className="text-xs mb-2">
                  <div className="font-semibold text-gray-700 mb-1">Measured Outcome</div>
                  <div className="text-gray-600 bg-gray-50 rounded p-2">{initiative.performance_data.primary_outcome}</div>
                </div>
              )}
              {initiative.performance_data.annual_impact_calculated && (
                <div className="text-xs">
                  <div className="font-semibold text-gray-700 mb-1">Annual Impact</div>
                  <div className="text-gray-600">{initiative.performance_data.annual_impact_calculated}</div>
                </div>
              )}
            </div>
          )}

          {hasProjections && initiative.projections && (
            <div className="bg-white rounded-lg p-3 border border-[#F58025]/30">
              <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#F58025]">
                <TrendingUp className="w-4 h-4" />
                Projection Model
              </h5>
              {initiative.projections.scenario_description && (
                <div className="bg-[#F58025]/5 rounded p-2 mb-3 text-xs">
                  <div className="font-semibold text-gray-700 mb-1">Scenario</div>
                  <div className="text-gray-600">{initiative.projections.scenario_description}</div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {initiative.projections.projected_users && (
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-[#F58025]">{initiative.projections.projected_users}</div>
                    <div className="text-xs text-gray-600">Projected Users</div>
                  </div>
                )}
                {initiative.projections.percent_of_organization && (
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-[#F58025]">
                      {formatPercentage(initiative.projections.percent_of_organization)}
                    </div>
                    <div className="text-xs text-gray-600">% of Org</div>
                  </div>
                )}
                {initiative.projections.projected_dollar_value && (
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">{initiative.projections.projected_dollar_value}</div>
                    <div className="text-xs text-gray-600">Projected Value</div>
                  </div>
                )}
              </div>
              {initiative.projections.calculation_method && (
                <div className="text-xs mb-2">
                  <div className="font-semibold text-gray-700 mb-1">Calculation Method</div>
                  <div className="text-gray-600 bg-gray-50 rounded p-2">{initiative.projections.calculation_method}</div>
                </div>
              )}
              {initiative.projections.assumptions && initiative.projections.assumptions.length > 0 && (
                <div className="text-xs">
                  <div className="font-semibold text-gray-700 mb-1">Assumptions</div>
                  <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                    {initiative.projections.assumptions.map((assumption, idx) => (
                      <li key={idx}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {hasStory && initiative.story && (
            <div className="bg-white rounded-lg p-3 border border-[#9B2F6A]/30">
              <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#9B2F6A]">
                <Award className="w-4 h-4" />
                Impact Story
              </h5>
              <div className="space-y-3 text-xs">
                {initiative.story.challenge && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Challenge</div>
                    <div className="text-gray-600 bg-[#9B2F6A]/5 rounded p-2">{initiative.story.challenge}</div>
                  </div>
                )}
                {initiative.story.approach && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Approach</div>
                    <div className="text-gray-600 bg-[#9B2F6A]/5 rounded p-2">{initiative.story.approach}</div>
                  </div>
                )}
                {initiative.story.outcome && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Outcome</div>
                    <div className="text-gray-600 bg-[#9B2F6A]/5 rounded p-2">{initiative.story.outcome}</div>
                  </div>
                )}
                {initiative.story.collaboration_detail && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Collaboration</div>
                    <div className="text-gray-600 bg-[#9B2F6A]/5 rounded p-2">{initiative.story.collaboration_detail}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Effort Log Modal */}
      {showEffortModal && currentUserId && (
        <EffortLogModal
          initiative={initiative}
          teamMemberId={currentUserId}
          onClose={() => setShowEffortModal(false)}
          onSave={handleEffortSave}
        />
      )}
    </div>
  );
};
