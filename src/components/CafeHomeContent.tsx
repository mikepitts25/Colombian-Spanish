import { cafeColors } from '../styles/cafeTheme';
import React, { ReactNode, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { useAppTheme } from '../context/ThemeContext';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useCafeAtmosphere } from '../hooks/useCafeAtmosphere';
import type { TranslationKey } from '../i18n/translations';
import type { HomePresentation } from '../utils/homePresentation';
import CafeScene from './CafeScene';
import Pressable from './ThemedPressable';

export default function CafeHomeContent({
  presentation: model,
  activity,
  adventure,
  children,
  onPrimary,
  onBrowse,
  onManage,
  onSettings,
}: {
  presentation: HomePresentation;
  activity?: { count: number; target: number };
  adventure: ReactNode;
  children: ReactNode;
  onPrimary: () => void;
  onBrowse: () => void;
  onManage: (id: string) => void;
  onSettings: () => void;
}) {
  const { t } = useLanguage();
  const theme = useAppTheme();
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle(theme.appearance === 'dark' ? 'light' : 'dark');
    }, [theme.appearance]),
  );
  const { time, animate, reduceMotion, palette } = useCafeAtmosphere();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  let heading: TranslationKey = 'home.cafe.invitation';
  let action: TranslationKey = 'home.cafe.practice';
  let body: TranslationKey = 'home.cafe.shortVisit';
  switch (model.kind) {
    case 'loading':
      action = 'common.loading';
      break;
    case 'readError':
      heading = 'home.barrio.readErrorTitle';
      body = 'home.barrio.readErrorBody';
      action = 'mission.retry';
      break;
    case 'reviewResume':
    case 'appliedResume':
      heading = 'home.cafe.seatSaved';
      body = 'home.cafe.resumeBody';
      action = 'home.cafe.continue';
      break;
    case 'completedToday':
      heading = 'home.cafe.complete';
      body = 'home.barrio.completedBody';
      action = 'home.barrio.completedAction';
      break;
    case 'unavailablePlan':
      heading = 'home.barrio.unavailableTitle';
      body = 'home.barrio.unavailableBody';
      action = 'home.barrio.unavailableAction';
      break;
    case 'browse':
      body =
        model.reason === 'empty'
          ? 'home.cafe.firstVisit'
          : model.reason === 'cap'
            ? 'home.barrio.capBody'
            : 'home.barrio.noDueBody';
      action = 'home.chooseTopic';
      break;
    case 'recommendation':
      body =
        model.suggestion.dueCount > 0 && model.suggestion.newCount === 0
          ? 'home.cafe.familiar'
          : 'home.cafe.newWords';
      break;
  }
  if (model.startError) action = 'mission.retry';
  if (model.pending) action = 'common.loading';
  const disabled = model.pending || model.action === 'none';
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <ScrollView
        key={fontScale}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.greetingCopy}>
              <Text maxFontSizeMultiplier={1.6} style={styles.eyebrow}>
                {t(`home.cafe.${time}`)}
              </Text>
              <Text
                maxFontSizeMultiplier={1.6}
                accessibilityRole="header"
                style={[styles.greeting, largeText && { fontSize: 26 }]}
              >
                {t('home.cafe.greeting')}
              </Text>
              {!largeText && <Text style={styles.welcome}>{t('home.cafe.welcome')}</Text>}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tabs.settings')}
              onPress={onSettings}
              style={({ pressed }) => [styles.profile, pressed && styles.pressed]}
            >
              <View accessible={false} style={styles.profileHead} />
              <View accessible={false} style={styles.profileShoulders} />
            </Pressable>
          </View>
          {fontScale < 2 && (
            <CafeScene
              time={time}
              animate={animate}
              reduceMotion={reduceMotion}
              background={palette.background}
            />
          )}
          <View style={styles.invitation}>
            {activity && model.kind !== 'readError' && model.kind !== 'loading' && (
              <Text
                style={styles.progress}
                accessibilityLabel={t('home.cafe.dailyProgress', {
                  count: activity.count,
                  target: activity.target,
                })}
              >
                {t('home.today')} · {activity.count}/{activity.target}
              </Text>
            )}
            <Text
              maxFontSizeMultiplier={1.6}
              accessibilityRole="header"
              style={[styles.title, largeText && { fontSize: 25, lineHeight: 33 }]}
            >
              {t(heading)}
            </Text>
            <Text
              accessibilityRole={model.kind === 'readError' ? 'alert' : undefined}
              style={styles.body}
            >
              {t(body, {
                minutes: model.kind === 'recommendation' ? model.suggestion.estimatedMinutes : '',
              })}
            </Text>
            {model.startError && (
              <Text accessibilityRole="alert" style={styles.body}>
                {t('home.barrio.startErrorBody')}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(action)}
              accessibilityState={{ disabled, busy: model.pending }}
              disabled={disabled}
              onPress={onPrimary}
              style={({ pressed }) => [
                styles.primary,
                pressed && styles.primaryPressed,
                disabled && styles.disabled,
              ]}
            >
              <Text style={styles.primaryText}>{t(action)}</Text>
              {!disabled && (
                <Text accessible={false} style={styles.primaryText}>
                  →
                </Text>
              )}
            </Pressable>
            {model.kind !== 'browse' && (
              <Pressable
                accessibilityRole="button"
                disabled={model.pending}
                onPress={onBrowse}
                style={({ pressed }) => [
                  styles.link,
                  pressed && styles.pressed,
                  model.pending && styles.disabled,
                ]}
              >
                <Text style={styles.linkText}>{t('home.chooseTopic')}</Text>
              </Pressable>
            )}
            {model.managePlanId && (
              <Pressable
                accessibilityRole="button"
                disabled={model.pending}
                onPress={() => onManage(model.managePlanId!)}
                style={styles.link}
              >
                <Text style={styles.linkText}>{t('plan.manage')}</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.adventure}>{adventure}</View>
          <View style={styles.details}>{children}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 28 },
  page: { width: '100%', maxWidth: 680, alignSelf: 'center' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  greetingCopy: { flex: 1 },
  eyebrow: {
    color: cafeColors.greeting,
    fontSize: 11,
    letterSpacing: 2.6,
    fontWeight: '700',
    marginBottom: 8,
  },
  greeting: { color: cafeColors.cream, fontFamily: serif, fontSize: 36 },
  welcome: { color: cafeColors.secondary, fontSize: 15, marginTop: 5, lineHeight: 22 },
  profile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: cafeColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  profileHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: cafeColors.cream },
  profileShoulders: {
    width: 22,
    height: 11,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: cafeColors.cream,
  },
  invitation: { paddingHorizontal: 24, gap: 11, marginTop: -8 },
  progress: { color: cafeColors.secondary, fontSize: 12, alignSelf: 'flex-start', marginBottom: 1 },
  title: { color: cafeColors.cream, fontFamily: serif, fontSize: 31, lineHeight: 38 },
  body: { color: cafeColors.secondary, fontSize: 15, lineHeight: 23 },
  primary: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: cafeColors.yellow,
    borderRadius: 28,
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  primaryText: {
    flexShrink: 1,
    color: cafeColors.onYellow,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryPressed: { backgroundColor: cafeColors.yellowPressed },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.7 },
  link: { minHeight: 48, padding: 8, alignItems: 'center', justifyContent: 'center' },
  linkText: {
    color: cafeColors.cream,
    fontSize: 15,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  adventure: { marginHorizontal: 20, marginTop: 2 },
  details: { marginTop: 24 },
});
