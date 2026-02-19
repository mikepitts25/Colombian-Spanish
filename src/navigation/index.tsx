import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { colors } from '../styles/theme';

// Tab Screens (4 main tabs)
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Stack Screens (accessed from tabs)
import StudyScreen from '../screens/StudyScreen';
import AddCardScreen from '../screens/AddCardScreen';
import ManageDecksScreen from '../screens/ManageDecksScreen';
import BrowseScreen from '../screens/BrowseScreen';
import PhrasebookScreen from '../screens/PhrasebookScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Icons
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Learn: '📚',
    Explore: '🔍',
    Progress: '📊',
    Settings: '⚙️',
  };
  
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}

function TabLabel({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text
      style={{
        color: focused ? colors.brand : colors.textSecondary,
        fontSize: 11,
        fontWeight: focused ? '600' : '400',
        marginTop: 2,
      }}
    >
      {name}
    </Text>
  );
}

// Main Tab Navigator (4 tabs)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textPrimary,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => <TabLabel name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Learn"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textPrimary,
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Study"
        component={StudyScreen}
        options={{ title: 'Study' }}
      />
      <Stack.Screen
        name="Browse"
        component={BrowseScreen}
        options={{ title: 'Browse' }}
      />
      <Stack.Screen
        name="Phrasebook"
        component={PhrasebookScreen}
        options={{ title: 'Phrasebook' }}
      />
      <Stack.Screen
        name="AddCard"
        component={AddCardScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ManageDecks"
        component={ManageDecksScreen}
        options={{ title: 'Manage Decks' }}
      />
    </Stack.Navigator>
  );
}
