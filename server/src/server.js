import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import redisClient from "./config/redis.js";
import { handleConnection } from "./controllers/socketController.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const start = async () => {
  await redisClient.connect();
  console.log("✅ Redis Ready");

  io.on("connection", (socket) => handleConnection(io, socket));

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();
