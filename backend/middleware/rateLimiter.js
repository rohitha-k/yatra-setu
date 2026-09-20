const requestCounts = new Map();

const CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    data.timestamps = data.timestamps.filter(t => now - t < data.windowMs);
    if (data.timestamps.length === 0) requestCounts.delete(key);
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limiter middleware factory
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 */
export const rateLimiter = (maxRequests = 100, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${clientIP}:${req.baseUrl}`;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { timestamps: [], windowMs });
    }

    const data = requestCounts.get(key);
    data.timestamps = data.timestamps.filter(t => now - t < windowMs);

    if (data.timestamps.length >= maxRequests) {
      const retryAfter = Math.ceil((data.timestamps[0] + windowMs - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      });
    }

    data.timestamps.push(now);
    next();
  };
};
