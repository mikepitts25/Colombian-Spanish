import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SHOW_REVIEW_TOOLS } from '../config';
import { ADVENTURES } from '../adventures/content';
import { useAdventureOverview } from '../adventures/useAdventureOverview';
import { useThemedStyles } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AdventureButton, CafeStamp, adventureStyles } from './AdventureUI';
export default function PracticePassport() {
  const overview = useAdventureOverview(),
    nav = useNavigation<any>();
  const { t, language } = useLanguage(),
    styles = useThemedStyles(adventureStyles);
  if (!overview.visible) return null;
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t('adventure.passport')}
      </Text>
      <Text style={styles.body}>{t('adventure.passportNote')}</Text>
      {overview.error ? (
        <>
          <Text accessibilityRole="alert" style={styles.body}>
            {t('adventure.loadError')}
          </Text>
          <AdventureButton label={t('mission.retry')} onPress={overview.retry} />
        </>
      ) : (
        <>
          {!overview.state.outcomes.length && (
            <Text style={styles.body}>{t('adventure.emptyPassport')}</Text>
          )}
          {overview.state.outcomes
            .filter((o) => o.mode === 'accepted' || SHOW_REVIEW_TOOLS)
            .map((outcome) => {
              const def = ADVENTURES.find((d) => d.pack.id === outcome.missionId);
              const available = overview.available.some(
                (d) =>
                  d.pack.id === outcome.missionId &&
                  d.mode === outcome.mode &&
                  d.fingerprint === outcome.fingerprint,
              );
              const description = [
                outcome.mode === 'preview' ? t('adventure.previewStamp') : t('adventure.stamp'),
                t(outcome.supported ? 'adventure.supported' : 'adventure.independent'),
                `${t('adventure.version')} ${outcome.contentVersion}`,
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
                      onPress={() =>
                        nav.navigate('Adventure', { id: outcome.missionId, mode: outcome.mode })
                      }
                    />
                  )}
                </View>
              );
            })}
          <AdventureButton label={t('adventure.open')} onPress={() => nav.navigate('Adventures')} />
        </>
      )}
    </View>
  );
}
