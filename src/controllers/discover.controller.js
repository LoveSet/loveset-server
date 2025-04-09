const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");

// onboarding ==> get new feed + cache
// swiping(2) ===> get new feed + cache
// refresh ==> get cache

const getFeed = catchAsync(async (req, res) => {
  try {
    // get data
    // add to cache
    // return
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
  getFeed,
};
