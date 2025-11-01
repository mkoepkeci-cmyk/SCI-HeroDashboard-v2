import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/**
 * Hook to load and apply primary brand color from application_config
 * Injects the color as a CSS variable --primary-brand-color
 */
export function useBrandColor() {
  const [brandColor, setBrandColor] = useState<string>('#9B2F6A'); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandColor();

    // Set up real-time subscription for config changes
    const channel = supabase
      .channel('brand-color-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'application_config',
          filter: 'key=eq.primary_brand_color',
        },
        (payload) => {
          if (payload.new && 'value' in payload.new) {
            const newColor = (payload.new as any).value;
            applyBrandColor(newColor);
            setBrandColor(newColor);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBrandColor = async () => {
    try {
      const { data, error } = await supabase
        .from('application_config')
        .select('value')
        .eq('key', 'primary_brand_color')
        .single();

      if (error) throw error;

      const color = data?.value || '#9B2F6A';
      applyBrandColor(color);
      setBrandColor(color);
    } catch (error) {
      console.error('Error loading brand color:', error);
      // Use default color on error
      applyBrandColor('#9B2F6A');
    } finally {
      setLoading(false);
    }
  };

  const applyBrandColor = (color: string) => {
    // Set CSS custom property on :root
    document.documentElement.style.setProperty('--primary-brand-color', color);

    // Calculate lighter version for hover/selected states (10% lighter)
    const lightColor = lightenColor(color, 10);
    document.documentElement.style.setProperty('--primary-brand-color-light', lightColor);

    // Calculate very light version for soft highlights (85% lighter)
    const softColor = lightenColor(color, 85);
    document.documentElement.style.setProperty('--primary-brand-color-soft', softColor);

    // Calculate darker version for hover states (10% darker)
    const darkColor = darkenColor(color, 10);
    document.documentElement.style.setProperty('--primary-brand-color-dark', darkColor);
  };

  return { brandColor, loading };
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const amount = percent / 100;

  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));

  return rgbToHex(newR, newG, newB);
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const amount = 1 - percent / 100;

  const newR = Math.max(0, Math.round(r * amount));
  const newG = Math.max(0, Math.round(g * amount));
  const newB = Math.max(0, Math.round(b * amount));

  return rgbToHex(newR, newG, newB);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
