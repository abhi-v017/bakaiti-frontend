// src/hooks/useWebRTC.js
// Safe WebRTC wrapper — works in Expo Go (calling disabled) and
// in a dev build / production build (calling fully enabled).

import { Platform } from 'react-native';

// Detect if the native module is actually available
let WebRTCAvailable = false;
let RTCPeerConnection    = null;
let RTCSessionDescription = null;
let RTCIceCandidate      = null;
let mediaDevices         = null;
let RTCView              = null;

try {
  if (Platform.OS !== 'web') {
    const mod = require('react-native-webrtc');
    // If the native module loaded, these will be real classes
    if (mod && mod.RTCPeerConnection) {
      RTCPeerConnection     = mod.RTCPeerConnection;
      RTCSessionDescription = mod.RTCSessionDescription;
      RTCIceCandidate       = mod.RTCIceCandidate;
      mediaDevices          = mod.mediaDevices;
      RTCView               = mod.RTCView;
      WebRTCAvailable       = true;
    }
  }
} catch (e) {
  // Expo Go — native module not compiled in, calling will be disabled
  console.log('[WebRTC] Native module not available (Expo Go). Calling disabled.');
}

export {
  WebRTCAvailable,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  RTCView,
};