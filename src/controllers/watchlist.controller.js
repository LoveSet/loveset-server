const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { watchlistService } = require("../services");

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

module.exports = {
  getWatchlist,
};
