const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getContent = {
  params: Joi.object().keys({
    slug: Joi.string().required(),
  }),
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId).optional(),
  }),
};

module.exports = {
  getContent,
};
