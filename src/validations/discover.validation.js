const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getContent = {
  body: Joi.object().keys({
    liked: Joi.array().required(),
    passed: Joi.array().required(),
  }),
};

const like = {
  body: Joi.object().keys({
    contentId: Joi.string().custom(objectId).required(),
  }),
};

const pass = {
  body: Joi.object().keys({
    contentId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getContent,
  like,
  pass,
};
