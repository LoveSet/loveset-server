const catchAsync = require("../utils/catchAsync");
const Responses = require("../utils/responses");
const logger = require("../config/logger");
const { preferenceService } = require("../services");

const onboarding = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    await preferenceService.updatePreferenceByFilter({ userId }, req.body);
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

module.exports = {
  onboarding,
};
