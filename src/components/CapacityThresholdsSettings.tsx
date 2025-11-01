import { useState, useEffect } from 'react';
import { AlertCircle, Edit3, X, Plus, Trash2, Save, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearCapacityThresholdsCache } from '../lib/useCapacityThresholds';

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'view' | 'draft';

interface CapacityThreshold {
  id: string;
  label: string;
  min_percentage: number;
  max_percentage: number;
  color: string;
  color_name: string | null;
  emoji: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type DraftChanges = Map<string, Partial<CapacityThreshold>>;

// Predefined color palette with names
const COLOR_PALETTE = [
  { hex: '#22c55e', name: 'Green', emoji: '🟢' },
  { hex: '#84cc16', name: 'Lime Green', emoji: '🟢' },
  { hex: '#eab308', name: 'Yellow', emoji: '🟡' },
  { hex: '#f59e0b', name: 'Yellow-Orange', emoji: '🟠' },
  { hex: '#f97316', name: 'Orange', emoji: '🟠' },
  { hex: '#dc2626', name: 'Red', emoji: '🔴' },
  { hex: '#c026d3', name: 'Red-Purple', emoji: '🟣' },
  { hex: '#9333ea', name: 'Purple', emoji: '🟣' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CapacityThresholdsSettings() {
  const [mode, setMode] = useState<ViewMode>('view');
  const [thresholds, setThresholds] = useState<CapacityThreshold[]>([]);
  const [draftChanges, setDraftChanges] = useState<DraftChanges>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('capacity_thresholds')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setThresholds(data || []);
    } catch (error) {
      console.error('Error loading capacity thresholds:', error);
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // DRAFT MODE HANDLERS
  // =============================================================================

  const handleEnterDraftMode = () => {
    setMode('draft');
    setDraftChanges(new Map());
  };

  const handleDiscardDraft = () => {
    if (draftChanges.size > 0) {
      if (!confirm('Discard all unsaved changes?')) return;
    }
    setMode('view');
    setDraftChanges(new Map());
  };

  const handleResetDraft = () => {
    if (!confirm('Reset all changes in this draft?')) return;
    setDraftChanges(new Map());
  };

  const handleDraftChange = (id: string, field: keyof CapacityThreshold, value: any) => {
    const updated = new Map(draftChanges);
    const existing = updated.get(id) || {};
    updated.set(id, { ...existing, [field]: value });
    setDraftChanges(updated);
  };

  const getDisplayValue = <K extends keyof CapacityThreshold>(
    threshold: CapacityThreshold,
    field: K
  ): CapacityThreshold[K] => {
    const draft = draftChanges.get(threshold.id);
    if (draft && field in draft) {
      return draft[field] as CapacityThreshold[K];
    }
    return threshold[field];
  };

  const hasChanges = draftChanges.size > 0;

  // =============================================================================
  // VALIDATION
  // =============================================================================

  const validateThresholds = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const workingThresholds = thresholds.map(t => ({
      ...t,
      ...(draftChanges.get(t.id) || {})
    })).filter(t => t.is_active !== false);

    // Sort by display order
    workingThresholds.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    // Check for gaps or overlaps
    for (let i = 0; i < workingThresholds.length - 1; i++) {
      const current = workingThresholds[i];
      const next = workingThresholds[i + 1];

      if (current.max_percentage !== next.min_percentage) {
        errors.push(`Gap/overlap between "${current.label}" (${current.min_percentage}-${current.max_percentage}%) and "${next.label}" (${next.min_percentage}-${next.max_percentage}%)`);
      }
    }

    // Check that first threshold starts at 0
    if (workingThresholds.length > 0 && workingThresholds[0].min_percentage !== 0) {
      errors.push('First threshold must start at 0%');
    }

    // Check for min < max
    workingThresholds.forEach(t => {
      if (t.min_percentage >= t.max_percentage) {
        errors.push(`"${t.label}": min_percentage must be less than max_percentage`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  // =============================================================================
  // SAVE HANDLER
  // =============================================================================

  const handleSave = async () => {
    if (!hasChanges) {
      setMode('view');
      return;
    }

    // Validate
    const validation = validateThresholds();
    if (!validation.valid) {
      alert('❌ Validation Error:\n\n' + validation.errors.join('\n\n'));
      return;
    }

    const changedCount = draftChanges.size;
    if (!confirm(`Save ${changedCount} threshold change(s)?\n\n⚠️ This will affect capacity color coding throughout the application.`)) return;

    setSaving(true);
    try {
      for (const [id, changes] of draftChanges.entries()) {
        const { error } = await supabase
          .from('capacity_thresholds')
          .update({
            ...changes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
      }

      // Clear cache to force reload
      clearCapacityThresholdsCache();

      await loadThresholds();
      setDraftChanges(new Map());
      setMode('view');
      alert('✅ Successfully saved threshold changes!\n\nCapacity colors will update across all views.\n\n💡 Tip: Refresh the page to see changes reflected immediately.');
    } catch (error) {
      console.error('Error saving thresholds:', error);
      alert('❌ Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // =============================================================================
  // ADD NEW THRESHOLD
  // =============================================================================

  const handleAddThreshold = async () => {
    const label = prompt('Enter label for new threshold (e.g., "Moderate Capacity"):');
    if (!label || !label.trim()) return;

    const minPct = prompt('Enter minimum percentage (0-100):', '0');
    if (!minPct) return;
    const min = parseInt(minPct);
    if (isNaN(min) || min < 0 || min > 100) {
      alert('Invalid minimum percentage');
      return;
    }

    const maxPct = prompt('Enter maximum percentage (0-100):', '100');
    if (!maxPct) return;
    const max = parseInt(maxPct);
    if (isNaN(max) || max < 0 || max > 200) {
      alert('Invalid maximum percentage');
      return;
    }

    if (min >= max) {
      alert('Minimum must be less than maximum');
      return;
    }

    try {
      const newThreshold = {
        label: label.trim(),
        min_percentage: min,
        max_percentage: max,
        color: '#84cc16', // Default lime green
        color_name: 'Lime Green',
        emoji: '🟢',
        display_order: thresholds.length + 1,
        is_active: true,
      };

      const { error } = await supabase
        .from('capacity_thresholds')
        .insert(newThreshold);

      if (error) throw error;

      await loadThresholds();
      alert('✅ New threshold added! Remember to adjust ranges to avoid gaps.');
    } catch (error) {
      console.error('Error adding threshold:', error);
      alert('❌ Error adding threshold. Please try again.');
    }
  };

  // =============================================================================
  // DELETE THRESHOLD
  // =============================================================================

  const handleDeleteThreshold = async (threshold: CapacityThreshold) => {
    if (thresholds.filter(t => t.is_active).length <= 1) {
      alert('❌ Cannot delete the last threshold. You must have at least one active threshold.');
      return;
    }

    if (!confirm(`Delete "${threshold.label}"?\n\nThis will affect capacity calculations.`)) return;

    try {
      const { error } = await supabase
        .from('capacity_thresholds')
        .delete()
        .eq('id', threshold.id);

      if (error) throw error;
      await loadThresholds();
      alert('✅ Threshold deleted successfully.');
    } catch (error) {
      console.error('Error deleting threshold:', error);
      alert('❌ Error deleting threshold.');
    }
  };

  // =============================================================================
  // COLOR HELPERS
  // =============================================================================

  const getColorName = (hex: string): string => {
    const match = COLOR_PALETTE.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    return match?.name || 'Custom';
  };

  const getEmojiForColor = (hex: string): string => {
    const match = COLOR_PALETTE.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    return match?.emoji || '⚪';
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-brand" />
          <h3 className="text-xl font-bold text-gray-900">Capacity Thresholds</h3>
        </div>
        <p className="text-gray-600">
          Configure capacity percentage ranges and their associated colors. These thresholds determine how capacity is visualized across the application.
        </p>
      </div>

      {/* Draft Mode Banner */}
      {mode === 'draft' && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-900">⚠️ Draft Mode Active</div>
                <div className="text-sm text-yellow-800 mt-1">
                  You are editing capacity thresholds. Changes are NOT saved to the database yet.
                </div>
                {hasChanges && (
                  <div className="mt-3 text-sm text-yellow-900">
                    <strong>Impact Preview:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>{draftChanges.size} threshold(s) modified</li>
                      <li>Capacity color coding will update across all views</li>
                      <li>Team capacity cards, effort tracking, and dashboards will reflect new colors</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDiscardDraft}
              className="text-yellow-600 hover:text-yellow-800 flex-shrink-0"
              title="Discard and exit"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                hasChanges && !saving
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : `Save & Apply (${draftChanges.size})`}
            </button>
            <button
              onClick={handleResetDraft}
              disabled={!hasChanges}
              className="px-4 py-2 rounded-lg font-semibold bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Draft
            </button>
            <button
              onClick={handleDiscardDraft}
              className="px-4 py-2 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Discard & Exit
            </button>
          </div>
        </div>
      )}

      {/* View Mode Header */}
      {mode === 'view' && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {thresholds.filter(t => t.is_active).length} active threshold(s)
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddThreshold}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Threshold
            </button>
            <button
              onClick={handleEnterDraftMode}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark flex items-center gap-2 font-semibold"
            >
              <Edit3 className="w-4 h-4" />
              Enter Draft Mode
            </button>
          </div>
        </div>
      )}

      {/* Visual Preview */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Visual Preview (0% - 120%)</h4>
        <div className="relative h-12 border rounded-lg overflow-hidden flex">
          {thresholds
            .filter(t => getDisplayValue(t, 'is_active'))
            .sort((a, b) => getDisplayValue(a, 'display_order') - getDisplayValue(b, 'display_order'))
            .map((threshold) => {
              const min = getDisplayValue(threshold, 'min_percentage');
              const max = getDisplayValue(threshold, 'max_percentage');
              const width = Math.min(max, 120) - min;
              const left = min;
              const color = getDisplayValue(threshold, 'color');

              return (
                <div
                  key={threshold.id}
                  className="absolute h-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{
                    left: `${(left / 120) * 100}%`,
                    width: `${(width / 120) * 100}%`,
                    backgroundColor: color,
                  }}
                  title={`${min}% - ${max}%: ${getDisplayValue(threshold, 'label')}`}
                >
                  <span className="truncate px-1">{min}%-{max}%</span>
                </div>
              );
            })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>30%</span>
          <span>60%</span>
          <span>90%</span>
          <span>120%</span>
        </div>
      </div>

      {/* Thresholds Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading thresholds...</div>
      ) : thresholds.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No thresholds configured.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Range (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Color</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Emoji</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Active</th>
                  {mode === 'view' && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {thresholds.map((threshold) => {
                  const isChanged = draftChanges.has(threshold.id);
                  return (
                    <tr key={threshold.id} className={isChanged ? 'bg-yellow-50' : ''}>
                      {/* Display Order */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="number"
                            value={getDisplayValue(threshold, 'display_order')}
                            onChange={(e) => handleDraftChange(threshold.id, 'display_order', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border rounded"
                            min="1"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{threshold.display_order}</span>
                        )}
                      </td>

                      {/* Label */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="text"
                            value={getDisplayValue(threshold, 'label')}
                            onChange={(e) => handleDraftChange(threshold.id, 'label', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{threshold.label}</span>
                        )}
                      </td>

                      {/* Range */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={getDisplayValue(threshold, 'min_percentage')}
                              onChange={(e) => handleDraftChange(threshold.id, 'min_percentage', parseInt(e.target.value))}
                              className="w-16 px-2 py-1 border rounded"
                              min="0"
                              max="100"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={getDisplayValue(threshold, 'max_percentage')}
                              onChange={(e) => handleDraftChange(threshold.id, 'max_percentage', parseInt(e.target.value))}
                              className="w-16 px-2 py-1 border rounded"
                              min="0"
                              max="200"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {threshold.min_percentage}% - {threshold.max_percentage}%
                          </span>
                        )}
                      </td>

                      {/* Color */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={getDisplayValue(threshold, 'color')}
                                onChange={(e) => {
                                  handleDraftChange(threshold.id, 'color', e.target.value);
                                  handleDraftChange(threshold.id, 'color_name', getColorName(e.target.value));
                                  handleDraftChange(threshold.id, 'emoji', getEmojiForColor(e.target.value));
                                }}
                                className="w-12 h-8 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={getDisplayValue(threshold, 'color')}
                                onChange={(e) => handleDraftChange(threshold.id, 'color', e.target.value)}
                                className="w-24 px-2 py-1 border rounded font-mono text-xs"
                              />
                            </div>
                            {/* Color palette quick select */}
                            <div className="flex gap-1">
                              {COLOR_PALETTE.map((c) => (
                                <button
                                  key={c.hex}
                                  onClick={() => {
                                    handleDraftChange(threshold.id, 'color', c.hex);
                                    handleDraftChange(threshold.id, 'color_name', c.name);
                                    handleDraftChange(threshold.id, 'emoji', c.emoji);
                                  }}
                                  className="w-6 h-6 rounded border-2 hover:border-gray-400"
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: threshold.color }}
                            />
                            <div>
                              <div className="text-xs font-mono text-gray-600">{threshold.color}</div>
                              <div className="text-xs text-gray-500">{threshold.color_name}</div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Emoji */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="text"
                            value={getDisplayValue(threshold, 'emoji') || ''}
                            onChange={(e) => handleDraftChange(threshold.id, 'emoji', e.target.value)}
                            className="w-12 px-2 py-1 border rounded text-center"
                            maxLength={2}
                          />
                        ) : (
                          <span className="text-xl">{threshold.emoji || '-'}</span>
                        )}
                      </td>

                      {/* Is Active */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="checkbox"
                            checked={getDisplayValue(threshold, 'is_active')}
                            onChange={(e) => handleDraftChange(threshold.id, 'is_active', e.target.checked)}
                            className="w-4 h-4"
                          />
                        ) : (
                          <span className={`text-sm font-semibold ${threshold.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {threshold.is_active ? '✓ Yes' : '✗ No'}
                          </span>
                        )}
                      </td>

                      {/* Actions (view mode only) */}
                      {mode === 'view' && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteThreshold(threshold)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete threshold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-900 space-y-2">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Thresholds should cover 0% to at least 100% with no gaps</li>
            <li>Use ascending display_order to define evaluation sequence</li>
            <li>Choose colors that provide clear visual distinction</li>
            <li>The first threshold's min should be 0%, last threshold's max can exceed 100%</li>
            <li>Changes affect: Team Capacity Cards, Effort Entry, Workload Dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
