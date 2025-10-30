interface CollaborationData {
  clinicalSponsorName: string;
  clinicalSponsorTitle: string;
  governanceBodies: string;
  keyCollaborators: string;
}

interface CollaborationTabProps {
  data: CollaborationData;
  setData: (data: CollaborationData) => void;
}

export const CollaborationTab = ({ data, setData }: CollaborationTabProps) => {
  return (
    <div className="space-y-6">
      {/* Clinical Sponsor Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Sponsor</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Sponsor Name
            </label>
            <input
              type="text"
              value={data.clinicalSponsorName}
              onChange={(e) => setData({ ...data, clinicalSponsorName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., Dr. Sarah Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Sponsor Title
            </label>
            <input
              type="text"
              value={data.clinicalSponsorTitle}
              onChange={(e) => setData({ ...data, clinicalSponsorTitle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="e.g., Chief Medical Officer"
            />
          </div>
        </div>
      </div>

      {/* Governance Bodies Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Governance & Oversight</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Governance Bodies
          </label>
          <textarea
            value={data.governanceBodies}
            onChange={(e) => setData({ ...data, governanceBodies: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2"
            rows={3}
            placeholder="Enter governance bodies (comma-separated)&#10;e.g., Clinical Informatics Council, Pharmacy Committee, Patient Safety Board"
          />
          <p className="text-xs text-gray-500 mt-1">
            List committees, councils, or boards overseeing this work
          </p>
        </div>
      </div>

      {/* Key Collaborators Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Collaboration</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Collaborators
          </label>
          <textarea
            value={data.keyCollaborators}
            onChange={(e) => setData({ ...data, keyCollaborators: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2"
            rows={4}
            placeholder="Enter key collaborators (comma-separated)&#10;e.g., IT Application Team, Nursing Leadership, Pharmacy Operations, Revenue Cycle Analysts"
          />
          <p className="text-xs text-gray-500 mt-1">
            List departments, teams, or individuals providing significant support
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <div className="text-blue-700 text-sm">
            <p className="font-medium mb-1">Collaboration Fields</p>
            <p>
              These fields help track stakeholder engagement and governance oversight.
              Use comma-separated lists for multiple entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
