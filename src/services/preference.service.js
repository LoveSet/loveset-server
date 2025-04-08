const { Preference } = require("../models");

const getPreferenceByFilter = async (filter = {}) => {
  return Preference.findOne(filter);
};

const updatePreferenceByFilter = async (filter, updateBody) => {
  const preference = await getPreferenceByFilter(filter);
  if (!preference) {
    return { error: "Preference not found", errorCode: 404 };
  } else {
    return await Preference.updateOne(filter, updateBody);
  }
};

module.exports = {
  getPreferenceByFilter,
  updatePreferenceByFilter,
};
