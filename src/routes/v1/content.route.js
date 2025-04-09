const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const contentController = require("../../controllers/content.controller");
const contentValidation = require("../../validations/content.validation");

const router = express.Router();

router.get(
  "/:slug",
  auth(),
  validate(contentValidation.getContent),
  contentController.getContent
);

module.exports = router;
