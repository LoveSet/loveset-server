const Joi = require("joi");

const google = {
  body: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

module.exports = {
  google,
};
