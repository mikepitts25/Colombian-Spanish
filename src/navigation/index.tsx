import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import ThemeIcon, { ThemeIconName } from '../components/ThemeIcon';
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AudioPreferencesScreen from '../screens/AudioPreferencesScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';

import ListeningScreen from '../screens/ListeningScreen';
import VoicePracticeScreen from '../screens/VoicePracticeScreen';
import MissionScreen from '../screens/MissionScreen';
import HomeScreen from '../screens/HomeScreen';
import DailyPlanScreen from '../screens/DailyPlanScreen';
import StudyScreen from '../screens/StudyScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LearningPreferencesScreen from '../screens/LearningPreferencesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DailyGoalScreen from '../screens/DailyGoalScreen';
import ManageDecksScreen from '../screens/ManageDecksScreen';
import ReviewScreen from '../screens/ReviewScreen';
import FlaggedScreen from '../screens/FlaggedScreen';
import QuizScreen from '../screens/QuizScreen';
import PhrasebookScreen from '../screens/PhrasebookScreen';
import PhrasesScreen from '../screens/PhrasesScreen';
import AddCardScreen from '../screens/AddCardScreen';
import ExploreScreen from '../screens/ExploreScreen';
import DifficultWordsScreen from '../screens/DifficultWordsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useReducedMotion } from '../hooks/useReducedMotion';

import { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../context/LanguageContext';
import { getPrefs } from '../storage/prefs';
import { SHOW_REVIEW_TOOLS } from '../config';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const smoothStackTransition: NativeStackNavigationOptions = {
  animation: 'fade',
  animationDuration: 220,
};

const TABS: { name: string; labelKey: TranslationKey; icon: ThemeIconName }[] = [
  { name: 'Home', labelKey: 'tabs.home', icon: 'home' },
  { name: 'Study', labelKey: 'tabs.study', icon: 'study' },
  { name: 'Progress', labelKey: 'tabs.progress', icon: 'progress' },
  { name: 'Settings', labelKey: 'tabs.settings', icon: 'settings' },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const expandedText = fontScale >= 1.4;
  const { t } = useLanguage();

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Recreate native text measurements when Dynamic Type changes live. */}
      <View key={fontScale} style={[styles.tabPill, expandedText && styles.tabPillExpanded]}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tab = TABS[index];

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.labelKey)}
              accessibilityState={{ selected: focused }}
              style={[
                styles.tabItem,
                expandedText && styles.tabItemExpanded,
                focused && styles.tabItemActive,
              ]}
              onPress={() => navigation.navigate(route.name)}
              android_ripple={null}
            >
              <ThemeIcon
                name={tab.icon}
                size={18}
                color={focused ? colors.onBrand : colors.textSecondary}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const styles = useThemedStyles(makeStyles);
  const appTheme = useAppTheme();
  const stackHeaderOpts: NativeStackNavigationOptions = {
    headerStyle: { backgroundColor: appTheme.colors.surface },
    headerTintColor: appTheme.colors.brand,
    headerTitleStyle: { fontWeight: '700' as const, color: appTheme.colors.textPrimary },
    headerBackButtonDisplayMode: 'minimal',
  };
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    getPrefs()
      .then((p) => setOnboarded(p.onboardingDone))
      .catch(() => setOnboarded(true));
  }, []);

  // Hold rendering one frame until we know whether to show onboarding —
  // avoids flashing Home before redirecting first-run users.
  if (onboarded === null) {
    return <View style={[styles.bootWrap, { backgroundColor: appTheme.colors.bg }]} />;
  }

  return (
    <Stack.Navigator
      screenOptions={reducedMotion ? { animation: 'none' } : smoothStackTransition}
      initialRouteName={onboarded ? 'Root' : 'Onboarding'}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="DailyPlan" component={DailyPlanScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ ...stackHeaderOpts, headerShown: false }}
      />
      <Stack.Screen
        name="AudioPreferences"
        component={AudioPreferencesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LearningPreferences"
        component={LearningPreferencesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyGoal"
        component={DailyGoalScreen}
        options={{ ...stackHeaderOpts, headerShown: false }}
      />
      <Stack.Screen
        name="ManageDecks"
        component={ManageDecksScreen}
        options={{ ...stackHeaderOpts, title: t('nav.manageDecks') }}
      />
      {SHOW_REVIEW_TOOLS && (
        <>
          <Stack.Screen
            name="VoicePracticePreview"
            component={VoicePracticeScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="ListeningPreview"
            component={ListeningScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MissionPreview"
            component={MissionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ ...stackHeaderOpts, title: t('nav.review') }}
          />
          <Stack.Screen
            name="Flagged"
            component={FlaggedScreen}
            options={{ ...stackHeaderOpts, title: t('nav.flagged') }}
          />
        </>
      )}
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ ...stackHeaderOpts, title: t('nav.quiz') }}
      />
      <Stack.Screen
        name="Phrasebook"
        component={PhrasebookScreen}
        options={{ ...stackHeaderOpts, title: t('nav.phrasebook') }}
      />
      <Stack.Screen
        name="Phrases"
        component={PhrasesScreen}
        options={{ ...stackHeaderOpts, title: t('nav.phrases') }}
      />
      <Stack.Screen
        name="AddCard"
        component={AddCardScreen}
        options={{ ...stackHeaderOpts, title: t('nav.addCard') }}
      />
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ ...stackHeaderOpts, title: t('nav.explore') }}
      />
      <Stack.Screen
        name="DifficultWords"
        component={DifficultWordsScreen}
        options={{ ...stackHeaderOpts, title: t('nav.difficultWords') }}
      />
    </Stack.Navigator>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    bootWrap: { flex: 1, backgroundColor: colors.bg },
    tabBarOuter: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingTop: 10,
      borderTopWidth: 0,
    },
    tabPill: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 36,
      borderWidth: 1,
      borderColor: colors.tabBorder,
      padding: 4,
      minHeight: 64,
    },
    tabItem: {
      flex: 1,
      minHeight: 48,
      paddingVertical: 8,
      paddingHorizontal: 2,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderRadius: 26,
    },
    tabPillExpanded: { flexWrap: 'wrap' },
    tabItemExpanded: { flexBasis: '45%' },
    tabItemActive: {
      backgroundColor: colors.brand,
    },
    tabIcon: {
      fontSize: 18,
    },
    tabLabel: {
      textAlign: 'center',
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: 0.5,
    },
    tabLabelActive: {
      color: colors.onBrand,
      fontWeight: '800',
    },
  });
