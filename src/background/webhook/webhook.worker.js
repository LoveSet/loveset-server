const { Worker } = require("bullmq");
const config = require("../../config/config");
const logger = require("../../config/logger");
const mongoose = require("mongoose");
const redisOptions = require("../../config/redisOptions");
const { Paddle, Environment, EventName } = require("@paddle/paddle-node-sdk");
const {
  userService,
  billingService,
  notificationService,
} = require("../../services");
const moment = require("moment");

mongoose.connect(config.mongoose.url, config.mongoose.options);

let paddle;

if (config.env === "development") {
  paddle = new Paddle(config.paddleTestApiKey, {
    environment: Environment.sandbox, // or Environment.sandbox for accessing sandbox API
    logLevel: "verbose", // or 'error' for less verbose logging
  });
} else {
  paddle = new Paddle(config.paddleLiveApiKey);
}

const webhookWorker = new Worker(
  "Webhook",
  async (job) => {
    try {
      logger.info("webhookWorker started...");
      const { eventData } = job.data;

      switch (eventData.eventType) {
        case EventName.TransactionCompleted: {
          const customerId = eventData.data.customerId;
          const productId = eventData.data.items[0].price.productId;
          const subscriptionId = eventData.data.subscriptionId;

          const priceId = eventData.data.items[0].price.id;
          const subscriptionPlan =
            eventData.data.items[0].price.billingCycle.interval === "week"
              ? "weekly"
              : eventData.data.items[0].price.billingCycle.interval === "month"
              ? "monthly"
              : "biannually";
          const amount = parseFloat(eventData.data.details.totals.total) / 100; // Convert smallest currency unit to dollars
          const invoiceNumber = eventData.data.invoiceNumber;

          const transactionId = eventData.data.id;
          // await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second delay
          // const pdfInvoice = await paddle.transactions.getInvoicePDF(
          //   transactionId
          // );

          // console.log(pdfInvoice?.url);

          // const file = await downloadFile(pdfInvoice?.url);
          // const filePath = `files/${file}`;

          // await multipartUploadToS3(file, filePath, "application/pdf");
          // await fs.unlinkSync(`./files/${file}`);

          // const paddleInvoiceUrl = file; // will put `FILES_URL` in front

          const newSubscriptionEnd =
            new Date(eventData.data.billingPeriod.endsAt).getTime() / 1000; // Convert to Unix timestamp

          const customer = await paddle.customers.get(customerId);

          const user = await userService.getUserByFilter({
            email: customer?.email,
          });
          const userId = user?.id;

          const now = moment().unix();
          let subscriptionExpiring;

          if (user?.premium && user?.subscriptionExpiring > now) {
            // User is resubscribing while still having an active subscription
            const remainingTime = user.subscriptionExpiring - now;
            subscriptionExpiring = newSubscriptionEnd + remainingTime;
          } else {
            // New subscription or expired previous subscription
            subscriptionExpiring = newSubscriptionEnd;
          }

          const billing = await billingService.createBilling({
            userId,
            isBeforeSubscribed: user?.premium,
            paddleInvoiceNumber: invoiceNumber,
            paddleProductId: productId,
            paddlePriceId: priceId,
            paddleSubscriptionId: subscriptionId,
            paddleTransactionId: transactionId,
            // paddleInvoiceUrl,
            amount,
            subscriptionPlan,
            billingPeriodEndTimestamp: newSubscriptionEnd,
          });

          let updateBody = {
            paddleSubscriptionId: subscriptionId,
            premium: true,
            subscriptionPlan,
            lastCharged: now,
            subscriptionExpiring,
            unsubscribed: false,
            lifetime: parseFloat(user?.lifetime || 0) + amount,
          };
          if (!user?.premiumSince) {
            updateBody.premiumSince = now;
          }

          await userService.updateByUserId(userId, updateBody);

          // store notification (2_types)
          // when you first subscribe (!user.premiumSince)
          const platle = await userService.getUserByFilter({
            username: "platle",
          });

          if (!user?.premiumSince) {
            // when you first subscribes
            // return { userId } ;
          }

          if (user?.premiumSince && user?.premium) {
            // subscribing after being previously unsubscribed (user.premium = false)
            // return { userId };
          }

          return { userId };
        }

        case EventName.SubscriptionCanceled: {
          const subscriptionId = eventData.data.id;

          await userService.updateUserByFilter(
            {
              paddleSubscriptionId: subscriptionId,
            },
            {
              unsubscribed: true,
              subscriptionManuallyExpired: moment().unix(),
            }
          );

          return {};
        }
        default:
          return {};
      }
    } catch (error) {
      logger.error(error);
    }
  },
  redisOptions
);

// NODE_ENV=production node src/backgroundJobs/webhook/webhook.worker.js --name webhook-worker
