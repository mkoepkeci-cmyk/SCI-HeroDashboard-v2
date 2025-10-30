import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { InitiativeWithDetails } from '../lib/supabase';
import { InitiativeModal } from './InitiativeModal';

interface InitiativesTableViewProps {
  initiatives: InitiativeWithDetails[];
  onEdit?: (initiative: InitiativeWithDetails) => void;
  expandAll?: boolean; // Expand all categories when search/filters are active
}

const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'System Initiative': '#00A1E0',
    'System Projects': '#9C5C9D',
    'Market Projects': '#9B2F6A',
    'Tickets': '#F58025',
    'Other': '#565658',
  };
  return colors[type] || '#565658';
};

const getStatusBadge = (status: string): string => {
  const badges: { [key: string]: string } = {
    'Not Started': '📋',
    'In Progress': '🔄',
    'On Hold': '⏸',
    'Completed': '✓',
    'Cancelled': '❌',
  };
  return badges[status] || '•';
};

const formatCurrency = (value?: number): string => {
  if (!value) return '-';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

export const InitiativesTableView = ({ initiatives, onEdit, expandAll = false }: InitiativesTableViewProps) => {
  const [selectedInitiative, setSelectedInitiative] = useState<InitiativeWithDetails | null>(null);

  // Get all category names from categoryOrder
  const categoryOrder = [
    'System Initiative',
    'System Projects',
    'Market Projects',
    'Tickets',
    'Other'
  ];

  // Start with all categories collapsed unless expandAll is true
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    expandAll ? new Set() : new Set(categoryOrder)
  );

  // Update collapsed state when expandAll changes
  useEffect(() => {
    setCollapsedCategories(expandAll ? new Set() : new Set(categoryOrder));
  }, [expandAll]);

  // Map database types to display categories
  const mapTypeToCategory = (type: string): string => {
    if (!type) return 'Other';

    // Direct matches
    if (type === 'System Initiative') return 'System Initiative';
    if (type === 'Market Project') return 'Market Projects';
    if (type === 'Ticket') return 'Tickets';

    // Map "Project" and "System Project" to "System Projects"
    if (type === 'System Project') return 'System Projects';
    if (type === 'Project') return 'System Projects';

    // Everything else goes to Other (General Support, Policy/ Guideline, Epic Gold, Epic Upgrades, Skip, etc.)
    return 'Other';
  };

  // Group initiatives by category, filtering out "Skip" type
  const groupedInitiatives = initiatives
    .filter(initiative => initiative.type !== 'Skip')
    .reduce((acc, initiative) => {
      const category = mapTypeToCategory(initiative.type);
      if (!acc[category]) acc[category] = [];
      acc[category].push(initiative);
      return acc;
    }, {} as Record<string, InitiativeWithDetails[]>);

  // Sort initiatives alphabetically within each category
  Object.keys(groupedInitiatives).forEach(category => {
    groupedInitiatives[category].sort((a, b) =>
      a.initiative_name.localeCompare(b.initiative_name)
    );
  });

  // Calculate total revenue per category
  const getCategoryRevenue = (initiatives: InitiativeWithDetails[]): number => {
    return initiatives.reduce((sum, init) => {
      return sum + (init.financial_impact?.actual_revenue || 0);
    }, 0);
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  return (
    <>
      <div className="space-y-4">
        {categoryOrder.map((category) => {
          const categoryInitiatives = groupedInitiatives[category];
          if (!categoryInitiatives || categoryInitiatives.length === 0) return null;

          const isCollapsed = collapsedCategories.has(category);
          const categoryRevenue = getCategoryRevenue(categoryInitiatives);
          const categoryColor = getTypeColor(category);

          return (
            <div key={category} className="bg-white rounded-lg border overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                style={{ borderLeft: `4px solid ${categoryColor}` }}
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <h3 className="font-semibold text-base" style={{ color: categoryColor }}>
                    {category}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({categoryInitiatives.length} initiative{categoryInitiatives.length !== 1 ? 's' : ''})
                  </span>
                </div>
                {categoryRevenue > 0 && (
                  <div className="text-sm font-semibold text-green-600">
                    {formatCurrency(categoryRevenue)} revenue
                  </div>
                )}
              </button>

              {/* Category Table */}
              {!isCollapsed && (
                <div className="border-t">
                  {/* Table Header */}
                  <div className="bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 border-b">
                    <div className="col-span-4">Initiative Name</div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-1">Role</div>
                    <div className="col-span-2">EHR</div>
                    <div className="col-span-2">Service Line</div>
                    <div className="col-span-1 text-right">Revenue</div>
                  </div>

                  {/* Table Rows */}
                  {categoryInitiatives.map((initiative) => (
                    <button
                      key={initiative.id}
                      onClick={() => setSelectedInitiative(initiative)}
                      className="w-full px-4 py-2.5 grid grid-cols-12 gap-2 text-sm hover:bg-gray-50 transition-colors border-b last:border-b-0 text-left"
                    >
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="font-medium text-gray-900 truncate">
                          {initiative.initiative_name}
                        </span>
                        <span className="flex-shrink-0 text-base">
                          {getStatusBadge(initiative.status)}
                        </span>
                      </div>
                      <div className="col-span-2 text-gray-700 truncate">
                        {initiative.owner_name}
                      </div>
                      <div className="col-span-1 text-gray-600 text-xs">
                        {initiative.role || '-'}
                      </div>
                      <div className="col-span-2 text-[#00A1E0] text-xs truncate">
                        {initiative.ehrs_impacted || '-'}
                      </div>
                      <div className="col-span-2 text-gray-600 text-xs truncate">
                        {initiative.service_line || '-'}
                      </div>
                      <div className="col-span-1 text-right font-semibold text-green-600 text-xs">
                        {formatCurrency(initiative.financial_impact?.actual_revenue)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Initiative Detail Modal */}
      {selectedInitiative && (
        <InitiativeModal
          initiative={selectedInitiative}
          onClose={() => setSelectedInitiative(null)}
          onEdit={onEdit ? (initiative) => {
            setSelectedInitiative(null);
            onEdit(initiative);
          } : undefined}
        />
      )}
    </>
  );
};
