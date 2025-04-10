const Watchlist = require("../models/watchlist.model");

const addToWatchlist = async (data) => {
  return await Watchlist.create(data);
};

const getWatchlistByFilter = async (filter, options) => {
  const { sort = "-createdAt", skip = 0, limit = 10 } = options;
  const query = Watchlist.find(filter).sort(sort).skip(skip).limit(limit);
  query.populate("contentId", "title director slug posterUrl"); // Populate content fields
  return query.exec();
};

const getWatchlistByFilter2 = async (filter) => {
  return await Watchlist.findOne(filter);
};

const getDocumentsCount = async (filter) => {
  return await Watchlist.countDocuments(filter);
};

const deleteFromWatchlist = async (filter) => {
  return await Watchlist.deleteOne(filter);
};

module.exports = {
  getWatchlistByFilter,
  getWatchlistByFilter2,
  getDocumentsCount,
  deleteFromWatchlist,
  addToWatchlist, // Export the new function
};
