import { useState, useEffect } from 'react';
import { AlertCircle, Edit3, X, Plus, Trash2, Save, RefreshCw, Settings, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ApplicationSettings } from './ApplicationSettings';

// =============================================================================
// TYPES
// =============================================================================

type FieldType = 'work_type' | 'role' | 'phase' | 'work_effort' | 'service_line' | 'ehr_platform' | 'status' | 'team_role' | 'groups_impacted' | 'impact_categories';
type ViewMode = 'view' | 'draft';
type SectionView = 'app_settings' | 'field_options';

interface FieldOption {
  id: string;
  field_type: FieldType;
  key: string;
  label: string;
  description: string | null;
  display_order: number;
  primary_color: string | null;
  chart_color: string | null;
  badge_color: string | null;
  background_color: string | null;
  text_color: string | null;
  hover_color: string | null;
  icon: string | null;
  is_active: boolean;
  affects_capacity_calc: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

type DraftChanges = Map<string, Partial<FieldOption>>;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FieldOptionsSettings() {
  const [sectionView, setSectionView] = useState<SectionView>('app_settings');
  const [selectedTab, setSelectedTab] = useState<FieldType>('work_type');
  const [mode, setMode] = useState<ViewMode>('view');
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [draftChanges, setDraftChanges] = useState<DraftChanges>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load options from database
  useEffect(() => {
    loadOptions();
  }, [selectedTab]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('field_options')
        .select('*')
        .eq('field_type', selectedTab)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setOptions(data || []);
    } catch (error) {
      console.error('Error loading field options:', error);
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

  const handleDraftChange = (id: string, field: keyof FieldOption, value: any) => {
    const updated = new Map(draftChanges);
    const existing = updated.get(id) || {};
    updated.set(id, { ...existing, [field]: value });
    setDraftChanges(updated);
  };

  const getDisplayValue = <K extends keyof FieldOption>(
    option: FieldOption,
    field: K
  ): FieldOption[K] => {
    const draft = draftChanges.get(option.id);
    if (draft && field in draft) {
      return draft[field] as FieldOption[K];
    }
    return option[field];
  };

  const hasChanges = draftChanges.size > 0;

  // =============================================================================
  // SAVE HANDLER
  // =============================================================================

  const handleSave = async () => {
    if (!hasChanges) {
      setMode('view');
      return;
    }

    const changedCount = draftChanges.size;
    const affectsCapacity = Array.from(draftChanges.entries()).some(([id]) => {
      const option = options.find(o => o.id === id);
      return option?.affects_capacity_calc;
    });

    let confirmMessage = `Save ${changedCount} change(s) to field options?\n\n`;
    if (affectsCapacity) {
      confirmMessage += '⚠️ WARNING: These changes affect capacity calculations!\n';
      confirmMessage += 'Please review the Calculator Settings tab after saving.\n\n';
    }
    confirmMessage += 'This will update the database and affect dropdown options throughout the application.';

    if (!confirm(confirmMessage)) return;

    setSaving(true);
    try {
      // Update all changed options
      for (const [id, changes] of draftChanges.entries()) {
        const { error } = await supabase
          .from('field_options')
          .update({
            ...changes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
      }

      // Reload options
      await loadOptions();

      // Reset draft state
      setDraftChanges(new Map());
      setMode('view');

      // Show success message
      let message = `✅ Successfully saved ${changedCount} change(s)!`;
      if (affectsCapacity) {
        message += '\n\n⚠️ Reminder: Please review Calculator Settings tab to ensure capacity calculations are correct.';
      }
      alert(message);

    } catch (error) {
      console.error('Error saving field options:', error);
      alert('❌ Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // =============================================================================
  // ADD NEW OPTION
  // =============================================================================

  const handleAddOption = async () => {
    const key = prompt('Enter unique key for new option (e.g., "New Option"):');
    if (!key || !key.trim()) return;

    const label = prompt('Enter display label:', key);
    if (!label || !label.trim()) return;

    try {
      const newOption = {
        field_type: selectedTab,
        key: key.trim(),
        label: label.trim(),
        display_order: options.length + 1,
        is_active: true,
        affects_capacity_calc: ['work_type', 'role', 'phase', 'work_effort'].includes(selectedTab),
      };

      const { error } = await supabase
        .from('field_options')
        .insert(newOption);

      if (error) throw error;

      await loadOptions();
      alert('✅ New option added successfully!');
    } catch (error: any) {
      console.error('Error adding option:', error);
      if (error.code === '23505') {
        alert('❌ Error: An option with this key already exists.');
      } else {
        alert('❌ Error adding option. Please try again.');
      }
    }
  };

  // =============================================================================
  // DELETE OPTION (with safety check)
  // =============================================================================

  const handleDeleteOption = async (option: FieldOption) => {
    // Check if option is in use (query initiatives table)
    const { count, error: countError } = await supabase
      .from('initiatives')
      .select('id', { count: 'exact', head: true })
      .or(`type.eq.${option.key},role.eq.${option.key},phase.eq.${option.key},work_effort.eq.${option.key},service_line.eq.${option.key},ehrs_impacted.eq.${option.key},status.eq.${option.key}`);

    if (countError) {
      console.error('Error checking usage:', countError);
    }

    const usageCount = count || 0;

    if (usageCount > 0) {
      const confirmMsg = `⚠️ WARNING: This option is used by ${usageCount} initiative(s).\n\n` +
        `Recommended: Mark as INACTIVE instead of deleting.\n\n` +
        `Mark as inactive? (Yes = inactive, No = cancel)`;

      if (!confirm(confirmMsg)) return;

      // Soft delete: mark as inactive
      try {
        const { error } = await supabase
          .from('field_options')
          .update({ is_active: false })
          .eq('id', option.id);

        if (error) throw error;
        await loadOptions();
        alert('✅ Option marked as inactive.');
      } catch (error) {
        console.error('Error deactivating option:', error);
        alert('❌ Error updating option.');
      }
      return;
    }

    // No usage - allow hard delete
    if (!confirm(`Delete "${option.label}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('field_options')
        .delete()
        .eq('id', option.id);

      if (error) throw error;
      await loadOptions();
      alert('✅ Option deleted successfully.');
    } catch (error) {
      console.error('Error deleting option:', error);
      alert('❌ Error deleting option.');
    }
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getTabLabel = (fieldType: FieldType): string => {
    const labels: Record<FieldType, string> = {
      work_type: 'Work Types',
      role: 'Roles',
      phase: 'Phases',
      work_effort: 'Work Effort',
      service_line: 'Service Lines',
      ehr_platform: 'EHR Platforms',
      status: 'Statuses',
      team_role: 'Team Roles',
      groups_impacted: 'Groups Impacted',
      impact_categories: 'Impact Categories',
    };
    return labels[fieldType];
  };

  const getFieldTypeInfo = (fieldType: FieldType): { description: string; usedIn: string[] } => {
    const info: Record<FieldType, { description: string; usedIn: string[] }> = {
      work_type: {
        description: 'Categorizes initiatives for workload tracking and reporting',
        usedIn: ['Initiative Form (Tab 1)', 'Browse Initiatives (category grouping)', 'Dashboard cards', 'Workload analytics']
      },
      role: {
        description: 'Defines team member involvement level on initiatives',
        usedIn: ['Initiative Form (Tab 1)', 'Team assignment dropdowns', 'Capacity calculations (weighted by role)']
      },
      phase: {
        description: 'Tracks project lifecycle stage for capacity planning',
        usedIn: ['Initiative Form (Tab 1)', 'Capacity calculations (weighted by phase)', 'Project timeline tracking']
      },
      work_effort: {
        description: 'Initial capacity estimate for planning (hours per week)',
        usedIn: ['Initiative Form (Tab 1)', 'My Effort (bulk entry)', 'Capacity calculations (base hours)']
      },
      service_line: {
        description: 'Identifies organizational area or department',
        usedIn: ['Initiative Form (Tab 1)', 'Filtering and analytics', 'Manager dashboards']
      },
      ehr_platform: {
        description: 'Tracks which electronic health record systems are affected',
        usedIn: ['Initiative Form (Tab 1)', 'EHR platform analytics', 'Dashboard filtering']
      },
      status: {
        description: 'Current state of initiative work',
        usedIn: ['Initiative Form (Tab 1)', 'Browse Initiatives (filtering)', 'Dashboard (Active/Completed tabs)', 'Effort tracking views']
      },
      team_role: {
        description: 'Categorizes team members by organizational scope',
        usedIn: ['Team Management Panel', 'Team member profiles', 'Organizational hierarchy']
      },
      groups_impacted: {
        description: 'Clinical and administrative groups affected by the initiative',
        usedIn: ['Team Requests (Governance Portal)', 'Initiative stakeholder tracking', 'Impact assessment forms']
      },
      impact_categories: {
        description: 'Strategic and compliance impact areas',
        usedIn: ['Team Requests (Governance Portal)', 'Initiative impact assessment', 'Strategic alignment reporting']
      }
    };
    return info[fieldType];
  };

  const showColorFields = ['work_type', 'work_effort', 'status'].includes(selectedTab);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Section Switcher */}
      <div className="flex gap-2 border-b-2 pb-2">
        <button
          onClick={() => {
            if (mode === 'draft' && draftChanges.size > 0) {
              if (!confirm('You have unsaved changes. Discard them and switch sections?')) return;
            }
            setSectionView('app_settings');
            setMode('view');
            setDraftChanges(new Map());
          }}
          className={`px-6 py-3 rounded-t-lg font-semibold transition-colors flex items-center gap-2 ${
            sectionView === 'app_settings'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Application Settings
        </button>
        <button
          onClick={() => {
            if (mode === 'draft' && draftChanges.size > 0) {
              if (!confirm('You have unsaved changes. Discard them and switch sections?')) return;
            }
            setSectionView('field_options');
            setMode('view');
            setDraftChanges(new Map());
          }}
          className={`px-6 py-3 rounded-t-lg font-semibold transition-colors flex items-center gap-2 ${
            sectionView === 'field_options'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <List className="w-4 h-4" />
          Field Options
        </button>
      </div>

      {/* Render selected section */}
      {sectionView === 'app_settings' ? (
        <ApplicationSettings />
      ) : (
        <>
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Field Options Management</h3>
            <p className="text-gray-600">
              Configure dropdown options for forms across the application. Changes marked with ⚠️ affect capacity calculations.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-2">
        {(['work_type', 'role', 'phase', 'work_effort', 'service_line', 'ehr_platform', 'status', 'team_role', 'groups_impacted', 'impact_categories'] as FieldType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              if (mode === 'draft' && draftChanges.size > 0) {
                if (!confirm('You have unsaved changes. Discard them and switch tabs?')) return;
              }
              setSelectedTab(type);
              setMode('view');
              setDraftChanges(new Map());
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedTab === type
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getTabLabel(type)}
          </button>
        ))}
      </div>

      {/* Field Type Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              {getTabLabel(selectedTab)}
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              {getFieldTypeInfo(selectedTab).description}
            </p>
            <div className="text-sm text-blue-800">
              <span className="font-medium">Used in:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 ml-2">
                {getFieldTypeInfo(selectedTab).usedIn.map((location, idx) => (
                  <li key={idx}>{location}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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
                  You are editing field options. Changes are NOT saved to the database yet.
                </div>
                {hasChanges && (
                  <div className="mt-3 text-sm text-yellow-900">
                    <strong>Impact Preview:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>{draftChanges.size} option(s) modified</li>
                      <li>Changes will affect dropdown menus throughout the application</li>
                      {Array.from(draftChanges.keys()).some(id => {
                        const opt = options.find(o => o.id === id);
                        return opt?.affects_capacity_calc;
                      }) && (
                        <li className="text-yellow-900 font-semibold">
                          ⚠️ These changes will affect capacity calculations
                        </li>
                      )}
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
            {options.filter(o => o.is_active).length} active option(s), {options.filter(o => !o.is_active).length} inactive
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddOption}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add New Option
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

      {/* Options Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading options...</div>
      ) : options.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No options found for this field type.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                  {showColorFields && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Primary Color</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Chart Color</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Affects Calc</th>
                  {mode === 'view' && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {options.map((option) => {
                  const isChanged = draftChanges.has(option.id);
                  return (
                    <tr key={option.id} className={isChanged ? 'bg-yellow-50' : ''}>
                      {/* Display Order */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="number"
                            value={getDisplayValue(option, 'display_order')}
                            onChange={(e) => handleDraftChange(option.id, 'display_order', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border rounded"
                            min="0"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{option.display_order}</span>
                        )}
                      </td>

                      {/* Key */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="text"
                            value={getDisplayValue(option, 'key')}
                            onChange={(e) => handleDraftChange(option.id, 'key', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <span className="text-sm font-mono text-gray-900">{option.key}</span>
                        )}
                      </td>

                      {/* Label */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="text"
                            value={getDisplayValue(option, 'label')}
                            onChange={(e) => handleDraftChange(option.id, 'label', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{option.label}</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="text"
                            value={getDisplayValue(option, 'description') || ''}
                            onChange={(e) => handleDraftChange(option.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="Optional description"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{option.description || '-'}</span>
                        )}
                      </td>

                      {/* Color Fields (conditional) */}
                      {showColorFields && (
                        <>
                          {/* Primary Color */}
                          <td className="px-4 py-3">
                            {mode === 'draft' ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={getDisplayValue(option, 'primary_color') || '#000000'}
                                  onChange={(e) => handleDraftChange(option.id, 'primary_color', e.target.value)}
                                  className="w-10 h-8 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={getDisplayValue(option, 'primary_color') || ''}
                                  onChange={(e) => handleDraftChange(option.id, 'primary_color', e.target.value)}
                                  className="w-20 px-2 py-1 border rounded font-mono text-xs"
                                  placeholder="#000000"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {option.primary_color && (
                                  <>
                                    <div
                                      className="w-6 h-6 rounded border"
                                      style={{ backgroundColor: option.primary_color }}
                                    />
                                    <span className="text-xs font-mono text-gray-600">{option.primary_color}</span>
                                  </>
                                )}
                                {!option.primary_color && <span className="text-sm text-gray-400">-</span>}
                              </div>
                            )}
                          </td>

                          {/* Chart Color */}
                          <td className="px-4 py-3">
                            {mode === 'draft' ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={getDisplayValue(option, 'chart_color') || '#000000'}
                                  onChange={(e) => handleDraftChange(option.id, 'chart_color', e.target.value)}
                                  className="w-10 h-8 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={getDisplayValue(option, 'chart_color') || ''}
                                  onChange={(e) => handleDraftChange(option.id, 'chart_color', e.target.value)}
                                  className="w-20 px-2 py-1 border rounded font-mono text-xs"
                                  placeholder="#000000"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {option.chart_color && (
                                  <>
                                    <div
                                      className="w-6 h-6 rounded border"
                                      style={{ backgroundColor: option.chart_color }}
                                    />
                                    <span className="text-xs font-mono text-gray-600">{option.chart_color}</span>
                                  </>
                                )}
                                {!option.chart_color && <span className="text-sm text-gray-400">-</span>}
                              </div>
                            )}
                          </td>
                        </>
                      )}

                      {/* Is Active */}
                      <td className="px-4 py-3">
                        {mode === 'draft' ? (
                          <input
                            type="checkbox"
                            checked={getDisplayValue(option, 'is_active')}
                            onChange={(e) => handleDraftChange(option.id, 'is_active', e.target.checked)}
                            className="w-4 h-4"
                          />
                        ) : (
                          <span className={`text-sm font-semibold ${option.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {option.is_active ? '✓ Yes' : '✗ No'}
                          </span>
                        )}
                      </td>

                      {/* Affects Capacity Calc */}
                      <td className="px-4 py-3">
                        {option.affects_capacity_calc ? (
                          <span className="text-xs font-semibold text-yellow-700">⚠️ Yes</span>
                        ) : (
                          <span className="text-xs text-gray-500">No</span>
                        )}
                      </td>

                      {/* Actions (view mode only) */}
                      {mode === 'view' && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteOption(option)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete option"
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
        </>
      )}
    </div>
  );
}
