const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { contentService, userService } = require("../services");
const streamingAvailability = require("../utils/streamingAvailability");

const getContent = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId } = req.query;

    let user = null;

    // Fetch user data if userId is provided
    if (userId) {
      user = await userService.getByUserId(userId);
      if (!user) {
        return Responses.handleError(404, "User not found", res);
      }
    }

    // Fetch content by slug
    const content = await contentService.getContentByFilter({ slug });
    if (!content) {
      return Responses.handleError(404, "Content not found", res);
    }

    const data = { ...content?.toJSON() };

    // Fetch streaming availability if user is premium and it's not already available
    if (user?.premium) {
      //
    } else {
      // Remove streamingAvailability if the user is not premium or userId is not provided
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

const getStreamingAvailability = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;

    // Fetch content by slug
    const content = await contentService.getContentByFilter({ slug });
    if (!content) {
      return Responses.handleError(404, "Content not found", res);
    }

    // Check if streaming availability already exists
    if (
      content.streamingAvailability &&
      content.streamingAvailability.length > 0
    ) {
      return Responses.handleSuccess(
        200,
        "Streaming availability retrieved successfully",
        res,
        content.streamingAvailability
      );
    }

    // Fetch streaming availability
    const streamingData = await streamingAvailability("/shows/search/title", {
      country: "us",
      title: `${content.title} ${content.year}`,
    });

    if (Array.isArray(streamingData) && streamingData.length > 0) {
      const firstItem = streamingData[0];
      const streamingOptions = firstItem?.streamingOptions?.us || [];

      // Extract name and link for each streaming service
      const availability = streamingOptions.map((option) => ({
        name: option.service.name,
        link: option.link,
      }));

      const processedAvailability = [...availability].reduce(
        (unique, current) => {
          const existingEntry = unique.find(
            (item) => item.name === current.name
          );
          if (!existingEntry) {
            unique.push(current);
          }
          return unique;
        },
        []
      );

      // Save the updated streaming availability to the database
      await contentService.updateContentByFilter(
        { slug },
        { streamingAvailability: processedAvailability }
      );

      return Responses.handleSuccess(
        200,
        "Streaming availability retrieved successfully",
        res,
        processedAvailability
      );
    }

    return Responses.handleError(404, "No streaming availability found", res);
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred while fetching streaming availability",
      res
    );
  }
});

module.exports = {
  getContent,
  getStreamingAvailability,
};
