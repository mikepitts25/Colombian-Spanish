import React, { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Top-level crash guard. Sits above the language provider, so copy is
// static and bilingual instead of using the i18n context.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Hook point for crash reporting (Sentry etc.) once configured.
    console.error('Unhandled error in component tree:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text style={styles.emoji}>🇨🇴</Text>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.subtitle}>Something went wrong</Text>
        <Text style={styles.body}>
          Tu progreso está guardado. Intenta de nuevo.{'\n'}
          Your progress is saved. Try again.
        </Text>
        <Pressable style={styles.button} onPress={this.handleRetry}>
          <Text style={styles.buttonText}>Reintentar / Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
  button: {
    marginTop: 20,
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.textInverse, fontSize: 15, fontWeight: '800' },
});
