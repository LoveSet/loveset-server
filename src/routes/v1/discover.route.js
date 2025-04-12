const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const discoverValidation = require("../../validations/discover.validation");
const discoverController = require("../../controllers/discover.controller");
const rateLimiter = require("../../middleware/rateLimiter");

const router = express.Router();

router.get(
  "/cache",
  rateLimiter.cacheRateLimiter,
  auth(),
  discoverController.getCache
);
router.get(
  "/content",
  rateLimiter.contentRateLimiter,
  auth(),
  // validate(discoverValidation.getContent),
  discoverController.getContent
);
router.post(
  "/like",
  auth(),
  validate(discoverValidation.like),
  discoverController.like
);
router.post(
  "/pass",
  auth(),
  validate(discoverValidation.pass),
  discoverController.pass
);

router.get(
  "/youtube",
  validate(discoverValidation.getYouTubeUrl),
  discoverController.getYouTubeUrl
);

module.exports = router;
