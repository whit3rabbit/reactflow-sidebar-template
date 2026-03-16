import type { ResolvedTheme, ThemeMode, ThemePreset } from '@/DarkModeProvider';

export const themeModes: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

export const themePresets: { value: ThemePreset; label: string; swatch: string }[] = [
  {
    value: 'graphite',
    label: 'Graphite',
    swatch: 'linear-gradient(135deg, #7dd3fc 0%, #8b5cf6 100%)',
  },
  {
    value: 'ocean',
    label: 'Ocean',
    swatch: 'linear-gradient(135deg, #38bdf8 0%, #14b8a6 100%)',
  },
  {
    value: 'ember',
    label: 'Ember',
    swatch: 'linear-gradient(135deg, #fb7185 0%, #f59e0b 100%)',
  },
];

const gridColors: Record<ThemePreset, Record<ResolvedTheme, string>> = {
  graphite: {
    dark: 'rgba(125, 211, 252, 0.15)',
    light: 'rgba(99, 102, 241, 0.14)',
  },
  ocean: {
    dark: 'rgba(45, 212, 191, 0.18)',
    light: 'rgba(20, 184, 166, 0.16)',
  },
  ember: {
    dark: 'rgba(251, 146, 60, 0.18)',
    light: 'rgba(249, 115, 22, 0.18)',
  },
};

export function getGridColor(preset: ThemePreset, resolvedTheme: ResolvedTheme): string {
  return gridColors[preset][resolvedTheme];
}
