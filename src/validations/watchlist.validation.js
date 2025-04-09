const Joi = require("joi");

const getWatchlist = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
  }),
};

module.exports = {
  getWatchlist,
};
