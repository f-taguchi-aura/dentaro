import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { palettes } from '@/theme/tokens';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const p = palettes[scheme];
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs
        backgroundColor={p.bg}
        tintColor={p.accent}
        iconColor={{ default: p.subtext, selected: p.accent }}
        indicatorColor={p.surface}
        labelStyle={{ default: { color: p.subtext }, selected: { color: p.accent } }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>電卓</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="plus.forwardslash.minus" md="calculate" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="compare">
          <NativeTabs.Trigger.Label>お得比較</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="tag" md="sell" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
