require("dotenv").config();
var mongoose = require("mongoose");
const mongooseConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })
    .then(
      () => {
        console.log("Connected!");
      },
      err => {
        console.log(err.reason);
      }
    );
};

module.exports = mongooseConnection;