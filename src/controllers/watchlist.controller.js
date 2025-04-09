const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const {
  watchlistService,
  userService,
  contentService,
} = require("../services");

const getWatchlist = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    const pageLimit = parseInt(req.query.limit, 10) || 10;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const skipIndex = (currentPage - 1) * pageLimit;

    const filter = { userId };

    // Fetch watchlist with pagination and populate content
    const watchlist = await watchlistService.getWatchlistByFilter(filter, {
      sort: "-createdAt",
      skip: skipIndex,
      limit: pageLimit,
    });

    // Count total documents for pagination
    const count = await watchlistService.getDocumentsCount(filter);
    const totalPages = Math.ceil(count / pageLimit);

    return Responses.handleSuccess(
      200,
      "Watchlist retrieved successfully",
      res,
      {
        watchlist,
        currentPage,
        totalPages,
      }
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

const deleteFromWatchlist = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userService.getByUserId(userId);

    // Ensure the user is a premium user
    if (!user?.premium) {
      return Responses.handleError(
        403,
        "Only premium users can delete from the watchlist",
        res
      );
    }

    const { watchlistId } = req.params;

    // Check if the content exists in the user's watchlist
    const watchlistItem = await watchlistService.getWatchlistByFilter2({
      userId,
      _id: watchlistId,
    });

    if (!watchlistItem || watchlistItem.length === 0) {
      return Responses.handleError(404, "Watchlist not found", res);
    }

    const contentId = watchlistItem?.contentId;

    // Fetch the content details
    const content = await contentService.getContentByFilter({ _id: contentId });
    if (!content) {
      return Responses.handleError(404, "Content not found", res);
    }

    // Remove the content from the watchlist
    await watchlistService.deleteFromWatchlist({ userId, contentId });

    // Remove the content from the user's contentLiked array
    const contentIdentifier = `${content.title} (${content.year})`;
    console.log(contentIdentifier);
    await userService.updateUserByFilter(
      { _id: userId },
      { $pull: { contentLiked: contentIdentifier } }
    );

    return Responses.handleSuccess(200, "Content removed from watchlist", res);
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
  getWatchlist,
  deleteFromWatchlist,
};
