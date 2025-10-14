import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

interface AuditResults {
  teamMembers: any[];
  workTypeSummary: any[];
  initiatives: any[];
  issues: {
    completedActive: any[];
    missingRole: any[];
    missingEHR: any[];
    missingServiceLine: any[];
  };
}

export function AuditPage() {
  const [results, setResults] = useState<AuditResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runAudit() {
      // Get team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('*')
        .order('name');

      // Get work type summary
      const { data: workTypeSummary } = await supabase
        .from('work_type_summary')
        .select('*');

      // Get initiatives
      const { data: initiatives } = await supabase
        .from('initiatives')
        .select('*')
        .order('team_member_id, type, status');

      // Identify issues
      const issues = {
        completedActive: initiatives?.filter(i =>
          ['Completed', 'On Hold', 'Cancelled'].includes(i.status)
        ) || [],
        missingRole: initiatives?.filter(i => !i.role) || [],
        missingEHR: initiatives?.filter(i => !i.ehrs_impacted) || [],
        missingServiceLine: initiatives?.filter(i => !i.service_line) || []
      };

      setResults({
        teamMembers: teamMembers || [],
        workTypeSummary: workTypeSummary || [],
        initiatives: initiatives || [],
        issues
      });
      setLoading(false);
    }

    runAudit();
  }, []);

  if (loading) {
    return <div className="p-8">Loading audit...</div>;
  }

  if (!results) {
    return <div className="p-8">No data</div>;
  }

  // Group initiatives by team member
  const initiativesByMember = results.initiatives.reduce((acc: any, init) => {
    if (!acc[init.team_member_id]) {
      acc[init.team_member_id] = [];
    }
    acc[init.team_member_id].push(init);
    return acc;
  }, {});

  // Group work type summary by team member
  const workTypeSummaryByMember = results.workTypeSummary.reduce((acc: any, item) => {
    if (!acc[item.team_member_id]) {
      acc[item.team_member_id] = { total: 0, types: [] };
    }
    acc[item.team_member_id].total += item.count;
    acc[item.team_member_id].types.push({
      type: item.work_type,
      count: item.count
    });
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Audit</h1>

      {/* Team Members Overview */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Team Members ({results.teamMembers.length})</h2>
        <div className="grid gap-4">
          {results.teamMembers.map(member => {
            const workSummary = workTypeSummaryByMember[member.id];
            const memberInitiatives = initiativesByMember[member.id] || [];

            return (
              <div key={member.id} className="border rounded p-4">
                <h3 className="font-bold text-lg">{member.name}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Total Assignments (work_type_summary): {workSummary?.total || 0}</p>
                  <p>Initiatives in Database: {memberInitiatives.length}</p>

                  {memberInitiatives.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Initiative Breakdown:</p>
                      <ul className="ml-4 mt-1">
                        {Object.entries(
                          memberInitiatives.reduce((acc: any, init: any) => {
                            acc[init.status] = (acc[init.status] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([status, count]) => (
                          <li key={status}>
                            {status}: {count}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data Issues */}
      <section className="mb-8 bg-red-50 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-red-900">⚠️ Potential Data Issues</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-red-800">
              1. Completed/On Hold/Cancelled Initiatives: {results.issues.completedActive.length}
            </h3>
            <p className="text-sm text-red-700 mb-2">
              These should likely not count toward current workload
            </p>
            {results.issues.completedActive.slice(0, 5).map(init => {
              const member = results.teamMembers.find(tm => tm.id === init.team_member_id);
              return (
                <div key={init.id} className="text-sm ml-4">
                  - {member?.name}: {init.initiative_name} ({init.status})
                </div>
              );
            })}
            {results.issues.completedActive.length > 5 && (
              <div className="text-sm ml-4 text-red-600">
                ... and {results.issues.completedActive.length - 5} more
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-red-800">
              2. Missing Role Field: {results.issues.missingRole.length}
            </h3>
            {results.issues.missingRole.slice(0, 5).map(init => {
              const member = results.teamMembers.find(tm => tm.id === init.team_member_id);
              return (
                <div key={init.id} className="text-sm ml-4">
                  - {member?.name}: {init.initiative_name}
                </div>
              );
            })}
            {results.issues.missingRole.length > 5 && (
              <div className="text-sm ml-4 text-red-600">
                ... and {results.issues.missingRole.length - 5} more
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-red-800">
              3. Missing EHRs Impacted: {results.issues.missingEHR.length}
            </h3>
          </div>

          <div>
            <h3 className="font-bold text-red-800">
              4. Missing Service Line: {results.issues.missingServiceLine.length}
            </h3>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="bg-blue-50 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-900">Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{results.initiatives.length}</div>
            <div className="text-sm text-blue-800">Total Initiatives</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {results.initiatives.filter(i => ['Planning', 'Active', 'Scaling'].includes(i.status)).length}
            </div>
            <div className="text-sm text-green-800">Active Initiatives</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-600">
              {results.initiatives.filter(i => ['Completed', 'On Hold', 'Cancelled'].includes(i.status)).length}
            </div>
            <div className="text-sm text-gray-800">Inactive Initiatives</div>
          </div>
        </div>
      </section>
    </div>
  );
}
