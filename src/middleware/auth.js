const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { assignRole } = require("../config/roles");

const verifyCallback =
  (req, resolve, reject, requiredRights) => async (err, user, info) => {
    if (err || info || !user) {
      return reject(
        // ❗❗❗ Do not change `Please authenticate`, it is used to used in the frontend to logout un-authorized users
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }

    // console.log('first', user)
    // if (user.emailVerified === false) {
    //   return reject(
    //     new ApiError(httpStatus.UNAUTHORIZED, "Please verify your email")
    //   );
    // }

    // console.log(requiredRights);

    // console.log("......................req",req)

    req.user = user;
    req.user.role = assignRole(user.admin);

    // if (requiredRights.length) {
    //   const userRights = roleRights.get(user.role);
    //   console.log(userRights)
    //   const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    //   console.log(hasRequiredRights)

    //   if (!hasRequiredRights && req.params.userId !== user.id) {
    //     return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    //   }
    // }

    resolve();
  };

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
