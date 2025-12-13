/**
 * Theme configuration file
 * Contains three main colors extracted from the reference image
 * These are temporary values and will be replaced later from the dashboard
 */

export const theme = {
  colors: {
    primary: '#FF6B35', // Orange primary color matching logo
    secondary: '#FF8C42', // Orange secondary color
    accent: '#FF6B35', // Orange accent color matching logo
  },
} as const;

export type Theme = typeof theme;

