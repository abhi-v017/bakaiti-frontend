// src/screens/ProfileScreen.js — View/edit own profile + dark mode toggle
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth }   from '../context/AuthContext';
import { useTheme }  from '../context/ThemeContext';
import { updateProfile } from '../services/userService';
import Avatar from '../components/common/Avatar';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [editing,   setEditing]   = useState(false);
  const [username,  setUsername]  = useState(user?.username || '');
  const [bio,       setBio]       = useState(user?.bio || '');
  const [avatarUri, setAvatarUri] = useState(null);
  const [saving,    setSaving]    = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateProfile({ username: username.trim(), bio, avatarUri });
      updateUser(updated);
      setAvatarUri(null);
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setAvatarUri(null);
    setEditing(false);
  };

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);

  const displayAvatar = avatarUri || user?.avatar?.url;
  const s = styles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Title row */}
        <View style={s.titleRow}>
          <Text style={s.title}>Profile</Text>
          {!editing && (
            <TouchableOpacity style={s.editChip} onPress={() => setEditing(true)}>
              <Text style={s.editChipText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar */}
        <TouchableOpacity
          style={s.avatarWrap}
          onPress={editing ? pickAvatar : undefined}
          activeOpacity={editing ? 0.7 : 1}
        >
          <Avatar uri={displayAvatar} name={user?.username} size={96} />
          {editing && (
            <View style={s.cameraBadge}>
              <Text style={{ fontSize: 16 }}>📷</Text>
            </View>
          )}
        </TouchableOpacity>

        {!editing && <Text style={s.displayName}>@{user?.username}</Text>}

        {/* Info card */}
        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>USERNAME</Text>
            {editing
              ? <TextInput
                  style={s.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.textMuted}
                />
              : <Text style={s.fieldValue}>@{user?.username}</Text>}
          </View>

          <View style={[s.field, s.fieldBorder]}>
            <Text style={s.fieldLabel}>EMAIL</Text>
            <Text style={[s.fieldValue, { color: colors.textSecondary }]}>{user?.email}</Text>
          </View>

          <View style={[s.field, s.fieldBorder]}>
            <Text style={s.fieldLabel}>BIO</Text>
            {editing
              ? <TextInput
                  style={[s.input, { minHeight: 70 }]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  placeholder="Tell people about yourself..."
                  placeholderTextColor={colors.textMuted}
                />
              : <Text style={[s.fieldValue, !user?.bio && { color: colors.textMuted }]}>
                  {user?.bio || 'No bio yet'}
                </Text>}
          </View>
        </View>

        {/* Settings */}
        <View style={s.card}>
          <View style={s.settingRow}>
            <Text style={s.settingLabel}>🌙  Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Action buttons */}
        {editing ? (
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.btn, s.btnPrimary]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Save Changes</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={handleCancel}>
              <Text style={[s.btnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.actions}>
            <TouchableOpacity style={[s.btn, s.btnDanger]} onPress={confirmLogout}>
              <Text style={s.btnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:        { flex: 1, backgroundColor: c.background },
  scroll:      { padding: 20, paddingBottom: 48 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title:       { fontSize: 28, fontWeight: '800', color: c.text },
  editChip:    { backgroundColor: c.primaryLight, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  editChipText:{ color: c.primary, fontWeight: '700', fontSize: 13 },
  avatarWrap:  { alignSelf: 'center', marginBottom: 10, position: 'relative' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: c.primary, width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: c.background,
  },
  displayName: { textAlign: 'center', color: c.textSecondary, fontSize: 15, marginBottom: 22 },
  card: {
    backgroundColor: c.surface, borderRadius: 16,
    paddingHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: c.border,
  },
  field:       { paddingVertical: 14 },
  fieldBorder: { borderTopWidth: 0.5, borderTopColor: c.divider },
  fieldLabel:  { fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 0.8, marginBottom: 5, textTransform: 'uppercase' },
  fieldValue:  { fontSize: 15, color: c.text },
  input: {
    backgroundColor: c.inputBg, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 15, color: c.text, borderWidth: 1, borderColor: c.border,
  },
  settingRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  settingLabel:{ fontSize: 15, color: c.text, fontWeight: '500' },
  actions:     { gap: 10, marginTop: 4 },
  btn:         { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnPrimary:  { backgroundColor: c.primary },
  btnOutline:  { borderWidth: 1, borderColor: c.border },
  btnDanger:   { backgroundColor: c.danger },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
});
