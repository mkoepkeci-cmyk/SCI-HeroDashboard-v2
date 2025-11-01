/**
 * useFieldOptions Hook
 *
 * Loads field options dynamically from the field_options table
 * Provides dropdown options for various fields (work types, roles, team roles, etc.)
 *
 * Usage:
 *   const { teamRoles, loading } = useTeamRoles();
 */

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface FieldOption {
  id: string;
  field_type: string;
  key: string;
  label: string;
  description: string | null;
  display_order: number;
  primary_color: string | null;
  is_active: boolean;
}

/**
 * Load field options for a specific field type
 */
export async function loadFieldOptions(fieldType: string): Promise<FieldOption[]> {
  const { data, error } = await supabase
    .from('field_options')
    .select('*')
    .eq('field_type', fieldType)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error(`Error loading ${fieldType} options:`, error);
    return [];
  }

  return data || [];
}

/**
 * Generic React hook for loading field options
 */
export function useFieldOptions(fieldType: string) {
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await loadFieldOptions(fieldType);
        setOptions(data);
      } catch (error) {
        console.error(`Failed to load ${fieldType} options:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [fieldType]);

  // Return specific convenience properties based on field type
  if (fieldType === 'service_line') {
    return { serviceLines: options, loading };
  }

  return { options, loading };
}

/**
 * React hook for loading team roles
 */
export function useTeamRoles() {
  const [teamRoles, setTeamRoles] = useState<string[]>(['Enterprise Team']); // Fallback default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const options = await loadFieldOptions('team_role');
        const roles = options.map(opt => opt.label);

        if (roles.length > 0) {
          setTeamRoles(roles);
        }
      } catch (error) {
        console.error('Failed to load team roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  return { teamRoles, loading };
}
