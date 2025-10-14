import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { DollarSign, Award, Loader2, Plus, List, TrendingUp } from 'lucide-react';
import { supabase, TeamMember, WorkTypeSummary, EHRPlatformSummary, KeyHighlight, InitiativeWithDetails, Assignment, DashboardMetrics } from './lib/supabase';
import { InitiativeSubmissionForm } from './components/InitiativeSubmissionForm';
import { InitiativeCard } from './components/InitiativeCard';
import { InitiativesView } from './components/InitiativesView';
import { calculateWorkload, getCapacityStatus, getCapacityColor, getCapacityEmoji, getCapacityLabel, WORK_EFFORT_HOURS, parseWorkEffort } from './lib/workloadUtils';
import StaffDetailModal from './components/StaffDetailModal';

interface TeamMemberWithDetails extends TeamMember {
  workTypes: { [key: string]: number };
  ehrs: { [key: string]: number };
  topWork: string[];
  initiatives: InitiativeWithDetails[];
  assignments: Assignment[];
  dashboard_metrics?: DashboardMetrics;
}

function App() {
  // Get initial view from URL hash or default to 'overview'
  const getInitialView = (): 'overview' | 'team' | 'initiatives' | 'workload' | 'addData' => {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (['overview', 'team', 'initiatives', 'workload', 'addData'].includes(hash)) {
      return hash as 'overview' | 'team' | 'initiatives' | 'workload' | 'addData';
    }
    return 'overview';
  };

  const [activeView, setActiveView] = useState<'overview' | 'team' | 'initiatives' | 'workload' | 'addData'>(getInitialView());
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithDetails | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInitiative, setEditingInitiative] = useState<InitiativeWithDetails | null>(null);

  // Update URL hash when view changes
  useEffect(() => {
    window.location.hash = activeView;
  }, [activeView]);

  // Listen for hash changes (back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const newView = getInitialView();
      setActiveView(newView);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true });

      if (membersError) throw membersError;

      const { data: workTypes, error: workTypesError } = await supabase
        .from('work_type_summary')
        .select('*');

      if (workTypesError) throw workTypesError;

      const { data: ehrPlatforms, error: ehrError } = await supabase
        .from('ehr_platform_summary')
        .select('*');

      if (ehrError) throw ehrError;

      const { data: highlights, error: highlightsError } = await supabase
        .from('key_highlights')
        .select('*')
        .order('order_index', { ascending: true });

      if (highlightsError) throw highlightsError;

      const { data: initiatives, error: initiativesError } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false });

      if (initiativesError) throw initiativesError;

      const { data: metrics, error: metricsError } = await supabase
        .from('initiative_metrics')
        .select('*')
        .order('display_order', { ascending: true });

      if (metricsError) throw metricsError;

      const { data: financialImpact, error: financialError } = await supabase
        .from('initiative_financial_impact')
        .select('*');

      if (financialError) throw financialError;

      const { data: performanceData, error: performanceError } = await supabase
        .from('initiative_performance_data')
        .select('*');

      if (performanceError) throw performanceError;

      const { data: projections, error: projectionsError } = await supabase
        .from('initiative_projections')
        .select('*');

      if (projectionsError) throw projectionsError;

      const { data: stories, error: storiesError } = await supabase
        .from('initiative_stories')
        .select('*');

      if (storiesError) throw storiesError;

      const { data: assignments, error: assignmentsError} = await supabase
        .from('assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      // Fetch dashboard metrics (pre-calculated from Excel Dashboard)
      const { data: dashboardMetrics, error: dashboardError } = await supabase
        .from('dashboard_metrics')
        .select('*');

      if (dashboardError) {
        console.warn('Dashboard metrics not available:', dashboardError);
      }

      const initiativesWithDetails: InitiativeWithDetails[] = (initiatives || []).map((initiative) => ({
        ...initiative,
        metrics: (metrics || []).filter((m) => m.initiative_id === initiative.id),
        financial_impact: (financialImpact || []).find((f) => f.initiative_id === initiative.id),
        performance_data: (performanceData || []).find((p) => p.initiative_id === initiative.id),
        projections: (projections || []).find((p) => p.initiative_id === initiative.id),
        story: (stories || []).find((s) => s.initiative_id === initiative.id),
      }));

      const membersWithDetails: TeamMemberWithDetails[] = (members || []).map((member) => {
        const memberWorkTypes = (workTypes || [])
          .filter((wt) => wt.team_member_id === member.id)
          .reduce((acc, wt) => {
            acc[wt.work_type] = wt.count;
            return acc;
          }, {} as { [key: string]: number });

        const memberEHRs = (ehrPlatforms || [])
          .filter((ehr) => ehr.team_member_id === member.id)
          .reduce((acc, ehr) => {
            acc[ehr.ehr_platform] = ehr.count;
            return acc;
          }, {} as { [key: string]: number });

        const memberHighlights = (highlights || [])
          .filter((h) => h.team_member_id === member.id)
          .map((h) => h.highlight);

        const memberInitiatives = initiativesWithDetails.filter(
          (i) => i.team_member_id === member.id
        );

        const memberAssignments = (assignments || []).filter(
          (a) => a.team_member_id === member.id
        );

        // Get dashboard metrics for this member
        const memberDashboardMetrics = (dashboardMetrics || []).find(
          (dm: any) => dm.team_member_id === member.id
        );

        return {
          ...member,
          workTypes: memberWorkTypes,
          ehrs: memberEHRs,
          topWork: memberHighlights,
          initiatives: memberInitiatives,
          assignments: memberAssignments,
          dashboard_metrics: memberDashboardMetrics,
        };
      });

      setTeamMembers(membersWithDetails);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Epic Gold': '#9B2F6A',
      'System Initiative': '#00A1E0',
      'Governance': '#6F47D0',
      'General Support': '#F58025',
      'Project': '#9C5C9D',
      'Policy/ Guideline': '#6F47D0',
      'Epic Governance': '#6F47D0',
      'Epic Upgrades': '#00A1E0',
      'Uncategorized': '#565658',
    };
    return colors[type] || '#565658';
  };

  // Calculate dynamic overview metrics
  const calculateOverviewMetrics = () => {
    const totalAssignments = teamMembers.reduce((sum, member) => sum + member.total_assignments, 0);

    // Get all initiatives with details
    const allInitiatives = teamMembers.flatMap(member => member.initiatives || []);
    const activeInitiatives = allInitiatives.filter(i => i.is_active === true);
    const completedInitiatives = allInitiatives.filter(i => i.is_active === false);

    // Calculate total financial impact
    const totalRevenue = allInitiatives.reduce((sum, initiative) => {
      const revenue = initiative.financial_impact?.projected_annual || 0;
      return sum + revenue;
    }, 0);

    // Aggregate work types across all team members
    const workTypeDistribution = teamMembers.reduce((acc, member) => {
      Object.entries(member.workTypes).forEach(([type, count]) => {
        acc[type] = (acc[type] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    // Calculate service line distribution
    const serviceLineDistribution = allInitiatives.reduce((acc, initiative) => {
      if (initiative.service_line) {
        acc[initiative.service_line] = (acc[initiative.service_line] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate EHR platform coverage
    const ehrDistribution = teamMembers.reduce((acc, member) => {
      Object.entries(member.ehrs).forEach(([ehr, count]) => {
        acc[ehr] = (acc[ehr] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    // Get top initiatives by revenue impact
    const topInitiativesByRevenue = [...completedInitiatives]
      .filter(i => i.financial_impact?.projected_annual)
      .sort((a, b) => (b.financial_impact?.projected_annual || 0) - (a.financial_impact?.projected_annual || 0))
      .slice(0, 3);

    return {
      totalAssignments,
      totalInitiatives: allInitiatives.length,
      activeInitiatives: activeInitiatives.length,
      completedInitiatives: completedInitiatives.length,
      totalRevenue,
      workTypeDistribution,
      serviceLineDistribution,
      ehrDistribution,
      topInitiativesByRevenue,
      allActiveInitiatives: activeInitiatives,
      recentCompletedInitiatives: completedInitiatives.slice(0, 5)
    };
  };

  const OverviewView = () => {
    const metrics = calculateOverviewMetrics();

    // Format currency
    const formatCurrency = (value: number) => {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    };

    return (
      <div className="space-y-4">
        {/* Hero Banner */}
        <div className="bg-[#9B2F6A] rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="inline-block bg-white/10 px-3 py-1 rounded-full mb-2">
                <span className="text-xs font-semibold tracking-wide">CommonSpirit Health</span>
              </div>
              <h2 className="text-3xl font-bold mb-1 tracking-tight">System Clinical Informatics</h2>
              <p className="text-white/90 text-sm font-medium">
                {teamMembers.length} Team Members • {metrics.totalAssignments} Active Assignments • {metrics.totalInitiatives} Initiatives
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="text-sm text-white/90 font-medium">Total Revenue Impact</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/15 rounded-lg p-3 border border-white/20">
              <div className="text-2xl font-bold">{metrics.activeInitiatives}</div>
              <div className="text-xs text-white/90 font-medium mt-1">Active Initiatives</div>
            </div>
            <div className="bg-white/15 rounded-lg p-3 border border-white/20">
              <div className="text-2xl font-bold">{metrics.completedInitiatives}</div>
              <div className="text-xs text-white/90 font-medium mt-1">Completed Projects</div>
            </div>
            <div className="bg-white/15 rounded-lg p-3 border border-white/20">
              <div className="text-2xl font-bold">{Object.keys(metrics.ehrDistribution).length}</div>
              <div className="text-xs text-white/90 font-medium mt-1">EHR Platforms</div>
            </div>
            <div className="bg-white/15 rounded-lg p-3 border border-white/20">
              <div className="text-2xl font-bold">{Object.keys(metrics.serviceLineDistribution).length}</div>
              <div className="text-xs text-white/90 font-medium mt-1">Service Lines</div>
            </div>
          </div>
        </div>

        {/* Active Initiatives Status */}
        {metrics.allActiveInitiatives.length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
              <span>Active Initiatives Overview</span>
              <span className="text-xs font-normal text-gray-600">
                {metrics.activeInitiatives} in progress
              </span>
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(
                metrics.allActiveInitiatives.reduce((acc, initiative) => {
                  const type = initiative.type || 'Other';
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="border rounded-lg p-3 text-center"
                    style={{
                      borderColor: getWorkTypeColor(type),
                      backgroundColor: `${getWorkTypeColor(type)}10`,
                    }}
                  >
                    <div className="text-xl font-bold" style={{ color: getWorkTypeColor(type) }}>
                      {count}
                    </div>
                    <div className="text-xs text-gray-700 mt-1">{type}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Work Type Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2">Work Type Distribution</h3>
            <div className="space-y-1">
              {Object.entries(metrics.workTypeDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getWorkTypeColor(type) }}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-xs text-gray-700">{type}</span>
                      <span className="text-xs font-bold" style={{ color: getWorkTypeColor(type) }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2">EHR Platform Coverage</h3>
            <div className="space-y-1">
              {Object.entries(metrics.ehrDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([ehr, count]) => (
                  <div key={ehr} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                    <span className="text-xs font-medium text-gray-700">{ehr}</span>
                    <span className="text-sm font-bold text-[#9B2F6A]">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Top Initiatives by Revenue */}
        {metrics.topInitiativesByRevenue.length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
              <span>Top Revenue-Generating Initiatives</span>
              <span className="text-xs font-normal text-gray-600">Completed</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {metrics.topInitiativesByRevenue.map((initiative) => (
                <div
                  key={initiative.id}
                  className="border rounded-lg p-3 hover:shadow-md transition-all"
                  style={{ borderColor: getWorkTypeColor(initiative.type) }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getWorkTypeColor(initiative.type) }}
                    />
                    <span className="text-xs text-gray-600">{initiative.type}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2 text-gray-800 line-clamp-2">
                    {initiative.initiative_name}
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Impact</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(initiative.financial_impact?.projected_annual || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner</span>
                      <span className="font-medium text-gray-700">{initiative.owner_name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Line Impact */}
        {Object.keys(metrics.serviceLineDistribution).length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Service Line Impact</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(metrics.serviceLineDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([serviceLine, count]) => (
                  <div
                    key={serviceLine}
                    className="bg-[#00A1E0]/10 border border-[#00A1E0]/30 rounded-lg p-3 text-center"
                  >
                    <div className="text-2xl font-bold text-[#00A1E0]">{count}</div>
                    <div className="text-xs text-gray-700 font-medium mt-1">{serviceLine}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Completed Initiatives */}
        {metrics.recentCompletedInitiatives.length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
              <span>Recent Wins</span>
              <span className="text-xs font-normal text-gray-600">
                {metrics.completedInitiatives} total completed
              </span>
            </h3>
            <div className="space-y-2">
              {metrics.recentCompletedInitiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getWorkTypeColor(initiative.type) }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-800">{initiative.initiative_name}</h4>
                      <p className="text-xs text-gray-600">
                        {initiative.owner_name} • {initiative.type}
                        {initiative.service_line && ` • ${initiative.service_line}`}
                      </p>
                    </div>
                  </div>
                  {initiative.financial_impact?.projected_annual && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(initiative.financial_impact.projected_annual)}
                      </div>
                      <div className="text-xs text-gray-600">Impact</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const TeamView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-white border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer hover:border-[#9B2F6A]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 bg-[#9B2F6A] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate text-[#565658]">{member.name}</h3>
              </div>
            </div>
            <div className="text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Assignments</span>
                <span className="font-semibold">{member.total_assignments}</span>
              </div>
              {member.revenue_impact && (
                <div className="flex justify-between mt-0.5">
                  <span className="text-gray-600">Impact</span>
                  <span className="font-semibold text-green-600">{member.revenue_impact}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">{selectedMember.name}'s Portfolio</h2>
              <p className="text-sm text-gray-600">
                {selectedMember.total_assignments} Active Assignments • {selectedMember.specialty}
              </p>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-sm text-[#9B2F6A] hover:text-[#8F2561] font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Work Type Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={Object.entries(selectedMember.workTypes).map(([type, count]) => ({
                      name: type,
                      value: count,
                      color: getWorkTypeColor(type),
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={(entry) => `${entry.name} (${entry.value})`}
                    labelLine={false}
                  >
                    {Object.entries(selectedMember.workTypes).map(([type], index) => (
                      <Cell key={`cell-${index}`} fill={getWorkTypeColor(type)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">EHR Platform Impact</h3>
              <div className="space-y-2">
                {Object.entries(selectedMember.ehrs)
                  .sort((a, b) => b[1] - a[1])
                  .map(([ehr, count]) => (
                    <div key={ehr} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{ehr}</span>
                      <span className="text-lg font-bold text-[#9B2F6A]">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="border border-[#9B2F6A]/20 rounded-lg p-3 bg-[#9B2F6A]/5">
            <h3 className="font-semibold text-sm mb-2 text-[#9B2F6A]">Key Highlights</h3>
            <div className="space-y-1 text-xs">
              {selectedMember.topWork.map((work, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#9B2F6A]">•</span>
                  <span className="text-[#565658]">{work}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2">Work Type Breakdown</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(selectedMember.workTypes)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="border rounded p-2 text-center"
                    style={{
                      borderColor: getWorkTypeColor(type),
                      backgroundColor: `${getWorkTypeColor(type)}10`,
                    }}
                  >
                    <div className="text-lg font-bold" style={{ color: getWorkTypeColor(type) }}>
                      {count}
                    </div>
                    <div className="text-xs text-gray-700">{type}</div>
                  </div>
                ))}
            </div>
          </div>

          {selectedMember.initiatives && selectedMember.initiatives.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
                <span>Major Initiatives & Impact</span>
                <span className="text-xs font-normal text-gray-600">
                  {selectedMember.initiatives.length} initiative{selectedMember.initiatives.length !== 1 ? 's' : ''}
                </span>
              </h3>

              {/* Group initiatives by work type */}
              {(() => {
                const groupedInitiatives = selectedMember.initiatives.reduce((acc, initiative) => {
                  const type = initiative.type || 'Other';
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(initiative);
                  return acc;
                }, {} as Record<string, typeof selectedMember.initiatives>);

                // Define order and colors for categories
                const categoryOrder = ['Project', 'System Initiative', 'Policy', 'Epic Gold', 'Governance', 'General Support', 'Other'];
                const categoryColors: Record<string, string> = {
                  'Project': '#9C5C9D',
                  'System Initiative': '#00A1E0',
                  'Policy': '#6F47D0',
                  'Epic Gold': '#9B2F6A',
                  'Governance': '#6F47D0',
                  'General Support': '#F58025',
                  'Other': '#565658'
                };

                return categoryOrder.map((category) => {
                  const initiatives = groupedInitiatives[category];
                  if (!initiatives || initiatives.length === 0) return null;

                  return (
                    <div key={category} className="mb-4">
                      <div
                        className="flex items-center gap-2 mb-2 pb-1 border-b-2"
                        style={{ borderColor: categoryColors[category] }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColors[category] }}
                        ></div>
                        <h4
                          className="font-semibold text-sm"
                          style={{ color: categoryColors[category] }}
                        >
                          {category}
                        </h4>
                        <span className="text-xs text-gray-600">
                          ({initiatives.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {initiatives.map((initiative) => (
                          <InitiativeCard key={initiative.id} initiative={initiative} />
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Parse capacity_status to extract warning information
  const parseCapacityWarnings = (capacityStatus: string | null | undefined) => {
    if (!capacityStatus) return null;

    // Format: "⚠️ 2 Need Baseline Info, 4 Other Incomplete - 🟢 Under"
    // or: "🟢 Under" (no warnings)
    if (!capacityStatus.includes('⚠️')) return null;

    const warningPart = capacityStatus.split('-')[0].trim();
    const warnings: { count: number; type: string }[] = [];

    // Extract warning patterns like "2 Need Baseline Info" or "4 Other Incomplete"
    const warningMatches = warningPart.matchAll(/(\d+)\s+([^,⚠️]+)/g);
    for (const match of warningMatches) {
      warnings.push({
        count: parseInt(match[1]),
        type: match[2].trim()
      });
    }

    const totalWarnings = warnings.reduce((sum, w) => sum + w.count, 0);

    // If we found the warning emoji but couldn't parse any warnings, return null
    // This prevents showing an empty warning indicator
    if (warnings.length === 0) {
      console.warn('Found warning emoji but could not parse warnings for:', capacityStatus);
      return null;
    }

    return { totalWarnings, warnings };
  };

  const WorkloadView = () => {
    const [alertsExpanded, setAlertsExpanded] = useState(false);
    const [teamDashboardExpanded, setTeamDashboardExpanded] = useState(false);
    const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<TeamMemberWithDetails | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMemberWithDetails | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'hours' | 'quality'>('capacity');
    const [showDataQuality, setShowDataQuality] = useState(true);
    const [expandedWarnings, setExpandedWarnings] = useState<Set<string>>(new Set());
    const [cardMetricView, setCardMetricView] = useState<'capacity' | 'worktype' | 'effort' | 'quality'>('capacity');

    // Use dashboard_metrics data (pre-calculated from Excel Dashboard)
    // STOP CALCULATING - use ONLY the Excel Dashboard data!
    const teamWorkloads = teamMembers
      .filter(member => member.dashboard_metrics) // Only members with metrics
      .map(member => {
        const dm = member.dashboard_metrics!;

        // Parse capacity status from the status string (format: "⚠️ 2 Need Baseline Info - 🟢 Under")
        let capacityStatus: 'available' | 'at_capacity' | 'over_capacity' = 'available';
        if (dm.capacity_status) {
          if (dm.capacity_status.includes('🔴') || dm.capacity_status.includes('Over')) {
            capacityStatus = 'over_capacity';
          } else if (dm.capacity_status.includes('🟡') || dm.capacity_status.includes('At')) {
            capacityStatus = 'at_capacity';
          }
        }

        // Build work type breakdown from dashboard metrics
        const workTypeBreakdown: { [key: string]: { count: number; hours: number } } = {
          'Epic Gold': { count: dm.epic_gold_count || 0, hours: dm.epic_gold_hours || 0 },
          'Governance': { count: dm.governance_count || 0, hours: dm.governance_hours || 0 },
          'System Initiative': { count: dm.system_initiative_count || 0, hours: dm.system_initiative_hours || 0 },
          'System Projects': { count: dm.system_projects_count || 0, hours: dm.system_projects_hours || 0 },
          'Epic Upgrades': { count: dm.epic_upgrades_count || 0, hours: dm.epic_upgrades_hours || 0 },
          'General Support': { count: dm.general_support_count || 0, hours: dm.general_support_hours || 0 },
          'Policy': { count: dm.policy_count || 0, hours: dm.policy_hours || 0 },
          'Market': { count: dm.market_count || 0, hours: dm.market_hours || 0 },
          'Ticket': { count: dm.ticket_count || 0, hours: dm.ticket_hours || 0 },
        };

        // Calculate effort size breakdown from actual assignments
        const effortCounts = { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
        if (member.assignments) {
          for (const assignment of member.assignments) {
            if (assignment.work_effort) {
              const effort = assignment.work_effort.split(' ')[0]; // Extract "XS" from "XS - Less than 1 hr/wk"
              if (effort in effortCounts) {
                effortCounts[effort as keyof typeof effortCounts]++;
              }
            }
          }
        }

        // Create a workload object that mimics the old structure for compatibility
        const workload = {
          totalMin: dm.active_hours_per_week, // Use active hours as both min and max
          totalMax: dm.active_hours_per_week,
          totalAssignments: dm.total_assignments,
          XS: effortCounts.XS,
          S: effortCounts.S,
          M: effortCounts.M,
          L: effortCounts.L,
          XL: effortCounts.XL,
        };

        // Data quality is now based on capacity_status warnings
        const hasWarnings = dm.capacity_status && dm.capacity_status.includes('⚠️');
        const dataQuality = {
          hasWorkEffort: dm.active_assignments,
          missingWorkEffort: hasWarnings ? (dm.total_assignments - dm.active_assignments) : 0,
          completionRate: dm.total_assignments > 0 ? (dm.active_assignments / dm.total_assignments) : 1,
        };

        return {
          member,
          workload,
          capacityStatus,
          dataQuality,
          workTypeBreakdown,
        };
      });

    // Sort team members
    const sortedWorkloads = [...teamWorkloads].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.member.name.localeCompare(b.member.name);
        case 'capacity':
          // Sort by capacity utilization percentage (descending)
          return (b.member.dashboard_metrics?.capacity_utilization || 0) - (a.member.dashboard_metrics?.capacity_utilization || 0);
        case 'hours':
          // Sort by active hours per week (descending)
          return (b.member.dashboard_metrics?.active_hours_per_week || 0) - (a.member.dashboard_metrics?.active_hours_per_week || 0);
        case 'quality':
          return b.dataQuality.completionRate - a.dataQuality.completionRate;
        default:
          return 0;
      }
    });

    // Get capacity alerts (over capacity and at capacity)
    const alerts = teamWorkloads.filter(w =>
      w.capacityStatus === 'over_capacity' || w.capacityStatus === 'at_capacity'
    );

    const availableMembers = teamWorkloads.filter(w => w.capacityStatus === 'available');

    // Calculate team stats from dashboard_metrics
    const totalActiveHours = teamWorkloads.reduce((sum, w) => sum + (w.member.dashboard_metrics?.active_hours_per_week || 0), 0);
    const avgUtilization = teamWorkloads.reduce((sum, w) => sum + (w.member.dashboard_metrics?.capacity_utilization || 0), 0) / (teamWorkloads.length || 1);
    const overCapacity = teamWorkloads.filter(w => w.capacityStatus === 'over_capacity').length;
    const nearCapacity = teamWorkloads.filter(w => w.capacityStatus === 'at_capacity').length;
    const avgDataQuality = teamWorkloads.reduce((sum, w) => sum + w.dataQuality.completionRate, 0) / (teamWorkloads.length || 1);

    const getDataQualityColor = (rate: number) => {
      if (rate >= 0.9) return '#22C55E';
      if (rate >= 0.7) return '#F59E0B';
      return '#EF4444';
    };

    // Calculate team-wide effort distribution from individual workloads
    const teamEffortDistribution = teamWorkloads.reduce((acc, w) => {
      acc.XS += w.workload.XS;
      acc.S += w.workload.S;
      acc.M += w.workload.M;
      acc.L += w.workload.L;
      acc.XL += w.workload.XL;
      return acc;
    }, { XS: 0, S: 0, M: 0, L: 0, XL: 0 });

    // Calculate team-wide work type distribution by hours and counts
    const teamWorkTypeData = teamWorkloads.reduce((acc, w) => {
      Object.entries(w.workTypeBreakdown).forEach(([type, data]) => {
        if (!acc[type]) {
          acc[type] = { count: 0, hours: 0 };
        }
        acc[type].count += data.count;
        acc[type].hours += data.hours;
      });
      return acc;
    }, {} as { [key: string]: { count: number; hours: number } });

    // Calculate capacity distribution
    const capacityDistribution = {
      available: teamWorkloads.filter(w => w.capacityStatus === 'available').length,
      at_capacity: teamWorkloads.filter(w => w.capacityStatus === 'at_capacity').length,
      over_capacity: teamWorkloads.filter(w => w.capacityStatus === 'over_capacity').length,
    };

    return (
      <div className="space-y-3">
        {/* Compact Header with Team Stats */}
        <div className="bg-[#9B2F6A] rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Team Workload Analysis</h2>
              <p className="text-[10px] text-white/90">{teamMembers.length} SCIs • {totalActiveHours.toFixed(1)}h/week active</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{(avgUtilization * 100).toFixed(0)}%</div>
                <div className="text-[10px] text-white/90">Avg Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overCapacity + nearCapacity}</div>
                <div className="text-[10px] text-white/90">At/Over</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(avgDataQuality * 100).toFixed(0)}%</div>
                <div className="text-[10px] text-white/90">Data Quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-white border rounded-lg p-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded px-2 py-1 text-xs"
              >
                <option value="capacity">Capacity %</option>
                <option value="hours">Hours/Week</option>
                <option value="quality">Data Quality</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Card View:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCardMetricView('capacity')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    cardMetricView === 'capacity'
                      ? 'bg-[#9B2F6A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Capacity
                </button>
                <button
                  onClick={() => setCardMetricView('worktype')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    cardMetricView === 'worktype'
                      ? 'bg-[#9B2F6A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Work Type
                </button>
                <button
                  onClick={() => setCardMetricView('effort')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    cardMetricView === 'effort'
                      ? 'bg-[#9B2F6A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Effort Size
                </button>
                <button
                  onClick={() => setCardMetricView('quality')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    cardMetricView === 'quality'
                      ? 'bg-[#9B2F6A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Data Quality
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Team Grid */}
        <div className="grid grid-cols-5 gap-2">
          {sortedWorkloads.map(({ member, workload, capacityStatus, dataQuality, workTypeBreakdown }) => (
            <div
              key={member.id}
              onClick={() => setSelectedMemberForDetail(member)}
              className={`bg-white rounded-lg p-2 hover:shadow-lg transition-all cursor-pointer shadow-md ${
                cardMetricView === 'worktype' ? 'row-span-2' : ''
              }`}
            >
              {/* Name & Avatar */}
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: getCapacityColor(capacityStatus) }}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <div className="font-bold text-xs truncate">{member.name}</div>
                    {parseCapacityWarnings(member.dashboard_metrics?.capacity_status) && (
                      <div
                        className="flex-shrink-0 w-3 h-3 bg-amber-400 rounded-sm flex items-center justify-center text-white cursor-help"
                        title={`${parseCapacityWarnings(member.dashboard_metrics?.capacity_status)?.totalWarnings} assignments with missing data`}
                      >
                        <span className="text-[8px] font-bold">!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Metrics - Dynamic based on cardMetricView */}
              <div className="space-y-0.5 text-[10px] leading-tight">
                {cardMetricView === 'capacity' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity</span>
                      <span
                        className="font-bold"
                        style={{ color: getCapacityColor(capacityStatus) }}
                      >
                        {Math.round((member.dashboard_metrics?.capacity_utilization || 0) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours</span>
                      <span className="font-semibold">{workload.totalMax.toFixed(1)}h</span>
                    </div>
                  </>
                )}

                {cardMetricView === 'worktype' && (
                  <div className="space-y-0.5">
                    {Object.entries(workTypeBreakdown)
                      .filter(([_, data]) => data.count > 0)
                      .sort((a, b) => b[1].hours - a[1].hours)
                      .map(([type, data]) => (
                        <div key={type} className="flex justify-between items-center text-[10px] leading-tight">
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getWorkTypeColor(type) }}
                            />
                            <span className="text-gray-600 truncate">{type}</span>
                          </div>
                          <div className="flex gap-1.5 ml-1 flex-shrink-0">
                            <span className="font-bold" style={{ color: getWorkTypeColor(type) }}>
                              {data.count}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="font-semibold text-gray-700">
                              {data.hours.toFixed(1)}h
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {cardMetricView === 'effort' && (
                  <div className="space-y-0.5">
                    {Object.entries({ XS: workload.XS, S: workload.S, M: workload.M, L: workload.L, XL: workload.XL })
                      .filter(([_, count]) => count > 0)
                      .map(([size, count]) => (
                        <div key={size} className="flex justify-between">
                          <span className="text-gray-600">{size}</span>
                          <span className="font-bold text-[#9B2F6A]">{count}</span>
                        </div>
                      ))}
                    {Object.values({ XS: workload.XS, S: workload.S, M: workload.M, L: workload.L, XL: workload.XL }).every(v => v === 0) && (
                      <div className="text-center text-gray-500 py-1">No data</div>
                    )}
                  </div>
                )}

                {cardMetricView === 'quality' && (
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Complete</span>
                      <span className="font-bold text-green-600">{dataQuality.hasWorkEffort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Missing</span>
                      <span className="font-bold text-red-600">{dataQuality.missingWorkEffort}</span>
                    </div>
                    <div className="flex justify-between pt-0.5 border-t border-gray-200">
                      <span className="text-gray-600">Quality</span>
                      <span
                        className="font-bold"
                        style={{ color: getDataQualityColor(dataQuality.completionRate) }}
                      >
                        {(dataQuality.completionRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Missing Data Warning Details */}
              {(() => {
                const warningInfo = parseCapacityWarnings(member.dashboard_metrics?.capacity_status);
                if (!warningInfo) return null;

                const isExpanded = expandedWarnings.has(member.id);

                return (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedWarnings);
                        if (isExpanded) {
                          newExpanded.delete(member.id);
                        } else {
                          newExpanded.add(member.id);
                        }
                        setExpandedWarnings(newExpanded);
                      }}
                      className="w-full text-[10px] text-left text-amber-700 bg-amber-50 px-1.5 py-1 rounded hover:bg-amber-100 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">
                        ⚠️ {warningInfo.totalWarnings} missing
                      </span>
                      <span className="text-amber-600 flex-shrink-0 ml-1">{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-1 bg-white border border-amber-200 rounded p-1.5 space-y-0.5 text-[10px]">
                        {warningInfo.warnings.map((warning, idx) => (
                          <div key={idx} className="flex items-center justify-between py-0.5 border-b border-gray-100 last:border-0">
                            <span className="text-gray-700 truncate flex-1 pr-1">{warning.type}</span>
                            <span className="font-bold text-amber-600 flex-shrink-0">{warning.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>

        {/* Selected Member Detail */}
        {selectedMember && (() => {
          const memberWorkload = teamWorkloads.find(w => w.member.id === selectedMember.id);
          if (!memberWorkload) return null;

          return (
            <div className="bg-white border-2 border-[#F58025] rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold">{selectedMember.name}'s Workload Detail</h3>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Metrics */}
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-600">Hours/Week</div>
                    <div className="text-lg font-bold">{memberWorkload.workload.totalMax.toFixed(1)}h</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-600">Capacity</div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: getCapacityColor(memberWorkload.capacityStatus) }}
                    >
                      {Math.round((memberWorkload.member.dashboard_metrics?.capacity_utilization || 0) * 100)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-600">Data Quality</div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: getDataQualityColor(memberWorkload.dataQuality.completionRate) }}
                    >
                      {(memberWorkload.dataQuality.completionRate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Work Type Breakdown */}
                <div className="col-span-2">
                  <h4 className="font-semibold text-sm mb-2">Work Type Hours</h4>
                  <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                    {Object.entries(memberWorkload.workTypeBreakdown)
                      .sort((a, b) => b[1].hours - a[1].hours)
                      .filter(([_, data]) => data.count > 0)
                      .map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between p-1 bg-gray-50 rounded">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getWorkTypeColor(type) }}
                            />
                            <span className="font-medium truncate">{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{data.count}</span>
                            <span className="font-bold text-[#F58025]">{data.hours.toFixed(1)}h</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Data Quality Details */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Data Quality</h4>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Complete</span>
                      <span className="font-semibold text-green-600">{memberWorkload.dataQuality.hasWorkEffort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Incomplete</span>
                      <span className="font-semibold text-red-600">{memberWorkload.dataQuality.missingWorkEffort}</span>
                    </div>
                  </div>
                  {(() => {
                    const warningInfo = parseCapacityWarnings(memberWorkload.member.dashboard_metrics?.capacity_status);
                    if (!warningInfo) return null;

                    const isExpanded = expandedWarnings.has(memberWorkload.member.id);

                    return (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedWarnings);
                            if (isExpanded) {
                              newExpanded.delete(memberWorkload.member.id);
                            } else {
                              newExpanded.add(memberWorkload.member.id);
                            }
                            setExpandedWarnings(newExpanded);
                          }}
                          className="w-full text-xs text-left text-amber-700 bg-amber-50 p-2 rounded hover:bg-amber-100 transition-colors flex items-center justify-between"
                        >
                          <span>
                            ⚠️ {warningInfo.totalWarnings} missing data items
                          </span>
                          <span className="text-amber-600">{isExpanded ? '▲' : '▼'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-1 bg-white border border-amber-200 rounded p-2 space-y-1 text-xs">
                            {warningInfo.warnings.map((warning, idx) => (
                              <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                                <span className="text-gray-700">{warning.type}</span>
                                <span className="font-bold text-amber-600">{warning.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Capacity Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setAlertsExpanded(!alertsExpanded)}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Capacity Alerts</h3>
                  <p className="text-sm text-gray-600">{alerts.length} team member{alerts.length !== 1 ? 's' : ''} need attention</p>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-800 transition-colors">
                <span className="text-2xl">{alertsExpanded ? '−' : '+'}</span>
              </button>
            </div>

            {alertsExpanded && (
              <>
                <div className="space-y-2 mt-3">
                  {alerts.map(({ member, workload, capacityStatus }) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        backgroundColor: `${getCapacityColor(capacityStatus)}15`,
                        borderLeft: `4px solid ${getCapacityColor(capacityStatus)}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCapacityEmoji(capacityStatus)}</span>
                        <div>
                          <h4 className="font-bold text-gray-800">{member.name}</h4>
                          <p className="text-[10px] text-gray-600">
                            {workload.totalMin}-{workload.totalMax} hrs/week • {workload.totalAssignments} assignments
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: getCapacityColor(capacityStatus) }}>
                          {getCapacityLabel(capacityStatus)}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {Math.round((member.dashboard_metrics?.capacity_utilization || 0) * 100)}% capacity
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {availableMembers.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-[10px] text-green-800">
                      ℹ️ <span className="font-semibold">{availableMembers.length} SCI{availableMembers.length !== 1 ? 's' : ''} available</span> for new assignments
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Team Capacity Dashboard */}
        <div className="bg-white border rounded-lg p-4">
          <div
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setTeamDashboardExpanded(!teamDashboardExpanded)}
          >
            <h3 className="font-bold text-lg text-gray-800">Team Capacity Dashboard</h3>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              <span className="text-2xl">{teamDashboardExpanded ? '−' : '+'}</span>
            </button>
          </div>

          {teamDashboardExpanded && (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-sm text-gray-700">SCI</th>
                  <th className="text-center py-3 px-2 font-semibold text-sm text-gray-700">XS</th>
                  <th className="text-center py-3 px-2 font-semibold text-sm text-gray-700">S</th>
                  <th className="text-center py-3 px-2 font-semibold text-sm text-gray-700">M</th>
                  <th className="text-center py-3 px-2 font-semibold text-sm text-gray-700">L</th>
                  <th className="text-center py-3 px-2 font-semibold text-sm text-gray-700">XL</th>
                  <th className="text-right py-3 px-2 font-semibold text-sm text-gray-700">Est. Hours/Week</th>
                  <th className="text-center py-3 px-2 font-semibold text-sm text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {teamWorkloads.map(({ member, workload, capacityStatus }) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#9B2F6A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm text-gray-800">{member.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="inline-block min-w-[24px] text-sm font-medium text-gray-700">
                        {workload.XS || '-'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="inline-block min-w-[24px] text-sm font-medium text-gray-700">
                        {workload.S || '-'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="inline-block min-w-[24px] text-sm font-medium text-gray-700">
                        {workload.M || '-'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="inline-block min-w-[24px] text-sm font-medium text-gray-700">
                        {workload.L || '-'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="inline-block min-w-[24px] text-sm font-medium text-gray-700">
                        {workload.XL || '-'}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2">
                      <span className="font-bold text-sm text-gray-800">
                        {workload.totalMin}-{workload.totalMax} hrs
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getCapacityColor(capacityStatus)}20`,
                          color: getCapacityColor(capacityStatus)
                        }}
                      >
                        {getCapacityEmoji(capacityStatus)} {getCapacityLabel(capacityStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Management Insights Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Work Type by Hours */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Hours by Work Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={Object.entries(teamWorkTypeData)
                  .filter(([_, data]) => data.hours > 0)
                  .sort((a, b) => b[1].hours - a[1].hours)
                  .map(([type, data]) => ({
                    name: type,
                    hours: data.hours,
                    color: getWorkTypeColor(type)
                  }))}
                margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                  {Object.entries(teamWorkTypeData).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(teamWorkTypeData)[index] ? getWorkTypeColor(Object.keys(teamWorkTypeData)[index]) : '#565658'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Work Type by Count */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Assignments by Work Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={Object.entries(teamWorkTypeData)
                  .filter(([_, data]) => data.count > 0)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([type, data]) => ({
                    name: type,
                    count: data.count,
                    color: getWorkTypeColor(type)
                  }))}
                margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {Object.entries(teamWorkTypeData).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(teamWorkTypeData)[index] ? getWorkTypeColor(Object.keys(teamWorkTypeData)[index]) : '#565658'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Capacity Distribution */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Team Capacity Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Available', value: capacityDistribution.available, color: '#22C55E' },
                    { name: 'At Capacity', value: capacityDistribution.at_capacity, color: '#F59E0B' },
                    { name: 'Over Capacity', value: capacityDistribution.over_capacity, color: '#EF4444' },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {[capacityDistribution.available, capacityDistribution.at_capacity, capacityDistribution.over_capacity].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#22C55E', '#F59E0B', '#EF4444'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Effort Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Team Effort Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { effort: 'XS (<1hr)', count: teamEffortDistribution.XS, color: '#94A3B8' },
                  { effort: 'S (1-2hr)', count: teamEffortDistribution.S, color: '#60A5FA' },
                  { effort: 'M (2-5hr)', count: teamEffortDistribution.M, color: '#F59E0B' },
                  { effort: 'L (5-10hr)', count: teamEffortDistribution.L, color: '#EF4444' },
                  { effort: 'XL (10+hr)', count: teamEffortDistribution.XL, color: '#DC2626' },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="effort" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {[teamEffortDistribution.XS, teamEffortDistribution.S, teamEffortDistribution.M, teamEffortDistribution.L, teamEffortDistribution.XL].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#94A3B8', '#60A5FA', '#F59E0B', '#EF4444', '#DC2626'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Effort Size Reference</h3>
            <div className="space-y-3">
              {Object.entries(WORK_EFFORT_HOURS).map(([effort, details]) => (
                <div key={effort} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#9B2F6A] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {effort}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{details.label}</div>
                      <div className="text-xs text-gray-600">
                        Avg: {details.min}-{details.max} hrs/week
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#9B2F6A]">
                      {teamEffortDistribution[effort as keyof typeof teamEffortDistribution]}
                    </div>
                    <div className="text-xs text-gray-600">assignments</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Detail Modal */}
        {selectedMemberForDetail && (
          <StaffDetailModal
            member={{
              ...selectedMemberForDetail,
              capacity_warnings: selectedMemberForDetail.dashboard_metrics?.capacity_status || undefined
            }}
            onClose={() => setSelectedMemberForDetail(null)}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#9B2F6A]" />
          <p className="text-[#565658] font-medium">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#9B2F6A]">System Clinical Informatics</h1>
              <p className="text-xs text-[#565658] font-medium">CommonSpirit Health • Excellence & Innovation</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'overview'
                    ? 'bg-[#9B2F6A] text-white shadow-md'
                    : 'bg-gray-100 text-[#565658] hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('team')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'team'
                    ? 'bg-[#9B2F6A] text-white shadow-md'
                    : 'bg-gray-100 text-[#565658] hover:bg-gray-200'
                }`}
              >
                Team
              </button>
              <button
                onClick={() => {
                  setEditingInitiative(null);
                  setActiveView('initiatives');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                  activeView === 'initiatives'
                    ? 'bg-[#6F47D0] text-white shadow-md'
                    : 'bg-gray-100 text-[#565658] hover:bg-gray-200'
                }`}
              >
                <List size={16} />
                Initiatives
              </button>
              <button
                onClick={() => setActiveView('workload')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                  activeView === 'workload'
                    ? 'bg-[#F58025] text-white shadow-md'
                    : 'bg-gray-100 text-[#565658] hover:bg-gray-200'
                }`}
              >
                <TrendingUp size={16} />
                Workload
              </button>
              <button
                onClick={() => {
                  setEditingInitiative(null);
                  setActiveView('addData');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                  activeView === 'addData'
                    ? 'bg-[#00A1E0] text-white shadow-md'
                    : 'bg-[#00A1E0]/10 text-[#00A1E0] hover:bg-[#00A1E0]/20'
                }`}
              >
                <Plus size={16} />
                Add Data
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {activeView === 'overview' ? (
          <OverviewView />
        ) : activeView === 'team' ? (
          <TeamView />
        ) : activeView === 'initiatives' ? (
          <InitiativesView
            onCreateNew={() => {
              setEditingInitiative(null);
              setActiveView('addData');
            }}
            onEdit={(initiative) => {
              setEditingInitiative(initiative);
              setActiveView('addData');
            }}
          />
        ) : activeView === 'workload' ? (
          <WorkloadView />
        ) : (
          <InitiativeSubmissionForm
            editingInitiative={editingInitiative || undefined}
            onClose={() => {
              setEditingInitiative(null);
              setActiveView('initiatives');
            }}
            onSuccess={() => {
              fetchTeamData();
              setEditingInitiative(null);
              setActiveView('initiatives');
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
