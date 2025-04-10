const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");
const Responses = require("../utils/responses");

// Rate limiter for getCache - higher limit since it's lightweight
const cacheRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute per IP
  // standardHeaders: true,
  handler: (req, res) => {
    logger.error("Error 429: Too many cache requests, please try again later.");
    return Responses.handleError(
      429,
      "Too many requests, please try again later.",
      res
    );
  },
});

// Rate limiter for getContent - stricter limit due to API costs
const contentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 requests per minute per IP
  // standardHeaders: true,
  handler: (req, res) => {
    logger.error(
      "Error 429: Too many content generation requests, please try again later."
    );
    return Responses.handleError(
      429,
      "Too many recommendation requests, please try again later.",
      res
    );
  },
});

// Global rate limiter for overall API protection
const globalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 250, // 250 requests per hour per IP
  // standardHeaders: true,
  handler: (req, res) => {
    logger.error("Error 429: Hourly request limit reached.");
    return Responses.handleError(
      429,
      "Hourly request limit reached. Please try again later.",
      res
    );
  },
});

module.exports = { cacheRateLimiter, contentRateLimiter, globalRateLimiter };
