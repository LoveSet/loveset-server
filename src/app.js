const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const morgan = require("./config/morgan");
const { appRateLimiter } = require("./middleware/rateLimiter");
const routes = require("./routes/v1");
const { errorConverter, errorHandler } = require("./middleware/error");
const Responses = require("./utils/responses");
const passport = require("passport");
const { jwtStrategy } = require("./config/passport");

const config = require("./config/config");


const app = express();

// Enable the 'trust proxy' setting to trust headers like X-Forwarded-For // todo: enable in prod

if (config.env === "production") {
  app.set("trust proxy", true);
}

// WATCH CLOSELY
app.use(morgan.successHandler);
app.use(morgan.errorHandler);

// set security HTTP headers
app.use(helmet());

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

let origin;

if (config.env === "development") {
  origin = "*";
} else {
  origin = config.prodClientUrl;
}

const corsOptions = {
  origin,
  optionsSuccessStatus: 200,
};

// enable cors
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// app.use(cors());
// app.options("*", cors());

// for webhooks
// app.use("/v1/subscriber/subscribe", express.raw({ type: "*/*" }));

// app.use(express.json({ limit: "10mb" }));
app.use(express.json({ limit: "5000mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use((req, res, next) => {
  appRateLimiter(req, res, next);
});

app.use("/v1", routes);

app.use(function (req, res, next) {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  return Responses.handleError(error.status || 500, error.message, res);
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
