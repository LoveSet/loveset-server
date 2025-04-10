const Joi = require("joi");

const customer = {
  body: Joi.object().keys({}),
};

const createCheckoutSession = {
  body: Joi.object().keys({
    plan: Joi.string().valid("monthly", "yearly").required(),
  }),
};

const unsubscribe = {
  body: Joi.object().keys({}),
};

module.exports = {
  customer,
  createCheckoutSession,
  unsubscribe,
};
