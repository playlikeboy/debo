/**
 * Debo Design Tokens conforming to docs/design-system/tokens.md
 * Warm Paper / Calm Editorial Aesthetic
 */

export const COLOR_TOKENS = {
  light: {
    bgCanvas: '#f9f9f8',
    bgSurface: '#ffffff',
    bgMuted: '#f0f0ed',
    fgPrimary: '#181816',
    fgSecondary: '#5c5c57',
    fgMuted: '#8a8a83',
    borderSubtle: '#e5e5e0',
    borderStrong: '#cfcfc8',
    accentPrimary: '#2b5c56', // Spruce green
    accentHighlight: '#c76a3a', // Warm terracotta
  },
  dark: {
    bgCanvas: '#121211',
    bgSurface: '#1a1a18',
    bgMuted: '#242422',
    fgPrimary: '#f2f2ee',
    fgSecondary: '#a8a8a0',
    borderSubtle: '#2b2b28',
    accentPrimary: '#4a8a81',
  },
} as const;

export const TYPOGRAPHY = {
  fontSans: 'Albert Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  fontMono: 'JetBrains Mono, monospace',
  sizes: {
    body: '15px',
    h1: '32px',
    h2: '24px',
    h3: '18px',
    mono: '13px',
  },
} as const;

export const RADII = {
  input: '6px',
  button: '6px',
  card: '10px',
} as const;
