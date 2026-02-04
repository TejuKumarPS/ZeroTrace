import { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const useChat = (token, onPreferenceUpdate) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [partnerNickname, setPartnerNickname] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [inQueue, setInQueue] = useState(false);
  const [matchData, setMatchData] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Prevent double connections in Strict Mode
    if (socketRef.current) {
      socketRef.current.auth = { token };
      return;
    }

    console.log("🔌 Initializing Socket Connection...");

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: false,
    });

    socketRef.current = newSocket;

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Connection failed. Please try again.");
    });

    newSocket.on("PREFERENCE_UPDATED", (newPreference) => {
      if (onPreferenceUpdate) {
        onPreferenceUpdate(newPreference);
      }
    });

    // Queue event handlers
    newSocket.on("QUEUE_JOINED", () => {
      console.log("📡 Joined queue");
      setInQueue(true);
    });

    // Match event handlers
    newSocket.on("MATCH_FOUND", (data) => {
      console.log("🎯 Match found:", data);
      setInQueue(false);
      setMatchData(data); // Save room ID
      setPartnerNickname(data.partnerNickname || "Anonymous");
      setMessages([
        {
          type: "system",
          text: "Match Found! Connection established.",
          timestamp: new Date(),
        },
      ]);
    });

    // Message event handlers
    newSocket.on("RECEIVE_MESSAGE", (data) => {
      console.log("💬 Message received:", data);
      setMessages((prev) => [
        ...prev,
        {
          type: "partner",
          text: data.text,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    });

    // Typing indicator
    newSocket.on("PARTNER_TYPING", () => {
      setIsTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    });

    // Partner disconnect
    newSocket.on("PARTNER_LEFT", () => {
      console.log("👋 Partner left");
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          text: "Partner disconnected.",
          timestamp: new Date(),
        },
      ]);

      setTimeout(() => {
        setPartnerNickname(null);
        setMatchData(null);
        setMessages([]);
        setInQueue(false);
      }, 1000);
    });

    // Error handling
    newSocket.on("ERROR", (data) => {
      console.error("⚠️ Socket error:", data);
      setError(data.message || "An error occurred");
      setInQueue(false);
    });

    return () => {
      if (socketRef.current) {
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current.off("PREFERENCE_UPDATED", onPreferenceUpdate);
        socketRef.current = null;
      }
    };
  }, [token, onPreferenceUpdate]);

  const joinQueue = useCallback((preference, gender, fingerprint, nickname) => {
    const socket = socketRef.current;
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }
      console.log("🔍 Joining queue with preference:", preference);
      socket.emit("JOIN_QUEUE", {
        preference,
        gender,
        fingerprint,
        nickname: nickname || "Anonymous",
      });
      setInQueue(true);
      setError(null);
    } else {
      console.error("Cannot join queue: Socket not connected");
    }
  }, []);

  const leaveQueue = useCallback(() => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      console.log("🚫 Leaving queue");
      socket.emit("LEAVE_QUEUE");
      setInQueue(false);
    }
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const socket = socketRef.current;
      if (socket && socket.connected && text.trim() && matchData) {
        console.log("📤 Sending message:", text);
        socket.emit("SEND_MESSAGE", {
          message: text.trim(),
          roomId: matchData.roomId,
        });

        setMessages((prev) => [
          ...prev,
          {
            type: "user",
            text: text.trim(),
            timestamp: new Date(),
          },
        ]);
      }
    },
    [matchData],
  );

  const sendTypingIndicator = useCallback(() => {
    const socket = socketRef.current;
    if (socket && socket.connected && partnerNickname) {
      socket.emit("TYPING");
    }
  }, [partnerNickname]);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      console.log("🔌 Disconnecting from chat");
      socket.emit("LEAVE_CHAT");
      socket.disconnect();
      setPartnerNickname(null);
      setMessages([]);
      setInQueue(false);
      setMatchData(null);
    }
  }, []);

  const reportPartner = useCallback(
    (chatHistory) => {
      const socket = socketRef.current;
      if (socket && socket.connected && partnerNickname) {
        console.log("🚩 Reporting partner");
        const evidence = chatHistory
          .filter((msg) => msg.type === "partner")
          .slice(-10); // last 10 messages from partner
        socket.emit("REPORT", { evidence });
      }
    },
    [partnerNickname],
  );

  return {
    socket: socketRef.current,
    connected,
    messages,
    partnerNickname,
    isTyping,
    error,
    inQueue,
    joinQueue,
    leaveQueue,
    sendMessage,
    sendTypingIndicator,
    disconnect,
    reportPartner,
  };
};
