const { QueueEvents } = require("bullmq");
const logger = require("../../config/logger");
const redisOptions = require("../../config/redisOptions");
const { tmdbQueue } = require("./tmdb.queue");

const TMDBEvent = new QueueEvents("TMDB", redisOptions);

TMDBEvent.on("completed", async (data) => {
  try {
    const {} = data?.returnvalue; //

    await tmdbQueue.close();
    logger.info(`TMDBEvent done - ${data.jobId}`);
  } catch (err) {}
});

TMDBEvent.on("failed", ({ jobId, failedReason }) => {
  try {
    logger.error("TMDBEvent error ", jobId, failedReason);
  } catch (err) {}
});

module.exports = TMDBEvent;
