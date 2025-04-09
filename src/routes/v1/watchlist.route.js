const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const watchlistController = require("../../controllers/watchlist.controller");
const watchlistValidation = require("../../validations/watchlist.validation");

const router = express.Router();

router.get(
  "/",
  auth(),
  validate(watchlistValidation.getWatchlist),
  watchlistController.getWatchlist
);

router.delete(
  "/:watchlistId",
  auth(),
  validate(watchlistValidation.deleteFromWatchlist),
  watchlistController.deleteFromWatchlist
);

module.exports = router;
