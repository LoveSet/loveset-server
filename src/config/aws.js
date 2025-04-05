const AWS = require("aws-sdk");
const { AWS_REGION } = require("./config");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

AWS.config.update({
  region: AWS_REGION,
});

module.exports = AWS;
