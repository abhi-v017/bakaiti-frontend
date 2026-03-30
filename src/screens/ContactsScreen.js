// src/screens/ContactsScreen.js — User search + open DM
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme }  from '../context/ThemeContext';
import { searchUsers } from '../services/userService';
import { accessChat }  from '../services/chatService';
import Avatar from '../components/common/Avatar';

export default function ContactsScreen({ navigation }) {
  const { colors } = useTheme();
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [opening,  setOpening]  = useState(null); // userId being opened

  const handleSearch = useCallback(async (q) => {
    setQuery(q);
    if (q.trim().length < 1) { setResults([]); return; }
    try {
      setLoading(true);
      const data = await searchUsers(q.trim());
      setResults(data);
    } catch (err) {
      console.warn('search:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDM = async (contact) => {
    try {
      setOpening(contact._id);
      const chat = await accessChat(contact._id);
      navigation.navigate('Chat', { chat });
    } catch (err) {
      console.warn('openDM:', err.message);
    } finally {
      setOpening(null);
    }
  };

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Contacts</Text>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search by username..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Text style={{ color: colors.textMuted, fontSize: 16, paddingHorizontal: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}

      <FlatList
        data={results}
        keyExtractor={(u) => u._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() => openDM(item)}
            activeOpacity={0.7}
            disabled={opening === item._id}
          >
            <Avatar uri={item.avatar?.url} name={item.username} size={50} showOnline isOnline={item.isOnline} />
            <View style={s.info}>
              <Text style={s.username}>{item.username}</Text>
              {item.bio
                ? <Text style={s.bio} numberOfLines={1}>{item.bio}</Text>
                : <Text style={s.bio}>{item.isOnline ? '🟢 Online' : '⚫ Offline'}</Text>}
            </View>
            {opening === item._id
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={s.arrow}>→</Text>}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        ListEmptyComponent={
          !loading && (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>{query.length > 0 ? '😕' : '🔍'}</Text>
              <Text style={s.emptyTitle}>
                {query.length > 0 ? 'No users found' : 'Find people'}
              </Text>
              <Text style={s.emptySub}>
                {query.length > 0
                  ? `No results for "${query}"`
                  : 'Search by username to start a conversation'}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: c.background },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  title:  { fontSize: 28, fontWeight: '800', color: c.text },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBg, marginHorizontal: 16, marginBottom: 10,
    borderRadius: 24, paddingHorizontal: 12, borderWidth: 1, borderColor: c.border,
  },
  searchIcon:  { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: c.text },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  info:     { flex: 1 },
  username: { fontSize: 16, fontWeight: '600', color: c.text },
  bio:      { fontSize: 13, color: c.textSecondary, marginTop: 2 },
  arrow:    { fontSize: 18, color: c.textMuted },
  sep:      { height: 0.5, backgroundColor: c.divider, marginLeft: 78 },
  empty:    { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 44, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: c.text, marginBottom: 5 },
  emptySub:   { fontSize: 14, color: c.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
});
