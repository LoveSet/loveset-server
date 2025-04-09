const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { Cache } = require("../models");
const { userService, contentService, cacheService } = require("../services");
const { webSearch } = require("../utils/openaiHelper");
const bing = require("../utils/bing");
const getYouTubeTrailerUrl = require("../utils/getYoutubeTrailer");
const tmdb = require("../utils/tmdb");
const { movieGenres, tvShowGenres } = require("../utils/tmdbGenres");

// onboarding ==> get new feed + cache
// swiping(2) ===> get new feed + cache
// refresh ==> get cache

const getContent = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userService.getByUserId(userId);

    const contentTypes = user?.contentTypes.join(",");
    const filmIndustries = user?.filmIndustries?.join(",");
    const genres = user?.genres?.join(",");
    const timePeriods = user?.timePeriods?.join(",");
    const contentLiked = user?.contentLiked?.join(",") || "";
    const contentPassed = user?.contentPassed?.join(",") || "";

    // Check if there's content in cache that user hasn't interacted with
    const uninteractedContent = await Cache.find({
      userId,
      liked: false,
      passed: false,
    }).populate("contentId");

    // If we have uninteracted content in cache, return it
    if (uninteractedContent && uninteractedContent.length > 0) {
      const contentResults = uninteractedContent.map((item) => item.contentId);
      return Responses.handleSuccess(200, "success", res, contentResults);
    }

    // Otherwise, generate new content
    let input = `
You are a fast, intelligent recommendation agent for movies and related content.

GOAL:
Quickly generate 6 engaging and fresh content suggestions that match this user's taste.

FOCUS:
- Prioritize user satisfaction over speed alone.
- Always prefer **quality, diversity, and freshness** over convenience.
- Slightly favor content that is similar in theme, genre, or tone to what the user has previously liked — but do not overly rely on this.
- Include 1 or 2 popular, trending, or recent titles if they are a good fit — but keep the majority of results unique, varied, or lesser-known.
- Avoid showing any content the user has already liked or passed.
- Ensure results span **different content types** (movies, TV shows, documentaries, animation, anime, short films) based on the user's preferences.
- If the user's profile is too narrow, use the **closest available match** to maintain variety and engagement.
- Pull content from **reliable and varied sources**. Do not simply grab the first result found.
- Be flexible. Use the user's profile as **inspiration**, not a strict filter.

USER PROFILE:
- Content Types: ${contentTypes || "N/A"}
- Film Industries: ${filmIndustries || "N/A"}
- Genres: ${genres || "N/A"}
- Time Periods: ${timePeriods || "N/A"}
- Liked Content: ${contentLiked || "N/A"}
- Passed Content: ${contentPassed || "N/A"}

RESPONSE FORMAT:
Return a valid JavaScript array of 6 content objects with:
- title
- year
- director
- duration (e.g. "148 min" or "12 seasons")
- cast (3 well-known names)

Do not include anything else but the array. Avoid repetition. Keep it diverse and satisfying.
`;

    logger.info(input);
    const results = await webSearch({
      input,
    });

    let data = results
      .replace(/```json/, "")
      .replace(/```/, "")
      .trim();

    let parsedData = JSON.parse(data);

    // Process each content item
    const contentPromises = parsedData.map(async (item) => {
      // Check if content already exists in database
      let existingContent = await contentService.getContentByFilter({
        title: item.title,
        year: item.year,
      });

      // If content already exists, use it, otherwise create new content
      if (!existingContent) {
        // Get trailer URL from YouTube
        const trailerUrl = getYouTubeTrailerUrl(item.title, item.year);

        // Determine if it's a movie or TV show based on duration
        const isMovie = !item.duration.includes("season");

        // Fetch additional data from TMDB
        let tmdbData;
        if (isMovie) {
          tmdbData = await tmdb("/3/search/movie", {
            query: item.title,
            include_adult: "false",
            language: "en-US",
            page: "1",
            year: item.year,
          });
        } else {
          tmdbData = await tmdb("/3/search/tv", {
            include_adult: "false",
            language: "en-US",
            page: "1",
            query: item.title,
          });
        }

        // Extract relevant TMDB data if results exist
        let genreIds = [];
        let posterUrl = "";
        let synopsis = "";

        if (tmdbData.results && tmdbData.results.length > 0) {
          const result = tmdbData.results[0];
          genreIds = result.genre_ids || [];
          posterUrl = result.poster_path
            ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
            : "";
          synopsis = result.overview || "";
        }

        // Map genre IDs to genre names
        const genreList = isMovie
          ? movieGenres
              .filter((g) => genreIds.includes(g.id))
              .map((g) => g.name)
          : tvShowGenres.genres
              .filter((g) => genreIds.includes(g.id))
              .map((g) => g.name);

        // Create content object
        const contentData = {
          title: item.title,
          year: item.year,
          posterUrl: posterUrl,
          director: item.director,
          trailerUrl: trailerUrl,
          duration: item.duration,
          genres: genreList,
          synopsis: synopsis,
          cast: item.cast || [],
        };

        // Store in content model
        existingContent = await contentService.createContent(contentData);
      }

      // Create cache entry for this content
      await cacheService.createCache({
        userId,
        contentId: existingContent._id,
        liked: false,
        passed: false,
      });

      return existingContent;
    });

    // Wait for all content to be processed
    const contentResults = await Promise.all(contentPromises);

    // Return the processed content
    return Responses.handleSuccess(200, "success", res, contentResults);
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

module.exports = {
  getContent,
};
