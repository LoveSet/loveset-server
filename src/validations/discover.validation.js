const Joi = require("joi");
const { objectId } = require("./custom.validation");

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
  like,
  pass,
};
