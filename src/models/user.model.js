const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const userSchema = mongoose.Schema(
{},
{ timestamps: true }
);

userSchema.plugin(toJSON);

const User = mongoose.model("User", userSchema);
module.exports = User;
