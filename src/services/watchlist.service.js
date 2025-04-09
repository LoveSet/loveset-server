const Watchlist = require("../models/watchlist.model");

const getWatchlistByFilter = async (filter, options) => {
  const { sort = "-createdAt", skip = 0, limit = 10 } = options;
  const query = Watchlist.find(filter).sort(sort).skip(skip).limit(limit);
  query.populate("contentId", "title director slug posterUrl"); // Populate content fields
  return query.exec();
};

const getDocumentsCount = async (filter) => {
  return await Watchlist.countDocuments(filter);
};

module.exports = {
  getWatchlistByFilter,
  getDocumentsCount,
};
