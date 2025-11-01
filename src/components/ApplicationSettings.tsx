import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

interface AppConfig {
  id: string;
  key: string;
  value: string;
  category: string;
  label: string;
  description: string | null;
  value_type: 'text' | 'number' | 'boolean' | 'color' | 'json';
  default_value: string | null;
  is_editable: boolean;
  display_order: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ApplicationSettings() {
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [editedValues, setEditedValues] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('application_config')
        .select('*')
        .eq('is_editable', true)
        .order('category, display_order');

      if (error) throw error;

      // Filter out capacity threshold configs (managed in Capacity Thresholds tab)
      const filteredData = (data || []).filter(
        config => !config.key.startsWith('capacity_')
      );

      setConfigs(filteredData);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    const updated = new Map(editedValues);
    updated.set(key, value);
    setEditedValues(updated);
  };

  const getDisplayValue = (config: AppConfig): string => {
    return editedValues.has(config.key) ? editedValues.get(config.key)! : config.value;
  };

  const hasChanges = editedValues.size > 0;

  const handleSave = async () => {
    if (!hasChanges) return;

    if (!confirm(`Save ${editedValues.size} configuration change(s)?`)) return;

    setSaving(true);
    try {
      for (const [key, value] of editedValues.entries()) {
        const { error } = await supabase
          .from('application_config')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);

        if (error) throw error;
      }

      await loadConfigs();
      setEditedValues(new Map());
      alert('✅ Configuration saved successfully!\n\nNote: Some changes may require a page refresh to take effect.');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('❌ Error saving configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (config: AppConfig) => {
    if (!config.default_value) return;
    if (!confirm(`Reset "${config.label}" to default value?\n\nDefault: ${config.default_value}`)) return;

    handleValueChange(config.key, config.default_value);
  };

  const handleDiscardChanges = () => {
    if (!hasChanges) return;
    if (!confirm('Discard all unsaved changes?')) return;
    setEditedValues(new Map());
  };

  // Group configs by category
  const configsByCategory = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, AppConfig[]>);

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      branding: 'Branding & Identity',
      labels: 'View Labels & Terminology',
      capacity: 'Capacity Thresholds',
    };
    return labels[category] || category;
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-brand" />
          <h3 className="text-xl font-bold text-gray-900">Application Settings</h3>
        </div>
        <p className="text-gray-600">
          Configure application-wide settings including banner titles, view labels, and system parameters.
        </p>
      </div>

      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-semibold text-yellow-900">⚠️ Unsaved Changes</div>
              <div className="text-sm text-yellow-800 mt-1">
                You have {editedValues.size} unsaved change(s). Click "Save All Changes" to apply them.
              </div>
            </div>
            <button
              onClick={handleDiscardChanges}
              className="text-yellow-600 hover:text-yellow-800"
              title="Discard changes"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
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
          {saving ? 'Saving...' : `Save All Changes (${editedValues.size})`}
        </button>
        {hasChanges && (
          <button
            onClick={handleDiscardChanges}
            className="px-4 py-2 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Discard Changes
          </button>
        )}
      </div>

      {/* Configuration Sections */}
      {Object.entries(configsByCategory).map(([category, categoryConfigs]) => (
        <div key={category} className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
            {getCategoryLabel(category)}
          </h4>

          <div className="space-y-4">
            {categoryConfigs.map((config) => {
              const isChanged = editedValues.has(config.key);
              return (
                <div
                  key={config.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isChanged ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-900 mb-1">
                        {config.label}
                        {isChanged && (
                          <span className="ml-2 text-xs font-normal text-yellow-700">(modified)</span>
                        )}
                      </label>
                      {config.description && (
                        <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                      )}

                      {/* Input Field */}
                      {config.value_type === 'text' && (
                        <input
                          type="text"
                          value={getDisplayValue(config)}
                          onChange={(e) => handleValueChange(config.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                          placeholder={config.default_value || ''}
                        />
                      )}

                      {config.value_type === 'number' && (
                        <input
                          type="number"
                          value={getDisplayValue(config)}
                          onChange={(e) => handleValueChange(config.key, e.target.value)}
                          className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                          placeholder={config.default_value || ''}
                        />
                      )}

                      {config.value_type === 'color' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={getDisplayValue(config)}
                            onChange={(e) => handleValueChange(config.key, e.target.value)}
                            className="w-16 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={getDisplayValue(config)}
                            onChange={(e) => handleValueChange(config.key, e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            placeholder="#000000"
                          />
                        </div>
                      )}

                      {config.value_type === 'boolean' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getDisplayValue(config) === 'true'}
                            onChange={(e) => handleValueChange(config.key, e.target.checked ? 'true' : 'false')}
                            className="w-5 h-5 rounded border-gray-300 text-brand focus:ring-brand"
                          />
                          <span className="text-sm text-gray-700">Enabled</span>
                        </label>
                      )}
                    </div>

                    {/* Reset Button */}
                    {config.default_value && (
                      <button
                        onClick={() => handleReset(config)}
                        className="text-gray-600 hover:text-gray-800 p-2"
                        title="Reset to default"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Show default value */}
                  {config.default_value && getDisplayValue(config) !== config.default_value && (
                    <div className="mt-2 text-xs text-gray-500">
                      Default: <span className="font-mono">{config.default_value}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-900">
          <strong>Note:</strong> Some configuration changes (like banner title or view labels) may require refreshing the page to take full effect across all views.
        </div>
      </div>
    </div>
  );
}
