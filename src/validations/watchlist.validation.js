const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getWatchlist = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
  }),
};

const deleteFromWatchlist = {
  params: Joi.object().keys({
    watchlistId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getWatchlist,
  deleteFromWatchlist,
};
