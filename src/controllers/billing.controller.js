const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { userService, billingService } = require("../services");
// const Stripe = require("stripe");
const config = require("../config/config");
// const { queryPaddle } = require("../utils/queryPaddle");
const { Paddle, Environment, EventName } = require("@paddle/paddle-node-sdk");
const { webhookQueue } = require("../background/webhook/webhook.queue");

// let stripe;
// let endpointSecret;
// let stripeMonthlyPriceId;
// let stripeYearlyPriceId;

let paddle;
let webhookSecretKey;

if (config.env === "development") {
  paddle = new Paddle(config.paddleTestApiKey, {
    environment: Environment.sandbox, // or Environment.sandbox for accessing sandbox API
    logLevel: "verbose", // or 'error' for less verbose logging
  });
  webhookSecretKey = config.paddleTestWebhookSecretKey;
} else {
  paddle = new Paddle(config.paddleLiveApiKey);
  webhookSecretKey = config.paddleLiveWebhookSecretKey;
}

const customer = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.getByUserId(userId);

    let paddleCustomerId = user?.paddleCustomerId;

    if (!paddleCustomerId) {
      const customer = await paddle.customers.create({
        email: user?.email,
        name: user?.name,
      });

      paddleCustomerId = customer?.id;

      await userService.updateByUserId(userId, {
        paddleCustomerId,
      });
    }

    return Responses.handleSuccess(200, "success", res, {
      paddleCustomerId,
    });
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

const webhook = catchAsync(async (req, res) => {
  try {
    let eventData;

    // Verify Paddle signature
    try {
      const signature = req.headers["paddle-signature"];
      const rawRequestBody = JSON.stringify(req.body);
      const secretKey = webhookSecretKey;

      // not working in development
      eventData = paddle.webhooks.unmarshal(
        rawRequestBody,
        secretKey,
        signature
      );
    } catch (err) {
      logger.error(`❌ Error message: ${JSON.stringify(err)}`);
      return Responses.handleError(
        400,
        `Webhook Error: ${JSON.stringify(err)}`,
        res
      );
    }

    webhookQueue.add("webhook", { eventData });
    logger.info("Added to Webhook Queue:", eventData);
    return Responses.handleSuccess(200, "success", res, { webhook: "success" });
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

// https://developer.paddle.com/webhooks/signature-verification

const getBillingHistory = catchAsync(async (req, res) => {
  try {
    const billings = await billingService.getBillingsByFilter({
      userId: req.user.id,
    });
    return Responses.handleSuccess(200, "success", res, billings);
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

const unsubscribe = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userService.getByUserId(userId);

    if (user?.paddleSubscriptionId) {
      const cancelled = await paddle.subscriptions.cancel(
        user?.paddleSubscriptionId,
        {
          effective_from: "immediately",
        }
      );
      logger.info(cancelled);
    }

    // after-effect moved to webhook `subscription.cancelled` or `SubscriptionCanceled`
    return Responses.handleSuccess(200, "success", res, {
      unsubscribed: true,
    });
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

module.exports = {
  customer,
  // createCheckoutSession,
  webhook,
  getBillingHistory,
  unsubscribe,
};
