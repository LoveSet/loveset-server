const mongoose = require("mongoose");
const validator = require("validator");
const { toJSON } = require("./plugins");
const { v4: uuidv4 } = require("uuid");
const generateNum = require("../utils/generateNum");
const generateLetter = require("../utils/generateLetter");
const moment = require("moment");
const { Decimal128 } = require("mongodb");
const generateRef = require("../utils/generateRef");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      default: function () {
        return `${generateLetter()}${generateNum(9)}`;
      },
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          q;
          throw new Error("Invalid email");
        }
      },
    },
    ref: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      default: function () {
        return generateRef(6);
      },
    },
    country: {
      type: String,
      trim: true,
    },
    swipesUsed: {
      type: Number,
      default: 0,
    },
    paddleCustomerId: {
      type: String,
    },
    paddleSubscriptionId: {
      type: String,
    },
    premium: {
      // subscribed
      type: Boolean,
      default: false,
    },
    premiumSince: {
      // first subscribed
      type: Number,
    },
    subscriptionPlan: {
      type: String,
      enum: ["weekly", "monthly", "bi-annually"],
    },
    lastCharged: {
      type: Number,
    },
    subscriptionExpiring: {
      type: Number,
    },
    unsubscribed: {
      // manuallyUnsubscribed
      type: Boolean,
      default: false,
    },
    subscriptionManuallyExpired: {
      // timestamp
      type: Number,
    },
    lifetime: {
      type: Decimal128,
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

userSchema.plugin(toJSON);

userSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.pre("save", async function (next) {
  const user = this;

  // username
  const regex = /^u\d{9}$/;
  if (user.isNew && (!user.username || regex.test(user.username))) {
    let generatedUsername = `${generateLetter()}${generateNum(9)}`;
    while (await User.findOne({ username: generatedUsername })) {
      generatedUsername = `${generateLetter()}${generateNum(9)}`;
    }
    user.username = generatedUsername;
  }

  // ref
  if (user.isNew && !user.ref) {
    let generatedRef = generateRef(6);
    while (await User.findOne({ ref: generatedRef })) {
      generatedRef = generateRef(6);
    }
    user.ref = generatedRef;
  }

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
