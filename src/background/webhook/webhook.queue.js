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

const webhookQueue = new Queue("Webhook", redisOptions);
logger.info("webhookQueue connected...");

const webhookQueueConfig = {
  type: "bullmq",
  name: webhookQueue.name,
  hostId: "Webhook",
  redis: { ...redis, maxRetriesPerRequest: null },
};

module.exports = {
  webhookQueue,
  webhookQueueConfig,
};
