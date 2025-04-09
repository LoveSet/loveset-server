const { Watchlist } = require("../models");

const addToWatchlist = async (data) => {
  return await Watchlist.create(data);
};

const getWatchlistByFilter = async (filter) => {
  return await Watchlist.find(filter);
};

const removeFromWatchlist = async (filter) => {
  return await Watchlist.findOneAndDelete(filter);
};

const updateWatchlist = async (filter, updateBody) => {
  return await Watchlist.findOneAndUpdate(filter, updateBody, { new: true });
};

const getWatchlistByFilterWithPagination = async (filter, options) => {
  return await Watchlist.paginate(filter, options);
};

module.exports = {
  addToWatchlist,
  getWatchlistByFilter,
  removeFromWatchlist,
  updateWatchlist,
  getWatchlistByFilterWithPagination,
};
