// src/components/chat/MessageBubble.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatMsgTime } from '../../utils/helpers';

export default function MessageBubble({ message, isOwn, showSenderName = false }) {
  const { colors } = useTheme();
  const s = styles(colors, isOwn);

  const renderContent = () => {
    if ((message.type === 'image') && message.media?.url) {
      return (
        <Image
          source={{ uri: message.media.url }}
          style={s.mediaImage}
          resizeMode="cover"
        />
      );
    }
    if (message.type === 'video' && message.media?.url) {
      return (
        <TouchableOpacity
          style={s.videoThumb}
          onPress={() => Linking.openURL(message.media.url)}
          activeOpacity={0.8}
        >
          <Text style={s.videoPlay}>▶</Text>
          <Text style={s.videoLabel}>Tap to open video</Text>
        </TouchableOpacity>
      );
    }
    // Text
    return <Text style={s.text} selectable>{message.content}</Text>;
  };

  const isRead = Array.isArray(message.readBy) && message.readBy.length > 0;

  return (
    <View style={s.wrapper}>
      {/* Group: show sender name above bubble */}
      {!isOwn && showSenderName && message.sender?.username && (
        <Text style={s.senderName}>{message.sender.username}</Text>
      )}

      <View style={s.bubble}>
        {renderContent()}

        <View style={s.meta}>
          <Text style={s.time}>{formatMsgTime(message.createdAt)}</Text>
          {isOwn && (
            <Text style={[s.tick, isRead && s.tickRead]}>
              {isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = (c, isOwn) => StyleSheet.create({
  wrapper: {
    alignSelf:    isOwn ? 'flex-end' : 'flex-start',
    maxWidth:     '78%',
    marginVertical:   2,
    marginHorizontal: 8,
  },
  senderName: {
    fontSize: 11, fontWeight: '700',
    color: c.primary, marginLeft: 10, marginBottom: 2,
  },
  bubble: {
    backgroundColor: isOwn ? c.bubbleOwn : c.bubble,
    borderRadius:        14,
    borderBottomRightRadius: isOwn ? 2 : 14,
    borderBottomLeftRadius:  isOwn ? 14 : 2,
    paddingHorizontal: 12,
    paddingTop:   8,
    paddingBottom: 6,
    elevation: 1,
    shadowColor: c.shadow, shadowOpacity: 0.07, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
  },
  text: { fontSize: 15, color: c.text, lineHeight: 22 },
  mediaImage: {
    width: 210, height: 170, borderRadius: 10, marginBottom: 4,
  },
  videoThumb: {
    width: 210, height: 130, borderRadius: 10,
    backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  videoPlay:  { fontSize: 40, color: '#fff' },
  videoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 },
  meta:  { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 3 },
  time:  { fontSize: 10, color: c.textMuted },
  tick:  { fontSize: 10, color: c.textMuted },
  tickRead: { color: c.primary },
});
