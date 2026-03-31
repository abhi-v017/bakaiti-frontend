// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { login }  = useAuth();
  const { colors } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please enter your email and password.');
    }
    try {
      setLoading(true);
      alert("API: " + process.env.EXPO_PUBLIC_API_URL);
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={s.hero}>
            <View style={s.logoCircle}>
              <Text style={s.logoEmoji}>💬</Text>
            </View>
            <Text style={s.appName}>ChatApp</Text>
            <Text style={s.tagline}>Fast · Private · Real-time</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.linkRow}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={s.linkText}>
                Don't have an account?{'  '}
                <Text style={s.linkBold}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test hint */}
          <Text style={s.hint}>
            Test accounts: alice@test.com / bob@test.com{'\n'}Password: test1234
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: c.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  hero:      { alignItems: 'center', marginBottom: 44 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: c.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  appName:   { fontSize: 34, fontWeight: '800', color: c.primary, letterSpacing: -1 },
  tagline:   { fontSize: 13, color: c.textMuted, marginTop: 4 },
  form:      { gap: 6 },
  label:     { fontSize: 12, fontWeight: '600', color: c.textSecondary, marginTop: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: c.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: c.text,
    borderWidth: 1, borderColor: c.border,
  },
  btn: {
    backgroundColor: c.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  btnDisabled: { opacity: 0.7 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow:     { alignItems: 'center', marginTop: 18 },
  linkText:    { color: c.textSecondary, fontSize: 14 },
  linkBold:    { color: c.primary, fontWeight: '700' },
  hint: {
    textAlign: 'center', color: c.textMuted, fontSize: 11,
    marginTop: 36, lineHeight: 18,
  },
});
