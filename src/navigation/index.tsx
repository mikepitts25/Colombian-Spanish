import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import StudyScreen from '../screens/StudyScreen';
import AddCardScreen from '../screens/AddCardScreen';
import BrowseScreen from '../screens/BrowseScreen';
import PhrasebookScreen from '../screens/PhrasebookScreen';
import ManageDecksScreen from '../screens/ManageDecksScreen';
import { colors, spacing, radius } from '../styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Home:       '🏠',
  Study:      '📖',
  Add:        '➕',
  Browse:     '🔍',
  Phrasebook: '💬',
};

const TAB_LABELS: Record<string, string> = {
  Home:       'Inicio',
  Study:      'Estudiar',
  Add:        'Agregar',
  Browse:     'Buscar',
  Phrasebook: 'Frases',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={styles.iconEmoji}>{TAB_ICONS[name]}</Text>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: 'rgba(255,218,0,0.15)',
          borderBottomWidth: 1,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ color }) => (
          <Text style={[styles.tabLabel, { color }]}>
            {TAB_LABELS[route.name] ?? route.name}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home"       component={HomeScreen}      options={{ headerShown: false }} />
      <Tab.Screen name="Study"      component={StudyScreen}     options={{ title: 'Estudiar' }} />
      <Tab.Screen name="Add"        component={AddCardScreen}   options={{ title: 'Nueva Tarjeta' }} />
      <Tab.Screen name="Browse"     component={BrowseScreen}    options={{ title: 'Buscar' }} />
      <Tab.Screen name="Phrasebook" component={PhrasebookScreen} options={{ title: 'Frasario' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root"        component={Tabs}             options={{ headerShown: false }} />
      <Stack.Screen
        name="ManageDecks"
        component={ManageDecksScreen}
        options={{
          title: 'Gestionar Decks',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,218,0,0.4)',
    height: 80,
    paddingBottom: spacing(1),
    paddingTop: spacing(0.5),
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,218,0,0.15)',
  },
  iconEmoji: {
    fontSize: 20,
  },
});
