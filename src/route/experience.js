const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../model/user");
const Experience = require("../model/experience");
const { check, validationResult } = require("express-validator");
const { basic } = require("../utils/auth");

router.post(
  "/",
  [
    check("role")
      .isLength({ min: 2 })
      .withMessage("Role is required. Min. Lenght is 2 characters."),
    check("company")
      .isLength({ min: 2 })
      .withMessage("Company is required. Min. Lenght is 2 characters."),
    check("startDate").isISO8601({ strict: true })
  ],
  passport.authenticate("jwt"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      // getting username from auth middleware
      const username = req.user;
      const { role, company, startDate, endDate, description, area } = req.body;
      let newExperience = { role, company, startDate };
      if (endDate) newExperience = { ...newExperience, endDate };
      if (description) newExperience = { ...newExperience, description };
      if (area) newExperience = { ...newExperience, area };
      const response = await Experience.create(newExperience);
      await response.save();
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          experiences: response._id
        }
      });
      res.json(response);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.put(
  "/:_id",
  [
    check("role")
      .isLength({ min: 2 })
      .withMessage("Role is required. Min. Lenght is 2 characters."),
    check("company")
      .isLength({ min: 2 })
      .withMessage("Company is required. Min. Lenght is 2 characters."),
    check("startDate").isISO8601({ strict: true })
  ],
  passport.authenticate("jwt"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const username = req.auth.user;
      const _id = req.params._id;
      const user = await User.findOne({ username });
      const isUserExp = user.experiences.find(exp => exp.toString() === _id);
      if (isUserExp) {
        const {
          role,
          company,
          startDate,
          endDate,
          description,
          area
        } = req.body;
        let update = { role, company, startDate };
        if (endDate) update = { ...update, endDate };
        if (description) update = { ...update, description };
        if (area) update = { ...update, area };
        const response = await Experience.findByIdAndUpdate(_id, update, {
          new: true
        });
        res.json(response);
      } else res.status(404).json({});
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.delete("/:_id", basic, async (req, res) => {
  try {
    const username = req.auth.user;
    const _id = req.params._id;
    const user = await User.findOne({ username });
    const isUserExp = user.experiences.find(exp => exp.toString() === _id);
    if (isUserExp) {
      const response = await Experience.findByIdAndDelete(_id);
      res.json(response);
    } else res.status(404).json({});
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});
module.exports = router;
