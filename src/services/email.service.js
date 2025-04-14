const config = require("../config/config");
const logger = require("../config/logger");
const Mailjet = require("node-mailjet");
const welcome = require("../email/welcome");
const referralAward = require("../email/referralAward");
const subscriptionExpired = require("../email/subscriptionExpired");

const mailjet = Mailjet.apiConnect(
  config.email.mailjet.public_key,
  config.email.mailjet.private_key
);

const sendEmail = async (senderName = "LoveSet Inc.", to, subject, html) => {
  // MAILJET API
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: config.email.from,
          Name: senderName,
        },
        To: [
          {
            Email: to,
            Name: to.split("@")[0],
          },
        ],
        Subject: subject,
        TextPart: "",
        HTMLPart: html,
        CustomID: "WelcomeEmail",
      },
    ],
  });
  return await request
    .then((result) => {
      logger.info(result);
      return true;
    })
    .catch((err) => {
      logger.error(err);
      return false;
    });
};

const sendWelcomeEmail = async (to) => {
  const subject = "Welcome to LoveSet!";
  const html = welcome();
  // const res = await sendEmail("LoveSet", to, subject, html);
  // return res;
};

const sendswipesAwardEmail = async (to) => {
  const subject = "You have Earned 10 Extra Swipes on LoveSet!";
  const html = referralAward();
  const res = await sendEmail("LoveSet", to, subject, html);
  return res;
};

const sendSubscriptionExpiredEmail = async (to) => {
  const subject = "Your LoveSet Subscription Has Expired!";
  const html = subscriptionExpired();
  const res = await sendEmail("LoveSet", to, subject, html);
  return res;
};

module.exports = {
  sendWelcomeEmail,
  sendswipesAwardEmail,
  sendSubscriptionExpiredEmail,
};
