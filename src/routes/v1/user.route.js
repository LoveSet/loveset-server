const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const userController = require("../../controllers/user.controller");
const userValidation = require("../../validations/user.validation");

const router = express.Router();

router.get(
  "/onboarding",
  auth(),
  validate(userValidation.onboarding),
  userController.onboarding
);

module.exports = router;
