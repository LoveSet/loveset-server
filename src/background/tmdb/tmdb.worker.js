const { Worker } = require("bullmq");
const config = require("../../config/config");
const logger = require("../../config/logger");
const mongoose = require("mongoose");
const redisOptions = require("../../config/redisOptions");
const { contentService } = require("../../services");
const downloadFile = require("../../utils/downloadFile");
const { multipartUploadToS3 } = require("../../utils/aws");
const fs = require("fs");
const { getYouTubeTrailerUrl } = require("../../utils/getYoutubeTrailer");

mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info("MongoDB connected successfully");
  })
  .catch((error) => {
    logger.error("Error starting queues:", error);
    process.exit(1);
  });

const tmdbWorker = new Worker(
  "TMDB",
  async (job) => {
    try {
      logger.info("tmdbWorker started...");
      const { contentId } = job.data;

      let filter = {
        _id: contentId,
      };

      const content = await contentService.getContentByFilter(filter);

      if (content) {
        const posterFile = await downloadFile(content?.posterUrl);
        const posterFilePath = `files/${posterFile}`;

        let updateData = {};

        await multipartUploadToS3(posterFile, posterFilePath, "image/jpeg");
        await fs.unlinkSync(`./files/${posterFile}`);

        updateData.posterUrl = posterFile;

        if (content?.trailerUrl?.includes("search_query")) {
          const trailerUrl = await getYouTubeTrailerUrl(
            content?.title,
            content?.year
          );
          updateData.trailerUrl = trailerUrl;
        }

        await contentService.updateContentByFilter(filter, updateData);
      }

      logger.info("tmdbWorker ended...");
    } catch (error) {
      logger.error(error);
    }
  },
  redisOptions
);

// NODE_ENV=development node src/background/tmdb/tmdb.worker.js
// NODE_ENV=production node src/background/tmdb/tmdb.worker.js --name tmdb-worker
