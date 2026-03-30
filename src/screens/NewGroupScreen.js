// src/screens/NewGroupScreen.js — Create a group chat
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme }    from '../context/ThemeContext';
import { searchUsers } from '../services/userService';
import { createGroup } from '../services/chatService';
import Avatar from '../components/common/Avatar';

export default function NewGroupScreen({ navigation }) {
  const { colors } = useTheme();
  const [groupName,  setGroupName]  = useState('');
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [selected,   setSelected]   = useState([]);   // [{ _id, username, avatar }]
  const [searching,  setSearching]  = useState(false);
  const [creating,   setCreating]   = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.trim().length < 1) { setResults([]); return; }
    try {
      setSearching(true);
      setResults(await searchUsers(q.trim()));
    } catch (err) {
      console.warn(err.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (u) => {
    setSelected((prev) =>
      prev.find((p) => p._id === u._id)
        ? prev.filter((p) => p._id !== u._id)
        : [...prev, u]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim())     return Alert.alert('Group name required', 'Please enter a name for the group.');
    if (selected.length < 2)  return Alert.alert('Add members', 'Select at least 2 people.');
    try {
      setCreating(true);
      const chat = await createGroup(groupName.trim(), selected.map((u) => u._id));
      navigation.replace('Chat', { chat });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      {/* ── Top bar ─────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.title}>New Group</Text>
        <TouchableOpacity onPress={handleCreate} disabled={creating}>
          {creating
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Text style={s.create}>Create</Text>}
        </TouchableOpacity>
      </View>

      {/* ── Group name ───────────────────────────────────── */}
      <View style={s.nameWrap}>
        <TextInput
          style={s.nameInput}
          placeholder="Group name"
          placeholderTextColor={colors.textMuted}
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* ── Selected chips ───────────────────────────────── */}
      {selected.length > 0 && (
        <View style={s.chips}>
          {selected.map((u) => (
            <TouchableOpacity key={u._id} style={s.chip} onPress={() => toggleSelect(u)}>
              <Text style={s.chipText}>{u.username}  ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Search ──────────────────────────────────────── */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search users to add..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </View>

      {searching && <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />}

      <FlatList
        data={results}
        keyExtractor={(u) => u._id}
        renderItem={({ item }) => {
          const isSelected = !!selected.find((u) => u._id === item._id);
          return (
            <TouchableOpacity style={s.userRow} onPress={() => toggleSelect(item)}>
              <Avatar uri={item.avatar?.url} name={item.username} size={44} />
              <Text style={s.username}>{item.username}</Text>
              <View style={[s.check, isSelected && s.checkActive]}>
                {isSelected && <Text style={s.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: colors.divider, marginLeft: 72 }} />}
      />
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: c.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  cancel: { color: c.danger,   fontSize: 15, fontWeight: '600' },
  title:  { color: c.text,     fontSize: 17, fontWeight: '700' },
  create: { color: c.primary,  fontSize: 15, fontWeight: '700' },
  nameWrap: { padding: 16 },
  nameInput: {
    backgroundColor: c.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 16, color: c.text, borderWidth: 1, borderColor: c.border,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  chip: { backgroundColor: c.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { color: c.primary, fontWeight: '600', fontSize: 13 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBg, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 24, paddingHorizontal: 12, borderWidth: 1, borderColor: c.border,
  },
  searchIcon:  { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: c.text },
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11, gap: 12,
  },
  username: { flex: 1, fontSize: 15, fontWeight: '500', color: c.text },
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: c.textMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  checkActive:  { backgroundColor: c.primary, borderColor: c.primary },
  checkMark:    { color: '#fff', fontSize: 13, fontWeight: '800' },
});
