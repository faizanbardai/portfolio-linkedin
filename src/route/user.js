const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../model/user");
const { basic, getToken } = require("../utils/auth");
const Experience = require("../model/experience");
const { check, validationResult } = require("express-validator");

router.get("/:_id", passport.authenticate("jwt"), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const _id = req.params._id;
  try {
    const response = await User.findById(_id)
      .select(
        "imageProfile experiences createdAt firstName lastName title area bio"
      )
      .populate("experiences");
    response ? res.json(response) : res.status(404).json({});
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.post("/token", passport.authenticate("jwt"), (req, res) => {
  const {
    imageProfile,
    experiences,
    _id,
    username,
    firstName,
    lastName,
    bio,
    title,
    area,
    createdAt
  } = req.user;
  const token = getToken({ _id });
  res.json({
    token,
    user: {
      imageProfile,
      experiences,
      _id,
      username,
      firstName,
      lastName,
      bio,
      title,
      area,
      createdAt
    }
  });
});

router.post(
  "/login",
  [
    check("username")
      .isEmail()
      .withMessage("A valid email is required!"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password should be atlease 8 characters.")
  ],
  passport.authenticate("local"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const token = getToken({ _id: req.user._id });
      const {
        username,
        firstName,
        lastName,
        imageProfile,
        area,
        bio,
        title,
        experiences,
        createdAt
      } = req.user;
      res.json({
        user: {
          username,
          firstName,
          lastName,
          imageProfile,
          area,
          bio,
          title,
          experiences,
          createdAt
        },
        token
      });
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.post(
  "/createAccount",
  [
    check("username")
      .isEmail()
      .withMessage("A valid email is required!"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password should be atlease 8 characters."),
    check("firstName")
      .isLength({ min: 1, max: 50 })
      .withMessage("First and Last name is required."),
    check("lastName")
      .isLength({ min: 1, max: 50 })
      .withMessage("First and Last name is required.")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { username, password, firstName, lastName } = req.body;
      const response = await User.register(
        { username, firstName, lastName },
        password
      );
      await response.save();
      const { imageProfile, _id, createdAt } = response;
      const token = getToken({ _id: _id });
      res.json({
        user: { imageProfile, _id, username, firstName, lastName, createdAt },
        token
      });
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.put("/", passport.authenticate("jwt"), async (req, res) => {
  try {
    const _id = req.user;
    const { firstName, lastName, title, area, bio } = req.body;
    let update = {};
    if (firstName) update = { ...update, firstName };
    if (lastName) update = { ...update, lastName };
    if (title) update = { ...update, title };
    if (area) update = { ...update, area };
    if (bio) update = { ...update, bio };
    const response = await User.findByIdAndUpdate(_id, update, {
      new: true
    })
      .select(
        "imageProfile experiences createdAt firstName lastName title area bio"
      )
      .populate("experiences");
    response ? res.json(response) : res.status(404).json({});
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// router.delete("/", basic, async (req, res) => {
//   try {
//     const username = req.auth.user;
//     const user = await User.findOne({ username });
//     user.experiences.forEach(
//       async experience => await Experience.findByIdAndDelete(experience)
//     );
//     const response = await User.findOneAndDelete({ username });
//     response ? res.json() : res.status(404).json({});
//   } catch (error) {
//     console.log(error);
//     res.json(error);
//   }
// });

module.exports = router;
