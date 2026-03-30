// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors }   = useTheme();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleRegister = async () => {
    const { username, email, password, confirm } = form;
    if (!username.trim() || !email.trim() || !password || !confirm)
      return Alert.alert('Missing fields', 'Please fill in all fields.');
    if (password !== confirm)
      return Alert.alert('Password mismatch', 'Passwords do not match.');
    if (password.length < 6)
      return Alert.alert('Weak password', 'Password must be at least 6 characters.');
    try {
      setLoading(true);
      await register(username.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Registration failed', err.message);
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
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={s.hero}>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.sub}>Join ChatApp today</Text>
          </View>

          <View style={s.form}>
            {[
              { key: 'username', label: 'Username',        placeholder: 'e.g. john_doe',       autoCapitalize: 'none' },
              { key: 'email',    label: 'Email',           placeholder: 'you@example.com',      keyboardType: 'email-address', autoCapitalize: 'none' },
              { key: 'password', label: 'Password',        placeholder: '••••••••',             secure: true },
              { key: 'confirm',  label: 'Confirm Password',placeholder: '••••••••',             secure: true },
            ].map(({ key, label, placeholder, keyboardType, autoCapitalize, secure }) => (
              <View key={key}>
                <Text style={s.label}>{label}</Text>
                <TextInput
                  style={s.input}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={form[key]}
                  onChangeText={set(key)}
                  keyboardType={keyboardType || 'default'}
                  autoCapitalize={autoCapitalize || 'sentences'}
                  secureTextEntry={!!secure}
                  autoCorrect={false}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate('Login')}>
              <Text style={s.linkText}>
                Already have an account?{'  '}
                <Text style={s.linkBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: c.background },
  container: { flexGrow: 1, padding: 28, paddingTop: 16 },
  back:      { marginBottom: 8 },
  backText:  { color: c.primary, fontSize: 15 },
  hero:      { marginBottom: 28 },
  title:     { fontSize: 30, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
  sub:       { fontSize: 14, color: c.textMuted, marginTop: 4 },
  form:      { gap: 2 },
  label:     { fontSize: 12, fontWeight: '600', color: c.textSecondary, marginTop: 14, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    backgroundColor: c.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: c.text,
    borderWidth: 1, borderColor: c.border,
  },
  btn: {
    backgroundColor: c.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.7 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow:     { alignItems: 'center', marginTop: 18 },
  linkText:    { color: c.textSecondary, fontSize: 14 },
  linkBold:    { color: c.primary, fontWeight: '700' },
});
