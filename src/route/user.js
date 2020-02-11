const express = require("express");
const router = express.Router();
const User = require("../model/user");
const { basic } = require("../utils/auth");
const Experience = require("../model/experience");
const { check, validationResult } = require("express-validator");

router.get(
  "/:username",
  [
    check("username")
      .isEmail()
      .withMessage("A valid email is required!")
  ],
  basic,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const username = req.params.username;
    try {
      const response = await User.findOne({ username: username })
        .select(
          "imageProfile experiences createdAt firstName lastName title area bio"
        )
        .populate("experiences");
      response ? res.json(response) : res.status(404).json({});
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.post(
  "/",
  [
    check("username")
      .isEmail()
      .withMessage("A valid email is required!"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password should be atlease 8 characters."),
    check("firstName").isLength({ min: 1, max: 50 }),
    check("lastName").isLength({ min: 1, max: 50 })
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
      res.json({ ok: true });
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.put("/", basic, async (req, res) => {
  try {
    const username = req.auth.user;
    const { firstName, lastName, title, area, bio } = req.body;
    let update = {};
    if (firstName) update = { ...update, firstName };
    if (lastName) update = { ...update, lastName };
    if (title) update = { ...update, title };
    if (area) update = { ...update, area };
    if (bio) update = { ...update, bio };
    const response = await User.findOneAndUpdate({ username }, update, {
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

router.delete("/", basic, async (req, res) => {
  try {
    const username = req.auth.user;
    const user = await User.findOne({ username });
    user.experiences.forEach(
      async experience => await Experience.findByIdAndDelete(experience)
    );
    const response = await User.findOneAndDelete({ username });
    response ? res.json() : res.status(404).json({});
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

module.exports = router;
