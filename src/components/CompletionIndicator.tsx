import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { CompletionStatus } from '../lib/supabase';
import {
  SECTIONS,
  getCompletionColor,
  getCompletionLabel,
  getSectionStatusColor
} from '../lib/completionUtils';

interface CompletionIndicatorProps {
  completionStatus: CompletionStatus;
  completionPercentage: number;
  variant?: 'compact' | 'full' | 'badge';
  showSections?: boolean;
}

export const CompletionIndicator = ({
  completionStatus,
  completionPercentage,
  variant = 'compact',
  showSections = false
}: CompletionIndicatorProps) => {

  if (variant === 'badge') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold"
        style={{
          backgroundColor: `${getCompletionColor(completionPercentage)}15`,
          color: getCompletionColor(completionPercentage)
        }}
      >
        {completionPercentage === 100 ? (
          <CheckCircle className="w-3 h-3" />
        ) : completionPercentage > 0 ? (
          <AlertCircle className="w-3 h-3" />
        ) : (
          <Circle className="w-3 h-3" />
        )}
        {Math.round(completionPercentage)}%
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: getCompletionColor(completionPercentage)
            }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600 min-w-[45px] text-right">
          {Math.round(completionPercentage)}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-700">
            Completion Status
          </div>
          <div
            className="text-xs font-medium mt-0.5"
            style={{ color: getCompletionColor(completionPercentage) }}
          >
            {getCompletionLabel(completionPercentage)}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-bold"
            style={{ color: getCompletionColor(completionPercentage) }}
          >
            {Math.round(completionPercentage)}%
          </div>
          <div className="text-xs text-gray-500">
            {Object.values(completionStatus).filter(Boolean).length} of {SECTIONS.length}
          </div>
        </div>
      </div>

      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${completionPercentage}%`,
            backgroundColor: getCompletionColor(completionPercentage)
          }}
        />
      </div>

      {showSections && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          {SECTIONS.map((section) => {
            const isComplete = completionStatus[section.key];
            return (
              <div
                key={section.key}
                className="flex items-center gap-2 p-2 rounded text-xs"
                style={{
                  backgroundColor: isComplete ? '#10B98110' : '#F59E0B10',
                  borderLeft: `3px solid ${isComplete ? '#10B981' : '#F59E0B'}`
                }}
              >
                {isComplete ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                )}
                <span className={`font-medium ${isComplete ? 'text-green-700' : 'text-orange-700'}`}>
                  {section.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
