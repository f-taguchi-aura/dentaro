import { useColorScheme } from 'react-native';

export type Palette = {
  scheme: 'light' | 'dark';
  bg: string;
  elevated: string;
  key: string;
  keyPressed: string;
  hairline: string;
  text: string;
  subtext: string;
  faint: string;
  accent: string;
  accentGradient: [string, string];
  onAccent: string;
  glow: string;
  ambient: string;
};

export const palettes: { light: Palette; dark: Palette } = {
  light: {
    scheme: 'light',
    bg: '#F4F3F1',
    elevated: '#FFFFFF',
    key: '#FFFFFF',
    keyPressed: '#ECEBE8',
    hairline: 'rgba(0,0,0,0.07)',
    text: '#111113',
    subtext: '#76767E',
    faint: '#B9B8B4',
    accent: '#7A1E2E',
    accentGradient: ['#9A2D40', '#5E1622'],
    onAccent: '#FFFFFF',
    glow: 'rgba(122,30,46,0.28)',
    ambient: 'rgba(122,30,46,0.08)',
  },
  dark: {
    scheme: 'dark',
    bg: '#0A0A0C',
    elevated: '#141417',
    key: '#1A1A1E',
    keyPressed: '#26262B',
    hairline: 'rgba(255,255,255,0.08)',
    text: '#F5F5F7',
    subtext: '#8A8A93',
    faint: '#45454C',
    accent: '#B23A4E',
    accentGradient: ['#C9495F', '#7A1E2E'],
    onAccent: '#FFFFFF',
    glow: 'rgba(201,73,95,0.45)',
    ambient: 'rgba(178,58,78,0.16)',
  },
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}

/** 数字は等幅・細字で精密な印象に */
export const numericFont = { fontVariant: ['tabular-nums' as const] };
