import { Plus } from 'lucide-react';
import { JournalEntry } from '../../lib/supabase';

interface Tab3Data {
  proposedSolution: string;
  votingStatement: string;
  ehrAreasImpacted: string[];
}

interface Tab3ContentProps {
  data: Tab3Data;
  setData: (data: Tab3Data) => void;
  journalEntries: JournalEntry[];
  setJournalEntries: (entries: JournalEntry[]) => void;
  newJournalEntry: string;
  setNewJournalEntry: (entry: string) => void;
  currentUser: { name: string; id: string };
}

export const Tab3Content = ({
  data,
  setData,
  journalEntries,
  setJournalEntries,
  newJournalEntry,
  setNewJournalEntry,
  currentUser
}: Tab3ContentProps) => {
  const addJournalEntry = () => {
    if (newJournalEntry.trim()) {
      const entry: JournalEntry = {
        timestamp: new Date().toISOString(),
        author: currentUser.name,
        author_id: currentUser.id,
        entry: newJournalEntry.trim()
      };
      setJournalEntries([entry, ...journalEntries]); // Prepend (newest first)
      setNewJournalEntry('');
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Proposed Solution */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Proposed Solution</h3>
        <textarea
          value={data.proposedSolution}
          onChange={(e) => setData({ ...data, proposedSolution: e.target.value })}
          rows={6}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Describe the proposed solution for governance review"
        />
      </div>

      {/* Voting Statement */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Voting Statement for Governance Committee</h3>
        <textarea
          value={data.votingStatement}
          onChange={(e) => setData({ ...data, votingStatement: e.target.value })}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Statement for governance committee voting"
        />
      </div>

      {/* EHR Areas Impacted */}
      <div>
        <h3 className="text-lg font-semibold mb-4">EHR Areas/Modules Impacted</h3>
        <textarea
          value={data.ehrAreasImpacted.join('\n')}
          onChange={(e) => setData({
            ...data,
            ehrAreasImpacted: e.target.value.split('\n').filter(a => a.trim())
          })}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="List EHR areas or modules (one per line)&#10;e.g.,&#10;Orders&#10;Medication Administration&#10;Clinical Documentation"
        />
        <p className="text-xs text-gray-500 mt-1">Enter one EHR area per line</p>
      </div>

      {/* Journal Log */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Journal Log</h3>
        <p className="text-sm text-gray-600 mb-4">
          Track decisions, meetings, updates, and milestones for this initiative.
        </p>

        {/* Existing Entries */}
        {journalEntries.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            {journalEntries.map((entry, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">
                  {formatDateTime(entry.timestamp)} - {entry.author}
                </div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {entry.entry}
                </div>
              </div>
            ))}
          </div>
        )}

        {journalEntries.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-sm text-gray-500 mb-4">
            No journal entries yet. Add your first entry below.
          </div>
        )}

        {/* Add New Entry */}
        <div className="space-y-2">
          <textarea
            value={newJournalEntry}
            onChange={(e) => setNewJournalEntry(e.target.value)}
            placeholder="Add a journal entry (meetings, decisions, updates, milestones)..."
            className="w-full border border-gray-300 rounded-lg p-3"
            rows={3}
          />
          <button
            onClick={addJournalEntry}
            disabled={!newJournalEntry.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );
};
