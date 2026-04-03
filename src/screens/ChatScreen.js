// src/screens/ChatScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useChat } from "../hooks/useChat";
import { sendMediaMessage } from "../services/chatService";
import { getOtherParticipant } from "../utils/helpers";

import MessageBubble from "../components/chat/MessageBubble";
import TypingIndicator from "../components/common/TypingIndicator";
import Avatar from "../components/common/Avatar";

const TYPING_DEBOUNCE = 1500;

export default function ChatScreen({ navigation, route }) {
  const { chat } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const { socket } = useSocket();
  const chatId = chat._id;

  const { messages, loading, typingUsers, flatListRef } = useChat(chatId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);

  const typingTimer = useRef(null);
  const isAtBottom = useRef(true); // 🔥 NEW

  const other = !chat.isGroup ? getOtherParticipant(chat, user._id) : null;

  const chatName = chat.isGroup
    ? chat.groupName
    : (other?.username ?? "Unknown");

  const avatarUrl = chat.isGroup
    ? chat.groupAvatar?.url
    : other?.avatar?.url;

  const s = styles(colors);

  // 🔹 Online status
  useEffect(() => {
    if (!socket || chat.isGroup) return;

    const onOnline = ({ userId }) => {
      if (userId?.toString() === other?._id?.toString()) {
        setOtherOnline(true);
      }
    };

    const onOffline = ({ userId }) => {
      if (userId?.toString() === other?._id?.toString()) {
        setOtherOnline(false);
      }
    };

    socket.on("user:online", onOnline);
    socket.on("user:offline", onOffline);

    return () => {
      socket.off("user:online", onOnline);
      socket.off("user:offline", onOffline);
    };
  }, [socket, other?._id]);

  // 🔹 Typing
  const handleTextChange = (val) => {
    setText(val);

    if (!socket) return;

    socket.emit("chat:typing", { chatId });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("chat:stopTyping", { chatId });
    }, TYPING_DEBOUNCE);
  };

  // 🔹 Send text
  const handleSend = () => {
    const content = text.trim();
    if (!content || !socket) return;

    socket.emit("chat:message", {
      chatId,
      content,
      type: "text",
    });

    setText("");
    clearTimeout(typingTimer.current);
    socket.emit("chat:stopTyping", { chatId });
  };

  // 🔹 Attach media
  const handleAttach = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    try {
      setSending(true);
      const mime =
        asset.type === "video" ? "video/mp4" : "image/jpeg";

      await sendMediaMessage(chatId, asset.uri, mime);
    } catch (err) {
      Alert.alert("Upload failed", err.message);
    } finally {
      setSending(false);
    }
  };

  const showTyping = typingUsers.length > 0;

  // 🔥 SMART AUTO SCROLL
  useEffect(() => {
    if (messages.length === 0) return;

    if (isAtBottom.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: true,
        });
      }, 50);
    }
  }, [messages]);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.headerInfo}
          activeOpacity={0.7}
          onPress={() =>
            chat.isGroup
              ? navigation.navigate("GroupInfo", { chat })
              : navigation.navigate("UserProfile", {
                  userId: other?._id,
                })
          }
        >
          <Avatar uri={avatarUrl} name={chatName} size={38} />

          <View>
            <Text style={s.headerName} numberOfLines={1}>
              {chatName}
            </Text>

            <Text style={s.headerSub}>
              {showTyping
                ? "✏️ typing..."
                : !chat.isGroup && otherOnline
                ? "🟢 online"
                : chat.isGroup
                ? `${chat.participants?.length ?? 0} members`
                : ""}
            </Text>
          </View>
        </TouchableOpacity>

        {!chat.isGroup && (
          <View style={s.callBtns}>
            <TouchableOpacity style={s.callBtn}>
              <Text style={s.callBtnIcon}>📞</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.callBtn}>
              <Text style={s.callBtnIcon}>📹</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CHAT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {loading ? (
          <ActivityIndicator
            style={{ flex: 1 }}
            color={colors.primary}
            size="large"
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            inverted
            keyExtractor={(m) => m._id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isOwn={
                  (item.sender?._id || item.sender)?.toString() ===
                  user._id?.toString()
                }
                showSenderName={chat.isGroup}
              />
            )}
            contentContainerStyle={s.msgList}
            ListFooterComponent={
              showTyping ? <TypingIndicator /> : null
            }

            // 🔥 IMPORTANT PART
            onScroll={(e) => {
              const offsetY = e.nativeEvent.contentOffset.y;
              isAtBottom.current = offsetY < 50;
            }}
            scrollEventThrottle={16}
          />
        )}

        {/* INPUT */}
        <View style={s.inputBar}>
          <TouchableOpacity
            style={s.attachBtn}
            onPress={handleAttach}
            disabled={sending}
          >
            <Text style={s.attachIcon}>
              {sending ? "⏳" : "📎"}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={s.input}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[
              s.sendBtn,
              !text.trim() && s.sendBtnOff,
            ]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={s.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },

    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.headerBg,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
      elevation: 4,
    },

    backBtn: { padding: 6 },
    backArrow: { fontSize: 22, color: c.headerText },

    headerInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    headerName: {
      fontSize: 16,
      fontWeight: "700",
      color: c.headerText,
    },

    headerSub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
    },

    callBtns: { flexDirection: "row" },
    callBtn: { padding: 8 },
    callBtnIcon: { fontSize: 20 },

    msgList: {
      paddingHorizontal: 6,
      paddingVertical: 10,
    },

    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: c.card,
      padding: 8,
      borderTopWidth: 0.5,
      borderTopColor: c.border,
      gap: 6,
    },

    attachBtn: { padding: 8 },
    attachIcon: { fontSize: 22 },

    input: {
      flex: 1,
      backgroundColor: c.inputBg,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: c.text,
      maxHeight: 120,
      borderWidth: 1,
      borderColor: c.border,
    },

    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    sendBtnOff: {
      backgroundColor: c.inputBg,
    },

    sendIcon: {
      color: "#fff",
      fontSize: 18,
    },
  });