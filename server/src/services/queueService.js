import redisClient from "../config/redis.js";
import { REDIS_KEYS } from "../utils/constants.js";

const getKey = (prefix, id) => `${prefix}:${id}`;

export const addToQueue = async (gender, socketId) => {
  const queueKey =
    gender === "male" ? REDIS_KEYS.QUEUE_MALE : REDIS_KEYS.QUEUE_FEMALE;

  return await redisClient.sAdd(queueKey, socketId);
};

export const removeFromQueue = async (socketId) => {
  const pipeline = redisClient.multi();
  pipeline.sRem(REDIS_KEYS.QUEUE_MALE, socketId);
  pipeline.sRem(REDIS_KEYS.QUEUE_FEMALE, socketId);
  return await pipeline.exec();
};

export const findMatch = async (targetGender) => {
  if (targetGender === "male") {
    return await redisClient.sPop(REDIS_KEYS.QUEUE_MALE);
  }

  if (targetGender === "female") {
    return await redisClient.sPop(REDIS_KEYS.QUEUE_FEMALE);
  }

  const queues = [REDIS_KEYS.QUEUE_MALE, REDIS_KEYS.QUEUE_FEMALE];
  const firstChoiceIndex = Math.random() > 0.5 ? 0 : 1;
  const firstQueue = queues[firstChoiceIndex];
  const secondQueue = queues[firstChoiceIndex === 0 ? 1 : 0];

  let peerId = await redisClient.sPop(firstQueue);

  if (!peerId) {
    peerId = await redisClient.sPop(secondQueue);
  }
  return peerId;
};

export const checkDailyLimit = async (deviceId) => {
  if (!deviceId) return 0;
  const key = getKey(REDIS_KEYS.DAILY_LIMIT, deviceId);
  const count = await redisClient.get(key);
  return count ? parseInt(count) : 0;
};

export const incrementDailyLimit = async (deviceId) => {
  if (!deviceId) return;
  const key = getKey(REDIS_KEYS.DAILY_LIMIT, deviceId);

  const newCount = await redisClient.incr(key);

  if (newCount === 1) {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const secondsUntilMidnight = Math.floor(
      (midnight.getTime() - now.getTime()) / 1000,
    );
    await redisClient.expire(key, secondsUntilMidnight);
  }

  return newCount;
};
