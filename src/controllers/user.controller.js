const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { userService } = require("../services");
const jwt = require("jsonwebtoken");
const { tokenTypes } = require("../config/tokens");

const onboarding = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    await userService.updateByUserId({ _id: userId }, req.body);
    return Responses.handleSuccess(200, "success", res, {});
  } catch (error) {
    logger.error(error);
    return Responses.handleError(
      500,
      "An error occurred. Please try again.",
      res
    );
  }
});

const getUser = catchAsync(async (req, res) => {
  try {
    // const { token } = req.query;
    const user = (await userService.getUserByFilter(req.params))?.toJSON();

    if (!user) {
      return Responses.handleError(404, "User not found", res);
    } else {
      return Responses.handleSuccess(200, "success", res, user);

      // if (!token) {
      //   // delete certain data
      //   delete data?.email;
      //   delete data?.unixTimestamp;
      // }

      // if (token) {
      //   try {
      //     const decoded = jwt.verify(req?.query?.token, config.jwt.secret);
      //     if (decoded.user_id != user.id) {
      //       // if it passes, you may not still be the owner of the user
      //       // ❗❗❗ Do not change `Please authenticate`, it is used to used in the frontend to logout un-authorized users
      //       return Responses.handleError(401, "Please authenticate", res);
      //     }
      //     data.email = user?.email;
      //   } catch (error) {
      //     // means your token is invalid
      //     return Responses.handleError(401, "Please authenticate", res);
      //   }
      // }
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
  onboarding,
  getUser,
};
