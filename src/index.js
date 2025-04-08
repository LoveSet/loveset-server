const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const dotenv = require("dotenv");
dotenv.config();

let server;
// make sure mongodb is connected
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info("MongoDB connected successfully");
    // logger.info("All queues resumed successfully");
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
    socketServer(server);
  })
  .catch((error) => {
    logger.error("Error starting queues:", error);
    process.exit(1);
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
