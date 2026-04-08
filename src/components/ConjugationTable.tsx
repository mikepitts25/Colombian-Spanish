import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// Sample conjugation data for "hablar"
const sampleConjugation = {
  present: { yo: 'hablo', tu: 'hablas', el: 'habla', nosotros: 'hablamos', ellos: 'hablan' },
  past: { yo: 'hablé', tu: 'hablaste', el: 'habló', nosotros: 'hablamos', ellos: 'hablaron' },
  future: { yo: 'hablaré', tu: 'hablarás', el: 'hablará', nosotros: 'hablaremos', ellos: 'hablarán' },
};

const pronouns = [
  { key: 'yo', label: 'yo' },
  { key: 'tu', label: 'tú' },
  { key: 'el', label: 'él/ella/usted' },
  { key: 'nosotros', label: 'nosotros' },
  { key: 'ellos', label: 'ellos/ellas/ustedes' },
];

export default function ConjugationTable() {
  const [activeTense, setActiveTense] = useState<'present' | 'past' | 'future'>('present');

  const tenseLabels = {
    present: 'Presente',
    past: 'Pretérito',
    future: 'Futuro',
  };

  return (
    <View style={styles.container}>
      {/* Tense selector tabs */}
      <View style={styles.tabContainer}>
        {(Object.keys(tenseLabels) as Array<keyof typeof tenseLabels>).map((tense) => (
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  pronoun: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  verbForm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
