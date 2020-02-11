const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new Schema(
  {
    // email: {
    //   type: String,
    //   index: true
    // },
    // password: String,
    // Passport-Local Mongoose will add
    // a username,
    // hash and salt field to store the username,
    // the hashed password
    // and the salt value.
    firstName: String,
    lastName: String,
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
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
module.exports = User;
