export const EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Auth
  VERIFY_IDENTITY: "VERIFY_IDENTITY",
  IDENTITY_VERIFIED: "IDENTITY_VERIFIED",

  // Queue & Match
  JOIN_QUEUE: "JOIN_QUEUE",
  MATCH_FOUND: "MATCH_FOUND",
  WAITING: "WAITING",

  // Chat
  SEND_MESSAGE: "SEND_MESSAGE",
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
  PARTNER_LEFT: "PARTNER_LEFT",

  // Errors
  ERROR: "ERROR",
};

export const REDIS_KEYS = {
  QUEUE_MALE: "queue:male",
  QUEUE_FEMALE: "queue:female",
  QUEUE_ANY: "queue:any",
  DAILY_LIMIT: "limit",
};
