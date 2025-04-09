const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const discoverController = require("../../controllers/discover.controller");

const router = express.Router();

router.get("/", auth(), discoverController.getContent);

module.exports = router;
