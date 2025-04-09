const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const discoverRoute = require("./discover.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/discover",
    route: discoverRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
