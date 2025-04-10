const cron = require("node-cron");
const logger = require("../config/logger");
const { userService } = require("../services");

const refreshSwipes = async () => {
  try {
    cron.schedule("0 0 * * *", async () => {
      logger.info("***refreshSwipes {CRON-JOB} RUNNING***");

      const usersPerBatch = 10;
      let skip = 0;

      while (true) {
        const users = await userService.getUsersByFilterWithSkipAndLimit(
          {},
          skip,
          usersPerBatch
        );

        if (users.length === 0) break;

        for (const user of users) {
          if (user.swipesUsed < 0) {
            // you are below 0 if you referred someone which got you -10 swipes, i.e. 10 extra swipes.
            await userService.updateByUserId(user.id, {
              swipesUsed: user.swipesUsed - 10,
            });
          } else {
            // start from 0 again, limit remains 10 swipes.
            await userService.updateByUserId(user.id, {
              swipesUsed: 0,
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
