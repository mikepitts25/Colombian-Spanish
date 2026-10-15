import React, { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import storage from '../storage/durableStorage';
import { colors } from '../styles/theme';

/** Keep providers from seeding/loading partially restored data after a restart. */
export default function StorageGate({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let mounted = true;
    setState('loading');
    storage.getItem('SRS_DECKS_V3').then(
      () => {
        if (mounted) setState('ready');
      },
      () => {
        if (mounted) setState('error');
      },
    );
    return () => {
      mounted = false;
    };
  }, [attempt]);
  if (state === 'ready') return <>{children}</>;
  return (
    <View style={styles.wrap}>
      <Text accessibilityRole={state === 'error' ? 'alert' : 'text'} style={styles.message}>
        {state === 'error'
          ? 'No se pudo cargar tu progreso guardado. Reintenta sin restablecer la app.\n\nCould not load your saved progress. Retry without resetting the app.'
          : 'Cargando / Loading…'}
      </Text>
      {state === 'error' && (
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => setAttempt((value) => value + 1)}
        >
          <Text style={styles.label}>Reintentar / Try again</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: 24,
    gap: 20,
  },
  message: { color: colors.textPrimary, textAlign: 'center', fontSize: 17, lineHeight: 25 },
  button: { backgroundColor: colors.brand, borderRadius: 24, minHeight: 48, padding: 16 },
  label: { color: colors.bg, fontSize: 16, fontWeight: '700' },
});
