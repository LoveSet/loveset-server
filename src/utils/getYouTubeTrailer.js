const axios = require("axios");

function getYouTubeSearchUrl(title, year, cast) {
  const query = `${title} (${year}) trailer - ${cast?.join(", ")}`;
  const encodedQuery = encodeURIComponent(query);
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
}

async function getYouTubeTrailerUrl(title, year, cast) {
  const searchYtUrl = getYouTubeSearchUrl(title, year, cast);
  try {
    const response = await axios.get(`https://r.jina.ai/${searchYtUrl}`);

    // Extract the first valid YouTube video URL from the response
    const videoIdRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/;
    const matches = response.data.match(videoIdRegex);

    if (matches && matches[1]) {
      return `https://www.youtube.com/watch?v=${matches[1]}`;
    }
    // return null; // Return null if no valid YouTube URL is found
    return getYouTubeSearchUrl(title, year, cast);
  } catch (error) {
    return getYouTubeSearchUrl(title, year, cast);
    // throw new Error("Failed to fetch YouTube trailer URL");
  }
}

module.exports = {
  getYouTubeSearchUrl,
  getYouTubeTrailerUrl,
};
