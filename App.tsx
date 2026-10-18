import React, { ReactNode, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { DeckProvider } from './src/hooks/useDeck';
import ErrorBoundary, { CrashBoundary } from './src/components/ErrorBoundary';
import StorageGate from './src/components/StorageGate';
import ThemeBootstrap from './src/components/ThemeBootstrap';
import { refreshScheduledNotifications } from './src/services/notifications';
import { initCrashReporting } from './src/services/crashReporting';

initCrashReporting();

function AppSurface({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar style={theme.appearance === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}
function ReadyApp() {
  const theme = useAppTheme();
  const navigationTheme = useMemo(
    () => ({
      ...(theme.appearance === 'dark' ? DarkTheme : DefaultTheme),
      dark: theme.appearance === 'dark',
      colors: {
        primary: theme.colors.brand,
        background: theme.colors.bg,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.danger,
      },
    }),
    [theme],
  );
  return (
    <NavigationContainer theme={navigationTheme}>
      <DeckProvider>
        <LanguageProvider>
          <RootNavigator />
        </LanguageProvider>
      </DeckProvider>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // Keep the rolling word-of-day reminder window fresh on every launch.
    refreshScheduledNotifications().catch(() => {});
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CrashBoundary>
        <ThemeProvider>
          <AppSurface>
            <ErrorBoundary>
              <StorageGate>
                <ThemeBootstrap>
                  <ReadyApp />
                </ThemeBootstrap>
              </StorageGate>
            </ErrorBoundary>
          </AppSurface>
        </ThemeProvider>
      </CrashBoundary>
    </GestureHandlerRootView>
  );
}
