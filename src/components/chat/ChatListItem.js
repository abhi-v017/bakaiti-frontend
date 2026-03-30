// src/components/chat/ChatListItem.js — Single row in the chat list
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import { getOtherParticipant, formatTime, truncate } from '../../utils/helpers';

export default function ChatListItem({ chat, myId, onPress }) {
  const { colors } = useTheme();

  const other    = chat.isGroup ? null : getOtherParticipant(chat, myId);
  const name     = chat.isGroup ? chat.groupName : (other?.username ?? 'Unknown');
  const avatarUrl = chat.isGroup ? chat.groupAvatar?.url : other?.avatar?.url;
  const isOnline  = !chat.isGroup && !!other?.isOnline;

  const lastMsg  = chat.lastMessage;
  let preview    = 'Tap to start chatting';
  if (lastMsg) {
    if (lastMsg.type === 'image')   preview = '📷 Photo';
    else if (lastMsg.type === 'video') preview = '🎥 Video';
    else preview = truncate(lastMsg.content, 45);
  }

  const s = styles(colors);
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Avatar
        uri={avatarUrl}
        name={name}
        size={52}
        showOnline={!chat.isGroup}
        isOnline={isOnline}
      />
      <View style={s.info}>
        <View style={s.top}>
          <Text style={s.name} numberOfLines={1}>{name}</Text>
          <Text style={s.time}>{lastMsg ? formatTime(lastMsg.createdAt) : ''}</Text>
        </View>
        <Text style={s.preview} numberOfLines={1}>{preview}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = (c) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11, gap: 12,
  },
  info:    { flex: 1 },
  top:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  name:    { fontSize: 16, fontWeight: '600', color: c.text, flex: 1, marginRight: 8 },
  time:    { fontSize: 12, color: c.textMuted },
  preview: { fontSize: 13, color: c.textSecondary },
});
