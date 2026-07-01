import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import StudyScreen from '../screens/StudyScreen';
import BrowseScreen from '../screens/BrowseScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DailyGoalScreen from '../screens/DailyGoalScreen';
import ManageDecksScreen from '../screens/ManageDecksScreen';
import ReviewScreen from '../screens/ReviewScreen';
import FlaggedScreen from '../screens/FlaggedScreen';
import QuizScreen from '../screens/QuizScreen';
import PhrasebookScreen from '../screens/PhrasebookScreen';
import AddCardScreen from '../screens/AddCardScreen';
import ExploreScreen from '../screens/ExploreScreen';
import DifficultWordsScreen from '../screens/DifficultWordsScreen';
import { colors } from '../styles/theme';
import { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TABS: { name: string; labelKey: TranslationKey; icon: string }[] = [
  { name: 'Home', labelKey: 'tabs.home', icon: '🏠' },
  { name: 'Study', labelKey: 'tabs.study', icon: '📖' },
  { name: 'Browse', labelKey: 'tabs.browse', icon: '🔍' },
  { name: 'Progress', labelKey: 'tabs.progress', icon: '📊' },
  { name: 'Settings', labelKey: 'tabs.settings', icon: '⚙️' },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabPill}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tab = TABS[index];

          return (
            <Pressable
              key={route.key}
              style={[styles.tabItem, focused && styles.tabItemActive]}
              onPress={() => navigation.navigate(route.name)}
              android_ripple={null}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
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
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Study"    component={StudyScreen} />
      <Tab.Screen name="Browse"   component={BrowseScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const stackHeaderOpts = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.brand,
  headerTitleStyle: { fontWeight: '700' as const, color: colors.textPrimary },
  headerBackTitleVisible: false,
};

export default function RootNavigator() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator>
      <Stack.Screen name="Root"         component={Tabs}              options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile"  component={EditProfileScreen} options={{ ...stackHeaderOpts, headerShown: false }} />
      <Stack.Screen name="Notifications"component={NotificationsScreen}options={{ ...stackHeaderOpts, headerShown: false }} />
      <Stack.Screen name="DailyGoal"    component={DailyGoalScreen}   options={{ ...stackHeaderOpts, headerShown: false }} />
      <Stack.Screen name="ManageDecks"  component={ManageDecksScreen}  options={{ ...stackHeaderOpts, title: t('nav.manageDecks') }} />
      <Stack.Screen name="Review"       component={ReviewScreen}       options={{ ...stackHeaderOpts, title: t('nav.review') }} />
      <Stack.Screen name="Flagged"      component={FlaggedScreen}      options={{ ...stackHeaderOpts, title: t('nav.flagged') }} />
      <Stack.Screen name="Quiz"         component={QuizScreen}         options={{ ...stackHeaderOpts, title: t('nav.quiz') }} />
      <Stack.Screen name="Phrasebook"   component={PhrasebookScreen}   options={{ ...stackHeaderOpts, title: t('nav.phrasebook') }} />
      <Stack.Screen name="AddCard"      component={AddCardScreen}      options={{ ...stackHeaderOpts, title: t('nav.addCard') }} />
      <Stack.Screen name="Explore"      component={ExploreScreen}      options={{ ...stackHeaderOpts, title: t('nav.explore') }} />
      <Stack.Screen name="DifficultWords" component={DifficultWordsScreen} options={{ ...stackHeaderOpts, title: t('nav.difficultWords') }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
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
    borderColor: 'rgba(255,218,0,0.4)',
    padding: 4,
    height: 62,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 26,
  },
  tabItemActive: {
    backgroundColor: colors.brand,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#020617',
    fontWeight: '800',
  },
});
