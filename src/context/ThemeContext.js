// src/context/ThemeContext.js — Dark / light theme with full color tokens
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

// ── Palettes ──────────────────────────────────────────────────
export const light = {
  primary:        '#00A884',
  primaryDark:    '#017561',
  primaryLight:   '#E8F5F1',
  background:     '#FFFFFF',
  surface:        '#F0F2F5',
  card:           '#FFFFFF',
  text:           '#111B21',
  textSecondary:  '#667781',
  textMuted:      '#8696A0',
  border:         '#E9EDEF',
  divider:        '#E9EDEF',
  inputBg:        '#F0F2F5',
  bubble:         '#FFFFFF',
  bubbleOwn:      '#D9FDD3',
  headerBg:       '#00A884',
  headerText:     '#FFFFFF',
  icon:           '#54656F',
  online:         '#25D366',
  unread:         '#25D366',
  danger:         '#FF3B30',
  callBg:         '#1B2530',
  modalBg:        'rgba(0,0,0,0.5)',
  shadow:         '#000',
};

export const dark = {
  primary:        '#00A884',
  primaryDark:    '#017561',
  primaryLight:   '#1A3A33',
  background:     '#111B21',
  surface:        '#1F2C34',
  card:           '#1F2C34',
  text:           '#E9EDEF',
  textSecondary:  '#8696A0',
  textMuted:      '#667781',
  border:         '#2A3942',
  divider:        '#2A3942',
  inputBg:        '#2A3942',
  bubble:         '#1F2C34',
  bubbleOwn:      '#005C4B',
  headerBg:       '#1F2C34',
  headerText:     '#E9EDEF',
  icon:           '#8696A0',
  online:         '#25D366',
  unread:         '#25D366',
  danger:         '#FF453A',
  callBg:         '#0B141A',
  modalBg:        'rgba(0,0,0,0.7)',
  shadow:         '#000',
};

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const scheme = useColorScheme();
  const [mode, setMode] = useState(scheme === 'dark' ? 'dark' : 'light');

  const colors  = mode === 'dark' ? dark : light;
  const isDark  = mode === 'dark';
  const toggleTheme = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme, mode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
