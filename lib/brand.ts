// ─── Magellania Design System — Brand utilities ─────────────────────────────
// Converted from window.MagellaniaBrand and window.MG (brand.js)

import type { CSSProperties } from 'react';

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  ocean800: '#0d1f35',
  ocean700: '#1a2e4a',
  ocean600: '#243d5e',
  ocean400: '#4a6d96',
  ocean200: '#a8bfcf',
  ocean100: '#c5d8e3',
  ocean50: '#e8f0f5',
  earth200: '#f2ece2',
  earth100: '#f8f5f0',
  earth300: '#e8dcc8',
  terra500: '#c4703f',
  terra600: '#b8572f',
  terra400: '#d4845a',
  terra100: '#f5ddd0',
  glacier400: '#6aaab4',
  glacier600: '#3a7a84',
} as const;

export type ColorToken = keyof typeof colors;

// ─── Fonts ───────────────────────────────────────────────────────────────────

export const fonts = {
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Lora', Georgia, serif",
} as const;

export type FontToken = keyof typeof fonts;

// ─── Brand object (replaces window.MagellaniaBrand) ──────────────────────────

export const brand = {
  colors,
  fonts,
} as const;

// ─── Button style helper (replaces window.MG.btn) ────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghost-light';
export type ButtonSize = 'sm' | 'md' | 'lg';

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { fontSize: 11, padding: '8px 16px' },
  md: { fontSize: 13, padding: '11px 24px' },
  lg: { fontSize: 14, padding: '14px 32px' },
};

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: { background: '#0d1f35', color: '#f8f5f0' },
  secondary: { background: '#c4703f', color: '#f8f5f0' },
  ghost: { background: 'transparent', color: '#0d1f35', border: '1px solid #0d1f35' },
  'ghost-light': {
    background: 'transparent',
    color: '#f8f5f0',
    border: '1px solid rgba(248,245,240,0.5)',
  },
};

/**
 * Returns a CSSProperties object for a styled button.
 * Replaces window.MG.btn(variant, size).
 */
export function btn(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): CSSProperties {
  const base: CSSProperties = {
    fontFamily: "'Lora', Georgia, serif",
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderRadius: 2,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none',
    transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
  };
  return { ...base, ...sizes[size], ...variants[variant] };
}

/**
 * MG namespace — replaces window.MG.
 */
export const MG = {
  btn,
} as const;
