const mongoose = require("mongoose");
const moment = require("moment");
const { toJSON, paginate } = require("./plugins");
const generateNum = require("../utils/generateNum");
const tmdb = require("../utils/tmdb");

const contentSchema = mongoose.Schema(
  {
    tId: {
      // tmdbId
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    director: {
      type: String,
    },
    trailerUrl: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: `${generateNum(19)}`,
    },
    duration: {
      type: String, // 142 min // 12 Seasons
    },
    genres: {
      type: Array,
    },
    synopsis: {
      type: String,
    },
    cast: {
      type: Array,
    },
    streamingAvailability: {
      type: Array,
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

contentSchema.plugin(toJSON);

contentSchema.pre("save", async function (next) {
  const content = this;

  if (content.isNew) {
    let generatedSlug = `${generateNum(19)}`;
    while (await Content.findOne({ slug: generatedSlug })) {
      generatedSlug = `${generateNum(19)}`;
    }
    content.slug = generatedSlug;
  }

  next();
});

const Content = mongoose.model("Content", contentSchema);
module.exports = Content;
