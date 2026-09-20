import { getRedisClient } from '../config/redis.js';

/**
 * Cache-aside middleware factory
 * @param {number} ttlSeconds - Cache time-to-live in seconds
 * @param {function} keyGenerator - Optional function to generate cache key from req
 */
export const cacheMiddleware = (ttlSeconds = 300, keyGenerator) => {
  return async (req, res, next) => {
    const cache = getRedisClient();
    const cacheKey = keyGenerator ? keyGenerator(req) : `cache:${req.originalUrl}`;

    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (e) {
      // Cache read failure, proceed to handler
    }

    // Store original json method to intercept response
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      try {
        await cache.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
      } catch (e) {
        // Cache write failure is non-critical
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache entries matching a pattern prefix
 */
export const invalidateCache = async (prefix) => {
  const cache = getRedisClient();
  try {
    const keys = await cache.keys(`${prefix}*`);
    for (const key of keys) {
      await cache.del(key);
    }
  } catch (e) {
    console.warn('Cache invalidation failed:', e.message);
  }
};
