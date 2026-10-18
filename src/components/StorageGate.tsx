import Pressable from './ThemedPressable';
import React, { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import storage from '../storage/durableStorage';
import { AppTheme } from '../styles/appTheme';
import { useThemedStyles } from '../context/ThemeContext';

/** Keep providers from seeding/loading partially restored data after a restart. */
export default function StorageGate({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let mounted = true;
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
    <StorageStatus
      error={state === 'error'}
      onRetry={() => {
        setState('loading');
        setAttempt((value) => value + 1);
      }}
    />
  );
}

/** Shared retry screen for storage recovery and startup content merge failures. */
export function StorageStatus({ error, onRetry }: { error: boolean; onRetry: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <Text accessibilityRole={error ? 'alert' : 'text'} style={styles.message}>
        {error
          ? 'No se pudo cargar tu progreso guardado. Reintenta sin restablecer la app.\n\nCould not load your saved progress. Retry without resetting the app.'
          : 'Cargando / Loading…'}
      </Text>
      {error && (
        <Pressable accessibilityRole="button" style={styles.button} onPress={onRetry}>
          <Text style={styles.label}>Reintentar / Try again</Text>
        </Pressable>
      )}
    </View>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
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
    label: { color: colors.onBrand, fontSize: 16, fontWeight: '700' },
  });
