import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import type { TranslationKey } from '../i18n/translations';
import type { AppTheme } from '../styles/appTheme';
import { controlSurface, controlText } from '../styles/controlStates';
import type { FlashCard } from '../types';
import type { HomePresentation } from '../utils/homePresentation';
import type { WordOfDayPick } from '../utils/wordOfDay';
import Pressable from './ThemedPressable';
import ThemeIcon from './ThemeIcon';

type ToolRoute =
  | 'Quiz'
  | 'DifficultWords'
  | 'Phrasebook'
  | 'Phrases'
  | 'Explore'
  | 'MissionPreview'
  | 'VoicePracticePreview'
  | 'ListeningPreview';
export type BarrioHomeContentProps = {
  presentation: HomePresentation;
  greeting: string;
  activity?: {
    dailyCount: number;
    dailyTarget: number;
    streak: number;
    freezes: number;
    totalDue: number;
    totalNew: number;
    newAvailableToday: number;
  };
  word?: WordOfDayPick;
  dueDecks: ReadonlyArray<{ id: string; name: string; cardCount: number; dueCount: number }>;
  reviewMeasured: boolean;
  replyMeasured: boolean;
  showDevelopment: boolean;
  onPrimary: () => void;
  onManagePlan: (planId: string) => void;
  onBrowseStudy: () => void;
  onDeckPress: (deckId: string) => void;
  onWordAudio: (card: FlashCard) => void;
  onTool: (route: ToolRoute) => void;
};

export default function BarrioHomeContent(props: BarrioHomeContentProps) {
  const { presentation: model } = props;
  const theme = useAppTheme(),
    styles = useThemedStyles(makeStyles);
  const { t } = useLanguage();
  const { width, fontScale } = useWindowDimensions();
  const contentWidth = Math.min(760, Math.max(0, width - 40));
  const stacked = fontScale >= 1.4 || contentWidth < 360;
  const activity =
    model.kind === 'loading' || model.kind === 'readError' ? undefined : props.activity;
  const fmt = (n: number) => n.toLocaleString();
  const plural = (one: TranslationKey, many: TranslationKey, n: number) =>
    t(n === 1 ? one : many, { count: fmt(n) });
  let title: TranslationKey = 'home.barrio.freshTitle';
  let action: TranslationKey = 'home.barrio.start';
  let body: TranslationKey | undefined;
  switch (model.kind) {
    case 'loading':
      title = 'home.barrio.loadingTitle';
      action = 'common.loading';
      break;
    case 'readError':
      title = 'home.barrio.readErrorTitle';
      body = 'home.barrio.readErrorBody';
      action = 'mission.retry';
      break;
    case 'reviewResume':
    case 'appliedResume':
      title = 'home.barrio.resumeTitle';
      action = 'home.barrio.resume';
      break;
    case 'unavailablePlan':
      title = 'home.barrio.unavailableTitle';
      body = 'home.barrio.unavailableBody';
      action = 'home.barrio.unavailableAction';
      break;
    case 'completedToday':
      title = 'home.barrio.completedTitle';
      body = 'home.barrio.completedBody';
      action = 'home.barrio.completedAction';
      break;
    case 'browse':
      title = 'home.barrio.browseTitle';
      action = 'home.browseAllDecks';
      body =
        model.reason === 'empty'
          ? 'home.barrio.emptyBody'
          : model.reason === 'cap'
            ? 'home.barrio.capBody'
            : 'home.barrio.noDueBody';
      break;
  }
  if (model.startError) action = 'mission.retry';
  if (model.pending) action = 'common.loading';
  const primaryDisabled = model.pending || model.action === 'none';
  const actionButton = (
    label: string,
    onPress: () => void,
    disabled = false,
    primary = false,
    busy = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary ? styles.primary : styles.secondary,
        controlSurface(theme, pressed, disabled, primary),
      ]}
    >
      <Text
        style={[primary ? styles.primaryText : styles.actionText, controlText(theme, disabled)]}
      >
        {label}
      </Text>
    </Pressable>
  );
  const tools: { route: ToolRoute; label: TranslationKey }[] = [
    { route: 'Quiz', label: 'home.tool.quiz' },
    { route: 'DifficultWords', label: 'nav.difficultWords' },
    { route: 'Phrasebook', label: 'home.barrio.favorites' },
    { route: 'Phrases', label: 'home.tool.phrases' },
  ];
  const previews: { route: ToolRoute; label: TranslationKey }[] = [
    { route: 'MissionPreview', label: 'mission.draft' },
    { route: 'VoicePracticePreview', label: 'voice.preview' },
    { route: 'ListeningPreview', label: 'listening.preview' },
  ];
  return (
    <ScrollView
      key={fontScale}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greetingRow}>
        <View style={styles.flex}>
          <Text accessibilityRole="header" style={styles.greeting}>
            {props.greeting}
          </Text>
          <Text style={styles.body}>{t('home.barrio.intro')}</Text>
        </View>
        {fontScale < 1.4 && contentWidth >= 320 && (
          <Image
            source={require('../../assets/theme-icons/barrio-cup.png')}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.cup}
          />
        )}
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{t('home.barrio.planEyebrow')}</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {t(title)}
        </Text>
        {body && (
          <Text
            accessibilityRole={model.kind === 'readError' ? 'alert' : undefined}
            style={styles.body}
          >
            {t(body)}
          </Text>
        )}
        {model.kind === 'recommendation' && (
          <>
            <Text style={styles.body}>
              {t(
                model.suggestion.cardCount === 1
                  ? 'home.barrio.reviewOne'
                  : 'home.barrio.reviewMany',
                {
                  count: fmt(model.suggestion.cardCount),
                  minutes: fmt(model.suggestion.estimatedMinutes),
                },
              )}
            </Text>
            {model.suggestion.newCount > 0 && (
              <Text style={styles.body}>
                {plural('home.barrio.newOne', 'home.barrio.newMany', model.suggestion.newCount)}
              </Text>
            )}
            {model.suggestion.catchUp && <Text style={styles.body}>{t('plan.catchUp')}</Text>}
            {props.reviewMeasured && (
              <Text style={styles.caption}>{t('home.measuredEstimate')}</Text>
            )}
          </>
        )}
        {model.kind === 'reviewResume' && (
          <Text style={styles.body}>
            {plural('home.barrio.remainingOne', 'home.barrio.remainingMany', model.remainingCards)}
          </Text>
        )}
        {model.phases.some((phase) => phase.kind === 'reply' && !phase.unavailable) &&
          model.kind !== 'completedToday' && (
            <Text style={styles.caption}>{t('home.barrio.draft')}</Text>
          )}
        {props.replyMeasured &&
          (model.kind === 'recommendation' || model.kind === 'appliedOnly') && (
            <Text style={styles.caption}>{t('plan.measuredReply')}</Text>
          )}
        {model.phases.length > 0 && (
          <View style={styles.phases}>
            {model.phases.map((phase) => {
              const state = phase.unavailable
                ? t('home.barrio.unavailable')
                : phase.finished
                  ? t('home.barrio.finished')
                  : phase.current
                    ? t('home.barrio.current')
                    : '';
              return (
                <Text key={phase.kind} style={styles.phaseText}>
                  {t(
                    phase.kind === 'review' ? 'home.barrio.reviewPhase' : 'home.barrio.replyPhase',
                  )}
                  {state ? ` · ${state}` : ''}
                </Text>
              );
            })}
          </View>
        )}
        {model.startError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {t('home.barrio.startErrorBody')}
          </Text>
        )}
        {actionButton(t(action), props.onPrimary, primaryDisabled, true, model.pending)}
        {model.managePlanId &&
          actionButton(
            t('home.barrio.manage'),
            () => props.onManagePlan(model.managePlanId!),
            model.pending,
          )}
      </View>

      {activity && (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.eyebrow}>
            {t('home.barrio.activity')}
          </Text>
          <Text style={styles.strong}>
            {plural('home.barrio.activityOne', 'home.barrio.activityMany', activity.dailyCount)}
          </Text>
          <Text style={styles.body}>
            {t('home.dailyGoal')}: {fmt(activity.dailyCount)}/{fmt(activity.dailyTarget)}
          </Text>
          {activity.dailyTarget > 0 && (
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={t('home.dailyGoal')}
              accessibilityValue={{
                min: 0,
                max: activity.dailyTarget,
                now: Math.min(activity.dailyCount, activity.dailyTarget),
              }}
              style={styles.track}
            >
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(1, Math.max(0, activity.dailyCount / activity.dailyTarget)) * 100}%`,
                  },
                ]}
              />
            </View>
          )}
          <Text style={styles.body}>
            {plural('home.barrio.streakOne', 'home.barrio.streakMany', activity.streak)}
          </Text>
          {activity.freezes > 0 && (
            <Text style={styles.caption}>
              {plural('home.barrio.freezesOne', 'home.barrio.freezesMany', activity.freezes)}
            </Text>
          )}
          <Text style={styles.body}>
            {t('home.dueLabel', {
              count: fmt(activity.totalDue),
              plural: activity.totalDue === 1 ? '' : 's',
            })}
          </Text>
          <Text style={styles.caption}>
            {t('home.newInLibrary', { count: fmt(activity.totalNew) })}
          </Text>
          <Text style={styles.caption}>
            {t('home.newAvailableToday', { count: fmt(activity.newAvailableToday) })}
          </Text>
        </View>
      )}

      {props.word && (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t('home.wordOfDay')}
          </Text>
          <View style={styles.panel}>
            <View style={[styles.wordRow, stacked && styles.stack]}>
              <Text style={[styles.word, stacked ? styles.full : styles.flex]}>
                {props.word.card.front}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t('common.listen')}: ${props.word.card.front}`}
                onPress={() => props.onWordAudio(props.word!.card)}
                style={({ pressed }) => [
                  styles.audio,
                  controlSurface(theme, pressed, false, false),
                ]}
              >
                <ThemeIcon name="audio" size={22} color={theme.colors.audioText} />
              </Pressable>
            </View>
            <Text style={styles.body}>{props.word.card.back}</Text>
            <Text style={styles.caption}>{props.word.deckName}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {t('home.barrio.exploreHeading')}
        </Text>
        <View style={[styles.toolGrid, stacked && styles.stack]}>
          {tools.map(({ route, label }) => (
            <View key={route} style={stacked ? styles.full : styles.toolCell}>
              {actionButton(t(label), () => props.onTool(route))}
            </View>
          ))}
        </View>
        {actionButton(t('home.barrio.explore'), () => props.onTool('Explore'))}
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {t('home.dueDecks')}
        </Text>
        {(model.kind === 'loading' || model.kind === 'readError' ? [] : props.dueDecks).map(
          (deck) => (
            <Pressable
              key={deck.id}
              accessibilityRole="button"
              accessibilityLabel={`${deck.name}, ${t('home.dueLabel', { count: fmt(deck.dueCount), plural: deck.dueCount === 1 ? '' : 's' })}`}
              disabled={model.pending}
              accessibilityState={{ disabled: model.pending }}
              onPress={() => props.onDeckPress(deck.id)}
              style={({ pressed }) => [
                styles.panel,
                controlSurface(theme, pressed, model.pending, false),
              ]}
            >
              <Text style={[styles.strong, controlText(theme, model.pending)]}>{deck.name}</Text>
              <Text style={[styles.caption, controlText(theme, model.pending)]}>
                {t('addCard.cardCount', {
                  count: fmt(deck.cardCount),
                  plural: deck.cardCount === 1 ? '' : 's',
                })}{' '}
                ·{' '}
                {t('home.dueLabel', {
                  count: fmt(deck.dueCount),
                  plural: deck.dueCount === 1 ? '' : 's',
                })}
              </Text>
            </Pressable>
          ),
        )}
        {model.kind !== 'browse' && actionButton(t('home.browseAllDecks'), props.onBrowseStudy)}
      </View>

      {props.showDevelopment && (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t('home.barrio.development')}
          </Text>
          {previews.map(({ route, label }) => (
            <View key={route}>{actionButton(t(label), () => props.onTool(route))}</View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    content: {
      padding: 20,
      paddingBottom: 32,
      gap: 28,
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    flex: { flex: 1, minWidth: 0 },
    full: { width: '100%' },
    greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    greeting: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
    cup: { width: 40, height: 40, tintColor: colors.accentRed },
    hero: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
      gap: 16,
    },
    eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary },
    title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
    body: { fontSize: 16, color: colors.textSecondary },
    caption: { fontSize: 14, color: colors.textSecondary },
    strong: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
    error: { fontSize: 16, color: colors.danger },
    phases: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: 14, gap: 10 },
    phaseText: { fontSize: 16, color: colors.textPrimary, fontWeight: '600' },
    action: {
      minHeight: 52,
      minWidth: 48,
      padding: 14,
      borderRadius: 12,
      justifyContent: 'center',
    },
    primary: { backgroundColor: colors.brand },
    secondary: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderWidth: 1,
    },
    primaryText: { fontSize: 17, fontWeight: '700', color: colors.onBrand },
    actionText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    section: { gap: 14 },
    sectionTitle: { fontSize: 21, fontWeight: '700', color: colors.textPrimary },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.progressTrack,
      overflow: 'hidden',
    },
    fill: { height: '100%', backgroundColor: colors.progressSuccess },
    panel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 18,
      gap: 10,
      minHeight: 48,
    },
    wordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    word: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
    audio: {
      minWidth: 48,
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: colors.audioSurface,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    toolCell: { width: '48%', flexGrow: 1 },
    stack: { flexDirection: 'column', alignItems: 'stretch' },
  });
