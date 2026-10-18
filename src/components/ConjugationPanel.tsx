import Pressable from './ThemedPressable';
import { useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { lookupConjugation } from '../data/conjugations';
import { spacing, radius, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';

interface ConjugationPanelProps {
  infinitive: string;
  compact?: boolean;
}

const pronouns = [
  { key: 'yo', label: 'yo', highlight: false },
  { key: 'tu', label: 'tú', highlight: false },
  { key: 'vos', label: 'vos', highlight: true },
  { key: 'el', label: 'él / ella / usted', highlight: false },
  { key: 'nosotros', label: 'nosotros', highlight: false },
  { key: 'ustedes', label: 'ellos / ellas / ustedes', highlight: true },
] as const;

const tenseLabelKeys = {
  presente: 'conjugation.presente',
  preterito: 'conjugation.preterito',
  futuro: 'conjugation.futuro',
} as const;

export default function ConjugationPanel({ infinitive, compact = false }: ConjugationPanelProps) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTense, setActiveTense] = useState<'presente' | 'preterito' | 'futuro'>('presente');

  const conjugation = lookupConjugation(infinitive);

  if (!conjugation) {
    return null;
  }

  const isIrregular = conjugation.irregular;

  return (
    <>
      {/* Compact trigger button */}
      <TouchableOpacity
        accessibilityRole="button"
        style={[
          compact ? styles.compactButton : styles.triggerButton,
          largeText && styles.stacked,
          isIrregular && (compact ? styles.irregularButton : styles.irregularTriggerButton),
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            compact ? styles.compactButtonText : styles.triggerButtonText,
            isIrregular && (compact ? styles.irregularButtonText : styles.irregularTriggerText),
          ]}
        >
          {isIrregular ? '⚠ ' : ''}
          {t('conjugation.conjugate')}
        </Text>
        {isIrregular && !compact && (
          <Text style={styles.irregularBadge}>{t('conjugation.irregular')}</Text>
        )}
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View key={`header-${fontScale}`} style={styles.modalHeader}>
              <View style={[styles.headerLeft, largeText && styles.stacked]}>
                <Text style={styles.modalTitle}>{infinitive}</Text>
                {isIrregular && (
                  <View style={styles.irregularPill}>
                    <Text style={styles.irregularPillText}>⚠ {t('conjugation.irregular')}</Text>
                  </View>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text allowFontScaling={false} accessible={false} style={styles.closeButtonText}>
                  ✕
                </Text>
              </Pressable>
            </View>

            <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
              <View key={`body-${fontScale}`}>
                {/* Irregular note */}
                {isIrregular && conjugation.irregularNote && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>{conjugation.irregularNote}</Text>
                  </View>
                )}

                {/* Tense selector */}
                <View style={[styles.tabContainer, largeText && styles.stacked]}>
                  {(Object.keys(tenseLabelKeys) as ('presente' | 'preterito' | 'futuro')[]).map(
                    (tense) => (
                      <TouchableOpacity
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeTense === tense }}
                        key={tense}
                        style={[
                          styles.tab,
                          largeText && styles.noFlex,
                          activeTense === tense && styles.activeTab,
                        ]}
                        onPress={() => setActiveTense(tense)}
                      >
                        <Text
                          style={[styles.tabText, activeTense === tense && styles.activeTabText]}
                        >
                          {t(tenseLabelKeys[tense])}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>

                {/* Conjugation table */}
                <View>
                  {pronouns.map(({ key, label, highlight }) => (
                    <View
                      key={key}
                      style={[styles.row, largeText && styles.stacked]}
                      testID={`conjugation-row-${key}`}
                    >
                      <View style={styles.pronounCell}>
                        <Text style={[styles.pronoun, highlight && styles.highlightPronoun]}>
                          {label}
                        </Text>
                        {highlight && <Text style={styles.colombiaTag}>🇨🇴</Text>}
                      </View>
                      <Text style={styles.verbForm}>
                        {conjugation[activeTense][key] ?? t('conjugation.unavailable')}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Colombia note */}
                <View style={styles.colombiaNote}>
                  <Text style={styles.colombiaNoteText}>{t('conjugation.colombiaNote')}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    stacked: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
    noFlex: { flex: 0 },
    bodyScroll: { flexShrink: 1 },
    bodyContent: { paddingBottom: 24 },
    // Compact button (for inline use)
    compactButton: {
      minHeight: 48,
      justifyContent: 'center',
      paddingVertical: spacing(1),
      paddingHorizontal: spacing(2),
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: 'flex-start',
    },
    irregularButton: {
      backgroundColor: colors.warningMuted,
      borderColor: colors.warning,
    },
    compactButtonText: {
      fontSize: typography.size.sm,
      color: colors.brand,
      fontWeight: typography.weight.medium,
    },
    irregularButtonText: {
      color: colors.warning,
    },

    // Trigger button
    triggerButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing(1.5),
      paddingHorizontal: spacing(3),
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing(2),
    },
    irregularTriggerButton: {
      backgroundColor: colors.warningMuted,
      borderColor: colors.warning,
    },
    triggerButtonText: {
      fontSize: typography.size.base,
      color: colors.brand,
      fontWeight: typography.weight.semibold,
    },
    irregularTriggerText: {
      color: colors.warning,
    },
    irregularBadge: {
      marginLeft: spacing(1.5),
      fontSize: typography.size.xs,
      color: colors.warning,
      fontWeight: typography.weight.bold,
      textTransform: 'uppercase',
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius['2xl'],
      borderTopRightRadius: radius['2xl'],
      padding: spacing(4),
      height: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing(3),
    },
    headerLeft: {
      flex: 1,
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing(2),
    },
    modalTitle: {
      fontSize: typography.size['2xl'],
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    irregularPill: {
      backgroundColor: colors.warningMuted,
      paddingHorizontal: spacing(2),
      paddingVertical: spacing(0.5),
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.warning,
    },
    irregularPillText: {
      fontSize: typography.size.xs,
      color: colors.warning,
      fontWeight: typography.weight.bold,
    },
    closeButton: {
      width: 48,
      height: 48,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontSize: typography.size.lg,
      color: colors.textSecondary,
      fontWeight: typography.weight.bold,
    },

    // Note box
    noteBox: {
      backgroundColor: colors.infoMuted,
      padding: spacing(2),
      borderRadius: radius.lg,
      marginBottom: spacing(3),
      borderLeftWidth: 4,
      borderLeftColor: colors.info,
    },
    noteText: {
      fontSize: typography.size.sm,
      color: colors.textPrimary,
      fontStyle: 'italic',
    },

    // Tabs
    tabContainer: {
      flexDirection: 'row',
      marginBottom: spacing(3),
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      padding: spacing(1),
    },
    tab: {
      minHeight: 48,
      flex: 1,
      paddingVertical: spacing(2),
      alignItems: 'center',
      borderRadius: radius.md,
    },
    activeTab: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tabText: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      fontWeight: typography.weight.medium,
    },
    activeTabText: {
      color: colors.brand,
      fontWeight: typography.weight.bold,
    },

    // Table
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing(2),
      paddingHorizontal: spacing(3),
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      marginBottom: spacing(1),
    },
    pronounCell: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing(1),
    },
    pronoun: {
      fontSize: typography.size.base,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    highlightPronoun: {
      color: colors.brand,
      fontWeight: typography.weight.semibold,
    },
    colombiaTag: {
      fontSize: 12,
    },
    verbForm: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },

    // Colombia note
    colombiaNote: {
      marginTop: spacing(3),
      padding: spacing(2),
      backgroundColor: colors.successMuted,
      borderRadius: radius.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
    },
    colombiaNoteText: {
      fontSize: typography.size.sm,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    bold: {
      fontWeight: typography.weight.bold,
    },
  });
