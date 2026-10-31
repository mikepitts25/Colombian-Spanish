import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import { useAdventureOverview } from '../adventures/useAdventureOverview';
import { AdventureButton, adventureStyles } from '../components/AdventureUI';
import PracticePassport from '../components/PracticePassport';
export default function AdventuresScreen() {
  const overview = useAdventureOverview(),
    nav = useNavigation<any>();
  const { t, language } = useLanguage(),
    styles = useThemedStyles(adventureStyles);
  const ordered = [...overview.available].sort((a, b) => {
    const complete = (id: string, mode: string) =>
      overview.state.milestones.some((m) => m.mode === mode && m.missionId === id);
    return Number(complete(a.pack.id, a.mode)) - Number(complete(b.pack.id, b.mode));
  });
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <AdventureButton label={t('mission.back')} onPress={() => nav.goBack()} />
        <Text accessibilityRole="header" style={styles.title}>
          {t('adventure.title')}
        </Text>
        <Text style={styles.body}>
          {t(overview.returning ? 'adventure.welcomeBack' : 'adventure.intro')}
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
            {!ordered.length && <Text style={styles.body}>{t('adventure.empty')}</Text>}
            {ordered.map((def) => {
              const locked = def.pack.prerequisites.some(
                (id) =>
                  !overview.state.milestones.some((m) => m.mode === def.mode && m.missionId === id),
              );
              const run = overview.state.runs.find(
                (r) => r.mode === def.mode && r.mission.missionId === def.pack.id,
              );
              return (
                <View key={def.pack.id} style={styles.card}>
                  <Text style={styles.eyebrow}>
                    {t(def.mode === 'preview' ? 'adventure.draft' : 'adventure.shortVisit')}
                  </Text>
                  <Text accessibilityRole="header" style={styles.heading}>
                    {def.pack.title[language]}
                  </Text>
                  <Text style={styles.body}>
                    {t(locked ? 'adventure.locked' : 'adventure.shortVisit')}
                  </Text>
                  <AdventureButton
                    label={t(
                      run && !run.mission.completed ? 'adventure.resume' : 'adventure.start',
                    )}
                    disabled={locked}
                    onPress={() => nav.navigate('Adventure', { id: def.pack.id, mode: def.mode })}
                  />
                </View>
              );
            })}
            <PracticePassport />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
