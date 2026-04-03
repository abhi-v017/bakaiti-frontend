// src/screens/UserProfileScreen.js — View another user's profile
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme }    from '../context/ThemeContext';
import { getUserById } from '../services/userService';
import { accessChat }  from '../services/chatService';
import Avatar from '../components/common/Avatar';

export default function UserProfileScreen({ navigation, route }) {
  const { userId }  = route.params;
  const { colors }  = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    getUserById(userId)
      .then(setProfile)
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const openChat = async () => {
    try {
      setOpening(true);
      const chat = await accessChat(userId);
      navigation.navigate('Chat', { chat });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setOpening(false);
    }
  };

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
        : (
          <ScrollView contentContainerStyle={s.scroll}>
            <Avatar
              uri={profile?.avatar?.url}
              name={profile?.username}
              size={100}
              showOnline
              isOnline={profile?.isOnline}
            />

            <Text style={s.username}>@{profile?.username}</Text>

            {/* User ID badge */}
            <View style={s.idBadge}>
              <Text style={s.idBadgeLabel}>USER ID</Text>
              <Text style={s.idBadgeValue}>{profile?.userId}</Text>
            </View>

            {profile?.isOnline
              ? <View style={s.onlinePill}><Text style={s.onlineText}>● Online now</Text></View>
              : profile?.lastSeen
                ? <Text style={s.lastSeen}>
                    Last seen {new Date(profile.lastSeen).toLocaleString()}
                  </Text>
                : null}

            {profile?.bio
              ? <Text style={s.bio}>{profile.bio}</Text>
              : null}

            <Text style={s.joined}>
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>

            <TouchableOpacity style={s.msgBtn} onPress={openChat} disabled={opening}>
              {opening
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.msgBtnText}>💬  Send Message</Text>}
            </TouchableOpacity>
          </ScrollView>
        )}
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:       { flex: 1, backgroundColor: c.background },
  backBtn:    { padding: 16, paddingBottom: 4 },
  backText:   { color: c.primary, fontSize: 15, fontWeight: '600' },
  scroll:     { alignItems: 'center', paddingTop: 24, paddingBottom: 60, paddingHorizontal: 24 },
  username:   { fontSize: 24, fontWeight: '800', color: c.text, marginTop: 16, marginBottom: 12 },

  idBadge: {
    backgroundColor: c.primaryLight,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 14, alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: c.primary + '30',
  },
  idBadgeLabel: { fontSize: 10, fontWeight: '700', color: c.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  idBadgeValue: {
    fontSize: 20, fontWeight: '800', color: c.primary, letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  onlinePill: { backgroundColor: 'rgba(37,211,102,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 10 },
  onlineText: { color: '#25D366', fontWeight: '700', fontSize: 13 },
  lastSeen:   { fontSize: 12, color: c.textMuted, marginBottom: 10 },
  bio:        { fontSize: 15, color: c.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 10 },
  joined:     { fontSize: 12, color: c.textMuted, marginBottom: 36 },

  msgBtn: {
    backgroundColor: c.primary, paddingHorizontal: 44,
    paddingVertical: 14, borderRadius: 30,
    elevation: 3, shadowColor: c.primary, shadowOpacity: 0.35, shadowRadius: 8,
    minWidth: 200, alignItems: 'center',
  },
  msgBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});