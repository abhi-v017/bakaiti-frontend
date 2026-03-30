// src/hooks/useChat.js — Message state + socket listeners for a chat room
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { getMessages } from '../services/chatService';

export const useChat = (chatId) => {
  const { socket }     = useSocket();
  const [messages,     setMessages]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [typingUsers,  setTypingUsers]  = useState([]); // [{ userId, username }]
  const flatListRef    = useRef(null);

  // ── Load history from REST ─────────────────────────────────────
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    getMessages(chatId)
      .then(setMessages)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [chatId]);

  // ── Socket listeners ───────────────────────────────────────────
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('chat:join', chatId);

    const onMessage = (msg) => {
      const msgChatId = msg.chat?._id || msg.chat;
      if (msgChatId !== chatId) return;
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev; // dedup
        return [...prev, msg];
      });
      // Auto-scroll
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    };

    const onTyping = ({ chatId: cid, userId, username }) => {
      if (cid !== chatId) return;
      setTypingUsers((prev) =>
        prev.find((u) => u.userId === userId) ? prev : [...prev, { userId, username }]
      );
    };

    const onStopTyping = ({ chatId: cid, userId }) => {
      if (cid !== chatId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on('chat:message',    onMessage);
    socket.on('chat:typing',     onTyping);
    socket.on('chat:stopTyping', onStopTyping);

    return () => {
      socket.emit('chat:leave', chatId);
      socket.off('chat:message',    onMessage);
      socket.off('chat:typing',     onTyping);
      socket.off('chat:stopTyping', onStopTyping);
    };
  }, [socket, chatId]);

  return { messages, loading, typingUsers, flatListRef };
};
