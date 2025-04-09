const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { contentService, userService } = require("../services");
const streamingAvailability = require("../utils/streamingAvailability");

const getContent = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    // Fetch user data
    const user = await userService.getByUserId(userId);

    // Fetch content by slug
    const content = await contentService.getContentByFilter({ slug });
    if (!content) {
      return Responses.handleError(404, "Content not found", res);
    }

    const data = { ...content };

    // Fetch streaming availability if user is premium and it's not already available
    if (user?.premium) {
      if (!data?.streamingAvailability) {
        const streamingData = await streamingAvailability("/search/title", {
          country: "us",
          title: content.title,
        });

        if (Array.isArray(streamingData) && streamingData.length > 0) {
          const firstItem = streamingData[0];
          const streamingOptions = firstItem?.streamingOptions?.us || [];

          // Extract name and link for each streaming service
          const availability = streamingOptions.map((option) => ({
            name: option.service.name,
            link: option.link,
          }));

          // Update content with streaming availability
          data.streamingAvailability = availability;

          // Optionally, save the updated streaming availability to the database
          await contentService.updateContentByFilter(
            { slug },
            { streamingAvailability: availability }
          );
        }
      }
    } else {
      // Remove streamingAvailability if the user is not premium
      delete data.streamingAvailability;
    }

    return Responses.handleSuccess(
      200,
      "Content retrieved successfully",
      res,
      data
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
