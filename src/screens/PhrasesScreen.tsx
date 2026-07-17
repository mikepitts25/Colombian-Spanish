import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { TranslationKey } from '../i18n/translations';
import { useDeck } from '../hooks/useDeck';
import { useLanguage } from '../context/LanguageContext';
import { speakCard } from '../services/tts';
import { AvailablePhraseTopic, getAvailablePhraseTopics } from '../utils/phraseTopics';
import { colors, radius, spacing } from '../styles/theme';

export default function PhrasesScreen() {
  const { ready, decks, toggleFavorite } = useDeck();
  const { t } = useLanguage();
  const nav = useNavigation<any>();
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();

  const topics = useMemo(() => getAvailablePhraseTopics(decks || []), [decks]);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.loading}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  const openFavorites = () => nav.navigate('Phrasebook');

  if (selectedTopic) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.topicHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('phrases.back')}
            style={styles.backButton}
            onPress={() => setSelectedTopicId(undefined)}
          >
            <Text style={styles.backText}>← {t('phrases.back')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('phrases.openFavorites')}
            style={styles.favoritesButton}
            onPress={openFavorites}
          >
            <Text style={styles.favoritesIcon}>★</Text>
          </Pressable>
        </View>

        <FlatList
          data={selectedTopic.cards}
          keyExtractor={(card) => card.id}
          contentContainerStyle={styles.cardsContent}
          ListHeaderComponent={
            <TopicHeader
              topic={selectedTopic}
              title={t(selectedTopic.titleKey as TranslationKey)}
              description={t(selectedTopic.descriptionKey as TranslationKey)}
              countLabel={t('phrases.cardCount', { count: selectedTopic.cards.length })}
              studyLabel={t(selectedTopic.studyKey as TranslationKey)}
              onStudy={() =>
                nav.navigate('Root', {
                  screen: 'Study',
                  params: { autoStartDeckId: selectedTopic.deck.id },
                })
              }
            />
          }
          renderItem={({ item: card }) => (
            <PhraseCard
              card={card}
              playLabel={t('phrases.playLabel', { phrase: card.front })}
              saveLabel={t('phrases.saveLabel', { phrase: card.front })}
              removeLabel={t('phrases.removeLabel', { phrase: card.front })}
              onPlay={() => void speakCard(card)}
              onToggleFavorite={() => toggleFavorite(card.id)}
            />
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{t('phrases.title')}</Text>
          <Text style={styles.sub}>{t('phrases.sub')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('phrases.openFavorites')}
          style={styles.favoritesButton}
          onPress={openFavorites}
        >
          <Text style={styles.favoritesIcon}>★</Text>
        </Pressable>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(topic) => topic.id}
        contentContainerStyle={styles.topicList}
        renderItem={({ item: topic }) => (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.topicCard, pressed && styles.topicCardPressed]}
            onPress={() => setSelectedTopicId(topic.id)}
          >
            <View style={styles.topicEmojiWrap}>
              <Text style={styles.topicEmoji}>{topic.emoji}</Text>
            </View>
            <View style={styles.topicCopy}>
              <Text style={styles.topicTitle}>{t(topic.titleKey as TranslationKey)}</Text>
              <Text style={styles.topicSub}>{t(topic.descriptionKey as TranslationKey)}</Text>
              <Text style={styles.topicCount}>
                {t('phrases.cardCount', { count: topic.cards.length })}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('phrases.empty')}</Text>}
      />
    </SafeAreaView>
  );
}

function TopicHeader({
  topic,
  title,
  description,
  countLabel,
  studyLabel,
  onStudy,
}: {
  topic: AvailablePhraseTopic;
  title: string;
  description: string;
  countLabel: string;
  studyLabel: string;
  onStudy: () => void;
}) {
  return (
    <View style={styles.selectedIntro}>
      <View style={styles.selectedTitleRow}>
        <Text style={styles.selectedEmoji}>{topic.emoji}</Text>
        <View style={styles.selectedCopy}>
          <Text style={styles.selectedTitle}>{title}</Text>
          <Text style={styles.selectedSub}>{description}</Text>
        </View>
      </View>
      <View style={styles.topicActionRow}>
        <Text style={styles.selectedCount}>{countLabel}</Text>
        <Pressable accessibilityRole="button" style={styles.studyButton} onPress={onStudy}>
          <Text style={styles.studyButtonText}>{studyLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PhraseCard({
  card,
  playLabel,
  saveLabel,
  removeLabel,
  onPlay,
  onToggleFavorite,
}: {
  card: AvailablePhraseTopic['cards'][number];
  playLabel: string;
  saveLabel: string;
  removeLabel: string;
  onPlay: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <View style={styles.phraseCard}>
      <View style={styles.phraseCopy}>
        <Text style={styles.phraseFront}>{card.front}</Text>
        <Text style={styles.phraseBack}>{card.back}</Text>
        {card.example ? <Text style={styles.example}>“{card.example}”</Text> : null}
      </View>
      <View style={styles.phraseActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playLabel}
          style={styles.actionButton}
          onPress={onPlay}
        >
          <Text style={styles.actionText}>🔊</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={card.favorite ? removeLabel : saveLabel}
          style={[styles.actionButton, card.favorite && styles.favoriteActive]}
          onPress={onToggleFavorite}
        >
          <Text style={styles.actionText}>{card.favorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  loading: { color: colors.textPrimary, fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(1.5),
    marginBottom: spacing(2),
  },
  headerCopy: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '900' },
  sub: { color: colors.textSecondary, fontSize: 15, lineHeight: 21, marginTop: 4 },
  favoritesButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderBrand,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  favoritesIcon: { color: colors.brand, fontSize: 22 },
  topicList: { gap: spacing(1), paddingBottom: spacing(3) },
  topicCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing(1.5),
    padding: spacing(1.5),
  },
  topicCardPressed: { backgroundColor: colors.surfacePressed },
  topicEmojiWrap: {
    alignItems: 'center',
    backgroundColor: colors.brandMuted,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  topicEmoji: { fontSize: 23 },
  topicCopy: { flex: 1 },
  topicTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  topicSub: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  topicCount: { color: colors.textTertiary, fontSize: 12, fontWeight: '700', marginTop: 5 },
  chevron: { color: colors.brand, fontSize: 28, fontWeight: '500' },
  empty: { color: colors.textSecondary, fontSize: 15, marginTop: spacing(2) },
  topicHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(1.5),
  },
  backButton: { paddingVertical: spacing(0.5) },
  backText: { color: colors.brand, fontSize: 14, fontWeight: '800' },
  cardsContent: { paddingBottom: spacing(3) },
  selectedIntro: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing(1.5),
    padding: spacing(1.5),
  },
  selectedTitleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing(1.25) },
  selectedEmoji: { fontSize: 30 },
  selectedCopy: { flex: 1 },
  selectedTitle: { color: colors.textPrimary, fontSize: 21, fontWeight: '900' },
  selectedSub: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 3 },
  topicActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing(1.5),
  },
  selectedCount: { color: colors.textTertiary, fontSize: 13, fontWeight: '700' },
  studyButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1),
  },
  studyButtonText: { color: colors.textInverse, fontSize: 13, fontWeight: '900' },
  phraseCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing(1),
    marginBottom: spacing(1),
    padding: spacing(1.25),
  },
  phraseCopy: { flex: 1 },
  phraseFront: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  phraseBack: { color: '#cbd5e1', fontSize: 14, marginTop: 3 },
  example: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 7,
  },
  phraseActions: { gap: spacing(0.75) },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.base,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  favoriteActive: { borderColor: colors.brand },
  actionText: { color: colors.textPrimary, fontSize: 18 },
});
