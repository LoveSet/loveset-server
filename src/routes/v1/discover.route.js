const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const discoverValidation = require("../../validations/discover.validation");
const discoverController = require("../../controllers/discover.controller");

const router = express.Router();

router.get("/cache", auth(), discoverController.getCache);
router.get("/content", auth(), discoverController.getContent);
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

module.exports = router;
