import { cafeColors } from '../styles/cafeTheme';
import React, { useEffect } from 'react';
import { Animated, Image, StyleSheet, View, useAnimatedValue } from 'react-native';
import type { CafeTime } from '../hooks/useCafeAtmosphere';

export default function CafeScene({
  time,
  animate,
  reduceMotion,
  background,
}: {
  time: CafeTime;
  animate: boolean;
  reduceMotion: boolean;
  background: string;
}) {
  const steam = useAnimatedValue(0);
  const daylight = useAnimatedValue(time === 'evening' ? 0 : 1);
  useEffect(() => {
    const transition = Animated.timing(daylight, {
      toValue: time === 'evening' ? 0 : 1,
      duration: reduceMotion || !animate ? 0 : 1400,
      useNativeDriver: true,
    });
    transition.start();
    return () => transition.stop();
  }, [animate, daylight, reduceMotion, time]);
  useEffect(() => {
    steam.setValue(0);
    if (!animate) return;
    const loop = Animated.loop(
      Animated.timing(steam, {
        toValue: 1,
        duration: 5400,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [animate, steam]);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.scene}
    >
      <Image source={require('../../assets/cafe/evening.jpg')} style={styles.image} />
      <Animated.Image
        source={require('../../assets/cafe/morning.jpg')}
        style={[styles.image, { opacity: daylight }]}
      />
      {time === 'afternoon' && <View style={[StyleSheet.absoluteFill, styles.afternoon]} />}
      {time === 'evening' && (
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: animate
                ? steam.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.05, 0.16, 0.05] })
                : 0.1,
            },
          ]}
        />
      )}
      {animate &&
        [0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.steam,
              {
                marginLeft: index * 4,
                width: 8 + index * 2,
                opacity: steam.interpolate({
                  inputRange: [0, 0.2, 0.65, 1],
                  outputRange: [0, 0.2 - index * 0.025, 0.13, 0],
                }),
                transform: [
                  {
                    translateY: steam.interpolate({
                      inputRange: [0, 1],
                      outputRange: [index * 5, -28 - index * 6],
                    }),
                  },
                  {
                    translateX: steam.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, index % 2 ? 5 : -4, 2],
                    }),
                  },
                  { scaleX: steam.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.6] }) },
                  { rotate: `${index % 2 ? 12 : -12}deg` },
                ],
              },
            ]}
          />
        ))}
      {Array.from({ length: 24 }, (_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            bottom: index * 2,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: background,
            opacity: (1 - index / 24) ** 2,
          }}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  scene: { width: '100%', aspectRatio: 1.5, overflow: 'hidden' },
  image: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' },
  afternoon: { backgroundColor: cafeColors.sunsetWash, opacity: 0.13 },
  glow: {
    position: 'absolute',
    left: '72%',
    top: '15%',
    width: '16%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: cafeColors.lamplight,
  },
  steam: {
    position: 'absolute',
    left: '56%',
    bottom: '36%',
    height: 24,
    borderRadius: 12,
    borderLeftWidth: 1.5,
    borderTopWidth: 1,
    borderColor: cafeColors.steam,
  },
});
