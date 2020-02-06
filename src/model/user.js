const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    email: {
      type: String,
      index: true
    },
    password: String,
    name: String,
    surname: String,
    bio: String,
    title: String,
    area: String,
    imageProfile: {
      type: String,
      default: "http://via.placeholder.com/360x360"
    },
    experiences: [{ type: Schema.Types.ObjectId, ref: "Experience" }]
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
