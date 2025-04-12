const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { Cache } = require("../models");
const {
  userService,
  contentService,
  cacheService,
  watchlistService,
} = require("../services");
const { webSearch } = require("../utils/openaiHelper");
const getYouTubeTrailerUrl = require("../utils/getYoutubeTrailer");
const tmdb = require("../utils/tmdb");
const { movieGenres, tvShowGenres } = require("../utils/tmdbGenres");
const { tmdbQueue } = require("../background/tmdb/tmdb.queue");

// onboarding ==> get new feed
// 4 items left ===> get new feed
// refresh ==> get cache

const getCache = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get uninteracted content from cache
    const uninteractedContent = await Cache.find({
      userId,
      liked: false,
      passed: false,
    }).populate("contentId");

    if (uninteractedContent && uninteractedContent.length > 0) {
      const contentResults = uninteractedContent.map((item) => item.contentId);
      return Responses.handleSuccess(200, "success", res, contentResults);
    }

    // If no cached content, return empty array
    return Responses.handleSuccess(200, "No cached content available", res, []);
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

const getContent = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    // const { liked, passed } = req.body;

    const user = await userService.getByUserId(userId);

    // Check if the user is not premium and has used 10 or more swipes
    if (!user.premium && user.swipesUsed >= 10) {
      return Responses.handleError(
        403,
        "You have reached your daily swipe limit. Upgrade to premium for unlimited swipes.",
        res
      );
    }

    const contentTypes = user?.contentTypes.join(",");
    const filmIndustries = user?.filmIndustries?.join(",");
    const genres = user?.genres?.join(",");
    const timePeriods = user?.timePeriods?.join(",");
    const contentCached = user?.contentCached?.join(",");

    // const contentLiked = user?.contentLiked?.join(",") || "";
    // const contentPassed = user?.contentPassed?.join(",") || "";

    // changed below to only a set of content that the user just (recently) liked or disliked, that removes the narrowness of the profile, the user's taste also constantly changes too
    // const contentLiked = liked?.join(",") || "";
    // const contentPassed = passed?.join(",") || "";

    // so it's like a sliding window
    const contentLiked = user?.contentLiked?.slice(-15).join(",") || "";
    const contentPassed = user?.contentPassed?.slice(-15).join(",") || "";

    // Otherwise, generate new content
    let input = `
You are a fast, intelligent recommendation agent for movies and related content.

GOAL:
Quickly generate 6 engaging and fresh content suggestions that match this user's taste.

FOCUS:
- Prioritize user satisfaction over speed alone.
- Always prefer **quality, diversity, and freshness** over convenience.
- Slightly favor content that is similar in theme, genre, or tone to what the user has previously liked — but do not overly rely on this.
- Include 1 popular, trending, or recent titles if they are a good fit — but keep the majority of results unique, varied, or lesser-known.
- Avoid showing any content the user has already cached, liked or passed.
- Rarely reuse cached/liked/passed content if list is hard to fill — for nostalgia or hidden gems, never overdo it.
- Ensure results span **different content types** (movies, TV shows, documentaries, animation, anime, short films) based on the user's preferences.
- If the user's profile is too narrow, use the **closest available match** to maintain variety and engagement.
- Pull content from **reliable and varied sources**. Do not simply grab the first result found.
- Be flexible. Use the user's profile as **inspiration**, not a strict filter.

USER PROFILE:
- Content Types: ${contentTypes || "N/A"}
- Film Industries: ${filmIndustries || "N/A"}
- Genres: ${genres || "N/A"}
- Time Periods: ${timePeriods || "N/A"}
- Cached Content: ${contentCached || "N/A"}
- Liked Content: ${contentLiked || "N/A"}
- Passed Content: ${contentPassed || "N/A"}

RESPONSE FORMAT:
Return a valid JavaScript array of 6 content objects with:
- title
- year
- director (use creator if director is unavailable)
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
        let isMovie = !item.duration.includes("season");

        // Fetch additional data from TMDB
        let tmdbData;
        if (isMovie) {
          tmdbData = await tmdb("/3/search/movie", {
            query: item.title,
            include_adult: "false",
            language: "en-US",
            page: "1",
            year: item.year,
          }).catch((err) => {
            return Responses.handleError(
              500,
              "An error occurred. Please try again.",
              res
            );
          });
        } else {
          tmdbData = await tmdb("/3/search/tv", {
            include_adult: "false",
            language: "en-US",
            page: "1",
            query: item.title,
          }).catch((err) => {
            return Responses.handleError(
              500,
              "An error occurred. Please try again.",
              res
            );
          });
        }

        // Check if we got results
        if (!tmdbData.results || tmdbData.results.length === 0) {
          // If no results from first guess, try the other type
          if (isMovie) {
            tmdbData = await tmdb("/3/search/tv", {
              include_adult: "false",
              language: "en-US",
              page: "1",
              query: item.title,
            });
            // Update isMovie flag if we found TV results
            if (tmdbData.results && tmdbData.results.length > 0) {
              isMovie = false;
            }
          } else {
            tmdbData = await tmdb("/3/search/movie", {
              query: item.title,
              include_adult: "false",
              language: "en-US",
              page: "1",
              year: item.year,
            });
            // Update isMovie flag if we found movie results
            if (tmdbData.results && tmdbData.results.length > 0) {
              isMovie = true;
            }
          }
        }

        // Extract relevant TMDB data if results exist
        let genreIds = [];
        let posterUrl = "";
        let synopsis = "";
        let tId = null;

        if (tmdbData.results && tmdbData.results.length > 0) {
          const result = tmdbData?.results[0];
          tId = result?.id;
          genreIds = result?.genre_ids || [];
          posterUrl = result?.poster_path
            ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
            : "";
          synopsis = result?.overview || "";
        }

        // Map genre IDs to genre names
        const genreList = isMovie
          ? movieGenres
              .filter((g) => genreIds.includes(g.id))
              .map((g) => g.name)
          : tvShowGenres.genres
              .filter((g) => genreIds.includes(g.id))
              .map((g) => g.name);

        if (posterUrl) {
          // Create content object
          const contentData = {
            tId,
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
      }

      if (existingContent) {
        // add to queue
        tmdbQueue.add("tmdb", {
          contentId: existingContent._id,
        });

        // add content to contentCached in user model
        await userService.updateUserByFilter(
          { _id: userId },
          {
            $addToSet: {
              contentCached: `${existingContent.title} (${existingContent.year})`,
            },
          }
        );

        // Create cache entry for this content
        await cacheService.createCache({
          userId,
          contentId: existingContent._id,
          liked: false,
          passed: false,
        });

        return existingContent;
      } else {
        return null;
      }
    });

    // Wait for all content to be processed
    const contentResults = await Promise.all(contentPromises);

    // Return the processed content
    const filteredContentResults = contentResults.filter(
      (item) => item !== null
    );
    return Responses.handleSuccess(200, "success", res, filteredContentResults);
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

const like = catchAsync(async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.user.id;

    // Update the cache to mark the content as liked
    const cacheUpdateResult = await cacheService.updateCacheByFilter(
      { userId, contentId },
      { liked: true }
    );

    if (!cacheUpdateResult) {
      return Responses.handleError(404, "Content not found in cache", res);
    }

    // Add the content to the user's liked list
    const content = await contentService.getContentByFilter({ _id: contentId });
    if (content) {
      await userService.updateUserByFilter(
        { _id: userId },
        {
          $push: { contentLiked: `${content.title} (${content.year})` },
          $inc: { swipesUsed: 1, totalSwipes: 1 },
        }
      );

      // Add the content to the user's watchlist
      await watchlistService.addToWatchlist({
        userId,
        contentId,
      });
    }

    return Responses.handleSuccess(
      200,
      "Content marked as liked and added to watchlist",
      res,
      {}
    );
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

const pass = catchAsync(async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.user.id;

    // Update the cache to mark the content as passed
    const cacheUpdateResult = await cacheService.updateCacheByFilter(
      { userId, contentId },
      { passed: true }
    );

    if (!cacheUpdateResult) {
      return Responses.handleError(404, "Content not found in cache", res);
    }

    // Add the content to the user's passed list
    const content = await contentService.getContentByFilter({ _id: contentId });
    if (content) {
      await userService.updateUserByFilter(
        { _id: userId },
        {
          $push: { contentPassed: `${content.title} (${content.year})` },
          $inc: { swipesUsed: 1, totalSwipes: 1 },
        }
      );
    }

    return Responses.handleSuccess(200, "Content marked as passed", res, {});
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
  getCache,
  getContent,
  like,
  pass,
};
