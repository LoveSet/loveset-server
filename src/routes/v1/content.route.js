const express = require("express");
const validate = require("../../middleware/validate");
const contentController = require("../../controllers/content.controller");
const contentValidation = require("../../validations/content.validation");

const router = express.Router();

router.get(
  "/:slug",
  validate(contentValidation.getContent),
  contentController.getContent
);

router.get(
  "/streaming/:slug/",
  validate(contentValidation.getContent),
  contentController.getStreamingAvailability
);

module.exports = router;
