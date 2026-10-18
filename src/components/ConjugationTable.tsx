import { useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Sample conjugation data for "hablar"
const sampleConjugation = {
  present: { yo: 'hablo', tu: 'hablas', el: 'habla', nosotros: 'hablamos', ellos: 'hablan' },
  past: { yo: 'hablé', tu: 'hablaste', el: 'habló', nosotros: 'hablamos', ellos: 'hablaron' },
  future: {
    yo: 'hablaré',
    tu: 'hablarás',
    el: 'hablará',
    nosotros: 'hablaremos',
    ellos: 'hablarán',
  },
};

const pronouns = [
  { key: 'yo', label: 'yo' },
  { key: 'tu', label: 'tú' },
  { key: 'el', label: 'él/ella/usted' },
  { key: 'nosotros', label: 'nosotros' },
  { key: 'ellos', label: 'ellos/ellas/ustedes' },
];

export default function ConjugationTable() {
  const styles = useThemedStyles(makeStyles);
  const [activeTense, setActiveTense] = useState<'present' | 'past' | 'future'>('present');

  const tenseLabels = {
    present: 'Presente',
    past: 'Pretérito / Pasado',
    future: 'Futuro',
  };

  return (
    <View style={styles.container}>
      {/* Tense selector tabs */}
      <View style={styles.tabContainer}>
        {(Object.keys(tenseLabels) as (keyof typeof tenseLabels)[]).map((tense) => (
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
      <View style={styles.table}>
        {pronouns.map(({ key, label }) => (
          <View key={key} style={styles.row}>
            <Text style={styles.pronoun}>{label}</Text>
            <Text style={styles.verbForm}>
              {sampleConjugation[activeTense][key as keyof typeof sampleConjugation.present]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = ({ id, colors }: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: id === 'classic' ? '#fff' : colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      borderRadius: 8,
      backgroundColor: id === 'classic' ? '#f0f0f0' : colors.surfaceElevated,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
    },
    activeTab: {
      backgroundColor: id === 'classic' ? '#fff' : colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      color: id === 'classic' ? '#666' : colors.textSecondary,
      fontWeight: '500',
    },
    activeTabText: {
      color: id === 'classic' ? '#007AFF' : colors.brand,
      fontWeight: '600',
    },
    table: {
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: id === 'classic' ? '#f8f9fa' : colors.surfaceElevated,
      borderRadius: 8,
    },
    pronoun: {
      fontSize: 14,
      color: id === 'classic' ? '#666' : colors.textSecondary,
      fontStyle: 'italic',
    },
    verbForm: {
      fontSize: 16,
      fontWeight: '600',
      color: id === 'classic' ? '#333' : colors.textPrimary,
    },
  });
