import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pressable from './ThemedPressable';
import type { AppTheme } from '../styles/appTheme';
import { useNavigation } from '@react-navigation/native';
import { SHOW_CAFE_DRAFTS } from '../config';
import { ADVENTURES } from '../adventures/content';
import { useAdventureOverview } from '../adventures/useAdventureOverview';
import { useThemedStyles } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AdventureButton, CafeStamp, adventureStyles } from './AdventureUI';
export default function PracticePassport() {
  const overview = useAdventureOverview(),
    nav = useNavigation<any>();
  const [open, setOpen] = useState(false);
  const cover = useThemedStyles(passportStyles);
  const { t, language } = useLanguage(),
    styles = useThemedStyles(adventureStyles);
  if (!overview.visible) return null;
  const outcomes = overview.state.outcomes.filter((o) => o.mode === 'accepted' || SHOW_CAFE_DRAFTS);
  const next = overview.available.find(
    (def) =>
      !overview.state.milestones.some((m) => m.mode === def.mode && m.missionId === def.pack.id) &&
      def.pack.prerequisites.every((id) =>
        overview.state.milestones.some((m) => m.mode === def.mode && m.missionId === id),
      ),
  );
  const unfinished =
    next &&
    overview.state.runs.some(
      (run) =>
        run.mode === next.mode && run.mission.missionId === next.pack.id && !run.mission.completed,
    );
  const visit = (id: string, mode: string) => {
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
      <Pressable
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
      {open && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setOpen(false)}
        >
          <SafeAreaView style={styles.wrap}>
            <ScrollView testID="passport-collection" contentContainerStyle={styles.content}>
              <AdventureButton
                label={t('adventure.closePassport')}
                onPress={() => setOpen(false)}
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
                    {overview.ready && next && (
                      <View style={{ gap: 10 }}>
                        <Text style={styles.body}>{next.pack.title[language]}</Text>
                        <AdventureButton
                          label={t(
                            unfinished
                              ? 'adventure.resume'
                              : !outcomes.length
                                ? 'adventure.firstVisit'
                                : 'adventure.continue',
                          )}
                          onPress={() => visit(next.pack.id, next.mode)}
                        />
                      </View>
                    )}
                    {outcomes.map((outcome) => {
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
                        <View
                          key={`${outcome.mode}:${outcome.missionId}:${outcome.fingerprint}`}
                          style={{ gap: 12 }}
                        >
                          <CafeStamp
                            title={def?.pack.title[language] ?? outcome.missionId}
                            description={description}
                          />
                          {available && (
                            <AdventureButton
                              label={`${t('adventure.revisit')}: ${def?.pack.title[language] ?? outcome.missionId}`}
                              onPress={() => visit(outcome.missionId, outcome.mode)}
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
      )}
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
