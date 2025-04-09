const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { contentService, userService } = require("../services");

const getContent = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    // Fetch user data
    const user = await userService.getByUserId(userId);
    if (!user) {
      return Responses.handleError(404, "User not found", res);
    }

    // Fetch content by slug
    const content = await contentService.getContentByFilter({ slug });
    if (!content) {
      return Responses.handleError(404, "Content not found", res);
    }

    return Responses.handleSuccess(
      200,
      "Content retrieved successfully",
      res,
      content
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

module.exports = {
  getContent,
};
