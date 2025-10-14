import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Edit, Loader2, X } from 'lucide-react';
import { supabase, Initiative, InitiativeWithDetails, InitiativeMetric, InitiativeFinancialImpact, InitiativePerformanceData, InitiativeProjection, InitiativeStory } from '../lib/supabase';
import { CompletionIndicator } from './CompletionIndicator';
import { InitiativeCard } from './InitiativeCard';
import { InitiativesTableView } from './InitiativesTableView';

interface InitiativesViewProps {
  onCreateNew: () => void;
  onEdit: (initiative: InitiativeWithDetails) => void;
}

export const InitiativesView = ({ onCreateNew, onEdit }: InitiativesViewProps) => {
  const [initiatives, setInitiatives] = useState<InitiativeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCompletion, setFilterCompletion] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const uniqueOwners = useMemo(() => {
    const owners = [...new Set(initiatives.map(i => i.owner_name))];
    return owners.sort();
  }, [initiatives]);

  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(initiatives.map(i => i.status))];
    return statuses.sort();
  }, [initiatives]);

  const uniqueTypes = useMemo(() => {
    const types = [...new Set(initiatives.map(i => i.type))];
    return types.sort();
  }, [initiatives]);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);

      const { data: initiativesData, error: initiativesError } = await supabase
        .from('initiatives')
        .select('*')
        .order('updated_at', { ascending: false });

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

      const initiativesWithDetails: InitiativeWithDetails[] = (initiativesData || []).map((initiative) => ({
        ...initiative,
        metrics: (metrics || []).filter((m: InitiativeMetric) => m.initiative_id === initiative.id),
        financial_impact: (financialImpact || []).find((f: InitiativeFinancialImpact) => f.initiative_id === initiative.id),
        performance_data: (performanceData || []).find((p: InitiativePerformanceData) => p.initiative_id === initiative.id),
        projections: (projections || []).find((p: InitiativeProjection) => p.initiative_id === initiative.id),
        story: (stories || []).find((s: InitiativeStory) => s.initiative_id === initiative.id),
      }));

      setInitiatives(initiativesWithDetails);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((initiative) => {
      // Tab filter (is_active)
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'active' && initiative.is_active === true) ||
        (activeTab === 'completed' && initiative.is_active === false);

      const matchesSearch = !searchQuery ||
        initiative.initiative_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        initiative.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        initiative.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOwner = !filterOwner || initiative.owner_name === filterOwner;
      const matchesStatus = !filterStatus || initiative.status === filterStatus;
      const matchesType = !filterType || initiative.type === filterType;

      const matchesCompletion = !filterCompletion ||
        (filterCompletion === 'complete' && initiative.completion_percentage === 100) ||
        (filterCompletion === 'incomplete' && initiative.completion_percentage < 100) ||
        (filterCompletion === 'started' && initiative.completion_percentage > 0 && initiative.completion_percentage < 100) ||
        (filterCompletion === 'empty' && initiative.completion_percentage === 0);

      return matchesTab && matchesSearch && matchesOwner && matchesStatus && matchesType && matchesCompletion;
    });
  }, [initiatives, activeTab, searchQuery, filterOwner, filterStatus, filterType, filterCompletion]);

  const clearFilters = () => {
    setFilterOwner('');
    setFilterStatus('');
    setFilterType('');
    setFilterCompletion('');
    setSearchQuery('');
  };

  const hasActiveFilters = filterOwner || filterStatus || filterType || filterCompletion || searchQuery;

  const stats = useMemo(() => {
    return {
      total: initiatives.length,
      active: initiatives.filter(i => i.is_active === true).length,
      completed: initiatives.filter(i => i.is_active === false).length,
      // Use is_active for consistency with tabs, not completion_percentage
      complete: initiatives.filter(i => i.is_active === false).length,
      inProgress: initiatives.filter(i => i.is_active === true).length,
      notStarted: initiatives.filter(i => !i.is_active && !i.status).length,
      avgCompletion: initiatives.length > 0
        ? Math.round(initiatives.reduce((sum, i) => sum + i.completion_percentage, 0) / initiatives.length)
        : 0
    };
  }, [initiatives]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#9B2F6A]" />
          <p className="text-[#565658] font-medium">Loading initiatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-[#6F47D0] rounded-lg p-3 text-white">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs opacity-90">Total Initiatives</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
            <div className="text-xs text-green-700">Complete</div>
          </div>
          <div className="bg-[#00A1E0]/10 border border-[#00A1E0]/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-[#00A1E0]">{stats.inProgress}</div>
            <div className="text-xs text-[#00A1E0]">In Progress</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
            <div className="text-xs text-gray-600">Not Started</div>
          </div>
          <div className="bg-[#6F47D0]/10 border border-[#6F47D0]/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-[#6F47D0]">{stats.avgCompletion}%</div>
            <div className="text-xs text-[#6F47D0]">Avg Completion</div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === 'active'
                ? 'text-[#9B2F6A] border-b-2 border-[#9B2F6A] bg-[#9B2F6A]/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Active
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'active'
                ? 'bg-[#9B2F6A] text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {stats.active}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === 'completed'
                ? 'text-[#9B2F6A] border-b-2 border-[#9B2F6A] bg-[#9B2F6A]/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Completed
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'completed'
                ? 'bg-[#9B2F6A] text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {stats.completed}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === 'all'
                ? 'text-[#9B2F6A] border-b-2 border-[#9B2F6A] bg-[#9B2F6A]/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            All
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'all'
                ? 'bg-[#9B2F6A] text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {stats.total}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search initiatives by name, owner, or type..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-[#9B2F6A] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="bg-white text-[#9B2F6A] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {[filterOwner, filterStatus, filterType, filterCompletion, searchQuery].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#00A1E0] text-white rounded-lg text-sm font-semibold hover:bg-[#0088c2] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Initiative
          </button>
        </div>

        {showFilters && (
          <div className="border-t pt-3 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Owner</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                >
                  <option value="">All Owners</option>
                  {uniqueOwners.map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Completion</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={filterCompletion}
                  onChange={(e) => setFilterCompletion(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="complete">Complete (100%)</option>
                  <option value="incomplete">Incomplete (&lt;100%)</option>
                  <option value="started">Started (&gt;0%)</option>
                  <option value="empty">Empty (0%)</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#9B2F6A] hover:bg-[#9B2F6A]/5 rounded transition-all"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {filteredInitiatives.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">No initiatives found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#9B2F6A] hover:underline"
            >
              Clear filters to see all initiatives
            </button>
          )}
        </div>
      ) : (
        <InitiativesTableView
          initiatives={filteredInitiatives}
          onEdit={onEdit}
        />
      )}
    </div>
  );
};
