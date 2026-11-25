import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, View } from 'react-native';
import {
  CommonActions,
  createNavigationContainerRef,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  StackActions,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { PurchaseProvider } from './src/context/PurchaseContext';
import { DeckProvider } from './src/hooks/useDeck';
import ErrorBoundary, { CrashBoundary } from './src/components/ErrorBoundary';
import StorageGate from './src/components/StorageGate';
import ThemeBootstrap from './src/components/ThemeBootstrap';
import {
  refreshScheduledNotifications,
  watchReminderResponses,
} from './src/services/notifications';
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
  const navigation = useMemo(() => createNavigationContainerRef(), []);
  const responses = useRef<ReturnType<typeof watchReminderResponses> | null>(null);
  const flush = useCallback(() => responses.current?.flush(), []);

  useEffect(() => {
    const watcher = watchReminderResponses((intent) => {
      if (!navigation.isReady() || navigation.getRootState()?.routes[0]?.name !== 'Root')
        return false;
      if (intent.kind === 'word' || intent.kind === 'wordUnavailable') {
        navigation.dispatch(CommonActions.navigate('ReminderWord', intent));
      } else {
        // Home resolves a saved plan before any new activity.
        navigation.dispatch(StackActions.popTo('Root', { screen: 'Home' }));
      }
      return true;
    });
    responses.current = watcher;
    watcher.flush();
    return () => {
      watcher.remove();
      responses.current = null;
    };
  }, [navigation]);

  return (
    <NavigationContainer
      ref={navigation}
      theme={navigationTheme}
      onReady={flush}
      onStateChange={flush}
    >
      <PurchaseProvider>
        <DeckProvider>
          <LanguageProvider>
            <RootNavigator />
          </LanguageProvider>
        </DeckProvider>
      </PurchaseProvider>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    const refresh = () => void refreshScheduledNotifications().catch(() => {});
    refresh();
    // Returning to the app also refreshes the rolling window in the current local timezone.
    const state = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => state.remove();
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
