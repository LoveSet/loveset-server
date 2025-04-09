const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { userService } = require("../services");
const { webSearch } = require("../utils/openaiHelper");
const bing = require("../utils/bing");
const getYouTubeTrailerUrl = require("../utils/getYoutubeTrailer");

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
    const contentLiked = user?.contentLiked.join(",");
    const contentPassed = user?.contentPassed.join(",");

    // todo: if cache, return cache
    // todo: else: get data

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

    const clean = results
      .replace(/```json/, "")
      .replace(/```/, "")
      .trim();

    logger.info(clean);

    // youtube trailer
    // getYouTubeTrailerUrl(title, year)
    // https://www.youtube.com/results?search_query=Inception+(2010)+trailer

    // populate with tmdb data

    const websites = (await bing("test"))?.webPages?.value;
    logger.info(websites);

    // todo: add to cache
    // todo: return data

    return Responses.handleSuccess(200, "success", res, {});
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
