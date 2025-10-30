import { useState } from 'react';
import { Edit, X, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { InitiativeWithDetails, EffortSize, EFFORT_SIZES, TeamMember } from '../lib/supabase';
import { getEffortSizeFromHours } from '../lib/effortUtils';
import ReassignModal from './ReassignModal';

interface InitiativeEffortEntry {
  initiative: InitiativeWithDetails;
  hours: number;
  effortSize: EffortSize;
  note: string;
  skipped: boolean;
  hasChanges: boolean;
}

interface SystemInitiativesTableProps {
  entries: InitiativeEffortEntry[];
  onHoursChange: (index: number, value: string) => void;
  onSizeClick: (index: number, size: EffortSize) => void;
  onNoteChange: (index: number, value: string) => void;
  onSkipToggle: (index: number) => void;
  onEditInitiative?: (initiative: InitiativeWithDetails) => void;
  onRemoveInitiative: (index: number) => void;
  allTeamMembers: TeamMember[];
}

export const SystemInitiativesTable = ({
  entries,
  onHoursChange,
  onSizeClick,
  onNoteChange,
  onSkipToggle,
  onEditInitiative,
  onRemoveInitiative,
  allTeamMembers
}: SystemInitiativesTableProps) => {
  const [reassigningInitiative, setReassigningInitiative] = useState<InitiativeWithDetails | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter to only System Initiative type
  const systemInitiativeEntries = entries.filter(
    entry => entry.initiative.type === 'System Initiative'
  );

  if (systemInitiativeEntries.length === 0) {
    return null;
  }

  const color = '#00A1E0'; // System Initiative blue color

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-[280px]" />
              <col className="w-32" />
              <col className="w-36" />
              <col className="w-24" />
              <col className="w-56" />
              <col />
              <col className="w-12" />
              <col className="w-12" />
            </colgroup>
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase">Skip</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Initiative</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">Owner</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actual Hours</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actual Size</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Note</th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase">Edit</th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Section Header */}
              <tr className="bg-gray-50">
                <td colSpan={9} className="px-4 py-2">
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center gap-3 text-left hover:bg-gray-100 transition-colors rounded px-2 py-1"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                    <div
                      className="w-1 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold text-gray-800">System Initiative</span>
                    <span
                      className="text-sm px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color
                      }}
                    >
                      {systemInitiativeEntries.length}
                    </span>
                  </button>
                </td>
              </tr>

              {/* Initiative Rows */}
              {!isCollapsed && systemInitiativeEntries.map((entry) => {
                const globalIndex = entries.findIndex(e => e.initiative.id === entry.initiative.id);

                return (
                  <tr key={entry.initiative.id} className={entry.hasChanges ? 'bg-blue-50/50' : ''}>
                    {/* Skip Checkbox */}
                    <td className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={entry.skipped}
                        onChange={() => onSkipToggle(globalIndex)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        title="Skip this week - mark as no work"
                      />
                    </td>

                    {/* Initiative Name */}
                    <td className="px-3 py-3">
                      <div>
                        <div className="font-medium text-sm">{entry.initiative.initiative_name}</div>
                        {entry.initiative.request_id && (
                          <div className="text-xs text-gray-500">{entry.initiative.request_id}</div>
                        )}
                      </div>
                    </td>

                    {/* Owner with Reassign Button */}
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-700 truncate">{entry.initiative.owner_name || 'Unassigned'}</span>
                        <button
                          onClick={() => setReassigningInitiative(entry.initiative)}
                          className="text-purple-600 hover:text-purple-800 transition-colors flex-shrink-0"
                          title="Reassign initiative"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-2 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium whitespace-nowrap">
                        {entry.initiative.type}
                      </span>
                    </td>

                    {/* Actual Hours Input */}
                    <td className="px-2 py-3">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={entry.hours || ''}
                        onChange={(e) => onHoursChange(globalIndex, e.target.value)}
                        disabled={entry.skipped}
                        className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="0"
                      />
                    </td>

                    {/* Effort Size Buttons */}
                    <td className="px-2 py-3">
                      <div className="space-y-1">
                        {entry.initiative.work_effort && (
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            Estimated: {entry.initiative.work_effort}
                          </div>
                        )}
                        <div className="flex gap-1">
                          {EFFORT_SIZES.map(size => (
                            <button
                              key={size.size}
                              onClick={() => onSizeClick(globalIndex, size.size)}
                              disabled={entry.skipped}
                              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                                entry.effortSize === size.size
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={`${size.hours} hours`}
                            >
                              {size.size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Note */}
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={entry.note}
                        onChange={(e) => onNoteChange(globalIndex, e.target.value)}
                        disabled={entry.skipped}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="Optional note..."
                      />
                    </td>

                    {/* Edit Button */}
                    <td className="px-4 py-3 text-center">
                      {onEditInitiative && (
                        <button
                          onClick={() => onEditInitiative(entry.initiative)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit initiative details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>

                    {/* Delete Button */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onRemoveInitiative(globalIndex)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete initiative"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {reassigningInitiative && (
        <ReassignModal
          initiative={reassigningInitiative}
          teamMembers={allTeamMembers}
          onClose={() => setReassigningInitiative(null)}
          onSuccess={() => {
            setReassigningInitiative(null);
            window.location.reload();
          }}
        />
      )}
    </>
  );
};
