import { useState, useEffect } from 'react';
import { X, Clock, Calendar, TrendingUp } from 'lucide-react';
import { supabase, EFFORT_SIZES, EffortLog, EffortSize, Initiative } from '../lib/supabase';
import { getWeekStartDate, formatWeekRange, getEffortSizeFromHours } from '../lib/effortUtils';

interface EffortLogModalProps {
  initiative: Initiative;
  teamMemberId: string;
  existingLog?: EffortLog;
  onClose: () => void;
  onSave: () => void;
}

export default function EffortLogModal({
  initiative,
  teamMemberId,
  existingLog,
  onClose,
  onSave,
}: EffortLogModalProps) {
  const currentWeek = getWeekStartDate();
  const [weekStartDate, setWeekStartDate] = useState(existingLog?.week_start_date || currentWeek);
  const [selectedSize, setSelectedSize] = useState<EffortSize>(existingLog?.effort_size || 'M');
  const [customHours, setCustomHours] = useState<string>(
    existingLog?.hours_spent.toString() || ''
  );
  const [note, setNote] = useState(existingLog?.note || '');
  const [useCustomHours, setUseCustomHours] = useState(
    existingLog ? !EFFORT_SIZES.some(e => e.hours === existingLog.hours_spent) : false
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selected size when custom hours change
  useEffect(() => {
    if (useCustomHours && customHours) {
      const hours = parseFloat(customHours);
      if (!isNaN(hours) && hours > 0) {
        setSelectedSize(getEffortSizeFromHours(hours));
      }
    }
  }, [customHours, useCustomHours]);

  const getHoursToSave = (): number => {
    if (useCustomHours) {
      const hours = parseFloat(customHours);
      return isNaN(hours) ? 0 : hours;
    }
    const sizeDetails = EFFORT_SIZES.find(e => e.size === selectedSize);
    return sizeDetails?.hours || 0;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const hours = getHoursToSave();

      if (hours <= 0) {
        setError('Please enter valid hours greater than 0');
        return;
      }

      if (hours > 168) {
        setError('Hours cannot exceed 168 (hours in a week)');
        return;
      }

      const logData = {
        initiative_id: initiative.id,
        team_member_id: teamMemberId,
        week_start_date: weekStartDate,
        hours_spent: hours,
        effort_size: selectedSize,
        note: note.trim() || null,
      };

      if (existingLog) {
        // Update existing log
        const { error: updateError } = await supabase
          .from('effort_logs')
          .update(logData)
          .eq('id', existingLog.id);

        if (updateError) throw updateError;
      } else {
        // Insert new log
        const { error: insertError } = await supabase
          .from('effort_logs')
          .insert([logData]);

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving effort log:', err);
      setError(err instanceof Error ? err.message : 'Failed to save effort log');
    } finally {
      setSaving(false);
    }
  };

  const hours = getHoursToSave();
  const selectedSizeDetails = EFFORT_SIZES.find(e => e.size === selectedSize);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Log Effort</h2>
            <p className="text-sm text-gray-600 mt-1">{initiative.initiative_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Week Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Week Starting
            </label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatWeekRange(weekStartDate)}
            </p>
          </div>

          {/* Effort Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-1" />
              Effort Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EFFORT_SIZES.map((size) => (
                <button
                  key={size.size}
                  onClick={() => {
                    setSelectedSize(size.size);
                    setUseCustomHours(false);
                    setCustomHours('');
                  }}
                  disabled={useCustomHours}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedSize === size.size && !useCustomHours
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${useCustomHours ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    borderColor:
                      selectedSize === size.size && !useCustomHours ? size.color : undefined,
                  }}
                >
                  <div className="font-semibold text-gray-900">{size.size}</div>
                  <div className="text-sm text-gray-600">{size.hours} hrs</div>
                  <div className="text-xs text-gray-500 mt-1">{size.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Hours */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="useCustomHours"
                checked={useCustomHours}
                onChange={(e) => setUseCustomHours(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="useCustomHours" className="text-sm font-medium text-gray-700">
                Use custom hours
              </label>
            </div>
            {useCustomHours && (
              <input
                type="number"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                placeholder="Enter hours (e.g., 12.5)"
                step="0.5"
                min="0"
                max="168"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Effort Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Weekly Effort</div>
                <div className="text-2xl font-bold text-gray-900">{hours} hours</div>
              </div>
              <div
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: selectedSizeDetails?.color }}
              >
                {selectedSize}
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Sprint planning meetings, Go-live prep, Design phase..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add context about what you worked on this week
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || hours <= 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : existingLog ? 'Update Effort' : 'Log Effort'}
          </button>
        </div>
      </div>
    </div>
  );
}
