// TEST ENTRY ONLY: isolated app copy; never imported by the normal app entry.
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { registerRootComponent } from 'expo';
import App from '../../../App';
import { captureBackupSnapshot } from '../../../src/storage/backupSnapshot';

// Start with recovery blocked. There is no journal on the clean fixture. Once
// a restore has been interrupted, a cold launch fails in the real StorageGate.
let blockRecovery = true;
let holdRestore = false;
let source = null;
let report = () => {};
const originalSet = AsyncStorage.setItem;
AsyncStorage.setItem = async (key, value) => {
  if (key === 'SRS_PREFS_V1' && holdRestore) {
    holdRestore = false;
    report('Restore held after earlier keys');
    await new Promise(() => {});
  }
  if (key === 'SRS_PREFS_V1' && blockRecovery) {
    // Only fail a replay after a native cold launch. While preparing the
    // original restore, the UI action turns this gate off.
    const journal = await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1');
    if (journal) throw new Error('QA recovery write unavailable');
  }
  return originalSet(key, value);
};
const originalClipboard = Clipboard.getStringAsync;
// Deliberate test-only transport replacement; never loaded by product AppEntry.
// eslint-disable-next-line import/namespace
Clipboard.getStringAsync = async (...args) =>
  source === null ? originalClipboard(...args) : JSON.stringify(source);

function NativeRestoreHarness() {
  const [status, setStatus] = useState('Idle');
  useEffect(() => {
    report = setStatus;
    return () => {
      report = () => {};
    };
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <App />
      <View
        style={{
          position: 'absolute',
          top: 70,
          right: 8,
          width: 142,
          padding: 6,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: '#005500',
        }}
      >
        <Text allowFontScaling={false} style={{ color: '#000', fontSize: 12 }}>
          QA restore: {status}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            try {
              source = await captureBackupSnapshot();
              source.decks[0].cards[0].back += ' [restore QA]';
              source.applicationState.prefs.speechRate = 0.85;
              blockRecovery = false;
              setStatus('Source staged');
            } catch {
              setStatus('Source preparation failed');
            }
          }}
        >
          <Text allowFontScaling={false} style={{ color: '#000', padding: 6 }}>
            QA stage source
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            holdRestore = true;
            setStatus('Armed');
          }}
        >
          <Text allowFontScaling={false} style={{ color: '#000', padding: 6 }}>
            QA hold restore
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            blockRecovery = false;
            setStatus('Recovery allowed');
          }}
        >
          <Text allowFontScaling={false} style={{ color: '#000', padding: 6 }}>
            QA allow recovery
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
registerRootComponent(NativeRestoreHarness);
