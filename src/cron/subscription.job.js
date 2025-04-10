const cron = require("node-cron");
const moment = require("moment");
// const { emitDataToUser } = require("../socket/server");
const { userService, emailService } = require("../services");
const { Paddle, Environment, EventName } = require("@paddle/paddle-node-sdk");
const config = require("../config/config");

let paddle;

if (config.env === "development") {
  paddle = new Paddle(config.paddleTestApiKey, {
    environment: Environment.sandbox, // or Environment.sandbox for accessing sandbox API
    logLevel: "verbose", // or 'error' for less verbose logging
  });
} else {
  paddle = new Paddle(config.paddleLiveApiKey);
}

const updateExpiredSubscriptions = async () => {
  try {
    cron.schedule("0 * * * *", async () => {
      logger.info("***updateExpiredSubscriptions {CRON-JOB} RUNNING***");

      // premium: true
      // NO GRACE PERIOD
      const now = moment().unix();

      const users = await userService.getUsersByFilter({
        premium: true,
        subscriptionExpiring: { $lte: now },
      });

      for (const user of users) {
        await userService.updateByUserId(user?.id, {
          premium: false,
        });

        // cancel subscription
        if (user?.paddleSubscriptionId) {
          const sub = await paddle.subscriptions.get(
            user?.paddleSubscriptionId
          );

          if (sub?.status != "canceled") {
            // cancel if not yet cancelled
            await paddle.subscriptions.cancel(user?.paddleSubscriptionId, {
              effective_from: "immediately",
            });
          }
        }

        if (!user?.unsubscribed) {
          // todo: emit notification event to update user data -> premium
          // emitDataToUser(user?.id, {
          //   action: "refresh_notifications_data",
          // });
          // todo:send email
          await emailService.sendSubscriptionExpiredEmail(user?.email);
        }
      }

      logger.info("***updateExpiredSubscriptions {CRON-JOB} DONE***");
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = {
  updateExpiredSubscriptions,
};
