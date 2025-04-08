const jwt = require("jsonwebtoken");
const config = require("../config/config");
const moment = require("moment");
const { Token } = require("../models");
const { tokenTypes } = require("../config/tokens");
const uuid = require("uuid");

const generateToken = (
  user_id,
  type,
  expiresIn,
  secret = config.jwt.secret
) => {
  const token = jwt.sign(
    {
      user_id,
      type,
    },
    secret,
    {
      expiresIn, // will expire in 30 days [MVP]
    }
  );
  return token;
};

const generateAuthToken = async (user) => {
  const token = generateToken(user.id, tokenTypes.AUTH, "720h");
  return token;
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

const verifyToken = async (token, type) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({
      token,
      type,
      user: payload.user_id,
      blacklisted: false,
    });
    if (!tokenDoc) {
      return { error: "Token not found", errorCode: 404 };
    }
    return tokenDoc;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return { error: "Token expired", errorCode: 401 };
    } else {
      return { error: "Invalid token", errorCode: 403 };
    }
  }
};

const generateResetPasswordToken = async (user) => {
  const expires = moment().add(10, "minutes");
  const resetPasswordToken = generateToken(
    user.id,
    tokenTypes.RESET_PASSWORD,
    "10m"
  );
  await saveToken(
    resetPasswordToken,
    user?.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  return resetPasswordToken;
};

const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(24, "hours");
  const verifyEmailToken = generateToken(
    user.id,
    tokenTypes.VERIFY_EMAIL,
    "24h"
  );
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

const generateInviteToken = async () => {
  const token = generateToken(uuid.v4(), tokenTypes.INVITE, "30d");
  return token;
};

module.exports = {
  generateToken,
  generateAuthToken,
  verifyToken,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateInviteToken,
};
