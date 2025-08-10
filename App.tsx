import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation';
import { DeckProvider } from './src/hooks/useDeck';

export default function App() {
  return (
    <NavigationContainer>
      <DeckProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </DeckProvider>
    </NavigationContainer>
  );
}
