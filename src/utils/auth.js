const User = require("../model/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const basicAuth = require("express-basic-auth");
const FacebookStrategy = require("passport-facebook").Strategy;

// strategy to verify username and password
const LocalStrategy = require("passport-local");

// strategy to verify the access token
const JwtStrategy = require("passport-jwt").Strategy;

// this is a helper to extract the info from the token
const ExtractJwt = require("passport-jwt").ExtractJwt;

// This strategy will be used when we ask passport to passport.authenticate("local")
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

const jwtOptions = {
  //Authorization: Bearer TOKEN
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_PASSWORD
};

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

// This strategy will be used when we ask passport to passport.authenticate("facebook")
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.BASE_URL_SERVER + "/auth/facebook/callback",
      profileFields: ["id", "displayName", "picture.type(large)", "emails"]
    },
    async (accessToken, refreshToken, profile, cb) => {
      const userExists = await User.findOne({ facebookID: profile.id });
      if (userExists) return cb(null, userExists);
      else {
        const newUser = await User.create({
          username: profile.emails[0].value,
          firstName: profile.displayName,
          facebookID: profile.id,
          imageProfile: profile.photos
            ? profile.photos[0].value
            : "http://via.placeholder.com/360x360",
          facebook: { profile, accessToken, refreshToken }
        });
        return cb(null, newUser);
      }
    }
  )
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
  getToken: user =>
    jwt.sign(user, jwtOptions.secretOrKey, { expiresIn: 60 * 60 * 24 * 7 })
};
