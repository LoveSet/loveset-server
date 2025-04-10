const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const moment = require("moment");
const { Decimal128 } = require("mongodb");

const billingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isBeforeSubscribed: {
      type: Boolean,
      default: false,
    },
    paddleInvoiceNumber: {
      type: String,
    },
    paddleProductId: {
      type: String,
    },
    paddlePriceId: {
      type: String,
    },
    paddleSubscriptionId: {
      type: String,
    },
    paddleTransactionId: {
      type: String,
    },
    paddleInvoiceUrl: {
      type: String,
    },
    amount: {
      type: Decimal128,
      required: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly"],
    },
    billingPeriodEndTimestamp: {
      type: Number,
    },
    unixTimestamp: {
      type: Number,
      default: function () {
        return moment().unix();
      },
    },
  },
  { timestamps: true }
);

billingSchema.plugin(toJSON);
billingSchema.plugin(paginate);

const Billing = mongoose.model("Billing", billingSchema);
module.exports = Billing;
