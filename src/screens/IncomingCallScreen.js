// src/screens/IncomingCallScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSocket } from '../context/SocketContext';
import { useTheme }  from '../context/ThemeContext';
import { WebRTCAvailable } from '../hooks/useWebRTC';
import Avatar from '../components/common/Avatar';

export default function IncomingCallScreen({ navigation, route }) {
  const { fromId, fromName, fromAvatar, callType, offer } = route.params;
  const { socket } = useSocket();
  const { colors } = useTheme();

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // If caller hangs up before we answer
  useEffect(() => {
    if (!socket) return;
    const onEnded = ({ from }) => {
      if (from?.toString() === fromId?.toString()) navigation.goBack();
    };
    socket.on('call:ended', onEnded);
    return () => socket.off('call:ended', onEnded);
  }, [socket]);

  const reject = () => {
    socket?.emit('call:reject', { toUserId: fromId });
    navigation.goBack();
  };

  const accept = () => {
    // Expo Go: WebRTC native module not compiled in
    if (!WebRTCAvailable || Platform.OS === 'web') {
      reject(); // send rejection signal
      alert('Calling requires a development build (npx expo run:android). Not supported in Expo Go.');
      return;
    }
    navigation.replace('Call', {
      chat: {
        _id:          null,
        isGroup:      false,
        participants: [{ _id: fromId, username: fromName, avatar: { url: fromAvatar } }],
      },
      callType,
      isCaller:      false,
      incomingOffer: offer,
    });
  };

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.card}>
        <Text style={s.label}>
          Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
        </Text>

        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Avatar uri={fromAvatar} name={fromName} size={110} />
        </Animated.View>

        <Text style={s.callerName}>{fromName}</Text>
        <Text style={s.typeIcon}>{callType === 'video' ? '📹' : '📞'}</Text>

        {!WebRTCAvailable && (
          <Text style={s.expoGoNote}>
            ⚠️ Calling not supported in Expo Go
          </Text>
        )}

        <View style={s.buttons}>
          <TouchableOpacity style={[s.btn, s.rejectBtn]} onPress={reject} activeOpacity={0.85}>
            <Text style={s.btnIcon}>📵</Text>
            <Text style={s.btnLabel}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, s.acceptBtn]} onPress={accept} activeOpacity={0.85}>
            <Text style={s.btnIcon}>📞</Text>
            <Text style={s.btnLabel}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:       { flex: 1, backgroundColor: c.callBg, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '82%', backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 28, padding: 40, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  label:       { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 28, letterSpacing: 0.5 },
  callerName:  { fontSize: 26, fontWeight: '700', color: '#fff', marginTop: 18, marginBottom: 6 },
  typeIcon:    { fontSize: 36, marginBottom: 16 },
  expoGoNote:  { color: '#FFD700', fontSize: 12, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 },
  buttons:     { flexDirection: 'row', gap: 36, marginTop: 8 },
  btn: {
    width: 74, height: 74, borderRadius: 37,
    justifyContent: 'center', alignItems: 'center',
  },
  rejectBtn:  { backgroundColor: c.danger },
  acceptBtn:  { backgroundColor: '#25D366' },
  btnIcon:    { fontSize: 28 },
  btnLabel:   { color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 3 },
});