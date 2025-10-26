import { useState, useEffect } from 'react';
import { Save, RotateCcw, Settings, Info, TrendingUp, AlertCircle, Eye, Edit3, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadCalculatorConfig, clearConfigCache } from '../lib/workloadCalculator';

interface ConfigItem {
  id: string;
  config_type: string;
  key: string;
  value: number;
  label: string;
  display_order: number;
  is_active: boolean;
}

// FIXED: Changed from plural to singular to match database
type TabView = 'effort_size' | 'role_weight' | 'work_type_weight' | 'phase_weight' | 'capacity_threshold';

type ViewMode = 'view' | 'draft';

export function WorkloadCalculatorSettings() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('effort_size'); // FIXED: singular
  const [mode, setMode] = useState<ViewMode>('view');
  const [draftValues, setDraftValues] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      console.log('🔍 [Calculator] Loading configuration...');

      const { data, error } = await supabase
        .from('workload_calculator_config')
        .select('*')
        .order('config_type', { ascending: true })
        .order('display_order', { ascending: true });

      console.log('📊 [Calculator] Data received:', data?.length || 0, 'items');
      console.log('❌ [Calculator] Error:', error);

      if (error) throw error;
      setConfig(data || []);

      console.log('✅ [Calculator] Config loaded successfully');
    } catch (err) {
      console.error('❌ [Calculator] Error loading config:', err);
      alert('Failed to load calculator configuration. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDraftChange = (id: string, newValue: string) => {
    const numValue = parseFloat(newValue);
    if (isNaN(numValue) || numValue < 0) return;

    const updated = new Map(draftValues);
    updated.set(id, numValue);
    setDraftValues(updated);
  };

  const getDisplayValue = (item: ConfigItem): number => {
    return draftValues.has(item.id) ? draftValues.get(item.id)! : parseFloat(item.value?.toString() || '0');
  };

  const hasChanges = draftValues.size > 0;

  const handleEnterDraftMode = () => {
    setMode('draft');
    setDraftValues(new Map());
  };

  const handleDiscardDraft = () => {
    if (draftValues.size > 0) {
      if (!confirm('Discard all draft changes?')) return;
    }
    setMode('view');
    setDraftValues(new Map());
  };

  const handleSaveDraft = async () => {
    if (!hasChanges) {
      setMode('view');
      return;
    }

    if (!confirm(`Save ${draftValues.size} weight change(s)?\n\nThis will affect capacity calculations for all team members.`)) {
      return;
    }

    try {
      setSaving(true);

      // Update all changed values
      const updates = Array.from(draftValues.entries()).map(([id, value]) => ({
        id,
        value,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('workload_calculator_config')
          .update({ value: update.value, updated_at: update.updated_at })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Clear cache to force reload
      clearConfigCache();

      // Reload config
      await loadConfig();

      // Exit draft mode
      setDraftValues(new Map());
      setMode('view');

      alert('✅ Configuration saved successfully!\n\nAll capacity calculations will now use the new weights.');
    } catch (err) {
      console.error('Error saving config:', err);
      alert('❌ Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (!confirm('Reset all weights to defaults?\n\nThis will discard your current draft.')) return;
    setDraftValues(new Map());
  };

  const filteredConfig = config.filter(item => item.config_type === activeTab);

  // Calculate impact preview
  const affectedCount = draftValues.size;
  const changedItems = Array.from(draftValues.keys())
    .map(id => config.find(c => c.id === id))
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading SCI Capacity Definition Calculator...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#9B2F6A] text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-6 h-6" />
              <h2 className="text-2xl font-bold">SCI Capacity Definition Calculator</h2>
            </div>
            <p className="text-white/80 text-sm">
              Configure weights and thresholds for System Clinical Informatics capacity calculations
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <button
                onClick={handleEnterDraftMode}
                className="px-4 py-2 bg-white text-[#9B2F6A] rounded-lg hover:bg-pink-50 transition-colors flex items-center gap-2 font-semibold"
              >
                <Edit3 className="w-4 h-4" />
                Enter Draft Mode
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white/90 text-sm font-medium flex items-center gap-1">
                  <Edit3 className="w-4 h-4" />
                  Draft Mode Active
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {config.length > 0 && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs font-mono text-gray-600">
          <strong>Debug:</strong> Loaded {config.length} config items |
          Active Tab: {activeTab} |
          Filtered: {filteredConfig.length} items |
          Mode: {mode === 'view' ? '👁️ View' : '✏️ Draft'} |
          Draft Changes: {draftValues.size}
        </div>
      )}

      {/* Draft Mode Banner */}
      {mode === 'draft' && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-900 mb-1">⚠️ Draft Mode Active</div>
                <div className="text-sm text-yellow-800">
                  You are editing weights. Changes are NOT saved to the database yet.
                </div>
                {affectedCount > 0 && (
                  <div className="mt-2 text-sm text-yellow-900">
                    <strong>Impact Preview:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>{affectedCount} weight{affectedCount !== 1 ? 's' : ''} modified</li>
                      <li>Changes: {changedItems.map(item => `${item?.key}`).join(', ')}</li>
                      <li>All team member capacities will be recalculated</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDiscardDraft}
              className="text-yellow-600 hover:text-yellow-800 p-1"
              title="Exit Draft Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving || !hasChanges}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : `💾 Save & Apply${hasChanges ? ` (${affectedCount})` : ''}`}
            </button>
            <button
              onClick={handleResetToDefaults}
              disabled={!hasChanges}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Draft
            </button>
            <button
              onClick={handleDiscardDraft}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Discard & Exit
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-900">
          <div className="font-semibold mb-1">How it works:</div>
          <div className="space-y-1 text-gray-700">
            <div>• <strong>Formula:</strong> Active Hours = Base Hours × Role Weight × Type Weight × Phase Weight</div>
            <div>• <strong>Governance Exception:</strong> Uses direct hours per week (no formula weights)</div>
            <div>• <strong>Draft Mode:</strong> Test changes safely before applying them system-wide</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - FIXED: All singular names */}
      <div className="bg-white border rounded-lg">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('effort_size')}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'effort_size'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            📊 Effort Sizes
          </button>
          <button
            onClick={() => setActiveTab('role_weight')}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'role_weight'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            👤 Role Weights
          </button>
          <button
            onClick={() => setActiveTab('work_type_weight')}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'work_type_weight'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            💼 Work Types
          </button>
          <button
            onClick={() => setActiveTab('phase_weight')}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'phase_weight'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            🔄 Phase Weights
          </button>
          <button
            onClick={() => setActiveTab('capacity_threshold')}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'capacity_threshold'
                ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            📈 Capacity Thresholds
          </button>
        </div>

        {/* Table Content - FIXED: All singular checks */}
        <div className="p-6">
          {filteredConfig.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-semibold text-gray-900 mb-2">No data found for this tab</div>
              <div className="text-sm text-gray-600">
                Expected config_type: <code className="bg-gray-100 px-2 py-1 rounded">{activeTab}</code>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Loaded {config.length} total items from database
              </div>
              <button
                onClick={loadConfig}
                className="mt-4 px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8B2858]"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'effort_size' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Effort Sizes (Base Hours/Week)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Base hours per week for each work effort size. These are the starting point before applying role, type, and phase multipliers.
                  </p>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hours/Week</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredConfig.map((item) => (
                        <tr key={item.id} className={draftValues.has(item.id) ? 'bg-yellow-50' : ''}>
                          <td className="px-4 py-3 font-medium text-gray-900">{item.key}</td>
                          <td className="px-4 py-3">
                            {mode === 'draft' ? (
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="40"
                                value={getDisplayValue(item)}
                                onChange={(e) => handleDraftChange(item.id, e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="text-gray-700">{getDisplayValue(item).toFixed(1)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'role_weight' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Role Weights (Responsibility Multiplier)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Multiplier based on level of responsibility. Owner has full weight, Support has reduced weight.
                  </p>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredConfig.map((item) => (
                        <tr key={item.id} className={draftValues.has(item.id) ? 'bg-yellow-50' : ''}>
                          <td className="px-4 py-3 font-medium text-gray-900">{item.key}</td>
                          <td className="px-4 py-3">
                            {mode === 'draft' ? (
                              <input
                                type="number"
                                step="0.25"
                                min="0"
                                max="2"
                                value={getDisplayValue(item)}
                                onChange={(e) => handleDraftChange(item.id, e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="text-gray-700">{getDisplayValue(item).toFixed(2)}x</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'work_type_weight' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Type Weights (Complexity Multiplier)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Multiplier based on work complexity and intensity. Governance uses direct hours (weight = 0).
                  </p>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Work Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredConfig.map((item) => (
                        <tr key={item.id} className={draftValues.has(item.id) ? 'bg-yellow-50' : item.key === 'Governance' ? 'bg-purple-50' : ''}>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.key}
                            {item.key === 'Governance' && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                Special
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {item.key === 'Governance' ? (
                              <span className="text-sm text-gray-500 italic">Uses direct hours</span>
                            ) : mode === 'draft' ? (
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="2"
                                value={getDisplayValue(item)}
                                onChange={(e) => handleDraftChange(item.id, e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="text-gray-700">{getDisplayValue(item).toFixed(2)}x</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'phase_weight' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Phase Weights (Lifecycle Intensity Multiplier)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Multiplier based on project phase intensity. Discovery is low intensity, Build/Design are high intensity.
                  </p>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phase</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredConfig.map((item) => (
                        <tr key={item.id} className={draftValues.has(item.id) ? 'bg-yellow-50' : ''}>
                          <td className="px-4 py-3 font-medium text-gray-900">{item.key}</td>
                          <td className="px-4 py-3">
                            {mode === 'draft' ? (
                              <input
                                type="number"
                                step="0.05"
                                min="0"
                                max="2"
                                value={getDisplayValue(item)}
                                onChange={(e) => handleDraftChange(item.id, e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="text-gray-700">{getDisplayValue(item).toFixed(2)}x</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'capacity_threshold' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Capacity Utilization Thresholds</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Define the utilization percentages for capacity status indicators. Values are minimums for each status.
                  </p>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Threshold (%)</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Indicator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredConfig.map((item) => {
                        const emoji = item.key === 'over' ? '🔴' : item.key === 'at' ? '🟠' : item.key === 'near' ? '🟡' : '🟢';
                        return (
                          <tr key={item.id} className={draftValues.has(item.id) ? 'bg-yellow-50' : ''}>
                            <td className="px-4 py-3 font-medium text-gray-900 capitalize">{item.key}</td>
                            <td className="px-4 py-3">
                              {mode === 'draft' ? (
                                <>
                                  <input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={getDisplayValue(item)}
                                    onChange={(e) => handleDraftChange(item.id, e.target.value)}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                  <span className="ml-2 text-sm text-gray-600">
                                    ({(getDisplayValue(item) * 100).toFixed(0)}%)
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-700">
                                  {getDisplayValue(item).toFixed(2)} ({(getDisplayValue(item) * 100).toFixed(0)}%)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.label}</td>
                            <td className="px-4 py-3 text-2xl">{emoji}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Help Text */}
      {mode === 'view' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <div className="font-semibold mb-2">About this Configuration:</div>
              <ul className="space-y-1 text-gray-600">
                <li>• These weights define how workload is calculated for System Clinical Informatics</li>
                <li>• Click <strong>"Enter Draft Mode"</strong> to test weight changes safely</li>
                <li>• Changes only apply after you save in draft mode</li>
                <li>• This is designed for iterative refinement as you learn what works best</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
