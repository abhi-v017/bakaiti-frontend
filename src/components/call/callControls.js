// src/components/call/CallControls.js — Reusable call action buttons
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function CallControlButton({ icon, label, onPress, active = false, danger = false }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        active  && styles.btnActive,
        danger  && { backgroundColor: colors.danger },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{icon}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  btnActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  icon:      { fontSize: 26 },
  label:     { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2 },
});
