import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { lookupConjugation } from '../utils/verbUtils';

interface Props {
  infinitive: string;
}

const PERSONS = ['yo', 'vos', 'él/ella', 'nosotros', 'ustedes', 'ellos'] as const;
type PersonKey = 'yo' | 'vos' | 'el_ella' | 'nosotros' | 'ustedes' | 'ellos';
const PERSON_KEYS: PersonKey[] = ['yo', 'vos', 'el_ella', 'nosotros', 'ustedes', 'ellos'];

export default function ConjugationPanel({ infinitive }: Props) {
  const [visible, setVisible] = useState(false);
  const entry = lookupConjugation(infinitive);

  if (!entry) return null;

  return (
    <>
      <Pressable
        style={[styles.trigger, entry.irregular && styles.triggerIrregular]}
        onPress={() => setVisible(true)}
        accessibilityLabel="Show conjugation table"
      >
        <Text style={[styles.triggerText, entry.irregular && styles.triggerTextIrregular]}>
          Conjugar ▾
        </Text>
        {entry.irregular && (
          <Text style={styles.irregularBadge}>⚠ irregular</Text>
        )}
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <Text style={styles.sheetInfinitive}>{infinitive}</Text>
                {entry.irregular && (
                  <View style={styles.irregularPill}>
                    <Text style={styles.irregularPillText}>⚠ irregular</Text>
                  </View>
                )}
              </View>
              {entry.irregular_note && (
                <Text style={styles.irregularNote}>{entry.irregular_note}</Text>
              )}
              <Pressable style={styles.closeBtn} onPress={() => setVisible(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.tableScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Column headers */}
              <View style={styles.row}>
                <View style={styles.personCell} />
                <View style={styles.tenseCell}>
                  <Text style={styles.tenseHeader}>Presente</Text>
                </View>
                <View style={styles.tenseCell}>
                  <Text style={styles.tenseHeader}>Pretérito</Text>
                </View>
                <View style={styles.tenseCell}>
                  <Text style={styles.tenseHeader}>Futuro</Text>
                </View>
              </View>

              {/* Data rows */}
              {PERSON_KEYS.map((key, i) => (
                <View
                  key={key}
                  style={[styles.row, i % 2 === 1 && styles.rowAlt]}
                >
                  <View style={styles.personCell}>
                    <Text style={styles.personLabel}>{PERSONS[i]}</Text>
                  </View>
                  <View style={styles.tenseCell}>
                    <Text style={styles.form}>{entry.presente[key]}</Text>
                  </View>
                  <View style={styles.tenseCell}>
                    <Text style={styles.form}>{entry.preterito[key]}</Text>
                  </View>
                  <View style={styles.tenseCell}>
                    <Text style={styles.form}>{entry.futuro[key]}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.tableFooter}>
                <Text style={styles.footerNote}>
                  Colombian Spanish · vos replaces tú · ustedes for all plurals
                </Text>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderActive,
    backgroundColor: colors.surfaceElevated,
    gap: spacing(1.5),
    marginTop: spacing(2),
  },
  triggerIrregular: {
    borderColor: colors.warning,
    backgroundColor: colors.warningMuted,
  },
  triggerText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  triggerTextIrregular: {
    color: colors.warning,
  },
  irregularBadge: {
    color: colors.warning,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingBottom: spacing(6),
    maxHeight: '75%',
  },
  sheetHeader: {
    padding: spacing(3),
    paddingBottom: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginBottom: spacing(0.5),
    paddingRight: spacing(8),
  },
  sheetInfinitive: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  irregularPill: {
    backgroundColor: colors.warningMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderWidth: 1,
    borderColor: colors.warning,
  },
  irregularPillText: {
    color: colors.warning,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  irregularNote: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    fontStyle: 'italic',
    marginTop: spacing(0.5),
  },
  closeBtn: {
    position: 'absolute',
    top: spacing(3),
    right: spacing(3),
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },

  // Table
  tableScroll: {
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    paddingVertical: spacing(0.5),
    borderRadius: radius.sm,
  },
  rowAlt: {
    backgroundColor: colors.surfaceElevated,
  },
  personCell: {
    width: 68,
    paddingLeft: spacing(1.5),
  },
  personLabel: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  tenseCell: {
    flex: 1,
    paddingHorizontal: spacing(0.5),
    alignItems: 'center',
  },
  tenseHeader: {
    color: colors.brand,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    paddingVertical: spacing(1),
  },
  form: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  tableFooter: {
    paddingHorizontal: spacing(1.5),
    paddingTop: spacing(2),
    paddingBottom: spacing(2),
  },
  footerNote: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
