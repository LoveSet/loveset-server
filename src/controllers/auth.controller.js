const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { authService, userService, tokenService } = require("../services");
const { verifyGoogleToken } = require("../utils/social");

const google = catchAsync(async (req, res) => {
  try {
    const googleResponse = await verifyGoogleToken(req.body.code);
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
        // todo: it's a new user, REDIRECT TO ONBOARDING
        data.next = "/app/onboarding";
      } else {
        // todo: NOT A NEW USER
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
