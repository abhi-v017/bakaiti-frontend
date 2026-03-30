// src/screens/ChatsListScreen.js — Main chat list with real-time updates
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme }  from '../context/ThemeContext';
import { useAuth }   from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMyChats } from '../services/chatService';
import ChatListItem from '../components/chat/ChatListItem';

export default function ChatsListScreen({ navigation }) {
  const { colors }   = useTheme();
  const { user }     = useAuth();
  const { socket }   = useSocket();
  const [chats,      setChats]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');

  const loadChats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getMyChats();
      setChats(data);
    } catch (err) {
      console.warn('loadChats:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload on tab focus
  useFocusEffect(useCallback(() => { loadChats(true); }, []));

  // Real-time: bump chat to top when a new message arrives
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      const msgChatId = msg.chat?._id || msg.chat;
      setChats((prev) => {
        const idx = prev.findIndex((c) => c._id === msgChatId);
        if (idx === -1) {
          // Unknown chat — reload
          loadChats(true);
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: msg, updatedAt: new Date().toISOString() };
        const [item] = updated.splice(idx, 1);
        return [item, ...updated];
      });
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [socket]);

  const filtered = chats.filter((c) => {
    const name = c.isGroup
      ? c.groupName
      : c.participants?.find((p) => p._id !== user._id)?.username || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Chats</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => navigation.navigate('NewGroup')}>
          <Text style={s.newBtnText}>+ Group</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ─────────────────────────────────────────── */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textMuted, fontSize: 16, paddingHorizontal: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── List ───────────────────────────────────────────── */}
      {loading
        ? <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
        : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ChatListItem
                chat={item}
                myId={user._id}
                onPress={() => navigation.navigate('Chat', { chat: item })}
              />
            )}
            ItemSeparatorComponent={() => <View style={s.sep} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadChats(); }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyEmoji}>💬</Text>
                <Text style={s.emptyTitle}>No chats yet</Text>
                <Text style={s.emptySub}>Go to Contacts to find people and start chatting</Text>
              </View>
            }
          />
        )}
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:       { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: c.text },
  newBtn: {
    backgroundColor: c.primaryLight, paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 20,
  },
  newBtnText:  { color: c.primary, fontWeight: '700', fontSize: 13 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBg, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 24, paddingHorizontal: 12, borderWidth: 1, borderColor: c.border,
  },
  searchIcon:  { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: c.text },
  sep:         { height: 0.5, backgroundColor: c.divider, marginLeft: 80 },
  empty:       { alignItems: 'center', paddingTop: 100 },
  emptyEmoji:  { fontSize: 52, marginBottom: 16 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
  emptySub:    { fontSize: 14, color: c.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
});
