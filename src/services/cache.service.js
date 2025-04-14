const { Cache } = require("../models");

const createCache = async (data) => {
  return await Cache.create(data);
};

const getCacheByFilter = async (filter) => {
  return await Cache.findOne(filter);
};

const updateCacheByFilter = async (filter, updateBody) => {
  const cache = await getCacheByFilter(filter);
  if (!cache) {
    return null;
  }
  return await Cache.updateOne(filter, updateBody);
};

const updateCachesByFilter = async (filter, updateBody) => {
  // Update all matching cache entries directly
  const result = await Cache.updateMany(filter, updateBody);
  if (result.matchedCount === 0) {
    return null; // Return null if no matching caches were found
  }
  return result; // Return the result of the update operation
};

module.exports = {
  createCache,
  getCacheByFilter,
  updateCacheByFilter,
  updateCachesByFilter,
};
