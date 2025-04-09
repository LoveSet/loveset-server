const mongoose = require("mongoose");
const moment = require("moment");
const { toJSON } = require("./plugins");

const cacheSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },
    liked: {
      type: Boolean,
      default: false,
    },
    passed: {
      type: Boolean,
      default: false,
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

// add plugin that converts mongoose to json
cacheSchema.plugin(toJSON);

const Cache = mongoose.model("Cache", cacheSchema);
module.exports = Cache;
