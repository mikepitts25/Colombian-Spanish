import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation';
import { LanguageProvider } from './src/context/LanguageContext';
import { DeckProvider } from './src/hooks/useDeck';
import ErrorBoundary from './src/components/ErrorBoundary';
import StorageGate from './src/components/StorageGate';
import { refreshScheduledNotifications } from './src/services/notifications';
import { initCrashReporting } from './src/services/crashReporting';

initCrashReporting();

export default function App() {
  useEffect(() => {
    // Keep the rolling word-of-day reminder window fresh on every launch.
    refreshScheduledNotifications().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <StorageGate>
          <NavigationContainer>
            <DeckProvider>
              <LanguageProvider>
                <StatusBar style="light" />
                <RootNavigator />
              </LanguageProvider>
            </DeckProvider>
          </NavigationContainer>
        </StorageGate>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
