// src/screens/ContactsScreen.js
// Search users by their 8-char userId (exact) or by username (partial match)
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme }   from '../context/ThemeContext';
import { searchUsers } from '../services/userService';
import { accessChat }  from '../services/chatService';
import Avatar from '../components/common/Avatar';

export default function ContactsScreen({ navigation }) {
  const { colors } = useTheme();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(null);

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
        <Text style={s.title}>Find People</Text>
        <Text style={s.subtitle}>Search by User ID or username</Text>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Enter User ID (e.g. X7kM2pQr) or username..."
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

      {/* Hint box */}
      {query.length === 0 && (
        <View style={s.hintBox}>
          <Text style={s.hintTitle}>💡 How to find people</Text>
          <Text style={s.hintText}>
            • Ask them for their 8-character User ID{'\n'}
            • Or search by their username{'\n'}
            • User IDs look like: <Text style={s.hintCode}>X7kM2pQr</Text>
          </Text>
        </View>
      )}

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
            <Avatar
              uri={item.avatar?.url}
              name={item.username}
              size={50}
              showOnline
              isOnline={item.isOnline}
            />
            <View style={s.info}>
              <View style={s.nameRow}>
                <Text style={s.username}>{item.username}</Text>
                {/* Always show the userId badge */}
                <View style={s.idBadge}>
                  <Text style={s.idBadgeText}>{item.userId}</Text>
                </View>
              </View>
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
          !loading && query.length > 0 && (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>😕</Text>
              <Text style={s.emptyTitle}>No users found</Text>
              <Text style={s.emptySub}>
                Try searching by exact User ID{'\n'}(case-sensitive, 8 characters)
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: c.background },
  header:   { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  title:    { fontSize: 28, fontWeight: '800', color: c.text },
  subtitle: { fontSize: 13, color: c.textMuted, marginTop: 2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBg, marginHorizontal: 16, marginVertical: 10,
    borderRadius: 24, paddingHorizontal: 14, borderWidth: 1, borderColor: c.border,
  },
  searchIcon:  { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: c.text },

  hintBox: {
    backgroundColor: c.surface, marginHorizontal: 16,
    borderRadius: 14, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: c.border,
  },
  hintTitle: { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 8 },
  hintText:  { fontSize: 13, color: c.textSecondary, lineHeight: 22 },
  hintCode: {
    fontFamily: 'monospace', color: c.primary,
    fontWeight: '700', backgroundColor: c.primaryLight,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  info:    { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  username:{ fontSize: 16, fontWeight: '600', color: c.text },
  idBadge: {
    backgroundColor: c.primaryLight,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: c.primary + '30',
  },
  idBadgeText: {
    fontSize: 11, fontWeight: '700', color: c.primary,
    fontFamily: 'monospace', letterSpacing: 1,
  },
  bio:   { fontSize: 13, color: c.textSecondary, marginTop: 3 },
  arrow: { fontSize: 18, color: c.textMuted },
  sep:   { height: 0.5, backgroundColor: c.divider, marginLeft: 78 },

  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: c.text, marginBottom: 6 },
  emptySub:   { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 21 },
});