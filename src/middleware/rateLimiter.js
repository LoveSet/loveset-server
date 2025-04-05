const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");
const Responses = require("../utils/responses");

const appRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 300 requests per 15 minutes per user
  handler: (req, res) => {
    logger.error("Error 429: Too many requests, please try again later.");
    return Responses.handleError(
      429,
      "Too many requests, please try again later.",
      res
    );
  },
});
module.exports = { appRateLimiter };
