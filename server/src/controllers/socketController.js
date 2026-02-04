import { v4 as uuidv4 } from "uuid";
import * as QueueService from "../services/queueService.js"; // Modular Import
import { EVENTS } from "../utils/constants.js";
import redisClient from "../config/redis.js";
import { Filter } from "bad-words";

const activeSessions = new Map();

const filter = new Filter();

const addStrike = async (fingerprint) => {
  const key = `strikes:${fingerprint}`;
  const strikes = await redisClient.incr(key);
  if (strikes === 1) await redisClient.expire(key, 30 * 24 * 60 * 60);
  return strikes;
};

export const handleConnection = (io, socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on(EVENTS.JOIN_QUEUE, async (data) => {
    try {
      socket.fingerprint = data.fingerprint;

      if (!data) {
        console.log("[ERROR] Data is null/undefined!");
        return;
      }
      let { gender, preference, fingerprint, nickname } = data;
      socket.nickname = nickname || "Anonymous";

      const matchesToday = await QueueService.checkDailyLimit(fingerprint);

      if (preference !== "any" && matchesToday >= 5) {
        preference = "any";

        socket.emit("RECEIVE_MESSAGE", {
          text: "⚠️ Daily filter limit reached. Switched to 'Any' match mode.",
        });

        socket.emit("PREFERENCE_UPDATED", "any");
      }

      let peerId = null;
      let peerSocket = null;
      let attempts = 0;

      while (attempts < 5) {
        peerId = await QueueService.findMatch(preference);

        if (!peerId) break; // Queue is empty

        peerSocket = io.sockets.sockets.get(peerId);

        if (peerSocket && peerId != socket.id) {
          break;
        }

        attempts++;
      }

      if (peerSocket) {
        const roomId = uuidv4();

        socket.join(roomId);
        peerSocket.join(roomId);

        activeSessions.set(socket.id, { roomId, peerId });
        activeSessions.set(peerId, { roomId, peerId: socket.id });

        if (preference !== "any") {
          await QueueService.incrementDailyLimit(fingerprint);
        }

        socket.emit(EVENTS.MATCH_FOUND, {
          roomId,
          partnerNickname: peerSocket.nickname || "Anonymous",
        });

        peerSocket.emit(EVENTS.MATCH_FOUND, {
          roomId,
          partnerNickname: socket.nickname || "Anonymous",
        });
      } else {
        await QueueService.addToQueue(gender, socket.id);
        socket.emit(EVENTS.WAITING, { message: "Waiting for a match..." });
      }
    } catch (error) {
      console.error("🔥 CRITICAL SOCKET ERROR 🔥");
      console.error(error);
      socket.emit("ERROR", { message: "Internal Server Error" });
    }
  });

  socket.on("TYPING", () => {
    const session = activeSessions.get(socket.id);
    if (!session) return;

    socket.to(session.roomId).emit("PARTNER_TYPING");
  });

  socket.on("REPORT", async (data) => {
    const session = activeSessions.get(socket.id);
    if (!session) return;

    const { evidence } = data || {};
    const reportedSocketId = session.peerId;

    const reportedSocket = io.sockets.sockets.get(reportedSocketId);
    if (!reportedSocket || !reportedSocket.fingerprint) {
      console.log("Could not find reported user's fingerprint");
      return;
    }

    const reportedFingerprint = reportedSocket.fingerprint;

    console.log(`🚩 Report received against ${reportedFingerprint}`);

    if (!evidence || !Array.isArray(evidence)) return;

    let abusiveCount = 0;

    evidence.forEach((msg) => {
      if (msg.text && filter.isProfane(msg.text)) {
        abusiveCount++;
      }
    });

    console.log(`🔍 Found ${abusiveCount} abusive messages in evidence.`);

    if (abusiveCount > 0) {
      const strikes = await addStrike(reportedFingerprint);

      socket.emit("RECEIVE_MESSAGE", {
        text: `🚨 System: Abuse verified. User penalized (${strikes}/3 strikes).`,
      });

      if (strikes >= 3) {
        const reportedSocket = io.sockets.sockets.get(reportedSocketId);
        if (reportedSocket) {
          reportedSocket.emit("ERROR", {
            message: "🚫 You have been banned for abusive behavior.",
          });
          reportedSocket.disconnect();
        }
      }
    } else {
      socket.emit("RECEIVE_MESSAGE", {
        text: "🚨 System: Report received. No automated violations detected in recent messages.",
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log(`Socket Disconnected: ${socket.id}`);
    const session = activeSessions.get(socket.id);

    if (session) {
      const { roomId, peerId } = session;

      io.to(roomId).emit(EVENTS.PARTNER_LEFT);

      activeSessions.delete(peerId);
    }

    activeSessions.delete(socket.id);
    await QueueService.removeFromQueue(socket.id);
  });

  socket.on(EVENTS.SEND_MESSAGE, ({ message, roomId }) => {
    const session = activeSessions.get(socket.id);
    if (!session || session.roomId !== roomId) {
      return socket.emit(EVENTS.ERROR, { message: "Invalid room." });
    }

    socket
      .to(roomId)
      .emit(EVENTS.RECEIVE_MESSAGE, { text: message, timestamp: Date.now() });
  });
};
