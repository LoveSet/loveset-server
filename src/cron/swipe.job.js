const cron = require("node-cron");
const logger = require("../config/logger");
const { userService } = require("../services");
const moment = require("moment");

const refreshSwipes = async () => {
  try {
    cron.schedule("0 * * * *", async () => {
      logger.info("***refreshSwipes {CRON-JOB} RUNNING***");

      const twentyFourHoursAgo = moment().subtract(24, "hours").unix();
      const usersPerBatch = 10;
      let skip = 0;

      while (true) {
        const users = await userService.getUsersByFilterWithSkipAndLimit(
          { lastSwipeReset: { $lt: twentyFourHoursAgo } },
          skip,
          usersPerBatch
        );

        if (users.length === 0) break;

        for (const user of users) {
          if (user.swipesUsed < 0) {
            // you are below 0 if you referred someone which got you -10 swipes, i.e. 10 extra swipes.
            await userService.updateByUserId(user.id, {
              swipesUsed: user.swipesUsed - 10,
              lastSwipeReset: moment().unix(),
            });
          } else {
            // start from 0 again, limit remains 10 swipes.
            await userService.updateByUserId(user.id, {
              swipesUsed: 0,
              lastSwipeReset: moment().unix(),
            });
          }
        }

        skip += usersPerBatch;
      }

      logger.info("***refreshSwipes {CRON-JOB} DONE***");
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = {
  refreshSwipes,
};
