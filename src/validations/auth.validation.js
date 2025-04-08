const Joi = require("joi");

const google = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    ref: Joi.string().optional(),
  }),
};

module.exports = {
  google,
};
