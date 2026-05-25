import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
});

export const redisPub = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));

// Cache helpers
export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 3600
): Promise<void> {
  await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redisClient.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function deleteCache(key: string): Promise<void> {
  await redisClient.del(key);
}

// Job state tracking
export async function setJobState(
  jobId: string,
  state: object
): Promise<void> {
  await redisClient.setex(`job:${jobId}`, 86400, JSON.stringify(state));
}

export async function getJobState(jobId: string): Promise<object | null> {
  return getCache(`job:${jobId}`);
}
