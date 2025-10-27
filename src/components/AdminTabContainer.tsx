import { useState } from 'react';
import { Settings, Users, UserCog, Calculator } from 'lucide-react';
import { TeamMember, Manager } from '../lib/supabase';
import { TeamManagementPanel } from './TeamManagementPanel';
import { ManagersPanel } from './ManagersPanel';
import { WorkloadCalculatorSettings } from './WorkloadCalculatorSettings';

type AdminSubView = 'team' | 'managers' | 'calculator';

interface AdminTabContainerProps {
  teamMembers: TeamMember[];
  managers: Manager[];
  onTeamMemberUpdate: () => void;
  onManagerUpdate: () => void;
}

export function AdminTabContainer({ teamMembers, managers, onTeamMemberUpdate, onManagerUpdate }: AdminTabContainerProps) {
  const [subView, setSubView] = useState<AdminSubView>('team');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#9B2F6A] text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Administration</h2>
        </div>
        <p className="text-white/80">Manage team members, managers, and system settings</p>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="bg-white border rounded-lg">
        <div className="flex border-b">
          <button
            onClick={() => setSubView('team')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              subView === 'team'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Management
          </button>
          <button
            onClick={() => setSubView('managers')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              subView === 'managers'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserCog className="w-4 h-4" />
            Managers
          </button>
          <button
            onClick={() => setSubView('calculator')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              subView === 'calculator'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Calculator Settings
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {subView === 'team' && (
            <TeamManagementPanel
              teamMembers={teamMembers}
              managers={managers}
              onTeamMemberUpdate={onTeamMemberUpdate}
            />
          )}
          {subView === 'managers' && (
            <ManagersPanel
              managers={managers}
              teamMembers={teamMembers}
              onManagerUpdate={onManagerUpdate}
            />
          )}
          {subView === 'calculator' && <WorkloadCalculatorSettings />}
        </div>
      </div>
    </div>
  );
}
