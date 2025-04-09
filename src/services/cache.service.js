const { Cache } = require("../models");

const createCache = async (data) => {
  return await Cache.create(data);
};

const getCacheByFilter = async (filter) => {
  return await Cache.findOne(filter);
};

module.exports = {
  createCache,
  getCacheByFilter,
};
