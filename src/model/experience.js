const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const experienceSchema = new Schema(
  {
    role: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String,
    area: String,
    imageExperience: {
      type: String,
      default: "http://via.placeholder.com/360x360"
    }
  },
  { timestamps: true }
);
const Experience = mongoose.model("Experience", experienceSchema);
module.exports = Experience;
