import { CompletionStatus } from './supabase';

export interface SectionInfo {
  key: keyof CompletionStatus;
  label: string;
  color: string;
  icon: string;
}

export const SECTIONS: SectionInfo[] = [
  { key: 'basic', label: 'Basic Info', color: '#9B2F6A', icon: 'FileText' },
  { key: 'governance', label: 'Governance', color: '#6F47D0', icon: 'Users' },
  { key: 'metrics', label: 'Metrics', color: '#00A1E0', icon: 'Activity' },
  { key: 'financial', label: 'Financial', color: '#10B981', icon: 'DollarSign' },
  { key: 'performance', label: 'Performance', color: '#6F47D0', icon: 'Target' },
  { key: 'projections', label: 'Projections', color: '#F58025', icon: 'TrendingUp' },
  { key: 'story', label: 'Story', color: '#9B2F6A', icon: 'Award' },
];

export const getCompletionColor = (percentage: number): string => {
  if (percentage === 100) return '#10B981';
  if (percentage >= 70) return '#00A1E0';
  if (percentage >= 40) return '#F58025';
  return '#9CA3AF';
};

export const getCompletionLabel = (percentage: number): string => {
  if (percentage === 100) return 'Complete';
  if (percentage >= 70) return 'Nearly Complete';
  if (percentage >= 40) return 'In Progress';
  if (percentage > 0) return 'Started';
  return 'Not Started';
};

export const getSectionStatusColor = (isComplete: boolean): string => {
  return isComplete ? '#10B981' : '#F59E0B';
};

export const getSectionStatusLabel = (isComplete: boolean): string => {
  return isComplete ? 'Complete' : 'Incomplete';
};

export const getIncompleteSections = (completionStatus: CompletionStatus): string[] => {
  return SECTIONS
    .filter(section => !completionStatus[section.key])
    .map(section => section.label);
};

export const getCompletedSectionsCount = (completionStatus: CompletionStatus): number => {
  return Object.values(completionStatus).filter(Boolean).length;
};

export const getTotalSectionsCount = (): number => {
  return SECTIONS.length;
};
