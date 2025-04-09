const Joi = require("joi");

const getContent = {
  params: Joi.object().keys({
    slug: Joi.string().required(),
  }),
};

module.exports = {
  getContent,
};
