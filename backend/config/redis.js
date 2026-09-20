let redisClient;
let isRedisConnected = false;

const memoryCache = new Map();
const memoryClientFallback = {
  async get(key) {
    const item = memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  },
  async setEx(key, seconds, value) {
    memoryCache.set(key, { value, expiresAt: Date.now() + (seconds * 1000) });
    return 'OK';
  },
  async del(key) {
    memoryCache.delete(key);
    return 1;
  },
  async keys(pattern) {
    const allKeys = [...memoryCache.keys()];
    if (pattern === '*') return allKeys;
    const prefix = pattern.replace('*', '');
    return allKeys.filter(k => k.startsWith(prefix));
  }
};

export const getRedisClient = () => {
  if (isRedisConnected && redisClient) return redisClient;
  return memoryClientFallback;
};

export const connectRedis = async () => {
  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  try {
    const redis = await import('redis');
    redisClient = redis.createClient({ 
      url: REDIS_URL,
      socket: { reconnectStrategy: false }
    });
    redisClient.on('error', (err) => {
      isRedisConnected = false;
    });
    await redisClient.connect();
    isRedisConnected = true;
    console.log('✓ Redis connected successfully.');
  } catch (err) {
    isRedisConnected = false;
    console.warn('⚠ Redis unavailable. Using in-memory cache fallback.');
  }
};
