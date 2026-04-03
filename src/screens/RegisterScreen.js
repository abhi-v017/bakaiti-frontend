// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors }   = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);

  // Show assigned userId in a modal after successful registration
  const [assignedId,    setAssignedId]    = useState('');
  const [showIdModal,   setShowIdModal]   = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password || !confirm) {
      return Alert.alert('Missing fields', 'Please fill in all fields.');
    }
    if (password !== confirm) {
      return Alert.alert('Password mismatch', 'Passwords do not match.');
    }
    if (password.length < 6) {
      return Alert.alert('Weak password', 'Password must be at least 6 characters.');
    }

    try {
      setLoading(true);
      const user = await register(username.trim(), password);
      // Show the assigned userId so the user can note it down
      setAssignedId(user.userId);
      setShowIdModal(true);
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
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={s.hero}>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.sub}>Pick a username and password to get started</Text>
          </View>

          <View style={s.form}>
            <Text style={s.label}>Username</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. john_doe"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Text style={s.hint}>Letters, numbers and underscores only</Text>

            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
            />

            <Text style={s.label}>Confirm Password</Text>
            <TextInput
              style={s.input}
              placeholder="Re-enter password"
              placeholderTextColor={colors.textMuted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

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

            <TouchableOpacity
              style={s.linkRow}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={s.linkText}>
                Already have an account?{'  '}
                <Text style={s.linkBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── userId reveal modal ─────────────────────────────── */}
      <Modal visible={showIdModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalEmoji}>🎉</Text>
            <Text style={s.modalTitle}>Account Created!</Text>
            <Text style={s.modalSub}>
              Your unique User ID has been assigned.{'\n'}
              Share it with friends so they can find you.
            </Text>

            {/* Big ID display */}
            <View style={s.idBox}>
              <Text style={s.idLabel}>YOUR USER ID</Text>
              <Text style={s.idValue}>{assignedId}</Text>
            </View>

            <Text style={s.modalWarning}>
              📌 Note this down — others search by this ID to start a chat with you.
            </Text>

            <TouchableOpacity
              style={s.modalBtn}
              onPress={() => setShowIdModal(false)}
            >
              <Text style={s.modalBtnText}>Got it, let's go!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: c.background },
  container: { flexGrow: 1, padding: 28, paddingTop: 16 },
  back:      { marginBottom: 10 },
  backText:  { color: c.primary, fontSize: 15, fontWeight: '600' },
  hero:      { marginBottom: 28 },
  title:     { fontSize: 30, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
  sub:       { fontSize: 14, color: c.textMuted, marginTop: 6, lineHeight: 20 },
  form:      { gap: 2 },
  label: {
    fontSize: 12, fontWeight: '700', color: c.textSecondary,
    marginTop: 16, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  input: {
    backgroundColor: c.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: c.text,
    borderWidth: 1, borderColor: c.border,
  },
  hint:        { fontSize: 11, color: c.textMuted, marginTop: 4 },
  btn: {
    backgroundColor: c.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.65 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow:     { alignItems: 'center', marginTop: 18 },
  linkText:    { color: c.textSecondary, fontSize: 14 },
  linkBold:    { color: c.primary, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: c.card, borderRadius: 24,
    padding: 28, alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: c.border,
  },
  modalEmoji:   { fontSize: 52, marginBottom: 12 },
  modalTitle:   { fontSize: 24, fontWeight: '800', color: c.text, marginBottom: 8 },
  modalSub: {
    fontSize: 14, color: c.textSecondary, textAlign: 'center',
    lineHeight: 21, marginBottom: 24,
  },
  idBox: {
    backgroundColor: c.primaryLight, borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 32,
    alignItems: 'center', width: '100%', marginBottom: 16,
    borderWidth: 1, borderColor: c.primary + '40',
  },
  idLabel: {
    fontSize: 10, fontWeight: '700', color: c.primary,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
  },
  idValue: {
    fontSize: 32, fontWeight: '800', color: c.primary,
    letterSpacing: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalWarning: {
    fontSize: 12, color: c.textSecondary, textAlign: 'center',
    lineHeight: 18, marginBottom: 24, paddingHorizontal: 8,
  },
  modalBtn: {
    backgroundColor: c.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});