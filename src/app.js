const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const morgan = require("./config/morgan");
const { globalRateLimiter } = require("./middleware/rateLimiter");
const config = require("./config/config");
const routes = require("./routes/v1");
const { errorConverter, errorHandler } = require("./middleware/error");
const Responses = require("./utils/responses");
const passport = require("passport");
const { jwtStrategy } = require("./config/passport");
const basicAuth = require("express-basic-auth");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { webhookQueue } = require("./background/webhook/webhook.queue");
const { tmdbQueue } = require("./background/tmdb/tmdb.queue");
const { subscriptionJob, swipeJob } = require("./cron");

const WebhookEvent = require("./background/webhook/webhook.event");
const TMDBEvent = require("./background/tmdb/tmdb.event");

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
  origin = config.clientUrl.prod;
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
  globalRateLimiter(req, res, next);
});

app.use("/v1", routes);

app.use(function (req, res, next) {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

/*  ======================= BULL BOARD ======================= */
const users = {
  root_1: config.redisBullboardPassword,
};

app.use(
  "/bull-board",
  basicAuth({
    users,
    challenge: true, // Forces unauthorized response if credentials are missing
    unauthorizedResponse: "Unauthorized", // Response when authentication fails
  })
);

// BULL-BOARD
const serverAdapter = new ExpressAdapter();

const bullBoard = createBullBoard({
  queues: [new BullMQAdapter(webhookQueue), new BullMQAdapter(tmdbQueue)],
  serverAdapter: serverAdapter,
});

serverAdapter.setBasePath("/bull-board");
app.use("/bull-board", serverAdapter.getRouter());

/*  ========================================================= */

/*  ======================= CRON JOBS ======================= */
// if (config.env === "production") {
subscriptionJob.updateExpiredSubscriptions();
swipeJob.refreshSwipes();
// }
/*  ========================================================= */

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
