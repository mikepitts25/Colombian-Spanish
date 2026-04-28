import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import StudyScreen from '../screens/StudyScreen';
import AddCardScreen from '../screens/AddCardScreen';
import PhrasebookScreen from '../screens/PhrasebookScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#0b1229' },
        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Home</Text>,
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="Study"
        component={StudyScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Study</Text>,
          title: 'Study',
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddCardScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Add</Text>,
          title: 'Add Cards',
        }}
      />
      <Tab.Screen
        name="Phrasebook"
        component={PhrasebookScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Phrasebook</Text>,
          title: 'Phrasebook',
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
