const { User } = require("../models");

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    const { user, userJson } = await getUserByEmail(userBody.email);
    return {
      error: "Email already exists",
      errorCode: 409,
      data: { ...userJson },
    };
  } else {
    const newUser = await User.create(userBody);
    return newUser.toJSON();
  }
};

const getDocumentsCount = async (filter) => {
  return await User.countDocuments(filter);
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  const userJson = user?.toJSON();
  return { user, userJson };
};

const getByUserId = async (userId) => {
  return User.findById(userId);
};

const getUserByFilter = async (filter = {}) => {
  return User.findOne(filter);
};

const getUsersByFilter = async (filter = {}) => {
  return User.find(filter);
};

const getUsersByFilterWithSkipAndLimit = async (filter = {}, skip, limit) => {
  return User.find(filter).skip(skip).limit(limit);
};

const getUsersByFilterWithLimitAndFields = async (
  filter = {},
  fields,
  limit
) => {
  return User.find(filter, fields).limit(limit);
};

const updateUserByFilter = async (filter, updateBody) => {
  const user = await getUserByFilter(filter);
  if (!user) {
    return { error: "User not found", errorCode: 404 };
  } else {
    return await User.updateOne(filter, updateBody);
  }
};

const updateByUserId = async (userId, updateBody) => {
  const user = await getByUserId(userId);
  if (!user) {
    return { error: "User not found", errorCode: 404 };
  } else {
    Object.assign(user, updateBody);
    await user.save();
    return user;
  }
};

module.exports = {
  createUser,
  getDocumentsCount,
  getUserByEmail,
  getByUserId,
  getUserByFilter,
  getUsersByFilter,
  getUsersByFilterWithSkipAndLimit,
  getUsersByFilterWithLimitAndFields,
  updateUserByFilter,
  updateByUserId,
};
