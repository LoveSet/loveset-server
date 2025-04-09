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

module.exports = {
  createCache,
  getCacheByFilter,
  updateCacheByFilter,
};
