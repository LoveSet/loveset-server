const express = require("express");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const billingValidation = require("../../validations/billing.validation");
const billingController = require("../../controllers/billing.controller");

const router = express.Router();

router.get("/customer", auth(), billingController.customer);

router.post("/webhook", billingController.webhook);

router.get("/history", auth(), billingController.getBillingHistory);

router.post(
  "/unsubscribe",
  auth(),
  validate(billingValidation.unsubscribe),
  billingController.unsubscribe
);

module.exports = router;
