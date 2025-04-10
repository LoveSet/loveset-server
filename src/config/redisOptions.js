const IORedis = require("ioredis");
const config = require("./config");
const logger = require("./logger");

let redis;

if (config.env === "development") {
  redis = config.redis.dev;
} else {
  redis = config.redis.prod;
}

let connection;

try {
  connection = new IORedis({
    ...redis,
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
  });
} catch (error) {
  logger.error("Redis connection error:", error);
  process.exit(1);
  // Handle the error as needed, e.g., use a fallback or exit the process
}

const redisOptions = { connection };

module.exports = redisOptions;
