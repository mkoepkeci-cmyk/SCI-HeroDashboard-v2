/**
 * useApplicationConfig Hook
 *
 * Loads application-wide configuration from application_config table
 * Provides dynamic labels, branding, and settings throughout the app
 *
 * Usage:
 *   const { config, loading } = useApplicationConfig();
 *   <h1>{config.banner_title || 'GovernIQ'}</h1>
 */

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface ApplicationConfig {
  banner_title: string;
  organization_name: string;
  workload_staff_view_label: string;
  workload_manager_view_label: string;
}

interface ConfigRecord {
  key: string;
  value: string;
  category: string;
  label: string;
  description: string | null;
}

// In-memory cache
let cachedConfig: ApplicationConfig | null = null;
let cacheLoadedAt: number = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Load application config from database
 * Caches results for performance
 */
export async function loadApplicationConfig(): Promise<ApplicationConfig> {
  // Return cached config if still valid
  const now = Date.now();
  if (cachedConfig && (now - cacheLoadedAt) < CACHE_TTL) {
    return cachedConfig;
  }

  const { data, error } = await supabase
    .from('application_config')
    .select('key, value, category, label, description')
    .eq('is_editable', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error loading application config:', error);
    return getDefaultConfig();
  }

  // Transform array to object
  const config: ApplicationConfig = {
    banner_title: 'GovernIQ',
    organization_name: 'Sample Healthcare',
    workload_staff_view_label: 'Staff View',
    workload_manager_view_label: "Manager's View",
  };

  if (data) {
    data.forEach((record: ConfigRecord) => {
      if (record.key in config) {
        (config as any)[record.key] = record.value;
      }
    });
  }

  // Cache the config
  cachedConfig = config;
  cacheLoadedAt = now;

  return config;
}

/**
 * Clear config cache (call after updating config in database)
 */
export function clearApplicationConfigCache(): void {
  cachedConfig = null;
  cacheLoadedAt = 0;
}

/**
 * Get default fallback config
 */
function getDefaultConfig(): ApplicationConfig {
  return {
    banner_title: 'GovernIQ',
    organization_name: 'Sample Healthcare',
    workload_staff_view_label: 'Staff View',
    workload_manager_view_label: "Manager's View",
  };
}

/**
 * React hook for loading application config
 */
export function useApplicationConfig() {
  const [config, setConfig] = useState<ApplicationConfig>(getDefaultConfig());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const loadedConfig = await loadApplicationConfig();
        setConfig(loadedConfig);
      } catch (error) {
        console.error('Failed to load application config:', error);
        setConfig(getDefaultConfig());
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading };
}
