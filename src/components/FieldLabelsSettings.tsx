import { useState, useEffect } from 'react';
import { supabase, FieldLabel } from '../lib/supabase';
import { Save, AlertCircle, CheckCircle, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export const FieldLabelsSettings = () => {
  const [labels, setLabels] = useState<FieldLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newLabelCategory, setNewLabelCategory] = useState<string>('');

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('field_labels')
        .select('*')
        .order('field_category, display_order');

      if (error) throw error;
      setLabels(data || []);
    } catch (err: any) {
      console.error('Error loading field labels:', err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (id: string, field: string, value: any) => {
    setLabels(labels.map(label =>
      label.id === id ? { ...label, [field]: value } : label
    ));
  };

  const handleToggleActive = (id: string) => {
    setLabels(labels.map(label =>
      label.id === id ? { ...label, is_active: !label.is_active } : label
    ));
  };

  const handleAddNew = (category: string) => {
    const newLabel: FieldLabel = {
      id: `temp-${Date.now()}`,
      field_key: '',
      label_text: '',
      description: '',
      field_category: category,
      display_order: labels.filter(l => l.field_category === category).length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLabels([...labels, newLabel]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this label? This action cannot be undone.')) {
      return;
    }

    // If it's a temporary (unsaved) label, just remove it from state
    if (id.startsWith('temp-')) {
      setLabels(labels.filter(label => label.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('field_labels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLabels(labels.filter(label => label.id !== id));
      setMessage({ type: 'success', text: 'Label deleted successfully!' });
    } catch (err: any) {
      console.error('Error deleting label:', err);
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Validate all labels have required fields
      const invalidLabels = labels.filter(l => !l.field_key.trim() || !l.label_text.trim());
      if (invalidLabels.length > 0) {
        throw new Error('All labels must have a field key and display label');
      }

      // Check for duplicate field_keys
      const fieldKeys = labels.map(l => l.field_key);
      const duplicates = fieldKeys.filter((key, index) => fieldKeys.indexOf(key) !== index);
      if (duplicates.length > 0) {
        throw new Error(`Duplicate field keys found: ${duplicates.join(', ')}`);
      }

      // Update existing and insert new labels
      for (const label of labels) {
        if (label.id.startsWith('temp-')) {
          // Insert new label
          const { error } = await supabase
            .from('field_labels')
            .insert({
              field_key: label.field_key,
              label_text: label.label_text,
              description: label.description,
              field_category: label.field_category,
              display_order: label.display_order,
              is_active: label.is_active
            });

          if (error) throw error;
        } else {
          // Update existing label
          const { error } = await supabase
            .from('field_labels')
            .update({
              field_key: label.field_key,
              label_text: label.label_text,
              description: label.description,
              display_order: label.display_order,
              is_active: label.is_active,
              updated_at: new Date().toISOString()
            })
            .eq('id', label.id);

          if (error) throw error;
        }
      }

      setMessage({ type: 'success', text: 'Field labels updated successfully!' });

      // Reload to confirm changes
      await loadLabels();
    } catch (err: any) {
      console.error('Error saving field labels:', err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'sponsor': return 'Executive Sponsor Fields';
      case 'impact_category': return 'Impact Category Labels';
      case 'groups_impacted': return 'Groups Impacted Labels';
      case 'general': return 'Section Headings';
      default: return category;
    }
  };

  const groupedLabels = labels.reduce((acc, label) => {
    if (!acc[label.field_category]) {
      acc[label.field_category] = [];
    }
    acc[label.field_category].push(label);
    return acc;
  }, {} as Record<string, FieldLabel[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading field labels...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Field Labels Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Customize field labels to match your organization's terminology
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
            {message.text}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">About Field Labels</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Changes apply to all forms across the application</li>
              <li>Click "Add New" to create custom labels for each category</li>
              <li>Use the eye icon to enable/disable labels (disabled labels won't appear in forms)</li>
              <li>Click the trash icon to permanently delete custom labels</li>
              <li>Field keys must be unique and use lowercase with underscores (e.g., group_custom_item)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grouped Labels */}
      {Object.entries(groupedLabels).map(([category, categoryLabels]) => (
        <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getCategoryTitle(category)}
            </h3>
            <button
              onClick={() => handleAddNew(category)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>
          <div className="space-y-3">
            {categoryLabels.map((label) => (
              <div key={label.id} className={`grid grid-cols-12 gap-3 items-start p-3 rounded-lg border ${
                label.is_active ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50 opacity-60'
              }`}>
                {/* Field Key */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Field Key
                  </label>
                  {label.id.startsWith('temp-') ? (
                    <input
                      type="text"
                      value={label.field_key}
                      onChange={(e) => handleLabelChange(label.id, 'field_key', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
                      placeholder="e.g., group_new_item"
                    />
                  ) : (
                    <div className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
                      {label.field_key}
                    </div>
                  )}
                </div>

                {/* Display Label */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Display Label
                  </label>
                  <input
                    type="text"
                    value={label.label_text}
                    onChange={(e) => handleLabelChange(label.id, 'label_text', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    placeholder="Enter label text"
                  />
                </div>

                {/* Description */}
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={label.description || ''}
                    onChange={(e) => handleLabelChange(label.id, 'description', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    placeholder="Optional description"
                  />
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-end gap-2 justify-end">
                  <button
                    onClick={() => handleToggleActive(label.id)}
                    className={`p-1.5 rounded ${
                      label.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={label.is_active ? 'Disable' : 'Enable'}
                  >
                    {label.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(label.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
