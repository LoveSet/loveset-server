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

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  const userJson = user?.toJSON();
  return { user, userJson };
};
