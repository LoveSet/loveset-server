const Joi = require("joi");

const onboarding = {
  body: Joi.object().keys({
    contentTypes: Joi.array().required(),
    filmIndustries: Joi.array().required(),
    genres: Joi.array().required(),
    timePeriods: Joi.array().required(),
  }),
};

module.exports = {
  onboarding,
};
