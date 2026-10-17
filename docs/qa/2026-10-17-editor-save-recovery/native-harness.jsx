// TEST ENTRY ONLY. Run from an isolated app copy with main pointing here.
// This file is never imported by the product entry point.
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerRootComponent } from 'expo';
import App from '../../../App';

function NativeEditorSaveHarness() {
  const [status, setStatus] = useState('Idle');
  const armed = useRef(false);
  const held = useRef(null);
  useEffect(() => {
    const original = AsyncStorage.setItem;
    AsyncStorage.setItem = async (key, value) => {
      if (key === 'SRS_DECKS_V3' && armed.current) {
        armed.current = false;
        setStatus('Write held');
        await new Promise((resolve, reject) => {
          held.current = { resolve, reject };
        });
      }
      return original(key, value);
    };
    return () => {
      AsyncStorage.setItem = original;
      held.current?.reject(new Error('QA harness closed'));
    };
  }, []);
  function settle(reject) {
    const operation = held.current;
    held.current = null;
    if (!operation) return;
    if (reject) operation.reject(new Error('QA simulated write failure'));
    else operation.resolve();
    setStatus(reject ? 'Rejected' : 'Released');
  }
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
          backgroundColor: '#ffffff',
          borderWidth: 2,
          borderColor: '#005500',
        }}
      >
        <Text allowFontScaling={false} style={{ color: '#000000', fontSize: 12 }}>
          QA transport: {status}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            armed.current = true;
            setStatus('Armed');
          }}
        >
          <Text allowFontScaling={false} style={{ color: '#000000', padding: 6 }}>
            QA hold next
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => settle(true)}>
          <Text allowFontScaling={false} style={{ color: '#000000', padding: 6 }}>
            QA reject write
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => settle(false)}>
          <Text allowFontScaling={false} style={{ color: '#000000', padding: 6 }}>
            QA release write
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
registerRootComponent(NativeEditorSaveHarness);
