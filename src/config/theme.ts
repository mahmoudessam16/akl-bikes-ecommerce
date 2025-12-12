/**
 * Theme configuration file
 * Contains three main colors extracted from the reference image
 * These are temporary values and will be replaced later from the dashboard
 */

export const theme = {
  colors: {
    primary: '#3B82F6', // Temporary primary color (blue)
    secondary: '#10B981', // Temporary secondary color (green)
    accent: '#F59E0B', // Temporary accent color (amber)
  },
} as const;

export type Theme = typeof theme;

