// src/components/common/TypingIndicator.js — animated "..." typing dots
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Dot = ({ delay, color }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color, transform: [{ translateY }] }]}
    />
  );
};

export default function TypingIndicator() {
  const { colors } = useTheme();
  return (
    <View style={[styles.bubble, { backgroundColor: colors.bubble }]}>
      <Dot delay={0}   color={colors.textMuted} />
      <Dot delay={150} color={colors.textMuted} />
      <Dot delay={300} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection:  'row',
    alignItems:     'center',
    alignSelf:      'flex-start',
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderRadius:      16,
    borderBottomLeftRadius: 2,
    marginHorizontal: 8,
    marginVertical:   3,
    gap: 4,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});
