import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { ConjugationTable, ConjugationTense, lookupConjugation } from '../data/conjugations';
import { colors, spacing, radius, typography } from '../styles/theme';

interface ConjugationPanelProps {
  infinitive: string;
  compact?: boolean;
}

const pronouns = [
  { key: 'yo', label: 'yo' },
  { key: 'tu_vos', label: 'tú / vos', highlight: true },
  { key: 'el', label: 'él/ella' },
  { key: 'nosotros', label: 'nosotros' },
  { key: 'ustedes', label: 'ustedes', highlight: true },
];

function getVerbForm(tense: ConjugationTense, key: string): string {
  if (key === 'tu_vos') {
    const tu = tense.tu;
    const vos = tense.vos;
    if (!tu || tu === vos) return vos;
    return `${tu} / ${vos}`;
  }
  return (tense as Record<string, string>)[key] ?? '';
}

const tenseLabels: Record<string, string> = {
  presente: 'Presente',
  preterito: 'Pretérito',
  futuro: 'Futuro',
};

export default function ConjugationPanel({ infinitive, compact = false }: ConjugationPanelProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTense, setActiveTense] = useState<'presente' | 'preterito' | 'futuro'>('presente');

  const conjugation = lookupConjugation(infinitive);

  if (!conjugation) {
    return null;
  }

  const isIrregular = conjugation.irregular;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, isIrregular && styles.irregularButton]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.compactButtonText, isIrregular && styles.irregularButtonText]}>
          {isIrregular ? '⚠ ' : ''}Conjugar ▾
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      {/* Compact trigger button */}
      <TouchableOpacity
        style={[styles.triggerButton, isIrregular && styles.irregularTriggerButton]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.triggerButtonText, isIrregular && styles.irregularTriggerText]}>
          {isIrregular ? '⚠ ' : ''}Conjugar ▾
        </Text>
        {isIrregular && (
          <Text style={styles.irregularBadge}>irregular</Text>
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
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.modalTitle}>{infinitive}</Text>
                {isIrregular && (
                  <View style={styles.irregularPill}>
                    <Text style={styles.irregularPillText}>⚠ irregular</Text>
                  </View>
                )}
              </View>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Irregular note */}
            {isIrregular && conjugation.irregularNote && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{conjugation.irregularNote}</Text>
              </View>
            )}

            {/* Tense selector */}
            <View style={styles.tabContainer}>
              {(Object.keys(tenseLabels) as Array<'presente' | 'preterito' | 'futuro'>).map((tense) => (
                <TouchableOpacity
                  key={tense}
                  style={[styles.tab, activeTense === tense && styles.activeTab]}
                  onPress={() => setActiveTense(tense)}
                >
                  <Text style={[styles.tabText, activeTense === tense && styles.activeTabText]}>
                    {tenseLabels[tense]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Conjugation table */}
            <ScrollView style={styles.tableContainer}>
              {pronouns.map(({ key, label, highlight }) => (
                <View key={key} style={styles.row}>
                  <View style={styles.pronounCell}>
                    <Text style={[styles.pronoun, highlight && styles.highlightPronoun]}>
                      {label}
                    </Text>
                    {highlight && <Text style={styles.colombiaTag}>🇨🇴</Text>}
                  </View>
                  <Text style={styles.verbForm}>
                    {getVerbForm(conjugation[activeTense], key)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Colombia note */}
            <View style={styles.colombiaNote}>
              <Text style={styles.colombiaNoteText}>
                🇨🇴 Uses <Text style={styles.bold}>tú / vos</Text> and <Text style={styles.bold}>ustedes</Text> — authentic Colombian Spanish
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Compact button (for inline use)
  compactButton: {
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  headerLeft: {
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
    width: 36,
    height: 36,
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
  tableContainer: {
    maxHeight: 300,
  },
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
