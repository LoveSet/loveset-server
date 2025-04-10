const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(9000),
    DEV_REDIS_URL: Joi.string().description("dev redis url"),
    DEV_REDIS_PORT: Joi.number().description("dev redis port"),
    DEV_REDIS_PASSWORD: Joi.string().description("dev redis password"),
    PROD_REDIS_URL: Joi.string().description("prod redis url"),
    PROD_REDIS_PORT: Joi.number().description("prod redis port"),
    PROD_REDIS_PASSWORD: Joi.string().description("prod redis password"),
    DEV_MONGODB_URL: Joi.string().required().description("Dev Mongo DB url"),
    PROD_MONGODB_URL: Joi.string().required().description("Prod Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    DEV_CLIENT_URL: Joi.string().description("dev client url"),
    PROD_CLIENT_URL: Joi.string().description("prod client url"),
    S3_BUCKET_NAME: Joi.string().description("s3 bucket name"),
    AWS_REGION: Joi.string().description("aws region"),
    OPENAI_SECRET: Joi.E().description("open ai secret"),
    BING_SEARCH_KEY: Joi.string().description("bing search key"),
    FILES_URL: Joi.string().description("files url"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app"
    ),
    MAILJET_PUBLIC_KEY: Joi.string().description(
      "public key for mailjet email server"
    ),
    MAILJET_PRIVATE_KEY: Joi.string().description(
      "private key for mailjet email server"
    ),
    GOOGLE_CLIENT_ID: Joi.string().description("google client id"),
    GOOGLE_CLIENT_SECRET: Joi.string().description("google client secret"),
    PADDLE_TEST_URL: Joi.string().description("paddle test url"),
    PADDLE_LIVE_URL: Joi.string().description("paddle live url"),
    PADDLE_TEST_API_KEY: Joi.string().description("paddle test api key"),
    PADDLE_LIVE_API_KEY: Joi.string().description("paddle live api key"),
    PADDLE_TEST_WEBHOOK_SECRET_KEY: Joi.string().description(
      "paddle test webhook secret key"
    ),
    PADDLE_LIVE_WEBHOOK_SECRET_KEY: Joi.string().description(
      "paddle live webhook secret key"
    ),
    TMDB_READ_ACCESS_TOKEN: Joi.string().description("tmdb read access token"),
    TMDB_API_KEY: Joi.string().description("tmdb api key"),
    RAPID_API_KEY: Joi.string()
      .required()
      .description("Rapid API key for streaming availability"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url:
      envVars.NODE_ENV == "development"
        ? envVars.DEV_MONGODB_URL //DEV_MONGODB_URL
        : envVars.PROD_MONGODB_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  redis: {
    dev: {
      host: envVars.DEV_REDIS_URL,
      port: envVars.DEV_REDIS_PORT,
      password: envVars.DEV_REDIS_PASSWORD,
    },
    prod: {
      host: envVars.PROD_REDIS_URL,
      port: envVars.PROD_REDIS_PORT,
      password: envVars.PROD_REDIS_PASSWORD,
    },
  },
  clientUrl: {
    dev: envVars.DEV_CLIENT_URL,
    prod: envVars.PROD_CLIENT_URL,
  },
  S3_BUCKET_NAME: envVars.S3_BUCKET_NAME,
  AWS_REGION: envVars.AWS_REGION,
  openAISecret: envVars.OPENAI_SECRET,
  bingSearchKey: envVars.BING_SEARCH_KEY,
  filesUrl: envVars.FILES_URL,
  from: envVars.EMAIL_FROM,
  email: {
    from: envVars.EMAIL_FROM,
    mailjet: {
      public_key: envVars.MAILJET_PUBLIC_KEY,
      private_key: envVars.MAILJET_PRIVATE_KEY,
    },
  },
  googleClientId: envVars.GOOGLE_CLIENT_ID,
  googleClientSecret: envVars.GOOGLE_CLIENT_SECRET,
  paddleTestUrl: envVars.PADDLE_TEST_URL,
  paddleLiveUrl: envVars.PADDLE_LIVE_URL,
  paddleTestApiKey: envVars.PADDLE_TEST_API_KEY,
  paddleLiveApiKey: envVars.PADDLE_LIVE_API_KEY,
  paddleTestWebhookSecretKey: envVars.PADDLE_TEST_WEBHOOK_SECRET_KEY,
  paddleLiveWebhookSecretKey: envVars.PADDLE_LIVE_WEBHOOK_SECRET_KEY,
  tmdbReadAccessToken: envVars.TMDB_READ_ACCESS_TOKEN,
  tmdbApiKey: envVars.TMDB_API_KEY,
  rapidApiKey: envVars.RAPID_API_KEY,
};
