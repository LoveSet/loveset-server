const IORedis = require("ioredis");
const config = require("./config");

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
  console.error("Redis connection error:", error);
  // Handle the error as needed, e.g., use a fallback or exit the process
}

const redisOptions = { connection };

module.exports = redisOptions;
