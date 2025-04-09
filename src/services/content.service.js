const { Content } = require("../models");

const getContentByFilter = async (filter) => {
  return await Content.findOne(filter);
};

const createContent = async (data) => {
  return await Content.create(data);
};

const updateContentByFilter = async (filter, updateBody) => {
  return await Content.findOneAndUpdate(filter, updateBody, { new: true });
};

module.exports = {
  getContentByFilter,
  createContent,
  updateContentByFilter,
};
