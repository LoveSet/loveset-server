const https = require("https");
const { rapidApiKey } = require("../config/config");
const logger = require("../config/logger");

// https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability/playground/apiendpoint_93e6eead-196b-49eb-b62a-cb106b99ff47

// https://www.movieofthenight.com/about/api/pricing

// https://docs.movieofthenight.com/guide/shows

function streamingAvailability(endpoint, queryParams = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Build query string from params
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      const path = `${endpoint}${queryString ? "?" + queryString : ""}`;

      const options = {
        method: "GET",
        hostname: "streaming-availability.p.rapidapi.com",
        path,
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
        },
      };

      const req = https.request(options, (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          try {
            const body = Buffer.concat(chunks).toString();
            resolve(JSON.parse(body));
          } catch (e) {
            logger.error(e);
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });

      req.on("error", (error) => {
        logger.error(error);
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.end();
    } catch (error) {
      logger.error(error);
      reject(new Error(`Unexpected error: ${error.message}`));
    }
  });
}

module.exports = streamingAvailability;
