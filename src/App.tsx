import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { DollarSign, Award, Loader2, Plus, List, TrendingUp, Search, Filter, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { supabase, TeamMember, Manager, WorkTypeSummary, EHRPlatformSummary, KeyHighlight, InitiativeWithDetails, Assignment, DashboardMetrics } from './lib/supabase';
import { InitiativeSubmissionForm } from './components/InitiativeSubmissionForm';
import { InitiativeCard } from './components/InitiativeCard';
import { InitiativesView } from './components/InitiativesView';
import { InitiativesTableView } from './components/InitiativesTableView';
import { InsightsChat } from './components/InsightsChat';
import PersonalWorkloadDashboard from './components/PersonalWorkloadDashboard';
import { GovernancePortalView } from './components/GovernancePortalView';
import { GovernanceRequestDetail } from './components/GovernanceRequestDetail';
import { GovernanceRequestForm } from './components/GovernanceRequestForm';
import { LandingPage } from './components/LandingPage';
import { WorkloadCalculatorSettings } from './components/WorkloadCalculatorSettings';
import { AdminTabContainer } from './components/AdminTabContainer';
import { calculateWorkload, getCapacityStatus, getCapacityColor, getCapacityEmoji, getCapacityLabel, WORK_EFFORT_HOURS, parseWorkEffort } from './lib/workloadUtils';
import { getTeamMemberWorkloadData } from './lib/workloadCalculator';
import StaffDetailModal from './components/StaffDetailModal';
import { LoadBalanceModal } from './components/LoadBalanceModal';
import { TeamCapacityCard } from './components/TeamCapacityCard';
import { TeamCapacityModal } from './components/TeamCapacityModal';
import TeamCapacityView from './components/TeamCapacityView';

interface TeamMemberWithDetails extends TeamMember {
  workTypes: { [key: string]: number };
  ehrs: { [key: string]: number };
  topWork: string[];
  initiatives: InitiativeWithDetails[];
  assignments: Assignment[];
  dashboard_metrics?: DashboardMetrics;
  // DELETED: calculatedCapacity, capacityUtilization, incompleteCount, activeInitiativeCount
  // Will use getTeamMemberWorkloadData() from workloadCalculator instead
}

function App() {
  // Get initial view from URL hash or default to 'landing'
  const getInitialView = (): 'landing' | 'dashboard' | 'workload' | 'governance' | 'insights' | 'addData' => {
    const hash = window.location.hash.slice(1); // Remove the '#'
    // Support legacy 'overview' and 'team' hashes by mapping to 'dashboard'
    if (hash === 'overview' || hash === 'team') {
      return 'dashboard';
    }
    // Map legacy 'myEffort' to 'workload' view
    if (hash === 'myEffort') {
      return 'workload';
    }
    // Handle workload sub-paths (e.g., workload/admin, workload/team)
    if (hash.startsWith('workload/')) {
      return 'workload';
    }
    if (['landing', 'dashboard', 'workload', 'governance', 'insights', 'addData'].includes(hash)) {
      return hash as 'landing' | 'dashboard' | 'workload' | 'governance' | 'insights' | 'addData';
    }
    return 'landing';
  };

  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'workload' | 'governance' | 'insights' | 'addData'>(getInitialView());
  const [dashboardSubView, setDashboardSubView] = useState<'overview' | 'team'>('overview'); // Toggle between overview and team
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithDetails | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithDetails[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInitiative, setEditingInitiative] = useState<InitiativeWithDetails | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMemberWithDetails | null>(null); // For effort tracking
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null); // For viewing specific initiative

  // Governance portal state
  const [selectedGovernanceRequest, setSelectedGovernanceRequest] = useState<any>(null);
  const [showGovernanceForm, setShowGovernanceForm] = useState(false);
  const [editingGovernanceRequest, setEditingGovernanceRequest] = useState<any>(null);
  const [governanceRefreshKey, setGovernanceRefreshKey] = useState(0);

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

  // Refresh data when navigating to dashboard view
  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchTeamData();
    }
  }, [activeView]);

  const fetchTeamData = async () => {
    try {
      console.log('🔄 [fetchTeamData] Starting data refresh...');
      setLoading(true);

      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true });

      if (membersError) throw membersError;

      // Debug: Check if specialty data is being fetched
      console.log('[App] Fetched team_members count:', members?.length);
      if (members && members.length > 0) {
        console.log('[App] Sample member specialty:', members[0].name, '→', members[0].specialty);
      }

      const { data: managersData, error: managersError } = await supabase
        .from('managers')
        .select('*')
        .eq('is_active', true)
        .order('last_name', { ascending: true });

      if (managersError) throw managersError;
      setManagers(managersData || []);

      // REMOVED: work_type_summary, ehr_platform_summary, key_highlights queries
      // These tables contain stale pre-aggregated data from before migration
      // Now calculating these in real-time from initiatives table instead

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

      // Load calculator config for capacity calculations
      const { data: calculatorConfig, error: configError } = await supabase
        .from('workload_calculator_config')
        .select('*');

      if (configError) {
        console.warn('Calculator config not available:', configError);
      }

      // Build lookup maps from calculator config
      const effortSizes: Record<string, number> = {};
      const roleWeights: Record<string, number> = {};
      const typeWeights: Record<string, number> = {};
      const phaseWeights: Record<string, number> = {};

      (calculatorConfig || []).forEach(c => {
        const value = parseFloat(c.value);
        if (c.config_type === 'effort_size') effortSizes[c.key] = value;
        if (c.config_type === 'role_weight') roleWeights[c.key] = value;
        if (c.config_type === 'work_type_weight') typeWeights[c.key] = value;
        if (c.config_type === 'phase_weight') phaseWeights[c.key] = value;
      });

      const initiativesWithDetails: InitiativeWithDetails[] = (initiatives || []).map((initiative) => ({
        ...initiative,
        metrics: (metrics || []).filter((m) => m.initiative_id === initiative.id),
        financial_impact: (financialImpact || []).find((f) => f.initiative_id === initiative.id),
        performance_data: (performanceData || []).find((p) => p.initiative_id === initiative.id),
        projections: (projections || []).find((p) => p.initiative_id === initiative.id),
        story: (stories || []).find((s) => s.initiative_id === initiative.id),
      }));

      const membersWithDetails: TeamMemberWithDetails[] = (members || []).map((member) => {
        // Get initiatives for this member (filter out deleted)
        const memberInitiatives = initiativesWithDetails.filter(
          (i) => (i.team_member_id === member.id || i.owner_name === member.name) && i.status !== 'Deleted'
        );

        const memberAssignments = (assignments || []).filter(
          (a) => a.team_member_id === member.id
        );

        // Get dashboard metrics for this member
        const memberDashboardMetrics = (dashboardMetrics || []).find(
          (dm: any) => dm.team_member_id === member.id
        );

        // Calculate work types from initiatives in REAL-TIME (not from stale summary table)
        const memberWorkTypes = memberInitiatives.reduce((acc, initiative) => {
          const type = initiative.type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        // Calculate EHR summaries from initiatives in REAL-TIME (not from stale summary table)
        const memberEHRs = memberInitiatives.reduce((acc, initiative) => {
          const ehr = initiative.ehrs_impacted;
          if (ehr && ehr !== 'All') {
            acc[ehr] = (acc[ehr] || 0) + 1;
          } else if (ehr === 'All') {
            // Count "All" towards each EHR platform
            ['Epic', 'Cerner', 'Altera'].forEach(platform => {
              acc[platform] = (acc[platform] || 0) + 1;
            });
          }
          return acc;
        }, {} as { [key: string]: number });

        // Calculate key highlights dynamically from initiatives (not from stale table)
        const memberHighlights: string[] = [];

        // Count Epic Gold initiatives
        const epicGoldCount = memberInitiatives.filter(i => i.type === 'Epic Gold').length;
        if (epicGoldCount > 0) {
          memberHighlights.push(`${epicGoldCount} Epic Gold ${epicGoldCount === 1 ? 'CAT' : 'CATs'}`);
        }

        // Count Governance initiatives
        const governanceCount = memberInitiatives.filter(i => i.type === 'Governance').length;
        if (governanceCount > 0) {
          memberHighlights.push(`${governanceCount} Governance ${governanceCount === 1 ? 'body' : 'bodies'}`);
        }

        // Find top revenue initiative
        const topRevenueInitiative = memberInitiatives
          .filter(i => i.financial_impact?.projected_annual || i.financial_impact?.actual_revenue)
          .sort((a, b) => {
            const aRev = (a.financial_impact?.actual_revenue || a.financial_impact?.projected_annual || 0);
            const bRev = (b.financial_impact?.actual_revenue || b.financial_impact?.projected_annual || 0);
            return bRev - aRev;
          })[0];

        if (topRevenueInitiative) {
          const revenue = topRevenueInitiative.financial_impact?.actual_revenue || topRevenueInitiative.financial_impact?.projected_annual || 0;
          const formatCurrency = (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            else if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return `${value.toFixed(0)}`;
          };
          memberHighlights.push(`${topRevenueInitiative.initiative_name}: ${formatCurrency(revenue)}`);
        }

        // DELETED ALL CAPACITY CALCULATION - will use workloadCalculator instead
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

      // Debug: Check if specialty survived the transformation
      const ashleyWithDetails = membersWithDetails.find(m => m.name === 'Ashley Daily');
      if (ashleyWithDetails) {
        console.log('[App] Ashley in membersWithDetails - specialty:', ashleyWithDetails.specialty);
      }

      // Set Marty as default current user for demo (in production, use actual auth)
      const marty = membersWithDetails.find(m => m.name === 'Marty');
      if (marty) {
        setCurrentUser(marty);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Epic Gold': '#9B2F6A',
      'Governance': '#6F47D0',
      'System Initiative': '#00A1E0',
      'System Project': '#00A1E0',
      'Epic Upgrades': '#00A1E0',
      'General Support': '#F58025',
      'Policy/Guidelines': '#6F47D0',
      'Market Project': '#9C5C9D',
      'Ticket': '#F58025',
      'Uncategorized': '#565658',
    };
    return colors[type] || '#565658';
  };

  // Calculate dynamic overview metrics
  const calculateOverviewMetrics = () => {
    const totalAssignments = teamMembers.reduce((sum, member) => sum + member.total_assignments, 0);

    // Get all initiatives with details (excluding deleted)
    const allInitiatives = teamMembers.flatMap(member => member.initiatives || [])
      .filter(i => i.status !== 'Deleted');
    const activeInitiatives = allInitiatives.filter(i =>
      i.status === 'Active' || i.status === 'Planning' || i.status === 'Scaling' ||
      i.status === 'Not Started' || i.status === 'In Progress'
    );
    const completedInitiatives = allInitiatives.filter(i => i.status === 'Completed');

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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterOwner, setFilterOwner] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterEHR, setFilterEHR] = useState('');
    const [filterServiceLine, setFilterServiceLine] = useState('');
    const [filterGovernance, setFilterGovernance] = useState<'all' | 'governance' | 'non-governance'>('all');
    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
    const [selectedInitiative, setSelectedInitiative] = useState<InitiativeWithDetails | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedCard, setExpandedCard] = useState<'active' | 'completed' | 'ehr' | 'serviceline' | null>(null);

    // Format currency
    const formatCurrency = (value: number) => {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    };

    // Format large numbers
    const formatNumber = (value: number) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
    };

    // Get all initiatives for filtering (excluding deleted)
    const allInitiatives = teamMembers.flatMap(member => member.initiatives || [])
      .filter(i => i.status !== 'Deleted');

    // Filter initiatives based on search and filters
    const filteredInitiatives = useMemo(() => {
      return allInitiatives.filter((initiative) => {
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'active' && (
            initiative.status === 'Active' || initiative.status === 'Planning' || initiative.status === 'Scaling' ||
            initiative.status === 'Not Started' || initiative.status === 'In Progress'
          )) ||
          (activeTab === 'completed' && initiative.status === 'Completed');

        const matchesSearch = !searchQuery ||
          initiative.initiative_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          initiative.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (initiative.service_line && initiative.service_line.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesOwner = !filterOwner || initiative.owner_name === filterOwner;
        const matchesType = !filterType || initiative.type === filterType;
        const matchesStatus = !filterStatus || initiative.status === filterStatus;
        const matchesEHR = !filterEHR || initiative.ehrs_impacted === filterEHR || initiative.ehrs_impacted === 'All';
        const matchesServiceLine = !filterServiceLine || initiative.service_line === filterServiceLine;

        const matchesGovernance =
          filterGovernance === 'all' ||
          (filterGovernance === 'governance' && initiative.governance_request_id) ||
          (filterGovernance === 'non-governance' && !initiative.governance_request_id);

        return matchesTab && matchesSearch && matchesOwner && matchesType && matchesStatus && matchesEHR && matchesServiceLine && matchesGovernance;
      });
    }, [allInitiatives, activeTab, searchQuery, filterOwner, filterType, filterStatus, filterEHR, filterServiceLine, filterGovernance]);

    // Get unique values for filters
    const uniqueOwners = useMemo(() => [...new Set(allInitiatives.map(i => i.owner_name))].sort(), [allInitiatives]);
    const uniqueTypes = useMemo(() => [...new Set(allInitiatives.map(i => i.type))].sort(), [allInitiatives]);
    const uniqueStatuses = useMemo(() => [...new Set(allInitiatives.map(i => i.status))].sort(), [allInitiatives]);
    const uniqueEHRs = useMemo(() => [...new Set(allInitiatives.map(i => i.ehrs_impacted).filter(Boolean))].sort(), [allInitiatives]);
    const uniqueServiceLines = useMemo(() => [...new Set(allInitiatives.map(i => i.service_line).filter(Boolean))].sort(), [allInitiatives]);

    // Calculate aggregate impact metrics from real data
    const impactMetrics = useMemo(() => {
      const totalRevenue = allInitiatives.reduce((sum, i) => sum + (i.financial_impact?.projected_annual || 0), 0);
      const totalActualRevenue = allInitiatives.reduce((sum, i) => sum + (i.financial_impact?.actual_revenue || 0), 0);
      const totalUsersDeployed = allInitiatives.reduce((sum, i) => sum + (i.performance_data?.users_deployed || 0), 0);
      const totalPotentialUsers = allInitiatives.reduce((sum, i) => sum + (i.performance_data?.total_potential_users || 0), 0);

      return { totalRevenue, totalActualRevenue, totalUsersDeployed, totalPotentialUsers };
    }, [allInitiatives]);

    const hasActiveFilters = filterOwner || filterStatus || filterType || filterEHR || filterServiceLine || filterGovernance !== 'all' || searchQuery;

    const clearFilters = () => {
      setFilterOwner('');
      setFilterStatus('');
      setFilterType('');
      setFilterEHR('');
      setFilterServiceLine('');
      setFilterGovernance('all');
      setSearchQuery('');
    };

    return (
      <div className="space-y-2">
        {/* Hero Banner */}
        <div className="bg-[#9B2F6A] rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="inline-block bg-white/10 px-2 py-0.5 rounded-full mb-1">
                <span className="text-[10px] font-semibold tracking-wide">CommonSpirit Health</span>
              </div>
              <p className="text-white/90 text-[10px] font-medium">
                {teamMembers.length} Team Members • {metrics.totalAssignments} Active Assignments • {metrics.totalInitiatives} Initiatives
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-0.5">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="text-[10px] text-white/90 font-medium">Total Revenue Impact</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setExpandedCard(expandedCard === 'active' ? null : 'active')}
              className="bg-white/15 rounded-lg p-2 border border-white/20 hover:bg-white/25 transition-all cursor-pointer text-left"
            >
              <div className="text-xl font-bold">{metrics.activeInitiatives}</div>
              <div className="text-[10px] text-white/90 font-medium mt-0.5">Active Initiatives</div>
            </button>
            <button
              onClick={() => setExpandedCard(expandedCard === 'completed' ? null : 'completed')}
              className="bg-white/15 rounded-lg p-2 border border-white/20 hover:bg-white/25 transition-all cursor-pointer text-left"
            >
              <div className="text-xl font-bold">{metrics.completedInitiatives}</div>
              <div className="text-[10px] text-white/90 font-medium mt-0.5">Completed Projects</div>
            </button>
            <button
              onClick={() => setExpandedCard(expandedCard === 'actual-revenue' ? null : 'actual-revenue')}
              className="bg-white/15 rounded-lg p-2 border border-white/20 hover:bg-white/25 transition-all cursor-pointer text-left"
            >
              <div className="text-xl font-bold">{formatCurrency(impactMetrics.totalActualRevenue)}</div>
              <div className="text-[10px] text-white/90 font-medium mt-0.5">Actual Revenue</div>
            </button>
            <button
              onClick={() => setExpandedCard(expandedCard === 'projected-revenue' ? null : 'projected-revenue')}
              className="bg-white/15 rounded-lg p-2 border border-white/20 hover:bg-white/25 transition-all cursor-pointer text-left"
            >
              <div className="text-xl font-bold">{formatCurrency(impactMetrics.totalRevenue)}</div>
              <div className="text-[10px] text-white/90 font-medium mt-0.5">Projected Revenue</div>
            </button>
          </div>
        </div>

        {/* Expanded Card Details */}
        {expandedCard === 'active' && (
          <div className="bg-white border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2 text-gray-800">Active Initiatives by Work Type</h3>
            <div className="space-y-1">
              {Object.entries(
                metrics.allActiveInitiatives.reduce((acc, initiative) => {
                  const type = initiative.type || 'Other';
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getWorkTypeColor(type) }}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{type}</span>
                      <span className="text-sm font-bold" style={{ color: getWorkTypeColor(type) }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {expandedCard === 'completed' && (
          <div className="bg-white border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2 text-gray-800">Completed Initiatives by Work Type</h3>
            <div className="space-y-1">
              {Object.entries(
                allInitiatives
                  .filter(i => i.status === 'Completed')
                  .reduce((acc, initiative) => {
                    const type = initiative.type || 'Other';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getWorkTypeColor(type) }}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{type}</span>
                      <span className="text-sm font-bold" style={{ color: getWorkTypeColor(type) }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {expandedCard === 'actual-revenue' && (
          <div className="bg-white border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2 text-gray-800">Actual Revenue by Initiative</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {allInitiatives
                .filter(i => i.financial_impact?.actual_revenue && i.financial_impact.actual_revenue > 0)
                .sort((a, b) => (b.financial_impact?.actual_revenue || 0) - (a.financial_impact?.actual_revenue || 0))
                .map((initiative) => (
                  <div key={initiative.id} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 flex-1">{initiative.initiative_name}</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(initiative.financial_impact?.actual_revenue || 0)}
                    </span>
                  </div>
                ))}
              {allInitiatives.filter(i => i.financial_impact?.actual_revenue && i.financial_impact.actual_revenue > 0).length === 0 && (
                <div className="text-sm text-gray-500 py-2">No initiatives with actual revenue recorded</div>
              )}
            </div>
          </div>
        )}

        {expandedCard === 'projected-revenue' && (
          <div className="bg-white border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2 text-gray-800">Projected Revenue by Initiative</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {allInitiatives
                .filter(i => i.financial_impact?.projected_annual && i.financial_impact.projected_annual > 0)
                .sort((a, b) => (b.financial_impact?.projected_annual || 0) - (a.financial_impact?.projected_annual || 0))
                .map((initiative) => (
                  <div key={initiative.id} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 flex-1">{initiative.initiative_name}</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrency(initiative.financial_impact?.projected_annual || 0)}
                    </span>
                  </div>
                ))}
              {allInitiatives.filter(i => i.financial_impact?.projected_annual && i.financial_impact.projected_annual > 0).length === 0 && (
                <div className="text-sm text-gray-500 py-2">No initiatives with projected revenue recorded</div>
              )}
            </div>
          </div>
        )}


        {/* Top Performing Initiatives - 2 Rows */}
        <div className="bg-white border rounded-lg p-3">
          <h3 className="font-semibold text-sm mb-3 text-gray-800">Top Performing Initiatives</h3>
          <div className="grid grid-cols-4 gap-3">
            {/* Get top initiatives by different metrics */}
            {(() => {
              // Get ALL initiatives (both active and completed) from all team members, excluding deleted
              const allInits = teamMembers.flatMap(member => member.initiatives || [])
                .filter(i => i.status !== 'Deleted');

              // Sort by different criteria and take unique initiatives
              const byRevenue = [...allInits]
                .filter(i => i.financial_impact?.projected_annual || i.financial_impact?.actual_revenue)
                .sort((a, b) => {
                  const aVal = (b.financial_impact?.projected_annual || b.financial_impact?.actual_revenue || 0);
                  const bVal = (a.financial_impact?.projected_annual || a.financial_impact?.actual_revenue || 0);
                  return aVal - bVal;
                });

              const byUsers = [...allInits]
                .filter(i => i.performance_data?.users_deployed)
                .sort((a, b) => (b.performance_data?.users_deployed || 0) - (a.performance_data?.users_deployed || 0));

              // Combine and deduplicate (max 8 initiatives, 2 rows of 4)
              const seen = new Set();
              const topInitiatives = [];

              for (const init of [...byRevenue, ...byUsers]) {
                if (!seen.has(init.id) && topInitiatives.length < 8) {
                  seen.add(init.id);
                  topInitiatives.push(init);
                }
              }

              return topInitiatives.map((initiative) => {
                const revenue = initiative.financial_impact?.projected_annual || initiative.financial_impact?.actual_revenue;
                const users = initiative.performance_data?.users_deployed;
                const actual = initiative.financial_impact?.actual_revenue;

                // Determine primary metric to highlight
                let metricLabel = '';
                let metricValue = '';
                let metricColor = '';

                if (revenue && revenue > 0) {
                  metricLabel = actual ? 'Actual Revenue' : 'Revenue Impact';
                  // Show in thousands (K) if under $1M, otherwise millions (M)
                  if ((actual || revenue) < 1000000) {
                    metricValue = '$' + Math.round((actual || revenue) / 1000) + 'K';
                  } else {
                    metricValue = formatCurrency(actual || revenue);
                  }
                  metricColor = 'text-green-600';
                } else if (users && users > 0) {
                  metricLabel = 'Users Deployed';
                  metricValue = formatNumber(users);
                  metricColor = 'text-purple-600';
                }

                return (
                  <div
                    key={initiative.id}
                    className="border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer"
                    style={{ borderColor: getWorkTypeColor(initiative.type) }}
                    onClick={() => setSelectedInitiative(initiative)}
                  >
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getWorkTypeColor(initiative.type) }}
                      />
                      <span className="text-[10px] text-gray-600">{initiative.type}</span>
                      {initiative.ehrs_impacted && (
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                          {initiative.ehrs_impacted}
                        </span>
                      )}
                      {initiative.status === 'Completed' && (
                        <span className="ml-auto text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-xs mb-1.5 text-gray-800 line-clamp-2 min-h-[2.5rem]">
                      {initiative.initiative_name}
                    </h4>
                    <div className="space-y-1 text-[10px]">
                      {metricLabel && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{metricLabel}</span>
                          <span className={`font-bold ${metricColor}`}>{metricValue}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner</span>
                        <span className="font-medium text-gray-700 truncate ml-1">{initiative.owner_name}</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Organization-Wide Productivity Metrics */}
        {(() => {
          // Active statuses for capacity metrics
          const activeStatuses = ['Active', 'In Progress', 'Not Started', 'Planning', 'Scaling'];

          // Get all active initiatives from all team members
          const orgActiveInitiatives = teamMembers.flatMap(member =>
            (member.initiatives || []).filter(i => activeStatuses.includes(i.status || ''))
          );

          // For Status Health, include ALL initiatives (except Deleted) for visibility
          const orgAllInitiatives = teamMembers.flatMap(member =>
            (member.initiatives || []).filter(i => i.status !== 'Deleted')
          );

          // Calculate Work Type Distribution
          const workTypeData = orgActiveInitiatives.reduce((acc, init) => {
            const type = init.type || 'Other';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const workTypePieData = Object.entries(workTypeData).map(([name, value]) => ({
            name,
            value,
          }));

          // Calculate Work Effort Distribution
          const effortData = orgActiveInitiatives.reduce((acc, init) => {
            const effort = init.work_effort || 'Unknown';
            acc[effort] = (acc[effort] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const effortBarData = Object.entries(effortData).map(([effort, count]) => ({
            effort,
            count,
          }));

          // Calculate Phase Distribution
          const phaseData = orgActiveInitiatives.reduce((acc, init) => {
            const phase = init.phase || 'Unknown';
            acc[phase] = (acc[phase] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const phaseBarData = Object.entries(phaseData).map(([phase, count]) => ({
            phase,
            count,
          }));

          // Calculate Role Breakdown
          const roleData = orgActiveInitiatives.reduce((acc, init) => {
            const role = init.role || 'Unknown';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const rolePieData = Object.entries(roleData).map(([name, value]) => ({
            name,
            value,
          }));

          // Calculate Status Health (all statuses)
          const statusCounts = orgAllInitiatives.reduce((acc, init) => {
            const status = init.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Calculate Service Line Coverage (Top 8)
          const serviceLineData = orgActiveInitiatives.reduce((acc, init) => {
            const serviceLine = init.service_line || 'Unknown';
            acc[serviceLine] = (acc[serviceLine] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const serviceLineBarData = Object.entries(serviceLineData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([serviceLine, count]) => ({
              serviceLine: serviceLine.length > 20 ? serviceLine.substring(0, 20) + '...' : serviceLine,
              count,
            }));

          // Color schemes (consistent with TeamCapacityView)
          const WORK_TYPE_COLORS: Record<string, string> = {
            'Project': '#9C5C9D',
            'System Initiative': '#00A1E0',
            'Policy': '#6F47D0',
            'Epic Gold': '#9B2F6A',
            'Governance': '#6F47D0',
            'General Support': '#F58025',
            'Other': '#565658',
          };

          const ROLE_COLORS: Record<string, string> = {
            'Owner': '#9B2F6A',
            'Primary': '#00A1E0',
            'Co-Owner': '#6F47D0',
            'Secondary': '#F58025',
            'Support': '#565658',
            'Unknown': '#D1D5DB',
          };

          return (
            <div className="bg-white border rounded-lg p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization-Wide Productivity Analytics</h3>

              {/* 3-Column Grid of Metrics */}
              <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                {/* Row 1, Col 1: Work Type Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Work Type Distribution</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={workTypePieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => `${entry.value}`}
                      >
                        {workTypePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={WORK_TYPE_COLORS[entry.name] || '#999'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {workTypePieData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: WORK_TYPE_COLORS[entry.name] || '#999' }}></div>
                        <span className="text-gray-700">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 1, Col 2: Work Effort Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Work Effort Distribution</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={effortBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="effort" type="category" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00A1E0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Row 1, Col 3: Phase Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Phase Distribution</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={phaseBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="phase" type="category" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9B2F6A" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Row 2, Col 1: Role Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Role Breakdown</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={rolePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => `${entry.value}`}
                      >
                        {rolePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name] || '#999'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {rolePieData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: ROLE_COLORS[entry.name] || '#999' }}></div>
                        <span className="text-gray-700">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2, Col 2: Status Health */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Status Health</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="bg-white rounded p-2 text-center border border-gray-200">
                        <div className="text-2xl font-bold text-[#9B2F6A]">{count}</div>
                        <div className="text-xs text-gray-600 truncate" title={status}>{status}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2, Col 3: Service Line Coverage */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Service Line Coverage (Top 8)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={serviceLineBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="serviceLine" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#F58025" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Initiative Search & Browse */}
        <div className="bg-white border rounded-lg p-3">
          <h3 className="font-semibold text-sm mb-3 text-gray-800">Browse Initiatives</h3>

          {/* Tabs */}
          <div className="flex gap-2 mb-3 border-b">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'active'
                  ? 'text-[#9B2F6A] border-b-2 border-[#9B2F6A]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'active' ? 'bg-[#9B2F6A] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {metrics.activeInitiatives}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'text-[#9B2F6A] border-b-2 border-[#9B2F6A]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'completed' ? 'bg-[#9B2F6A] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {metrics.completedInitiatives}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'text-[#9B2F6A] border-b-2 border-[#9B2F6A]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'all' ? 'bg-[#9B2F6A] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {metrics.totalInitiatives}
              </span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search initiatives by name, owner, or service line..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-[#9B2F6A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && !showFilters && (
                  <span className="bg-white text-[#9B2F6A] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {[filterOwner, filterStatus, filterType, filterEHR, filterServiceLine, filterGovernance !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="border rounded-lg p-2 bg-gray-50">
                {/* Governance Quick Filters */}
                <div className="flex gap-2 mb-2 pb-2 border-b">
                  <button
                    onClick={() => setFilterGovernance('all')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      filterGovernance === 'all'
                        ? 'bg-[#9B2F6A] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                    }`}
                  >
                    All Initiatives
                  </button>
                  <button
                    onClick={() => setFilterGovernance('governance')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                      filterGovernance === 'governance'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    From SCI Requests
                  </button>
                  <button
                    onClick={() => setFilterGovernance('non-governance')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      filterGovernance === 'non-governance'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                    }`}
                  >
                    Standard Initiatives
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <select
                    className="border rounded px-2 py-1.5 text-xs"
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                  >
                    <option value="">All Owners</option>
                    {uniqueOwners.map((owner) => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1.5 text-xs"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1.5 text-xs"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1.5 text-xs"
                    value={filterEHR}
                    onChange={(e) => setFilterEHR(e.target.value)}
                  >
                    <option value="">All EHRs</option>
                    {uniqueEHRs.map((ehr) => (
                      <option key={ehr} value={ehr}>{ehr}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1.5 text-xs"
                    value={filterServiceLine}
                    onChange={(e) => setFilterServiceLine(e.target.value)}
                  >
                    <option value="">All Service Lines</option>
                    {uniqueServiceLines.map((sl) => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-[#9B2F6A] hover:bg-white rounded transition-all"
                  >
                    <X className="w-3 h-3" />
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Initiative Table View */}
          {filteredInitiatives.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No initiatives found</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-[#9B2F6A] hover:underline">
                  Clear filters to see all initiatives
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="text-xs text-gray-600 mb-2">
                Showing {filteredInitiatives.length} of {allInitiatives.length} initiatives
              </div>
              <InitiativesTableView
                initiatives={filteredInitiatives}
                expandAll={hasActiveFilters}
              />
            </>
          )}
        </div>

      </div>
    );
  };

  const TeamView = () => {
    // Format currency helper
    const formatCurrency = (value: number) => {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    };

    // Calculate team-wide metrics
    const teamMetrics = useMemo(() => {
      const totalInitiatives = teamMembers.reduce((sum, tm) =>
        sum + ((tm.initiatives || []).filter(i => i.status !== 'Deleted').length), 0);

      const totalRevenue = teamMembers.reduce((sum, tm) =>
        sum + (tm.initiatives || [])
          .filter(i => i.status !== 'Deleted')
          .reduce((rev, i) => rev + ((i.financial_impact?.projected_annual || 0)), 0), 0);

      const avgCapacity = teamMembers.length > 0
        ? teamMembers.reduce((sum, tm) => sum + ((tm.dashboard_metrics?.capacity_utilization || 0)), 0) / teamMembers.length
        : 0;

      return { totalInitiatives, totalRevenue, avgCapacity };
    }, [teamMembers]);

    return (
      <div className="space-y-4">
        {/* Capacity Cards Grid - 5 per row, 200px wide */}
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
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
                <span className="text-gray-600">Initiatives</span>
                <span className="font-semibold">
                  {(member.initiatives || []).filter(i => i.status !== 'Deleted').length}
                </span>
              </div>
              {(() => {
                // Calculate total revenue dynamically from member's initiatives
                const totalRevenue = (member.initiatives || [])
                  .filter(i => i.status !== 'Deleted')
                  .reduce((sum, i) => sum + (i.financial_impact?.projected_annual || 0), 0);

                const formatCurrency = (value: number) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value.toFixed(0)}`;
                };

                if (totalRevenue === 0) return null;

                return (
                  <div className="flex justify-between mt-0.5">
                    <span className="text-gray-600">Impact</span>
                    <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
                  </div>
                );
              })()}
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
              {(() => {
                try {
                  const highlights: string[] = [];
                  const initiatives = selectedMember?.initiatives || [];

                  console.log('Key Highlights Debug:', {
                    memberName: selectedMember?.name,
                    initiativesCount: initiatives.length,
                    initiatives: initiatives.map(i => ({ name: i?.initiative_name, type: i?.type, status: i?.status, financial: i?.financial_impact }))
                  });

                  // Count Epic Gold initiatives
                  const epicGoldCount = initiatives.filter(i => i?.type === 'Epic Gold' && i?.status !== 'Deleted').length;
                  if (epicGoldCount > 0) {
                    highlights.push(`${epicGoldCount} Epic Gold ${epicGoldCount === 1 ? 'CAT' : 'CATs'}`);
                  }

                  // Count Governance initiatives
                  const governanceCount = initiatives.filter(i => i?.type === 'Governance' && i?.status !== 'Deleted').length;
                  if (governanceCount > 0) {
                    highlights.push(`${governanceCount} Governance ${governanceCount === 1 ? 'body' : 'bodies'}`);
                  }

                  // Find top revenue initiative
                  const topRevenueInitiative = initiatives
                    .filter(i => i?.financial_impact?.projected_annual || i?.financial_impact?.actual_revenue)
                    .sort((a, b) => {
                      const aRev = (a?.financial_impact?.actual_revenue || a?.financial_impact?.projected_annual || 0);
                      const bRev = (b?.financial_impact?.actual_revenue || b?.financial_impact?.projected_annual || 0);
                      return bRev - aRev;
                    })[0];

                  if (topRevenueInitiative) {
                    const revenue = topRevenueInitiative?.financial_impact?.actual_revenue || topRevenueInitiative?.financial_impact?.projected_annual || 0;
                    highlights.push(`${topRevenueInitiative?.initiative_name}: ${formatCurrency(revenue)}`);
                  }

                  // If no dynamic highlights, show a default message
                  if (highlights.length === 0) {
                    highlights.push('No key initiatives yet');
                  }

                  return highlights.map((work, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#9B2F6A]">•</span>
                      <span className="text-[#565658]">{work}</span>
                    </div>
                  ));
                } catch (error) {
                  console.error('Error calculating Key Highlights:', error);
                  // Fallback to safe display
                  return (
                    <div className="flex items-start gap-2">
                      <span className="text-[#9B2F6A]">•</span>
                      <span className="text-[#565658]">No highlights available</span>
                    </div>
                  );
                }
              })()}
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
              {(() => {
                // Separate active and completed initiatives
                const activeInitiatives = selectedMember.initiatives.filter(
                  (i) => i.status === 'Active' || i.status === 'Scaling' || i.status === 'Planning' ||
                         i.status === 'In Progress' || i.status === 'Not Started' || i.status === 'On Hold'
                );
                const completedInitiatives = selectedMember.initiatives.filter(
                  (i) => i.status === 'Completed'
                );

                const renderInitiativesByCategory = (initiatives: typeof selectedMember.initiatives, title: string) => {
                  if (initiatives.length === 0) return null;

                  const groupedInitiatives = initiatives.reduce((acc, initiative) => {
                    const type = initiative.type || 'Other';
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(initiative);
                    return acc;
                  }, {} as Record<string, typeof initiatives>);

                  // Define order and colors for categories
                  const categoryOrder = ['System Project', 'Project', 'System Initiative', 'Policy', 'Epic Gold', 'Governance', 'General Support', 'Other'];
                  const categoryColors: Record<string, string> = {
                    'System Project': '#9C5C9D',
                    'Project': '#9C5C9D',
                    'System Initiative': '#00A1E0',
                    'Policy': '#6F47D0',
                    'Epic Gold': '#9B2F6A',
                    'Governance': '#6F47D0',
                    'General Support': '#F58025',
                    'Other': '#565658'
                  };

                  return (
                    <div className="mb-6">
                      <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
                        <span>{title}</span>
                        <span className="text-xs font-normal text-gray-600">
                          {initiatives.length} initiative{initiatives.length !== 1 ? 's' : ''}
                        </span>
                      </h3>

                      {categoryOrder.map((category) => {
                        const categoryInitiatives = groupedInitiatives[category];
                        if (!categoryInitiatives || categoryInitiatives.length === 0) return null;

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
                                ({categoryInitiatives.length})
                              </span>
                            </div>
                            <div className="space-y-2">
                              {categoryInitiatives.map((initiative) => (
                                <InitiativeCard key={initiative.id} initiative={initiative} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <>
                    {renderInitiativesByCategory(activeInitiatives, 'Active Initiatives & Impact')}
                    {renderInitiativesByCategory(completedInitiatives, 'Completed Initiatives')}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Team Metrics Section */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{teamMetrics.totalInitiatives}</div>
            <div className="text-sm text-gray-700 mt-1">Total Initiatives</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              ${(teamMetrics.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-700 mt-1">Revenue Impact</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {(teamMetrics.avgCapacity * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-700 mt-1">Avg Capacity</div>
          </div>
        </div>
      </div>
    </div>
    );
  };

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
    // Get initial sub-view from URL hash (e.g., #workload/admin)
    const getInitialSubView = (): 'sci' | 'team' | 'admin' => {
      const hash = window.location.hash.slice(1); // Remove the '#'
      if (hash.startsWith('workload/')) {
        const subView = hash.split('/')[1];
        if (['sci', 'team', 'admin'].includes(subView)) {
          return subView as 'sci' | 'team' | 'admin';
        }
      }
      return 'sci';
    };

    const [workloadSubView, setWorkloadSubView] = useState<'sci' | 'team' | 'admin'>(getInitialSubView());

    // Update URL hash when sub-view changes
    useEffect(() => {
      window.location.hash = `workload/${workloadSubView}`;
    }, [workloadSubView]);
    const [alertsExpanded, setAlertsExpanded] = useState(false);
    const [teamDashboardExpanded, setTeamDashboardExpanded] = useState(false);
    const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<TeamMemberWithDetails | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMemberWithDetails | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'hours' | 'quality'>('name');
    const [showDataQuality, setShowDataQuality] = useState(true);
    const [expandedWarnings, setExpandedWarnings] = useState<Set<string>>(new Set());
    const [cardMetricView, setCardMetricView] = useState<'alpha' | 'capacity' | 'worktype' | 'effort' | 'quality'>('alpha');
    const [loadBalanceFrom, setLoadBalanceFrom] = useState<TeamMemberWithDetails | null>(null);
    const [selectedManagerFilter, setSelectedManagerFilter] = useState<string | null>(null);
    const [capacityModalMember, setCapacityModalMember] = useState<TeamMemberWithDetails | null>(null);

    // Find and show the selected initiative from governance portal
    const selectedInitiative = selectedInitiativeId
      ? teamMembers.flatMap(m => m.initiatives || []).find(i => i.id === selectedInitiativeId)
      : null;

    // DELETED: Team workload calculation and all dependent calculations

    return (
      <div className="space-y-3">
        {/* Sub-Tab Navigation */}
        <div className="bg-white border rounded-lg flex gap-2 p-1">
          <button
            onClick={() => setWorkloadSubView('sci')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              workloadSubView === 'sci'
                ? 'bg-[#9B2F6A] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            SCI View
          </button>
          <button
            onClick={() => setWorkloadSubView('team')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              workloadSubView === 'team'
                ? 'bg-[#9B2F6A] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Team View
          </button>
          <button
            onClick={() => setWorkloadSubView('admin')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              workloadSubView === 'admin'
                ? 'bg-[#9B2F6A] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Admin
          </button>
        </div>

        {/* Conditional Content Based on Sub-View */}
        {workloadSubView === 'admin' ? (
          <AdminTabContainer
            teamMembers={teamMembers}
            managers={managers}
            onTeamMemberUpdate={fetchTeamData}
            onManagerUpdate={fetchTeamData}
          />
        ) : workloadSubView === 'sci' ? (
          <PersonalWorkloadDashboard
            teamMember={currentUser}
            allTeamMembers={teamMembers}
            initiatives={teamMembers.flatMap(m => m.initiatives || [])}
            onTeamMemberChange={setCurrentUser}
            onInitiativesRefresh={fetchTeamData}
          />
        ) : workloadSubView === 'team' ? (
          <TeamCapacityView
            teamMembers={teamMembers}
            managers={managers}
          />
        ) : null}
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
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setActiveView('landing')}
            >
              <h1 className="text-xl font-bold text-[#9B2F6A]">System Clinical Informatics</h1>
              <p className="text-xs text-[#565658] font-medium">CommonSpirit Health • Excellence & Innovation</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  setDashboardSubView('overview');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-[#9B2F6A] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('governance')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                  activeView === 'governance'
                    ? 'bg-[#9B2F6A] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                System Intake
              </button>
              <button
                onClick={() => setActiveView('workload')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                  activeView === 'workload'
                    ? 'bg-[#9B2F6A] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TrendingUp size={16} />
                Workload
              </button>
              <button
                onClick={() => setActiveView('insights')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                  activeView === 'insights'
                    ? 'bg-[#9B2F6A] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Sparkles size={16} />
                AI Insights
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className={activeView === 'landing' ? '' : 'max-w-7xl mx-auto px-4 py-4'}>
        {activeView === 'landing' ? (
          <LandingPage onGetStarted={() => setActiveView('dashboard')} />
        ) : activeView === 'dashboard' ? (
          <div className="space-y-4">
            {/* Dashboard Sub-Navigation Toggle */}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => setDashboardSubView('overview')}
                className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-all ${
                  dashboardSubView === 'overview'
                    ? 'bg-white text-[#9B2F6A] border-b-2 border-[#9B2F6A]'
                    : 'bg-gray-50 text-[#565658] hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDashboardSubView('team')}
                className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-all ${
                  dashboardSubView === 'team'
                    ? 'bg-white text-[#9B2F6A] border-b-2 border-[#9B2F6A]'
                    : 'bg-gray-50 text-[#565658] hover:bg-gray-100'
                }`}
              >
                Team
              </button>
            </div>
            {/* Render appropriate sub-view */}
            {dashboardSubView === 'overview' ? <OverviewView /> : <TeamView />}
          </div>
        ) : activeView === 'workload' ? (
          <WorkloadView />
        ) : activeView === 'governance' ? (
          <>
            <GovernancePortalView
              key={governanceRefreshKey}
              onCreateNew={() => setShowGovernanceForm(true)}
              onViewRequest={(request) => setSelectedGovernanceRequest(request)}
              onViewInitiative={(initiativeId) => {
                setSelectedInitiativeId(initiativeId);
              }}
            />
            {showGovernanceForm && (
              <GovernanceRequestForm
                onClose={() => {
                  setShowGovernanceForm(false);
                  setEditingGovernanceRequest(null);
                }}
                onSuccess={async () => {
                  setShowGovernanceForm(false);
                  setEditingGovernanceRequest(null);
                  setGovernanceRefreshKey(prev => prev + 1); // Force portal refresh
                  // Refresh dashboard data so counts update immediately
                  await fetchTeamData();
                }}
                editingRequest={editingGovernanceRequest}
              />
            )}
            {selectedGovernanceRequest && (
              <GovernanceRequestDetail
                key={selectedGovernanceRequest.id}
                request={selectedGovernanceRequest}
                onClose={() => setSelectedGovernanceRequest(null)}
                onUpdate={async () => {
                  setSelectedGovernanceRequest(null);
                  setGovernanceRefreshKey(prev => prev + 1); // Refresh portal after updates/deletes
                  // Refresh dashboard data so counts update immediately
                  await fetchTeamData();
                }}
                onEdit={(request) => {
                  setEditingGovernanceRequest(request);
                  setShowGovernanceForm(true);
                  setSelectedGovernanceRequest(null);
                }}
                onViewInitiative={(initiativeId) => {
                  setSelectedInitiativeId(initiativeId);
                  setSelectedGovernanceRequest(null);
                }}
              />
            )}
          </>
        ) : activeView === 'insights' ? (
          <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
            <InsightsChat
              contextData={JSON.stringify({
                teamMembers: teamMembers.map(tm => ({
                  name: tm.name,
                  totalAssignments: tm.total_assignments,

                  // Capacity metrics (everything AI needs for capacity queries)
                  capacityUtilizationPercent: tm.dashboard_metrics?.capacity_utilization ?
                    Math.round(tm.dashboard_metrics.capacity_utilization * 100) : null,
                  capacityStatus: tm.dashboard_metrics?.capacity_status,
                  activeAssignments: tm.dashboard_metrics?.active_assignments,
                  activeHoursPerWeek: tm.dashboard_metrics?.active_hours_per_week,
                  availableHours: tm.dashboard_metrics?.available_hours,

                  // Work type summary (counts only, not full objects)
                  workTypeCounts: tm.workTypes,

                  // Initiative summary (count only, not full objects)
                  initiativeCount: tm.initiatives?.length || 0,
                })),
                summary: {
                  totalTeamMembers: teamMembers.length,
                  totalInitiatives: teamMembers.reduce((sum, tm) => sum + (tm.initiatives?.length || 0), 0),
                  activeInitiatives: teamMembers.reduce((sum, tm) =>
                    sum + (tm.initiatives?.filter(i => i.is_active).length || 0), 0),
                  completedInitiatives: teamMembers.reduce((sum, tm) =>
                    sum + (tm.initiatives?.filter(i => !i.is_active).length || 0), 0),
                }
              }, null, 2)}
            />
          </div>
        ) : null}
      </main>

      {/* Global initiative modal - can appear on any tab */}
      {selectedInitiativeId && (() => {
        const initiative = teamMembers.flatMap(m => m.initiatives || []).find(i => i.id === selectedInitiativeId);
        return initiative ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center p-4 py-8">
              <div className="max-w-6xl w-full">
                <InitiativeSubmissionForm
                  key={initiative.id + '-' + initiative.updated_at}
                  editingInitiative={initiative}
                  onClose={() => setSelectedInitiativeId(null)}
                  onSuccess={async () => {
                    // Refresh data BEFORE closing modal to ensure updates are visible
                    await fetchTeamData();
                    setSelectedInitiativeId(null); // Close modal AFTER data refresh
                  }}
                />
              </div>
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}

export default App;
