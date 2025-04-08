const mongoose = require("mongoose");
const moment = require("moment");
const { toJSON, paginate } = require("./plugins");

const preferenceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentTypes: {
      type: Array,
    },
    filmIndustries: {
      type: Array,
    },
    genres: {
      type: Array,
    },
    timePeriods: {
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

// add plugin that converts mongoose to json
preferenceSchema.plugin(toJSON);
preferenceSchema.plugin(paginate);

const preference = mongoose.model("Preference", preferenceSchema);
module.exports = preference;
