const mongoose = require("mongoose");
const moment = require("moment");
const { toJSON } = require("./plugins");

const cacheSchema = mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },
    swiped: {
      type: Boolean,
      default: false,
    },
    like: {
      type: Boolean,
      default: false,
    },
    pass: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
cacheSchema.plugin(toJSON);

const Cache = mongoose.model("Cache", cacheSchema);
module.exports = Cache;
