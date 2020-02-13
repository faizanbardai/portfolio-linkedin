const User = require("../model/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const basicAuth = require("express-basic-auth");

// strategy to verify username and password
const LocalStrategy = require("passport-local");

// strategy to verify the access token
const JwtStrategy = require("passport-jwt").Strategy;

// this is a helper to extract the info from the token
const ExtractJwt = require("passport-jwt").ExtractJwt;

const jwtOptions = {
  //Authorization: Bearer TOKEN
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_PASSWORD
};

// This strategy will be used when we ask passport to passport.authenticate("local")
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

// This strategy will be used when we ask passport to passport.authenticate("jwt")
passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, callback) => {
    //looks into the collection
    User.findById(jwtPayload._id, (err, user) => {
      // Something went wrong getting the info from the db
      if (err) return callback(err, false);
      // Existing user, all right!
      else if (user) return callback(null, user);
      // Non existing user
      else return callback(null, false);
    });
  })
);

checkInMongoose = async (username, password, cb) => {
  const authResult = await User.authenticate()(username, password);
  return cb(null, authResult.user);
};

module.exports = {
  basic: basicAuth({
    authorizer: checkInMongoose,
    authorizeAsync: true
  }),

  // A helper to generate token
  getToken: user => jwt.sign(user, jwtOptions.secretOrKey, { expiresIn: 6000 })
};
