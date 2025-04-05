const roles = {
  user: "user",
  admin: "admin",
};

const assignRole = (admin) => {
  if (admin) {
    return "admin";
  } else {
    return "user";
  }
};

module.exports = { roles, assignRole };
