const express = require("express");
const passport = require("passport");
const app = express.Router();
const { getToken } = require("../utils/auth");

app.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: process.env.BASE_URL_HOST + "/login",
    session: false
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(
      process.env.BASE_URL_HOST +
        "/auth/facebook/callback/" +
        getToken({ _id: req.user._id })
    );
  }
);

module.exports = app;
