const https = require("https");
const { tmdbReadAccessToken } = require("../config/config");

// You might want to store this in a config file
const TMDB_AUTH_TOKEN = tmdbReadAccessToken;

function tmdb(endpoint, queryParams = {}) {
  return new Promise((resolve, reject) => {
    // Build query string from params
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    const path = `${endpoint}${queryString ? "?" + queryString : ""}`;

    const options = {
      method: "GET",
      hostname: "api.themoviedb.org",
      path,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_AUTH_TOKEN}`,
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

module.exports = tmdb;

// Search for TV shows
// const tvResults = await tmdb('/3/search/tv', {
//     include_adult: 'false',
//     language: 'en-US',
//     page: '1',
//     query: 'Breaking Bad'
//   });

// Search for movies
//   const movieResults = await tmdb('/3/search/movie', {
//     query: 'A Minecraft Movie',
//     include_adult: 'false',
//     language: 'en-US',
//     page: '1',
//     year: '2025'
//   });
