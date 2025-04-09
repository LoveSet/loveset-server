const mongoose = require("mongoose");
const moment = require("moment");
const { toJSON, paginate } = require("./plugins");

const watchlistSchema = mongoose.Schema(
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
watchlistSchema.plugin(toJSON);
watchlistSchema.plugin(paginate);

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
module.exports = Watchlist;
