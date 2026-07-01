import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useLanguage } from '../context/LanguageContext';

export default function EditProfileScreen() {
  const nav = useNavigation<any>();
  const { decks } = useDeck();
  const { t } = useLanguage();

  const [name, setName] = useState('Mike Pitts');
  const [username, setUsername] = useState('@mikepitts');
  const [email] = useState('mikepitts25@gmail.com');

  const totalCards = (decks || []).reduce((s, d) => s + (d.cards?.length ?? 0), 0);
  const mastered = (decks || []).reduce(
    (s, d) => s + (d.cards || []).filter((c: any) => c.reps >= 3).length,
    0,
  );

  function handleSave() {
    Alert.alert(t('profile.saved.title'), t('profile.saved.message'));
    nav.goBack();
  }

  return (
    <SafeAreaView style={styles.wrap}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>{t('profile.back')}</Text>
        </Pressable>
        <Text style={styles.navTitle}>{t('profile.title')}</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('profile.save')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>MP</Text>
          </View>
          <Pressable style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>{t('profile.changePhoto')}</Text>
          </Pressable>
        </View>

        {/* Form fields */}
        <View style={styles.fieldsSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('profile.name')}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[styles.fieldInput, styles.fieldInputActive]}
              placeholderTextColor={colors.textTertiary}
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('profile.username')}</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.fieldInput}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('profile.email')}</Text>
            <View style={[styles.fieldInput, styles.fieldInputDisabled]}>
              <Text style={styles.fieldInputText}>{email}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('profile.nativeLanguage')}</Text>
            <Pressable style={[styles.fieldInput, styles.fieldInputRow]}>
              <Text style={styles.fieldInputText}>{t('profile.nativeLanguageValue')}</Text>
              <Text style={styles.fieldChevron}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: colors.brand, backgroundColor: 'rgba(255,218,0,0.08)' }]}>
            <Text style={[styles.statVal, { color: colors.brand }]}>{totalCards.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t('profile.cards')}</Text>
          </View>
          <View style={[styles.statBox, { borderColor: colors.accentBlue, backgroundColor: 'rgba(0,56,147,0.12)' }]}>
            <Text style={[styles.statVal, { color: '#60a5fa' }]}>{(decks || []).length}</Text>
            <Text style={styles.statLabel}>{t('profile.decks')}</Text>
          </View>
          <View style={[styles.statBox, { borderColor: colors.accentRed, backgroundColor: 'rgba(206,17,38,0.1)' }]}>
            <Text style={[styles.statVal, { color: '#f87171' }]}>{mastered}</Text>
            <Text style={styles.statLabel}>{t('profile.mastered')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 20, backgroundColor: colors.surface },
  backArrow: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  backLabel: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  navTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.brand },
  saveBtnText: { color: '#020617', fontSize: 14, fontWeight: '800' },

  scroll: { padding: 16, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', gap: 12, marginBottom: 28 },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.accentBlue,
    borderWidth: 3,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.brand, fontSize: 28, fontWeight: '800' },
  changePhotoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,218,0,0.1)',
    borderWidth: 1,
    borderColor: colors.brand,
  },
  changePhotoText: { color: colors.brand, fontSize: 13, fontWeight: '700' },

  fieldsSection: { gap: 14, marginBottom: 24 },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: colors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginLeft: 4 },
  fieldInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  fieldInputActive: { borderColor: colors.brand, borderWidth: 1.5 },
  fieldInputDisabled: { opacity: 0.6 },
  fieldInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldInputText: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  fieldChevron: { color: colors.textSecondary, fontSize: 22 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 11 },
});
