const User = require("../model/user");
const basicAuth = require("express-basic-auth");

checkInMongoose = async (username, password, cb) => {
  const authResult = await User.authenticate()(username, password);
  return cb(null, authResult.user);
};

module.exports = {
  basic: basicAuth({
    authorizer: checkInMongoose,
    authorizeAsync: true
  })
};
