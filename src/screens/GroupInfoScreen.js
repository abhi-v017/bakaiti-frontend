// src/screens/GroupInfoScreen.js — Group details + member management
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import { removeFromGroup } from '../services/chatService';
import Avatar from '../components/common/Avatar';

export default function GroupInfoScreen({ navigation, route }) {
  const { chat }   = route.params;
  const { colors } = useTheme();
  const { user }   = useAuth();
  const [members, setMembers] = useState(chat.participants || []);

  const adminId = chat.groupAdmin?._id || chat.groupAdmin;
  const isAdmin = adminId?.toString() === user._id?.toString();

  const handleRemove = (member) => {
    Alert.alert(
      'Remove member',
      `Remove ${member.username} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromGroup(chat._id, member._id);
              setMembers((prev) => prev.filter((m) => m._id !== member._id));
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView>
        {/* Group avatar + name */}
        <View style={s.hero}>
          <Avatar uri={chat.groupAvatar?.url} name={chat.groupName} size={90} />
          <Text style={s.groupName}>{chat.groupName}</Text>
          <Text style={s.memberCount}>{members.length} members</Text>
        </View>

        {/* Members */}
        <Text style={s.sectionLabel}>MEMBERS</Text>
        {members.map((m) => {
          const mIsAdmin = (chat.groupAdmin?._id || chat.groupAdmin)?.toString() === m._id?.toString();
          return (
            <View key={m._id} style={s.memberRow}>
              <Avatar uri={m.avatar?.url} name={m.username} size={44} showOnline isOnline={m.isOnline} />
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{m.username}</Text>
                {mIsAdmin && <Text style={s.adminTag}>Admin</Text>}
              </View>
              {isAdmin && m._id !== user._id && !mIsAdmin && (
                <TouchableOpacity onPress={() => handleRemove(m)} style={s.removeBtn}>
                  <Text style={s.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:        { flex: 1, backgroundColor: c.background },
  backBtn:     { padding: 16, paddingBottom: 4 },
  backText:    { color: c.primary, fontSize: 15, fontWeight: '600' },
  hero:        { alignItems: 'center', paddingVertical: 24 },
  groupName:   { fontSize: 22, fontWeight: '800', color: c.text, marginTop: 12, marginBottom: 4 },
  memberCount: { fontSize: 14, color: c.textSecondary },
  sectionLabel:{ fontSize: 11, fontWeight: '700', color: c.textMuted, paddingHorizontal: 16, paddingVertical: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderBottomWidth: 0.5, borderBottomColor: c.divider,
  },
  memberInfo:   { flex: 1 },
  memberName:   { fontSize: 15, fontWeight: '600', color: c.text },
  adminTag:     { fontSize: 11, color: c.primary, fontWeight: '700', marginTop: 2 },
  removeBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: c.danger },
  removeBtnText:{ color: c.danger, fontSize: 12, fontWeight: '600' },
});
