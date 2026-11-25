import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import { useAdventureOverview } from '../adventures/useAdventureOverview';
import { AdventureButton, adventureStyles, visitStatus } from '../components/AdventureUI';
import { ADVENTURES } from '../adventures/content';
import PracticePassport from '../components/PracticePassport';
export default function AdventuresScreen() {
  const overview = useAdventureOverview(),
    nav = useNavigation<any>();
  const { t, language } = useLanguage(),
    styles = useThemedStyles(adventureStyles);
  const [laterOpen, setLaterOpen] = useState(false);
  const visits = overview.available.map((def) => ({
    def,
    status: visitStatus(def, overview.state),
  }));
  const next =
    visits.find(({ status }) => status.kind === 'resume') ??
    visits.find(({ status }) => status.kind === 'start');
  const locked = visits.filter(({ status }) => status.kind === 'locked');
  const otherPlayable = visits.filter((visit) => visit !== next && visit.status.kind !== 'locked');
  const renderVisit = ({ def, status }: (typeof visits)[number], secondary = false) => {
    const title = def.pack.title[language];
    const task = def.pack.nodes.find(
      (node) => node.kind === 'production' || node.kind === 'choice' || node.kind === 'listening',
    );
    const prerequisite =
      status.kind === 'locked'
        ? ADVENTURES.find((candidate) => candidate.pack.id === status.prerequisite)
        : undefined;
    return (
      <View key={def.pack.id} style={styles.card}>
        {def.mode === 'preview' && <Text style={styles.eyebrow}>{t('adventure.draft')}</Text>}
        <Text accessibilityRole="header" style={styles.heading}>
          {title}
        </Text>
        {status.kind === 'locked' ? (
          <Text style={styles.body}>
            {t('adventure.locked', {
              title: prerequisite?.pack.title[language] ?? status.prerequisite,
            })}
          </Text>
        ) : (
          <>
            {!secondary && task && <Text style={styles.body}>{task.title[language]}</Text>}
            <AdventureButton
              label={t(`adventure.visit.${status.kind}`, { title })}
              secondary={secondary}
              onPress={() => nav.navigate('Adventure', { id: def.pack.id, mode: def.mode })}
            />
          </>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <AdventureButton label={t('mission.back')} secondary onPress={() => nav.goBack()} />
        <Text accessibilityRole="header" style={styles.title}>
          {t('adventure.title')}
        </Text>
        {overview.error ? (
          <>
            <Text accessibilityRole="alert" style={styles.body}>
              {t('adventure.loadError')}
            </Text>
            <AdventureButton label={t('mission.retry')} onPress={overview.retry} />
          </>
        ) : !overview.ready ? (
          <Text style={styles.body}>{t('common.loading')}</Text>
        ) : (
          <>
            {next && renderVisit(next)}
            {!visits.length && (
              <>
                <Text style={styles.body}>{t('adventure.empty')}</Text>
                <AdventureButton
                  label={t('adventure.backToPractice')}
                  onPress={() => nav.navigate('Root', { screen: 'Study' }, { pop: true })}
                />
              </>
            )}
            <PracticePassport />
            {otherPlayable.map((visit) => renderVisit(visit, true))}
            {locked.length > 0 && (
              <AdventureButton
                label={t('adventure.laterVisits')}
                secondary
                expanded={laterOpen}
                onPress={() => setLaterOpen((open) => !open)}
              />
            )}
            {laterOpen && locked.map((visit) => renderVisit(visit, true))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
