import React, { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { EVENTS } from "../utils/constants"; // Make sure this path is correct

const SocketContext = createContext();

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [match, setMatch] = useState(null); // { roomId, role }
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("IDLE"); // IDLE, SEARCHING, CONNECTED

  // 1. Initialize Connection (Only when we have a token)
  const connectSocket = (token, gender) => {
    const newSocket = io("", {
      auth: { token }, // specific to your backend auth logic
      query: { gender },
    });

    newSocket.on("connect", () => console.log("✅ Connected to Socket"));

    // Listen for Match
    newSocket.on(EVENTS.MATCH_FOUND, ({ roomId }) => {
      setStatus("CONNECTED");
      setMatch({ roomId });
      setMessages([]); // Clear old chats
    });

    // Listen for Incoming Messages
    newSocket.on(EVENTS.RECEIVE_MESSAGE, (msg) => {
      setMessages((prev) => [...prev, { ...msg, isMe: false }]);
    });

    // Listen for Partner Disconnect
    newSocket.on(EVENTS.PARTNER_LEFT, () => {
      alert("Partner disconnected! Shredding session...");
      setStatus("IDLE");
      setMatch(null);
      setMessages([]);
    });

    setSocket(newSocket);
  };

  // 2. Queue Logic
  const joinQueue = (preference, gender, fingerprint) => {
    if (!socket) return;
    setStatus("SEARCHING");
    socket.emit(EVENTS.JOIN_QUEUE, { preference, gender, fingerprint });
  };

  // 3. Send Message
  const sendMessage = (text) => {
    if (!socket || !match) return;
    const msgPayload = { message: text, roomId: match.roomId };

    socket.emit(EVENTS.SEND_MESSAGE, msgPayload);
    // Optimistically update UI
    setMessages((prev) => [
      ...prev,
      { text, isMe: true, timestamp: new Date() },
    ]);
  };

  // 4. Disconnect / Leave
  const disconnect = () => {
    if (socket) socket.disconnect();
    setStatus("IDLE");
    setMatch(null);
    setMessages([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        status,
        messages,
        connectSocket,
        joinQueue,
        sendMessage,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
