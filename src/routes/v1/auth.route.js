const express = require("express");
const validate = require("../../middleware/validate");
const authValidation = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");

const router = express.Router();

router.post("/google", validate(authValidation.google), authController.google);

module.exports = router;
