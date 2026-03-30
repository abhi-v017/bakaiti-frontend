// src/components/common/Avatar.js — Reusable avatar with fallback initial
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Avatar({ uri, name = '?', size = 48, showOnline = false, isOnline = false }) {
  const { colors } = useTheme();
  const letter     = (name?.[0] || '?').toUpperCase();

  return (
    <View style={{ width: size, height: size }}>
      {uri
        ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        : (
          <View style={[styles.fallback, {
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: colors.primary,
          }]}>
            <Text style={[styles.letter, { fontSize: size * 0.38 }]}>{letter}</Text>
          </View>
        )
      }
      {showOnline && (
        <View style={[styles.dot, {
          width:       size * 0.27,
          height:      size * 0.27,
          borderRadius: size * 0.135,
          backgroundColor: isOnline ? colors.online : colors.textMuted,
          borderColor:     colors.background,
        }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { justifyContent: 'center', alignItems: 'center' },
  letter:   { color: '#fff', fontWeight: '700' },
  dot: {
    position: 'absolute', bottom: 1, right: 1,
    borderWidth: 2,
  },
});
