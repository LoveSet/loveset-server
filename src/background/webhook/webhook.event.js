const { QueueEvents } = require("bullmq");
const logger = require("../../config/logger");
const redisOptions = require("../../config/redisOptions");
const { webhookQueue } = require("./webhook.queue");
// const { emitDataToUser } = require("../../socket/server");
// const socketEmitter = require("../../socket/socketEmitter");

const WebhookEvent = new QueueEvents("Webhook", redisOptions);

WebhookEvent.on("completed", async (data) => {
  try {
    const { userId } = data?.returnvalue; //

    if (userId) {
      // todo: emit notification event to update user data -> premium
      // const emitDataToRoom = socketEmitter.getEmitter();
      // emitDataToRoom(userId, { action: "refresh_notifications_data" });
    }

    await webhookQueue.close();
    logger.info(`WebhookEvent done - ${data.jobId}`);
  } catch (err) {}
});

WebhookEvent.on("failed", ({ jobId, failedReason }) => {
  try {
    logger.error("WebhookEvent error ", jobId, failedReason);
  } catch (err) {}
});

module.exports = WebhookEvent;
