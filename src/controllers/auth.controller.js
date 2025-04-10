const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require("../services");
const { verifyGoogleToken } = require("../utils/social");
const moment = require("moment");

const google = catchAsync(async (req, res) => {
  try {
    const { code, ref, country } = req.body;

    const googleResponse = await verifyGoogleToken(code);
    if (googleResponse == null) {
      return Responses.handleError(
        400,
        "An error occurred while logging in",
        res
      );
    } else {
      const user = await userService.createUser({
        name: `${googleResponse?.given_name}${
          googleResponse?.family_name ? ` ${googleResponse?.family_name}` : ""
        }`,
        email: googleResponse?.email,
        country,
        lastSwipeReset: moment().unix(),
      });

      // google is one-way authentication
      let returnedUser = user.data || user;
      //                 returning user || new user

      // console.log("**", user.data);
      // console.log("*****", user);

      // generate login token
      const token = await tokenService.generateAuthToken(returnedUser);

      let data = {
        ...returnedUser,
        token,
      };

      if (user?.id) {
        // it's a new user, REDIRECT TO ONBOARDING

        // process referral
        if (ref) {
          const user = await userService.getUserByFilter({ ref });
          if (user) {
            await userService.updateUserByFilter(
              { ref },
              {
                swipesUsed: user?.swipesUsed - 10,
              }
            );
            await emailService.sendswipesAwardEmail(user?.email);
          }
        }

        // send welcome email
        await emailService.sendWelcomeEmail(googleResponse?.email);

        data.next = "/app/onboarding";
      } else {
        // NOT A NEW USER
        data.next = "/app/discover";
      }

      return Responses.handleSuccess(201, "success", res, data);
    }
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
  google,
};
