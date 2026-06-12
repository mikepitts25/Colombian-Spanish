import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation';
import { LanguageProvider } from './src/context/LanguageContext';
import { DeckProvider } from './src/hooks/useDeck';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <DeckProvider>
          <LanguageProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </LanguageProvider>
        </DeckProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
