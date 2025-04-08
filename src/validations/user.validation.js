const Joi = require("joi");

const onboarding = {
  body: Joi.object().keys({
    contentTypes: Joi.array().required(),
    filmIndustries: Joi.array().required(),
    genres: Joi.array().required(),
    timePeriods: Joi.array().required(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    username: Joi.string().required(),
  }),
  // query: Joi.object().keys({
  //   token: Joi.string().optional(),
  // }),
};

module.exports = {
  onboarding,
  getUser,
};
