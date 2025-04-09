const { Content } = require("../models");

const createContent = async (data) => {
  return await Content.create(data);
};

const getContentByFilter = async (filter) => {
  return await Content.findOne(filter);
};

module.exports = {
  createContent,
  getContentByFilter,
};
