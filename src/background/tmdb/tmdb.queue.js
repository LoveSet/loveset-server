const { Queue } = require("bullmq");
const config = require("../../config/config");
const redisOptions = require("../../config/redisOptions");
const logger = require("../../config/logger");

let redis;

if (config.env === "development") {
  redis = config.devRedis;
} else {
  redis = config.prodRedis;
}

const tmdbQueue = new Queue("TMDB", redisOptions);
logger.info("tmdbQueue connected...");

const tmdbQueueConfig = {
  type: "bullmq",
  name: tmdbQueue.name,
  hostId: "TMDB",
  redis: { ...redis, maxRetriesPerRequest: null },
};

module.exports = {
  tmdbQueue,
  tmdbQueueConfig,
};
