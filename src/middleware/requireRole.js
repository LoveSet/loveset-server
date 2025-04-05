const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const requireRole = (role) => {
  return async (req, res, next) => {
    // Check if the user has the required role.
    if (req.user.role === role) {
      next();
    } else {
      next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
    }
  };
};

module.exports = requireRole;
