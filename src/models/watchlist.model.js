const mongoose = require("mongoose");
const moment = require("moment");
const { toJSON, paginate } = require("./plugins");

const watchlistSchema = mongoose.Schema({}, { timestamps: true });

// add plugin that converts mongoose to json
watchlistSchema.plugin(toJSON);
watchlistSchema.plugin(paginate);

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
module.exports = Watchlist;
