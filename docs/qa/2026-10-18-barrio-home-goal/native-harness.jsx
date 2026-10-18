// TEST ENTRY ONLY: isolated app copy; product package/entry remain unchanged.
// Hold exactly one real plan read. Never alter returned data or storage files.
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerRootComponent } from 'expo';
import App from '../../../App';

function HomeReadHarness() {
  const [status, setStatus] = useState('Idle');
  const armed = useRef(false);
  const held = useRef(null);
  useEffect(() => {
    const original = AsyncStorage.getItem;
    AsyncStorage.getItem = async (key) => {
      if (key === 'SRS_DAILY_PLAN_V1' && armed.current) {
        armed.current = false;
        setStatus('Read held');
        await new Promise((resolve, reject) => {
          held.current = { resolve, reject };
        });
      }
      return original(key);
    };
    return () => {
      AsyncStorage.getItem = original;
      held.current?.reject(new Error('QA harness closed'));
    };
  }, []);
  function settle(reject) {
    const operation = held.current;
    held.current = null;
    if (!operation) return;
    if (reject) operation.reject(new Error('QA simulated plan read failure'));
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
            QA hold next read
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => settle(true)}>
          <Text allowFontScaling={false} style={{ color: '#000000', padding: 6 }}>
            QA reject read
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => settle(false)}>
          <Text allowFontScaling={false} style={{ color: '#000000', padding: 6 }}>
            QA release read
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
registerRootComponent(HomeReadHarness);
