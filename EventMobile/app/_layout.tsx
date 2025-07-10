// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui'; // Import SystemUI
import 'react-native-reanimated';
import React, { useEffect } from 'react'; // Import useEffect

import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColors } from '@/constants/Theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const M3Theme = useThemeColors();

  // --- FIX: This effect sets the root background color for the whole app ---
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(M3Theme.background);
  }, [M3Theme]); // It re-runs if the theme changes

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: M3Theme.background,
      card: M3Theme.surface,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: M3Theme.background,
      card: M3Theme.surface,
    },
  };

  if (!loaded) {
    if (error) {
      console.error("Font loading error:", error);
    }
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="details" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}