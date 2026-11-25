import React, { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pressable from './ThemedPressable';
import type { AppTheme } from '../styles/appTheme';
import { useNavigation } from '@react-navigation/native';
import { SHOW_CAFE_DRAFTS } from '../config';
import { ADVENTURES } from '../adventures/content';
import { outcomeKey, type PracticeOutcome } from '../adventures/state';
import { useAdventureOverview } from '../adventures/useAdventureOverview';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useThemedStyles } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AdventureButton, CafeStamp, adventureStyles, visitStatus } from './AdventureUI';
export default function PracticePassport({
  stamp,
  primary = false,
}: {
  stamp?: PracticeOutcome;
  primary?: boolean;
}) {
  const overview = useAdventureOverview(),
    nav = useNavigation<any>();
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const trigger = useRef<View>(null);
  const closeButton = useRef<View>(null);
  const stampView = useRef<View>(null);
  const returnFocus = useRef(false);
  const cover = useThemedStyles(passportStyles);
  const { t, language } = useLanguage(),
    styles = useThemedStyles(adventureStyles);
  const focusedStamp = stamp && outcomeKey(stamp);
  if (!overview.visible && !stamp) return null;
  const outcomes = overview.state.outcomes.filter((o) => o.mode === 'accepted' || SHOW_CAFE_DRAFTS);
  if (stamp && !overview.ready && !outcomes.some((outcome) => outcomeKey(outcome) === focusedStamp))
    outcomes.unshift(stamp);
  const visits = overview.available.map((def) => ({
    def,
    status: visitStatus(def, overview.state),
  }));
  const next =
    visits.find(({ status }) => status.kind === 'resume') ??
    visits.find(({ status }) => status.kind === 'start');
  const restoreFocus = () => {
    if (!returnFocus.current) return;
    returnFocus.current = false;
    if (trigger.current) AccessibilityInfo.sendAccessibilityEvent(trigger.current, 'focus');
  };
  const close = () => {
    returnFocus.current = true;
    setOpen(false);
    if (Platform.OS !== 'ios') requestAnimationFrame(restoreFocus);
  };
  const visit = (id: string, mode: string) => {
    returnFocus.current = false;
    setOpen(false);
    nav.navigate('Adventure', { id, mode });
  };
  const count = t(outcomes.length === 1 ? 'adventure.stampCountOne' : 'adventure.stampCount', {
    count: outcomes.length,
  });
  const summary = overview.error
    ? t('adventure.loadError')
    : !overview.ready
      ? t('common.loading')
      : count;
  return (
    <>
      {stamp ? (
        <AdventureButton
          label={t('adventure.viewStamp')}
          onPress={() => setOpen(true)}
          buttonRef={trigger}
          secondary={!primary}
        />
      ) : (
        <Pressable
          ref={trigger}
          accessibilityRole="button"
          accessibilityLabel={t('adventure.openPassport')}
          accessibilityHint={t('adventure.passportTagline')}
          accessibilityValue={{ text: summary }}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [cover.cover, pressed && cover.pressed]}
        >
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={cover.book}
          >
            <View style={cover.spine} />
            <Text style={cover.emblem}>✦</Text>
            <Text style={cover.bookTitle}>COLOMBIA</Text>
            <View style={cover.flag}>
              <View style={cover.yellow} />
              <View style={cover.blue} />
              <View style={cover.red} />
            </View>
          </View>
          <View style={cover.coverCopy}>
            <Text style={cover.eyebrow}>{t('adventure.passportCover')}</Text>
            <Text style={cover.title}>{t('adventure.passport')}</Text>
            <Text style={cover.count}>{summary}</Text>
            <Text style={cover.open}>{t('adventure.openPassport')} →</Text>
          </View>
        </Pressable>
      )}
      <Modal
        visible={open}
        animationType={reducedMotion ? 'none' : 'slide'}
        presentationStyle="pageSheet"
        onRequestClose={close}
        onDismiss={restoreFocus}
        onShow={() => {
          const target = stampView.current ?? closeButton.current;
          if (target) AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
        }}
      >
        <SafeAreaView style={styles.wrap} accessibilityViewIsModal>
          <ScrollView testID="passport-collection" contentContainerStyle={styles.content}>
            <AdventureButton
              label={t('adventure.closePassport')}
              onPress={close}
              buttonRef={closeButton}
              secondary
            />
            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.heading}>
                {t('adventure.passport')}
              </Text>
              <Text style={styles.body}>{t('adventure.passportTagline')}</Text>
              {overview.error ? (
                <>
                  <Text accessibilityRole="alert" style={styles.body}>
                    {t('adventure.loadError')}
                  </Text>
                  <AdventureButton label={t('mission.retry')} onPress={overview.retry} />
                </>
              ) : (
                <>
                  {!overview.ready ? (
                    <Text style={styles.body}>{t('common.loading')}</Text>
                  ) : (
                    !outcomes.length && (
                      <View style={styles.stamp}>
                        <Text style={styles.heading}>{t('adventure.firstStamp')}</Text>
                        <Text style={styles.body}>{t('adventure.emptyPassport')}</Text>
                      </View>
                    )
                  )}
                  {overview.ready && next && !focusedStamp && (
                    <View style={{ gap: 10 }}>
                      <Text style={styles.body}>{next.def.pack.title[language]}</Text>
                      <AdventureButton
                        label={t(
                          next.status.kind === 'resume'
                            ? 'adventure.resume'
                            : !outcomes.length
                              ? 'adventure.firstVisit'
                              : 'adventure.continue',
                        )}
                        onPress={() => visit(next.def.pack.id, next.def.mode)}
                      />
                    </View>
                  )}
                  {[...outcomes]
                    .sort(
                      (a, b) =>
                        Number(outcomeKey(b) === focusedStamp) -
                        Number(outcomeKey(a) === focusedStamp),
                    )
                    .map((outcome) => {
                      const def = ADVENTURES.find((d) => d.pack.id === outcome.missionId);
                      const available = overview.available.some(
                        (d) =>
                          d.pack.id === outcome.missionId &&
                          d.mode === outcome.mode &&
                          d.fingerprint === outcome.fingerprint,
                      );
                      const description = [
                        outcome.mode === 'preview'
                          ? t('adventure.previewStamp')
                          : t('adventure.stamp'),
                        t(outcome.supported ? 'adventure.supported' : 'adventure.independent'),
                        `${t('adventure.version')} ${outcome.contentVersion}`,
                        new Date(outcome.earnedAt).toLocaleDateString(
                          language === 'es' ? 'es-CO' : 'en-GB',
                        ),
                        ...(!available ? [t('adventure.historical')] : []),
                      ].join(' · ');
                      return (
                        <View key={outcomeKey(outcome)} style={{ gap: 12 }}>
                          <CafeStamp
                            title={def?.pack.title[language] ?? outcome.missionId}
                            description={description}
                            stampRef={outcomeKey(outcome) === focusedStamp ? stampView : undefined}
                          />
                          {available && (
                            <AdventureButton
                              label={`${t('adventure.revisit')}: ${def?.pack.title[language] ?? outcome.missionId}`}
                              onPress={() => visit(outcome.missionId, outcome.mode)}
                              secondary
                            />
                          )}
                        </View>
                      );
                    })}
                  <Text style={styles.body}>{t('adventure.passportNote')}</Text>
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const passportStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    cover: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
      padding: 18,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderBrand,
      backgroundColor: colors.deepSurface,
    },
    pressed: { opacity: 0.8 },
    book: {
      width: 84,
      minHeight: 112,
      borderRadius: 8,
      borderTopLeftRadius: 3,
      borderBottomLeftRadius: 3,
      borderWidth: 1,
      borderColor: colors.brand,
      padding: 12,
      paddingLeft: 16,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      backgroundColor: colors.bg,
      transform: [{ rotate: '-6deg' }],
    },
    spine: {
      position: 'absolute',
      left: 6,
      top: 0,
      bottom: 0,
      borderLeftWidth: 1,
      borderColor: colors.borderBrand,
    },
    emblem: { fontSize: 32, color: colors.brand },
    bookTitle: { fontSize: 8, letterSpacing: 1, fontWeight: '700', color: colors.brand },
    flag: { width: 28, height: 12, overflow: 'hidden', borderRadius: 2 },
    yellow: { flex: 2, backgroundColor: colors.gradient.colombia[0] },
    blue: { flex: 1, backgroundColor: colors.gradient.colombia[1] },
    red: { flex: 1, backgroundColor: colors.gradient.colombia[2] },
    coverCopy: { flex: 1, gap: 6 },
    eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: colors.brand },
    title: { fontSize: 20, lineHeight: 26, fontWeight: '700', color: colors.textPrimary },
    count: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    open: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.brand },
  });
