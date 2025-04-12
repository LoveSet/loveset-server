// const axios = require("axios");
// const logger = require("../config/logger");

async function getYouTubeTrailerUrl(title, year) {
  const query = `${title} (${year}) trailer`;
  const encodedQuery = encodeURIComponent(query);
  const searchYtUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
  // const response = await axios.get(searchYtUrl);

  // logger.info(response.data); // Log the response data for debugging

  // Extract the first valid YouTube video URL from the response
  // const videoIdRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/;
  // const matches = response.data.match(videoIdRegex);

  // if (matches && matches[1]) {
  //   logger.info(`https://www.youtube.com/watch?v=${matches[1]}`);
  //   return `https://www.youtube.com/watch?v=${matches[1]}`;
  // }
  // logger.info(null);
  // return null; // Return null if no valid YouTube URL is found
  return searchYtUrl;
}
module.exports = getYouTubeTrailerUrl;
