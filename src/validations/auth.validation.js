const Joi = require("joi");

const google = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    ref: Joi.string().optional(),
    country: Joi.string().optional(),
    location: Joi.object().optional(),
  }),
};

module.exports = {
  google,
};
