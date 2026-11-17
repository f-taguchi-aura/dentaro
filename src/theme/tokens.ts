import { useColorScheme } from 'react-native';

export type Palette = {
  bg: string;
  surface: string;
  key: string;
  keyPressed: string;
  text: string;
  subtext: string;
  border: string;
  accent: string;
  onAccent: string;
};

export const palettes: { light: Palette; dark: Palette } = {
  light: {
    bg: '#FFFFFF',
    surface: '#F4F4F5',
    key: '#E9E9EB',
    keyPressed: '#DCDCDF',
    text: '#0A0A0A',
    subtext: '#71717A',
    border: '#E4E4E7',
    accent: '#7A1E2E',
    onAccent: '#FFFFFF',
  },
  dark: {
    bg: '#000000',
    surface: '#111113',
    key: '#1F1F22',
    keyPressed: '#2C2C30',
    text: '#FAFAFA',
    subtext: '#A1A1AA',
    border: '#27272A',
    accent: '#B23A4E',
    onAccent: '#FFFFFF',
  },
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}
