const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const discoverController = require("../../controllers/discover.controller");

const router = express.Router();

router.get("/cache", auth(), discoverController.getCache);
router.get("/content", auth(), discoverController.getContent);

module.exports = router;
