const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { userService } = require("../services");
const { webSearch } = require("../utils/openaiHelper");

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
    // let input = `
    // You are an intelligent movie and entertainment content recommendation assistant.

    // SYSTEM INSTRUCTIONS:
    // - Your primary goal is to keep this user engaged with a variety of content that aligns with their preferences and swiping behavior.
    // - Always prioritize content the user is likely to enjoy based on likes, interests, and interaction history.
    // - Do not be overly strict with preferences—be flexible and creative with how you interpret the user’s taste.
    // - You may include both popular and obscure content across different formats that match or resonate with the user’s profile.
    // - Avoid showing anything in the "passed" or "liked" lists — those have already been seen.
    // - If the query is too narrow or returns little, loosen some filters and use specific preferences (like genres, content types, or time periods) to broaden the scope.
    // - If there's a risk of repetition, branch from content the user liked (e.g. similar themes, creators, genre fusion).
    // - Always return a valid JavaScript array of content items.
    // - If your first result is invalid or poorly structured, retry internally and correct it.
    // - Keep results diverse, varied, and interesting to maintain a sense of discovery and prevent fatigue.

    // USER PROFILE:
    // - Preferred Content Types: ${contentTypes || "N/A"}
    // - Film Industries of Interest: ${filmIndustries || "N/A"}
    // - Favorite Genres: ${genres || "N/A"}
    // - Time Period Preferences: ${timePeriods || "N/A"}
    // - Previously Liked: ${contentLiked || "N/A"}
    // - Previously Passed: ${contentPassed || "N/A"}

    // TASK:
    // Generate a JavaScript array of 6 content items (based on user profile).
    // Each item should have the following structure:
    // - title
    // - year
    // - director
    // - duration (e.g. "148 min" or "12 seasons")
    // - cast (3 to 4 notable actors/voices)
    // - trailerUrl (usually a YouTube link)
    // - reason it was picked (e.g., based on genre, theme, creator similarity, etc.)

    // Ensure variety in the types of content and the reasoning for their selection.
    // Return only the array of 6 structured content objects.
    // `;

    let input = `
You are a fast, intelligent recommendation agent for movies and related content.

GOAL:
Quickly generate 6 engaging and fresh content suggestions that match this user's taste.

FOCUS:
- Prioritize user satisfaction over speed alone.
- Always prefer **quality and variety** over simply picking from the first website or source.
- Avoid showing any content the user has already liked or passed.
- The results must span **different content types** (movies, TV shows, documentaries, animation, anime, short films) — based specifically on what the user prefers.
- Do not include anything the user has already liked or passed.
- If the preferences are too narrow, pick based on the closest available matches.
- Pull content from reliable and diverse sources. Do not rely on just the first result you find.
- Be flexible. Use the user’s preferences as guidance, not strict rules.

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

    logger.info(results);

    return Responses.handleSuccess(200, "success", res, {});

    // todo: add to cache
    // todo: return data
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
