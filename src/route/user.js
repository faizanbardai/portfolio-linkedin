const express = require("express");
const router = express.Router();
const User = require("../model/user");
const { check, validationResult } = require("express-validator");
router.get(
  "/:email",
  [
    check("email")
      .isEmail()
      .withMessage("A valid email is required!")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const email = req.params.email;
    try {
      const response = await User.find({ email }).select(
        "imageProfile experiences createdAt name surname title area bio"
      );
      response.length ? res.json(response) : res.status(404).json({});
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.post(
  "/",
  [
    check("email")
      .isEmail()
      .withMessage("A valid email is required!"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password should be atlease 8 characters.")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const response = await User.create({
        email,
        password
      });
      await response.save();
      res.json({ ok: true });
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.put(
  "/:email",
  [
    check("email")
      .isEmail()
      .withMessage("A valid email is required!")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { name, surname, title, area, bio } = req.body;
      let update = {};
      if (name) update = { ...update, name };
      if (surname) update = { ...update, surname };
      if (title) update = { ...update, title };
      if (area) update = { ...update, area };
      if (bio) update = { ...update, bio };
      const email = req.params.email;
      const response = await User.findOneAndUpdate({ email }, update, {
        new: true
      }).select(
        "imageProfile experiences createdAt name surname title area bio"
      );
      response ? res.json(response) : res.status(404).json({});
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.delete(
  "/:email",
  [
    check("email")
      .isEmail()
      .withMessage("A valid email is required!")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const email = req.params.email;
      const response = await User.findOneAndDelete({ email });
      response ? res.json(response) : res.status(404).json({});
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

module.exports = router;
