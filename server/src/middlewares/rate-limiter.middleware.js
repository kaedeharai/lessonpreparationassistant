const ResponseUtil = require('../utils/response.util');

const requestCounts = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

function rateLimiterMiddleware(req, res, next) {
  const clientIp = req.ip || 'unknown';
  const now = Date.now();

  if (!requestCounts.has(clientIp)) {
    requestCounts.set(clientIp, { count: 1, windowStart: now });
    return next();
  }

  const data = requestCounts.get(clientIp);

  if (now - data.windowStart > WINDOW_MS) {
    data.count = 1;
    data.windowStart = now;
    return next();
  }

  data.count++;

  if (data.count > MAX_REQUESTS) {
    return ResponseUtil.error(res, '请求过于频繁，请稍后再试', 429);
  }

  next();
}

module.exports = rateLimiterMiddleware;