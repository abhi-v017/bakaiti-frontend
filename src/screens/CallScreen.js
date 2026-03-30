// src/screens/CallScreen.js
// Works in Expo Go (shows "not available" message) AND
// in dev/production builds (full WebRTC voice + video calling).

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSocket } from '../context/SocketContext';
import { useAuth }   from '../context/AuthContext';
import { useTheme }  from '../context/ThemeContext';
import { getOtherParticipant, formatDuration } from '../utils/helpers';
import Avatar from '../components/common/Avatar';

import {
  WebRTCAvailable,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  RTCView,
} from '../hooks/useWebRTC';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function CallScreen({ navigation, route }) {
  const { chat, callType, isCaller, incomingOffer } = route.params;
  const { socket } = useSocket();
  const { user }   = useAuth();
  const { colors } = useTheme();

  const other = getOtherParticipant(chat, user._id);

  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef       = useRef(null);

  const [localStream,  setLocalStream]  = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus,   setCallStatus]   = useState(isCaller ? 'calling' : 'connecting');
  const [duration,     setDuration]     = useState(0);
  const [isMuted,      setIsMuted]      = useState(false);
  const [isCamOff,     setIsCamOff]     = useState(false);

  const s = styles(colors);

  // ── WebRTC not available (Expo Go) ──────────────────────────
  if (!WebRTCAvailable) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>📵</Text>
        <Text style={s.unavailTitle}>Calling Not Available</Text>
        <Text style={s.unavailSub}>
          Calling requires a development build.{'\n'}
          It does not work in Expo Go.
        </Text>
        <Text style={s.unavailNote}>
          Run:{'\n'}
          <Text style={s.unavailCode}>npx expo run:android</Text>
          {'\n'}to enable calling.
        </Text>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Web platform ─────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>📵</Text>
        <Text style={s.unavailTitle}>Calling Not Available on Web</Text>
        <Text style={s.unavailSub}>Use the Android or iOS app for calls.</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Full WebRTC implementation ────────────────────────────────
  const createPC = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && other?._id) {
        socket?.emit('call:iceCandidate', { toUserId: other._id, candidate });
      }
    };
    pc.ontrack = (e) => {
      if (e.streams?.[0]) setRemoteStream(e.streams[0]);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      }
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        hangUp(false);
      }
    };
    pcRef.current = pc;
    return pc;
  };

  const getMedia = () =>
    mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video' ? { facingMode: 'user' } : false,
    });

  const startCall = async () => {
    try {
      const stream = await getMedia();
      localStreamRef.current = stream;
      setLocalStream(stream);
      const pc = createPC();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      await pc.setLocalDescription(offer);
      socket?.emit('call:initiate', { toUserId: other?._id, callType, offer });
    } catch (err) {
      Alert.alert('Call Error', err.message);
      navigation.goBack();
    }
  };

  const answerCall = async () => {
    try {
      const stream = await getMedia();
      localStreamRef.current = stream;
      setLocalStream(stream);
      const pc = createPC();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket?.emit('call:accept', { toUserId: other?._id, answer });
      setCallStatus('connected');
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      Alert.alert('Answer Error', err.message);
      navigation.goBack();
    }
  };

  const cleanup = () => {
    clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
  };

  const hangUp = (emitEnd = true) => {
    if (emitEnd && other?._id) socket?.emit('call:end', { toUserId: other._id });
    cleanup();
    navigation.goBack();
  };

  useEffect(() => {
    if (!socket) return;
    const onAccepted = async ({ answer }) => {
      try {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('connected');
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      } catch (err) { console.warn(err); }
    };
    const onIce = async ({ candidate }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (err) { console.warn(err); }
    };
    const onRejected = () => { setCallStatus('rejected'); setTimeout(() => navigation.goBack(), 1600); };
    const onEnded    = () => { setCallStatus('ended');    setTimeout(() => navigation.goBack(), 1600); };

    socket.on('call:accepted',     onAccepted);
    socket.on('call:iceCandidate', onIce);
    socket.on('call:rejected',     onRejected);
    socket.on('call:ended',        onEnded);
    return () => {
      socket.off('call:accepted',     onAccepted);
      socket.off('call:iceCandidate', onIce);
      socket.off('call:rejected',     onRejected);
      socket.off('call:ended',        onEnded);
    };
  }, [socket]);

  useEffect(() => {
    isCaller ? startCall() : answerCall();
    return () => cleanup();
  }, []);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((m) => !m);
  };

  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCamOff((c) => !c);
  };

  const statusText = {
    calling:    'Calling...',
    connecting: 'Connecting...',
    connected:  formatDuration(duration),
    rejected:   '📵  Call declined',
    ended:      '📵  Call ended',
  }[callStatus];

  return (
    <SafeAreaView style={s.safe}>
      {callType === 'video' && remoteStream && RTCView && (
        <RTCView streamURL={remoteStream.toURL()} style={StyleSheet.absoluteFill} objectFit="cover" />
      )}
      <View style={s.overlay}>
        <View style={s.callerSection}>
          <Avatar uri={other?.avatar?.url} name={other?.username} size={110} />
          <Text style={s.callerName}>{other?.username ?? 'Unknown'}</Text>
          <Text style={s.statusText}>{statusText}</Text>
          <Text style={s.callTypeLabel}>{callType === 'video' ? '📹 Video call' : '📞 Voice call'}</Text>
        </View>

        {callType === 'video' && localStream && RTCView && (
          <View style={s.localVideoPip}>
            <RTCView streamURL={localStream.toURL()} style={s.localVideo} objectFit="cover" mirror />
          </View>
        )}

        <View style={s.controls}>
          <View style={s.controlRow}>
            <TouchableOpacity style={[s.ctrlBtn, isMuted && s.ctrlBtnActive]} onPress={toggleMute}>
              <Text style={s.ctrlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
              <Text style={s.ctrlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
            {callType === 'video' && (
              <TouchableOpacity style={[s.ctrlBtn, isCamOff && s.ctrlBtnActive]} onPress={toggleCam}>
                <Text style={s.ctrlIcon}>{isCamOff ? '📷' : '📹'}</Text>
                <Text style={s.ctrlLabel}>{isCamOff ? 'Start cam' : 'Stop cam'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[s.ctrlBtn, s.endBtn]} onPress={() => hangUp(true)}>
              <Text style={s.ctrlIcon}>📵</Text>
              <Text style={[s.ctrlLabel, { color: '#fff' }]}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: c.callBg },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 24 },

  // Unavailable screen
  unavailTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 12, textAlign: 'center' },
  unavailSub:   { fontSize: 15, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 32 },
  unavailNote:  { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  unavailCode:  { fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.1)', color: '#00A884' },
  backBtn:      { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  backBtnText:  { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Call screen
  callerSection: { alignItems: 'center', marginTop: 50 },
  callerName:    { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 18, marginBottom: 8 },
  statusText:    { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  callTypeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  localVideoPip: {
    position: 'absolute', top: 24, right: 24,
    width: 100, height: 140, borderRadius: 14,
    overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  localVideo:    { flex: 1 },
  controls:      { paddingBottom: 20 },
  controlRow:    { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  ctrlBtn: {
    alignItems: 'center', width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center',
  },
  ctrlBtnActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  endBtn:        { backgroundColor: c.danger },
  ctrlIcon:      { fontSize: 26 },
  ctrlLabel:     { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
});