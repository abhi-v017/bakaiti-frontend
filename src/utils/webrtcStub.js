// src/utils/webrtcStub.js
// ─────────────────────────────────────────────────────────────
// react-native-webrtc is Android/iOS ONLY.
// This file is a no-op stub served to the web bundler so it
// doesn't crash. Calling is disabled on web automatically.
// ─────────────────────────────────────────────────────────────

export const RTCPeerConnection   = class {};
export const RTCSessionDescription = class {};
export const RTCIceCandidate     = class {};
export const mediaDevices        = { getUserMedia: () => Promise.reject(new Error('WebRTC not supported on web')) };
export const RTCView             = () => null;

export default {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  RTCView,
};
