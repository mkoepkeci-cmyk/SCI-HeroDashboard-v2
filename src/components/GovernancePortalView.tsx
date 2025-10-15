import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, X, FileText, AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react';
import { supabase, GovernanceRequest, GovernanceRequestWithDetails } from '../lib/supabase';
import {
  filterRequests,
  sortRequests,
  calculatePipelineMetrics,
  getStatusConfig,
  formatDate,
  formatCurrency,
  getTimeAgo,
  DIVISION_REGIONS,
  type RequestFilters,
  type SortField,
  type SortDirection
} from '../lib/governanceUtils';

interface GovernancePortalViewProps {
  onCreateNew: () => void;
  onViewRequest: (request: GovernanceRequest) => void;
  onViewInitiative?: (initiativeId: string) => void;
}

export const GovernancePortalView = ({ onCreateNew, onViewRequest, onViewInitiative }: GovernancePortalViewProps) => {
  const [requests, setRequests] = useState<GovernanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RequestFilters>({});
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [quickFilter, setQuickFilter] = useState<'all' | 'needsSci' | 'readyForReview' | 'needsRefinement' | 'readyForGovernance'>('all');
  const [showSystemLevelModal, setShowSystemLevelModal] = useState(false);

  useEffect(() => {
    fetchGovernanceRequests();
  }, []);

  const fetchGovernanceRequests = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('governance_requests')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching governance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pipeline metrics
  const metrics = useMemo(() => calculatePipelineMetrics(requests), [requests]);

  // Apply filters and sorting
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = filterRequests(requests, { ...filters, search: searchQuery });

    // Apply quick filters based on status
    if (quickFilter === 'needsSci') {
      filtered = filtered.filter(r => !r.assigned_sci_id && r.status !== 'Dismissed');
    } else if (quickFilter === 'readyForReview') {
      filtered = filtered.filter(r => r.status === 'Ready for Review');
    } else if (quickFilter === 'needsRefinement') {
      filtered = filtered.filter(r => r.status === 'Needs Refinement');
    } else if (quickFilter === 'readyForGovernance') {
      filtered = filtered.filter(r => r.status === 'Ready for Governance');
    }

    return sortRequests(filtered, sortField, sortDirection);
  }, [requests, filters, searchQuery, quickFilter, sortField, sortDirection]);

  // Get unique values for filter dropdowns
  const uniqueSubmitters = useMemo(() =>
    [...new Set(requests.map(r => r.submitter_name))].sort(),
    [requests]
  );

  const uniqueDivisions = useMemo(() =>
    [...new Set(requests.map(r => r.division_region))].sort(),
    [requests]
  );

  const uniqueAssignedScis = useMemo(() =>
    [...new Set(requests.map(r => r.assigned_sci_name).filter(Boolean))].sort() as string[],
    [requests]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setQuickFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading governance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-purple-900 mb-2">
              SCI Consultant Request Portal
            </h1>
            <p className="text-purple-700">
              Submit requests for System Clinical Informatics consultation on enterprise initiatives affecting multiple markets or the entire organization.
            </p>
            <a
              href="#"
              className="text-sm text-purple-600 hover:text-purple-800 underline mt-2 inline-block"
              onClick={(e) => {
                e.preventDefault();
                setShowSystemLevelModal(true);
              }}
            >
              Not sure if your request is system-level? Click here
            </a>
          </div>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-xs text-gray-600 uppercase font-medium">Total</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{metrics.total}</p>
        </div>

        {/* Draft */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-2">
          <p className="text-xs text-gray-600 uppercase font-medium">📝 Draft</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{metrics.byStatus['Draft']}</p>
        </div>

        {/* Needs SCI Assigned */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
          <p className="text-xs text-orange-700 uppercase font-medium">Needs SCI</p>
          <p className="text-xl font-bold text-orange-900 mt-1">
            {requests.filter(r => !r.assigned_sci_id && r.status !== 'Dismissed').length}
          </p>
        </div>

        {/* Ready for Review */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="text-xs text-blue-700 uppercase font-medium">📤 Ready for Review</p>
          <p className="text-xl font-bold text-blue-900 mt-1">{metrics.byStatus['Ready for Review']}</p>
        </div>

        {/* Needs Refinement */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
          <p className="text-xs text-orange-700 uppercase font-medium">🔧 Needs Refinement</p>
          <p className="text-xl font-bold text-orange-900 mt-1">{metrics.byStatus['Needs Refinement']}</p>
        </div>

        {/* Ready for Governance */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="text-xs text-green-700 uppercase font-medium">✅ Ready for Gov</p>
          <p className="text-xl font-bold text-green-900 mt-1">{metrics.byStatus['Ready for Governance']}</p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setQuickFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            quickFilter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({metrics.total})
        </button>
        <button
          onClick={() => setQuickFilter('needsSci')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            quickFilter === 'needsSci'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Needs SCI ({requests.filter(r => !r.assigned_sci_id && r.status !== 'Dismissed').length})
        </button>
        <button
          onClick={() => setQuickFilter('readyForReview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            quickFilter === 'readyForReview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ready for Review ({metrics.byStatus['Ready for Review'] || 0})
        </button>
        <button
          onClick={() => setQuickFilter('needsRefinement')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            quickFilter === 'needsRefinement'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Needs Refinement ({metrics.byStatus['Needs Refinement'] || 0})
        </button>
        <button
          onClick={() => setQuickFilter('readyForGovernance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            quickFilter === 'readyForGovernance'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ready for Governance ({metrics.byStatus['Ready for Governance'] || 0})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, request ID, or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
          {(Object.keys(filters).length > 0 || searchQuery || quickFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Clear
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Refinement">Refinement</option>
                <option value="Ready for Governance">Ready for Governance</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Declined">Declined</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Division/Region</label>
              <select
                value={filters.division || ''}
                onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">All Divisions</option>
                {uniqueDivisions.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned SCI</label>
              <select
                value={filters.assignedSci || ''}
                onChange={(e) => setFilters({ ...filters, assignedSci: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">All SCIs</option>
                {uniqueAssignedScis.map(sci => (
                  <option key={sci} value={sci}>{sci}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('request_id')}
              >
                Request ID
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                Title / Submitter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Division
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Assigned SCI
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('updated_at')}
              >
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-lg font-medium">No requests found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or create a new request</p>
                </td>
              </tr>
            ) : (
              filteredAndSortedRequests.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                return (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onViewRequest(request)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-purple-700">
                        {request.request_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.submitter_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {request.division_region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          color: statusConfig.color,
                          backgroundColor: statusConfig.bgColor,
                          border: `1px solid ${statusConfig.borderColor}`
                        }}
                      >
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {request.assigned_sci_name || (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTimeAgo(request.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRequest(request);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 text-center">
        Showing {filteredAndSortedRequests.length} of {requests.length} requests
      </div>

      {/* System-Level Information Modal */}
      {showSystemLevelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                System-Level Governance Request
              </h2>
              <button
                onClick={() => setShowSystemLevelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                This portal is exclusively for <strong>system-level requests</strong> that:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Impact the entire organization or multiple divisions/markets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Require system-level governance approval and CI number assignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Utilize enterprise resources (system clinical informatics team, IT infrastructure)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Establish organization-wide standards or policies</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Individual market or facility-level requests should NOT be submitted through this portal.
                  If your request only affects a single market or facility, please work with your local leadership.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSystemLevelModal(false)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
